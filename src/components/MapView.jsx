import React, {useEffect, useRef, useState} from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

// ✅ Your Mapbox access token and custom style URL
mapboxgl.accessToken = 'pk.eyJ1Ijoia3JhbmdhcyIsImEiOiJjbTltNnAzOGMwOWhtMnFwdDRyNXdxNmNuIn0.vQb6BXcXPCQhBfYRP498ew'; // Replace me
const MAP_STYLE = 'mapbox://styles/krangas/cm9m9p0p400l901s552755bkb'; // Replace with your published style

const MapViewWithSidebar = () => {
    const mapContainer = useRef(null);
    const mapRef = useRef(null);
    const popupRef = useRef(null);
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [highlightedId, setHighlightedId] = useState(null);
    const [layerVisibility, setLayerVisibility] = useState({
        buildings: true,
        amenities: true,
        leisure: true,
        landuse: true,
    });
    const [amenityFilter, setAmenityFilter] = useState('');
    const [availableAmenities, ] = useState([
        '', 'cafe', 'library', 'parking', 'atm', 'toilets', 'fast_food'
    ]);
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: MAP_STYLE,
            center: [-97.0701, 36.1270],
            zoom: 16,
            bounds: [
                [-97.085, 36.115],
                [-97.055, 36.135]
            ]
        });
        mapRef.current = map;

        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        map.on('load', () => {
            map.addSource('osu', {
                type: 'geojson',
                data: '/data/osu_features_filtered.geojson',
                generateId: true
            });

            map.addLayer({
                id: 'buildings',
                type: 'fill',
                source: 'osu',
                filter: ['has', 'building'],
                paint: { 'fill-color': '#f97316', 'fill-opacity': 0.5 },
            });

            map.addLayer({
                id: 'leisure',
                type: 'fill',
                source: 'osu',
                filter: ['has', 'leisure'],
                paint: { 'fill-color': '#4ade80', 'fill-opacity': 0.3 },
            });

            map.addLayer({
                id: 'landuse',
                type: 'fill',
                source: 'osu',
                filter: ['has', 'landuse'],
                paint: { 'fill-color': '#bae6fd', 'fill-opacity': 0.2 },
            });

            map.addLayer({
                id: 'amenities',
                type: 'symbol',
                source: 'osu',
                filter: ['has', 'amenity'],
                layout: {
                    'icon-image': ['concat', ['get', 'amenity'], '-icon'],
                    'icon-size': 0.8,
                    'icon-allow-overlap': true,
                    'text-field': ['get', 'amenity'],
                    'text-size': 11,
                },
                paint: { 'text-color': '#111827' },
            });

            map.addLayer({
                id: 'highlight-feature',
                type: 'line',
                source: 'osu',
                filter: ['==', ['id'], -1],
                paint: {
                    'line-color': '#f43f5e',
                    'line-width': 4
                }
            });

            map.on('click', (e) => {
                const features = map.queryRenderedFeatures(e.point, {
                    layers: ['buildings', 'amenities', 'leisure', 'landuse'],
                });
                if (features.length) {
                    const feature = features[0];
                    setSelectedFeature(feature);
                    setHighlightedId(feature.id);
                    map.setFilter('highlight-feature', ['==', ['id'], feature.id]);

                    if (popupRef.current) {
                        popupRef.current.remove();
                    }
                    const coords = feature.geometry.type === 'Point'
                        ? feature.geometry.coordinates
                        : feature.geometry.type === 'Polygon'
                            ? feature.geometry.coordinates[0][0]
                            : null;

                    if (coords) {
                        const popup = new mapboxgl.Popup({ closeOnClick: true })
                            .setLngLat(coords)
                            .setHTML(`<strong>${feature.properties.name || 'Feature'}</strong>`)
                            .addTo(map);
                        popupRef.current = popup;
                    }

                    map.flyTo({ center: e.lngLat, zoom: 18 });
                }
            });
        });

        return () => map.remove();
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        if (!map || !map.getLayer('amenities')) return;
        const filter = amenityFilter ? ['==', ['get', 'amenity'], amenityFilter] : ['has', 'amenity'];
        map.setFilter('amenities', filter);
    }, [amenityFilter]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map || !searchText) {
            setSearchResults([]);
            return;
        }
        const allFeatures = map.querySourceFeatures('osu');
        const matches = allFeatures.filter(f => {
            const name = (f.properties.name || '').toLowerCase();
            return searchText.toLowerCase().split(' ').every(word => name.includes(word));
        });
        setSearchResults(matches);
    }, [searchText]);

    const toggleLayer = (layerId) => {
        const map = mapRef.current;
        const isVisible = layerVisibility[layerId];
        map.setLayoutProperty(layerId, 'visibility', isVisible ? 'none' : 'visible');
        setLayerVisibility((prev) => ({ ...prev, [layerId]: !isVisible }));
    };

    const handleDownload = () => {
        if (!selectedFeature) return;
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(selectedFeature, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', 'selected_feature.json');
        downloadAnchor.click();
    };

    const handleClearFilters = () => {
        setAmenityFilter('');
        setSearchText('');
        setSearchResults([]);
        setHighlightedId(null);
        const map = mapRef.current;
        if (map && map.getLayer('highlight-feature')) {
            map.setFilter('highlight-feature', ['==', ['id'], -1]);
        }
        if (popupRef.current) {
            popupRef.current.remove();
        }
    };

    const handleResultClick = (feature) => {
        const map = mapRef.current;
        const center = feature.geometry.type === 'Point'
            ? feature.geometry.coordinates
            : feature.geometry.type === 'Polygon'
                ? feature.geometry.coordinates[0][0]
                : null;
        if (center) {
            map.flyTo({ center, zoom: 18 });
            setSelectedFeature(feature);
            setHighlightedId(feature.id);
            map.setFilter('highlight-feature', ['==', ['id'], feature.id]);

            if (popupRef.current) {
                popupRef.current.remove();
            }

            const popup = new mapboxgl.Popup({ closeOnClick: true })
                .setLngLat(center)
                .setHTML(`<strong>${feature.properties.name || 'Feature'}</strong>`)
                .addTo(map);
            popupRef.current = popup;
        }
    };

    return (
        <div className="mapview-sidebar" style={{ display: 'flex', height: 'calc(100vh - 80px)' }}>
            <div className="sidebar" style={{ width: '320px', height: '100%', padding: '1rem', borderRight: '1px solid #ccc', overflowY: 'auto' }}>
                <img src="src/assets/pistol-pete.png"/>
                <h3>Campus Map Layers</h3>

                <input
                    type="text"
                    placeholder="Search campus features…"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: '100%', marginBottom: '8px' }}
                />

                {searchResults.length > 0 && (
                    <ul style={{ maxHeight: '160px', overflowY: 'auto', paddingLeft: '1rem' }}>
                        {searchResults.map((feat, idx) => (
                            <li
                                key={idx}
                                style={{
                                    cursor: 'pointer',
                                    color: highlightedId === feat.id ? '#f43f5e' : '#1d4ed8',
                                    fontWeight: highlightedId === feat.id ? 'bold' : 'normal'
                                }}
                                onClick={() => handleResultClick(feat)}
                            >
                                {feat.properties.name || '[Unnamed]'}
                            </li>
                        ))}
                    </ul>
                )}

                {Object.keys(layerVisibility).map((layer) => (
                    <div key={layer}>
                        <label>
                            <input type="checkbox" checked={layerVisibility[layer]} onChange={() => toggleLayer(layer)} /> {layer}
                        </label>
                    </div>
                ))}

                <div style={{ marginTop: '1rem' }}>
                    <label htmlFor="amenityFilter">Amenity type:</label>
                    <select
                        id="amenityFilter"
                        value={amenityFilter}
                        onChange={(e) => setAmenityFilter(e.target.value)}
                        style={{ width: '100%', marginTop: '4px' }}
                    >
                        {availableAmenities.map((type) => (
                            <option key={type} value={type}>{type || 'All'}</option>
                        ))}
                    </select>
                    <button onClick={handleClearFilters} style={{ marginTop: '8px' }}>Clear Filters</button>
                </div>

                {selectedFeature && (
                    <div style={{ marginTop: '1rem' }}>
                        <h4>Selected Feature</h4>
                        <ul style={{ fontSize: '14px' }}>
                            {Object.entries(selectedFeature.properties).map(([k, v]) => (
                                <li key={k}><strong>{k}</strong>: {v}</li>
                            ))}
                        </ul>
                        <button onClick={handleDownload} style={{ marginTop: '10px' }}>Download JSON</button>
                    </div>
                )}
            </div>

            <div ref={mapContainer} style={{ flexGrow: 1, height: '100%' }} />

        </div>
    );
};

export default MapViewWithSidebar;
