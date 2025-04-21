# 🧭 Oklahoma State University OSU Explorer

An interactive web application that visualizes the Oklahoma State University (OSU) Stillwater campus. Explore buildings, amenities, and green spaces with intelligent search, real-time voice interaction, and AI-enhanced descriptions powered by GPT.

---

![OSU Campus Map Screenshot](./public/screenshot.png)

## 📋 Table of Contents

- [Features](#-features)
- [Installation](#️-installation)
- [Usage](#-usage)
- [AI WebSocket Server](#-ai-websocket-server)
- [Contributing](#-contributing)
- [Acknowledgments](#-acknowledgments)

---

## 🚀 Features

- **🗺️ Interactive 3D Map**: Explore the OSU Stillwater campus with full zoom, tilt, and pitch functionality via Mapbox GL JS.
- **🧠 AI-Powered Popups**: Click on buildings to receive concise, GPT-generated descriptions contextualized to the clicked feature.
- **🎙️ Voice Assistant ("Ask Pete")**: Activate microphone input and ask questions naturally (e.g., *"Where is the Student Union?"*).
- **🔌 WebSocket Integration**: Seamlessly stream AI-generated building insights from the backend in real-time.
- **🔍 Fuzzy Search**: Quickly locate buildings and amenities with typo-tolerant, inexact search powered by Fuse.js.
- **🧭 Layer Controls**: Enable or disable campus layers like academic buildings, amenities, leisure spaces, and land usage.
- **🏷️ Amenity Filtering**: Narrow down points of interest by categories such as cafes, libraries, and parking spots.
- **✨ Feature Highlighting**: Fly to selected features, highlight them visually, and view descriptive insights.
- **📱 Responsive Design**: Fully optimized for desktop, tablet, and mobile users.
- **🌙 Dark Mode (optional)**: Built-in theme toggle support (pending frontend toggle setup).

---

## 🛠️ Installation

1. **Clone the repository:**

```bash
git clone https://github.com/yourusername/osu-campus-map.git
cd osu-campus-map
```

2. **Install frontend dependencies:**

```bash
npm install
```

3. **Start the development server:**

```bash
npm run dev
# or
npm start
```

4. **Access the application:**

Navigate to: [http://localhost:3000](http://localhost:3000)

---

## 📖 Usage

- **Search Bar**: Located in the sidebar for fuzzy, typo-tolerant lookups.
- **Click-to-Explain**: Click any feature on the map to view an AI-generated summary.
- **Ask Pete**: Click the mic icon and speak your query. Try "Where is the Engineering South building?"
- **Toggle Map Layers**: Use sidebar checkboxes to show/hide buildings, land use, etc.
- **Filter Amenities**: Filter for specific places like ATMs, restrooms, or libraries.

---

## 🧠 AI WebSocket Server

This backend WebSocket service delivers real-time GPT-based descriptions of clicked features.

### ✅ Requirements

```bash
pip install openai websockets python-dotenv
```

### 🔐 .env Setup

Create a `.env` file in your root directory:

```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

> Never commit `.env` to source control. Add it to your `.gitignore`.

### ▶️ Run the Server

```bash
python server.py
```

The server runs at:

```
ws://localhost:8000/ws
```

This endpoint powers live descriptions when map features are clicked or questions are spoken.

---

## 🤝 Contributing

We welcome all contributions! To get started:

1. Fork this repository
2. Create a new feature branch:

```bash
git checkout -b feature/your-feature-name
```

3. Make your changes and commit:

```bash
git commit -m "Add your feature"
```

4. Push the changes:

```bash
git push origin feature/your-feature-name
```

5. Open a Pull Request (PR) on GitHub

---

## 🙏 Acknowledgments

- 🗺️ [Mapbox](https://www.mapbox.com/) — advanced vector map rendering
- 🧭 [OpenStreetMap](https://www.openstreetmap.org/) — base geospatial data
- ⚛️ [React](https://reactjs.org/) — frontend library
- 🧠 [OpenAI](https://openai.com/) — GPT-powered natural language descriptions
- 🔊 [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) — browser speech recognition

---

For feedback, questions, or feature ideas, feel free to open an issue or reach out!

