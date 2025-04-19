# 🧭 Oklahoma State University OSU Explorer

An interactive web application that visualizes the Oklahoma State University (OSU) Stillwater campus. Explore buildings, amenities, and green spaces with intelligent search, real-time voice interaction, and AI-enhanced descriptions.

---

![OSU Campus Map Screenshot](./public/screenshot.png) 

## 📋 Table of Contents

- [Features](#-features)
- [Installation](#️-installation)
- [Usage](#-usage)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## 🚀 Features

- **Interactive 3D Map**: Navigate the OSU Stillwater campus with zoom, tilt, and pitch features using Mapbox GL JS.
- **AI-Powered Popups**: Get brief, GPT-generated building descriptions when clicking on map features.
- **Voice Assistant ("Ask Pete")**: Click the mic icon and speak naturally (e.g., *“Tell me about Edmon Low Library”*).
- **WebSocket Integration**: Real-time description streaming from your backend via a persistent connection.
- **Fuzzy Search**: Type partial names or misspellings — powered by Fuse.js — to find buildings and amenities.
- **Layer Controls**: Toggle visibility of buildings, amenities, leisure areas, and land use with checkboxes.
- **Amenity Filtering**: Filter amenities by type (e.g., cafe, library, parking).
- **Feature Highlighting**: Click on features to highlight them, fly to their location, and view AI-generated context.
- **Responsive Design**: Optimized for desktop and mobile devices.
- **(Optional) Dark Mode**: Theme switcher support (if implemented in future).

---

## 🛠️ Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/osu-campus-map.git
cd osu-campus-map
Install dependencies:

bash
Copy
Edit
npm install
Start the development server:

bash
Copy
Edit
npm run dev
Access the application:

Open your browser and navigate to http://localhost:3000

📖 Usage
Search: Use the sidebar search bar for buildings and features. Fuzzy matching supports typos and partial matches.

Click to Learn: Click on buildings or amenities to get a brief AI description.

Voice Assistant: Click 🎙️ to speak with Pete! Try phrases like “Tell me about the Engineering South”.

Layer Toggle: Show/hide layers like buildings, leisure, or landuse in the sidebar.

Amenity Filter: Choose from amenity types to refine map results (e.g., show only ATMs or cafes).

🤝 Contributing
Contributions are welcome! Please follow these steps:

Fork the repository.

Create a new branch:

bash
Copy
Edit
git checkout -b feature/your-feature-name
Commit your changes:

bash
Copy
Edit
git commit -m 'Add your feature'
Push to the branch:

bash
Copy
Edit
git push origin feature/your-feature-name
Open a pull request.

📄 License


Acknowledgments
🗺️ Mapbox — for the dynamic mapping platform.

🧭 OpenStreetMap — for detailed campus geospatial data.

⚛️ React — for building the frontend.

🧠 OpenAI — for GPT-based intelligent descriptions.

📢 Web Speech API — for browser-based voice recognition.

🔶 OSU Brand Management — for official logo and branding guidelines.



