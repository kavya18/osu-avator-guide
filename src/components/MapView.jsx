import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

// ✅ Your Mapbox access token and custom style URL
mapboxgl.accessToken = 'pk.eyJ1Ijoia3JhbmdhcyIsImEiOiJjbTltNnAzOGMwOWhtMnFwdDRyNXdxNmNuIn0.vQb6BXcXPCQhBfYRP498ew'; // Replace me
const MAP_STYLE = 'mapbox://styles/krangas/cm9m9p0p400l901s552755bkb'; // Replace with your published style

const MapView = () => {
    const mapContainer = useRef(null);

    useEffect(() => {
        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: MAP_STYLE,
            center: [-97.0701, 36.1270],
            zoom: 16,
        });

        // Controls
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        map.addControl(
            new MapboxGeocoder({
                accessToken: mapboxgl.accessToken,
                mapboxgl,
            }),
            'top-left'
        );

        map.on('load', () => {
            // 🔹 Load OSU features
            map.addSource('osu', {
                type: 'geojson',
                data: '/data/osu_features_filtered.geojson',
            });

            // 🏢 Buildings with name
            map.addLayer({
                id: 'named-buildings',
                type: 'fill',
                source: 'osu',
                filter: ['all', ['has', 'building'], ['has', 'name']],
                paint: {
                    'fill-color': 'rgba(249,115,22,0.59)',
                    'fill-opacity': 0.6,
                },
            });

            // 🏢 Other buildings
            map.addLayer({
                id: 'buildings-outline',
                type: 'line',
                source: 'osu',
                filter: ['has', 'building'],
                paint: {
                    'line-color': '#444',
                    'line-width': 0.5,
                },
            });

            // 🌳 Leisure areas
            map.addLayer({
                id: 'leisure',
                type: 'fill',
                source: 'osu',
                filter: ['has', 'leisure'],
                paint: {
                    'fill-color': '#4ade80',
                    'fill-opacity': 0.3,
                },
            });

            // 🟩 Landuse zones
            map.addLayer({
                id: 'landuse',
                type: 'fill',
                source: 'osu',
                filter: ['has', 'landuse'],
                paint: {
                    'fill-color': '#bae6fd',
                    'fill-opacity': 0.2,
                },
            });

            // 🧭 Dynamic icons for amenities
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
                    'text-font': ['Open Sans Bold'],
                    'text-size': 11,
                    'text-offset': [0, 1.4],
                    'text-anchor': 'top',
                },
                paint: {
                    'text-color': '#111827',
                },
            });

            // 💬 Click handler for all layers
            map.on('click', (e) => {
                const features = map.queryRenderedFeatures(e.point, {
                    layers: [
                        'named-buildings',
                        'buildings-outline',
                        'leisure',
                        'landuse',
                        'amenities',
                    ],
                });
                if (!features.length) return;

                const feature = features[0];
                const props = feature.properties;
                const title =
                    props.name || props.amenity || props.building || props.landuse || 'Feature';

                let html = `<div style="font-family: sans-serif; font-size: 14px;">
            <h3 style="margin: 0 0 6px; color: #1d4ed8;">${title}</h3><hr style="margin-bottom: 6px;">`;

                for (const key in props) {
                    if (props[key] && props[key] !== 'yes') {
                        html += `<strong>${key}</strong>: ${props[key]}<br/>`;
                    }
                }
                html += `</div>`;

                new mapboxgl.Popup({ offset: 10 })
                    .setLngLat(e.lngLat)
                    .setHTML(html)
                    .addTo(map);
            });

            // Pointer change on hover
            const interactiveLayers = [
                'named-buildings',
                'buildings-outline',
                'leisure',
                'landuse',
                'amenities',
            ];
            interactiveLayers.forEach((layer) => {
                map.on('mouseenter', layer, () => {
                    map.getCanvas().style.cursor = 'pointer';
                });
                map.on('mouseleave', layer, () => {
                    map.getCanvas().style.cursor = '';
                });
            });
        });

        return () => map.remove();
    }, []);

    return <div ref={mapContainer} style={{ width: '100%', height: '100vh' }} />;
};

export default MapView;
