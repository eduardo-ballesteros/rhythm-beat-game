import { ARROW_KEYS } from './modules/Constants.js';
import gameState from './modules/GameState.js';
import audioSystem from './modules/AudioSystem.js';
import storageManager from './modules/StorageManager.js';
import uiManager from './modules/UIManager.js';
import dancerSystem from './modules/DancerSystem.js';
import recordingSystem from './modules/RecordingSystem.js';
import gameEngine from './modules/GameEngine.js';

class RhythmGame {
    constructor() {
        this.initialized = false;
    }
    
    async initialize() {
        if (this.initialized) return;
        
        // Initialize all systems
        gameState.initializeUIReferences();
        audioSystem.initialize();
        gameEngine.initialize();
        dancerSystem.initialize();
        recordingSystem.initialize();
        uiManager.initializeElements();
        
        // Load data from storage
        this.loadFromStorage();
        
        // Setup UI callbacks
        this.setupUICallbacks();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Add shake animation styles
        this.addStyles();
        
        this.initialized = true;
    }
    
    loadFromStorage() {
        const savedSongs = storageManager.loadSongs();
        const savedDancers = storageManager.loadDancers();
        
        gameState.setCustomSongs(savedSongs);
        gameState.setCustomDancers(savedDancers);
        
        // Show buttons if there are saved items
        uiManager.toggleButton('mySongsBtn', savedSongs.length > 0);
        uiManager.toggleButton('myDancersBtn', savedDancers.length > 0);
    }
    
    setupUICallbacks() {
        const callbacks = {
            getDancerCount: () => gameState.customDancers.length,
            getSongCount: () => gameState.customSongs.length,
            openCamera: (dancerName) => this.openCamera(dancerName),
            startRecording: (songName, baseScore) => this.startRecording(songName, baseScore),
            stopRecording: () => this.stopRecording(),
            showMySongs: () => this.showMySongs(),
            showMyDancers: () => this.showMyDancers(),
            setDuration: (seconds) => this.setDuration(seconds),
            closeCamera: () => this.closeCamera()
        };
        
        uiManager.setCallbacks(callbacks);
        uiManager.setupEventListeners();
    }
    
    setupEventListeners() {
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }
    
    addStyles() {
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = `
            @keyframes shake { 
                0%, 100% { transform: translateX(0); } 
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 
                20%, 40%, 60%, 80% { transform: translateX(5px); } 
            } 
            .animate-shake { animation: shake 0.3s ease-in-out; }
        `;
        document.head.appendChild(styleSheet);
    }
    
    handleKeyDown(e) {
        if (!gameState.isGameRunning) {
            if (e.key === 'Enter') {
                this.startGame();
            }
            return;
        }
        
        if (!ARROW_KEYS.includes(e.key)) return;
        
        if (gameState.isRecording) {
            recordingSystem.handleRecordingKeyPress(e.key, gameState, audioSystem);
        } else {
            gameEngine.handleKeyPress(e.key, gameState, audioSystem, uiManager);
        }
    }
    
    handleKeyUp(e) {
        if (ARROW_KEYS.includes(e.key)) {
            gameEngine.handleKeyRelease(e.key, gameState);
        }
    }
    
    async startGame() {
        gameState.startGame();
        uiManager.clearPlayArea();
        uiManager.showGameUI();
        
        await audioSystem.startAudio();
        
        // Start game timer
        gameState.gameTimerId = setInterval(() => {
            const shouldEnd = gameState.updateTimer();
            if (shouldEnd) {
                this.endGame();
            }
        }, 1000);
        
        // Start game loop
        this.runGameLoop();
    }
    
    runGameLoop() {
        const loop = (timestamp) => {
            const result = gameEngine.gameLoop(timestamp, gameState, audioSystem, uiManager);
            
            if (result === 'END_GAME') {
                this.endGame();
                return;
            }
            
            if (gameState.isGameRunning) {
                gameState.animationFrameId = requestAnimationFrame(loop);
            }
        };
        
        gameState.animationFrameId = requestAnimationFrame(loop);
    }
    
    endGame() {
        gameState.endGame();
        audioSystem.stopAudio();
        dancerSystem.stopPoseAnimation();
        
        if (gameState.isRecording) {
            this.saveRecordedSong();
            uiManager.showMainMenu("Rhythm Beat", "Song Saved!");
        } else {
            uiManager.showGameOverScreen(gameState.score);
        }
    }
    
    startRecording(songName, baseScore) {
        gameState.startRecording(songName, baseScore);
        uiManager.clearPlayArea();
        uiManager.showRecordingUI();
        
        audioSystem.startAudio();
        
        // Start recording timer
        gameState.gameTimerId = setInterval(() => {
            gameState.updateTimer();
        }, 1000);
        
        this.runGameLoop();
    }
    
    stopRecording() {
        this.endGame();
    }
    
    saveRecordedSong() {
        const recordedSong = gameState.getRecordedSong();
        gameState.addCustomSong(recordedSong);
        storageManager.saveSongs(gameState.customSongs);
        uiManager.toggleButton('mySongsBtn', true);
    }
    
    showMySongs() {
        uiManager.populateSongsList(gameState.customSongs, (song) => {
            gameState.setSongChart(song);
            this.startGame();
        });
        uiManager.showModal('mySongsModal');
    }
    
    showMyDancers() {
        uiManager.populateDancersList(gameState.customDancers, (dancer) => {
            dancerSystem.setDancerPoses(dancer.poses);
            dancerSystem.startPoseAnimation();
        });
        uiManager.showModal('myDancersModal');
    }
    
    async openCamera(dancerName) {
        uiManager.showModal('cameraModal');
        const success = await dancerSystem.openCamera();
        
        if (!success) {
            const cameraModal = document.getElementById('camera-modal');
            cameraModal.innerHTML = `
                <p class="text-red-500 text-2xl">Could not access camera. Please check permissions.</p>
                <button onclick="game.closeCamera()" class="mt-4 px-4 py-2 bg-gray-500 rounded">Close</button>
            `;
            return;
        }
        
        // Setup take photo button
        const takePhotoBtn = document.getElementById('take-photo-btn');
        takePhotoBtn.onclick = () => this.takePhotoAndGenerate(dancerName);
    }
    
    closeCamera() {
        dancerSystem.closeCamera();
        uiManager.hideModal('cameraModal');
    }
    
    async takePhotoAndGenerate(dancerName) {
        try {
            uiManager.updateCameraLoading("Analyzing your face...", false);
            
            const base64ImageData = dancerSystem.capturePhoto();
            
            const dancer = await dancerSystem.generateDancer(
                dancerName, 
                base64ImageData,
                (progress) => uiManager.updateCameraLoading(progress, false)
            );
            
            gameState.addCustomDancer(dancer);
            storageManager.saveDancers(gameState.customDancers);
            uiManager.toggleButton('myDancersBtn', true);
            
            this.closeCamera();
            
        } catch (error) {
            console.error("Error generating dancer:", error);
            uiManager.updateCameraLoading("Failed to create character. Please try again.");
            setTimeout(() => {
                uiManager.resetCameraLoading();
            }, 3000);
        }
    }
    
    setDuration(seconds) {
        gameState.setDuration(seconds);
    }
}

// Create global game instance and initialize when page loads
const game = new RhythmGame();
window.game = game; // Make available globally for HTML onclick handlers

window.addEventListener('load', async () => {
    await game.initialize();
});

export default game;