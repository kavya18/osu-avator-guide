import React, {useEffect, useRef, useState} from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import DialogflowChat from "./DialogflowChat.jsx";
import Fuse from 'fuse.js';
import axios from "axios";
import './MapViewWithSidebar.css'

// ✅ Your Mapbox access token and custom style URL
mapboxgl.accessToken = 'pk.eyJ1Ijoia3JhbmdhcyIsImEiOiJjbTltNnAzOGMwOWhtMnFwdDRyNXdxNmNuIn0.vQb6BXcXPCQhBfYRP498ew'; // Replace me
// const MAP_STYLE = 'mapbox://styles/krangas/cm9m9p0p400l901s552755bkb'; // Replace with your published style
const MAP_STYLE = 'mapbox://styles/mapbox/satellite-streets-v12';


const MapViewWithSidebar = () => {
    const mapContainer = useRef(null);
    const mapRef = useRef(null);
    const popupRef = useRef(null);
    const wsRef = useRef(null);
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [highlightedId, setHighlightedId] = useState(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
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

    // WebSocket setup
    useEffect(() => {
        wsRef.current = new WebSocket('ws://localhost:8000/ws');
        
        wsRef.current.onopen = () => console.log('WebSocket connected');
        
        wsRef.current.onmessage = (event) => {
            // Receive description from server and speak it
            const description = event.data;
            console.log('Received description:', description);
            speak(description);
        };
        
        wsRef.current.onerror = err => console.error('WebSocket error:', err);
        
        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, []);

    useEffect(() => {
        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: MAP_STYLE,
            center: [-97.0701, 36.1270],
            zoom: 16,
            pitch: 60,
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

            map.on('click', async (e) => {
                const features = map.queryRenderedFeatures(e.point, {
                    layers: ['buildings', 'amenities', 'leisure', 'landuse'],
                });
                if (features.length) {
                    const feature = features[0];
                    setSelectedFeature(feature);
                    setHighlightedId(feature.id);
                    map.setFilter('highlight-feature', ['==', ['id'], feature.id]);

                    let info;
                    if(feature.properties.name) {
                        info = await fetchBuildingInfo(feature.properties.name);
                        speak(info);
                    }

                    // We'll no longer call fetchBuildingInfo and speak here
                    // The description will come from the WebSocket response

                    if (popupRef.current) {
                        popupRef.current.remove();
                    }
                    const coords = feature.geometry.type === 'Point'
                        ? feature.geometry.coordinates
                        : feature.geometry.type === 'Polygon'
                            ? feature.geometry.coordinates[0][0]
                            : null;

                    if (coords) {
                        // Fetch building description from OpenAI (or fallback if undefined)

                        const popup = new mapboxgl.Popup({ closeOnClick: true })
                            .setLngLat(coords)
                            .setHTML(`
                                <div>
                                    <strong>${feature.properties.name || 'Feature'}</strong>
                                    <p style="margin-top: 0.5rem;">${info}</p>
                                </div>
                            `)
                            .addTo(map);

                        popupRef.current = popup;
                    }

                    map.flyTo({ center: e.lngLat, zoom: 18, pitch: 60 });
                    
                    // Build and send the report via WebSocket
                    const props = feature.properties;
                    const reportLines = ['Selected Feature'];
                    for (let [k, v] of Object.entries(props)) {
                        reportLines.push(`${k}: ${v}`);
                    }
                    const report = reportLines.join('\n');
                    console.log("test report");
                    console.log(report);
                    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                        wsRef.current.send(report);
                        console.log('Sent feature report:\n' + report);
                    }
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
        const fuse = new Fuse(allFeatures, {
            keys: ['properties.name'],
            threshold: 0.3,           // Lower means stricter match
            includeScore: true,
        });

        const result = fuse.search(searchText);
        const matches = result.map(r => r.item);
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
            
            // Build and send the report via WebSocket when clicking on search results
            const props = feature.properties;
            const reportLines = ['Selected Feature'];
            for (let [k, v] of Object.entries(props)) {
                reportLines.push(`${k}: ${v}`);
            }
            const report = reportLines.join('\n');
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(report);
                console.log('Sent feature report:\n' + report);
            }
        }
    };

    const speak = (text) => {
        setIsSpeaking(true);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    };


    const fetchBuildingInfo = async (buildingName) => {
        const prompt = `name: ${buildingName}`;

        try {
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: (
                                "You are a mapping assistant for Oklahoma State University. "
                                + "you're supposed to describe what that building is in two short, friendly sentences. "
                                + "Use any clues from the building's name (like 'library', 'engineering', 'stadium', etc.) to guess its purpose or importance on campus."
                            )
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 60,
                    temperature: 0.6,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            return response.data.choices[0].message.content.trim();

        } catch (error) {
            console.error('Error fetching building info:', error);
            return 'Sorry, I could not retrieve information about that building at this time.';
        }
    };


    const startListening = () => {
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        setIsListening(true);

        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            setIsListening(false);
            if (transcript.toLowerCase().includes('tell me about')) {
                const buildingName = transcript.toLowerCase().replace('tell me about', '').trim();
                const info = await fetchBuildingInfo(buildingName);
                speak(info);
            } else {
                speak("Sorry, I didn't understand. Try saying 'Tell me about Edmon Low Library'.");
            }
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    return (
        <div className="mapview-sidebar">
            <div className="sidebar">
                <img
                    src={isSpeaking ? '/pistol-pete-speaking.svg' : '/pistol-pete.svg'}
                    alt="Pistol Pete"
                    className="pistol-pete-img"
                />
                <button onClick={startListening} disabled={isListening}>
                    🎙️ Ask Pete
                </button>

                <h3>Campus Map Layers</h3>

                <input
                    type="text"
                    placeholder="Search campus features…"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />

                {searchResults.length > 0 && (
                    <ul>
                        {searchResults.map((feat, idx) => (
                            <li
                                key={idx}
                                style={{
                                    color: highlightedId === feat.id ? '#f43f5e' : '#1d4ed8',
                                    fontWeight: highlightedId === feat.id ? 'bold' : 'normal',
                                }}
                                onClick={() => handleResultClick(feat)}
                            >
                                {feat.properties.name || '[Unnamed]'}
                            </li>
                        ))}
                    </ul>
                )}

                {Object.keys(layerVisibility).map((layer) => (
                    <label key={layer}>
                        <input
                            type="checkbox"
                            checked={layerVisibility[layer]}
                            onChange={() => toggleLayer(layer)}
                        />{' '}
                        {layer}
                    </label>
                ))}

                <div>
                    <label htmlFor="amenityFilter">Amenity type:</label>
                    <select
                        id="amenityFilter"
                        value={amenityFilter}
                        onChange={(e) => setAmenityFilter(e.target.value)}
                    >
                        {availableAmenities.map((type) => (
                            <option key={type} value={type}>
                                {type || 'All'}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedFeature && (
                    <div className="download-section">
                        <button onClick={handleDownload}>Download JSON</button>
                    </div>
                )}

                <div className="dialogflow-box">
                    <DialogflowChat />
                </div>
            </div>

            <div ref={mapContainer} style={{ flexGrow: 1, height: '100%' }} />
        </div>

    );
};

export default MapViewWithSidebar;