import React, { useState, useEffect } from 'react';
import MapViewWithSidebar from "./components/MapView.jsx";
import './App.css';
import DialogflowChat from "./components/DialogflowChat.jsx";

function App() {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        document.body.classList.toggle('dark-mode', darkMode);
    }, [darkMode]);

    return (
        <div className="App">
            <header className="app-header">
                <img src="/osu-logo.png" alt="OSU Logo" className="osu-logo" />
                <div className="header-text">
                    <h1>Oklahoma State University OSU Explorer</h1>
                    <p>Explore buildings, amenities, and green spaces across OSU Stillwater</p>
                </div>
                <button onClick={() => setDarkMode(!darkMode)} className="dark-mode-toggle">
                    {darkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
            </header>
            <MapViewWithSidebar />
            <DialogflowChat />
        </div>
    );
}

export default App;
