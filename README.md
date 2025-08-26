# Rhythm Beat Game

A web-based rhythm game with AI-powered dancer creation and song recording capabilities.

## Features

- **Rhythm Gameplay**: Press arrow keys in sync with music
- **Song Recording**: Create custom songs by recording your key presses
- **AI Dancers**: Generate animated characters using your camera and AI
- **Local Storage**: Save your songs and dancers locally
- **Modular Architecture**: Clean, maintainable codebase

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Modern web browser with ES6 module support

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/rhythm-beat-game.git
cd rhythm-beat-game
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## Game Controls

- **Arrow Keys**: Hit the notes as they reach the receptors
- **Enter**: Start game or navigate menus
- **Camera**: Create AI dancers using your webcam

## Project Structure

```
public/
├── index.html              # Main HTML file
├── js/
│   ├── main.js            # Main entry point
│   └── modules/
│       ├── AudioSystem.js    # Audio and music management
│       ├── Constants.js      # Game configuration
│       ├── DancerSystem.js   # AI dancer functionality
│       ├── GameEngine.js     # Core game mechanics
│       ├── GameState.js      # State management
│       ├── RecordingSystem.js # Song recording
│       ├── StorageManager.js # Local storage
│       └── UIManager.js      # UI and modal management
server.js                   # Express server
```

## Technologies Used

- **Frontend**: Vanilla JavaScript (ES6 modules), HTML5, CSS3
- **Audio**: Tone.js for web audio synthesis
- **Server**: Node.js with Express
- **AI Integration**: Google Gemini API for dancer generation
- **Styling**: Tailwind CSS

## Development

- `npm start` - Start the production server
- `npm run dev` - Start the development server

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).