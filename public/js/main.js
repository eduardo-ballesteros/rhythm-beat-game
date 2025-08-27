import { ARROW_KEYS } from './modules/Constants.js';
import gameState from './modules/GameState.js';
import audioSystem from './modules/AudioSystem.js';
import storageManager from './modules/StorageManager.js';
import uiManager from './modules/UIManager.js';
import dancerSystem from './modules/DancerSystem.js';
import recordingSystem from './modules/RecordingSystem.js';
import gameEngine from './modules/GameEngine.js';
import quantizationSystem from './modules/QuantizationSystem.js';
import harmonySystem from './modules/HarmonySystem.js';

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
        try {
            console.log('Loading data from storage...');
            
            const savedSongs = storageManager.loadSongs();
            const savedDancers = storageManager.loadDancers();
            
            console.log(`Loaded ${savedSongs.length} songs and ${savedDancers.length} dancers`);
            
            gameState.setCustomSongs(savedSongs);
            gameState.setCustomDancers(savedDancers);
            
            // Show buttons if there are saved items
            uiManager.toggleButton('mySongsBtn', gameState.customSongs.length > 0);
            uiManager.toggleButton('myDancersBtn', gameState.customDancers.length > 0);
            
            // Show storage warning if needed
            const storageInfo = storageManager.getStorageInfo();
            if (storageInfo.isNearLimit) {
                console.warn(`Storage usage is high: ${storageInfo.usagePercent.toFixed(1)}%`);
                
                // Show warning to user after a delay so it doesn't interfere with startup
                setTimeout(() => {
                    uiManager.showHarmonicFeedback(
                        `Storage ${storageInfo.usagePercent.toFixed(0)}% full - consider deleting old items`, 
                        '#f59e0b', 
                        4000
                    );
                }, 3000);
            }
            
        } catch (error) {
            console.error('Error loading from storage:', error);
            // Don't show error to user during startup, just log it
            
            // Initialize with empty arrays to prevent crashes
            gameState.setCustomSongs([]);
            gameState.setCustomDancers([]);
            uiManager.toggleButton('mySongsBtn', false);
            uiManager.toggleButton('myDancersBtn', false);
        }
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
            closeCamera: () => this.closeCamera(),
            
            // Quantization callbacks
            toggleQuantization: () => this.toggleQuantization(),
            setQuantizationType: (type) => this.setQuantizationType(type),
            toggleBeatGrid: () => this.toggleBeatGrid(),
            toggleBeatSync: () => this.toggleBeatSync(),
            toggleQuantizePreview: () => this.toggleQuantizePreview(),
            
            // Harmony system callbacks
            toggleHarmonicSuggestions: () => this.toggleHarmonicSuggestions(),
            toggleAutoHarmonize: () => this.toggleAutoHarmonize()
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
        
        // Initialize beat grid for playback
        if (gameEngine.showBeatGrid || gameEngine.beatSyncEnabled) {
            gameEngine.startBeatGrid(gameState.duration);
        }
        
        // Show quantization and harmony controls during gameplay
        uiManager.showQuantizationControls();
        uiManager.showHarmonyControls();
        this.updateQuantizationUI();
        this.updateHarmonyUI();
        
        // Show musical context
        const musicalContext = audioSystem.getMusicalContext();
        uiManager.showMusicalContext(musicalContext);
        
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
        
        // Clean up quantization systems
        if (gameState.isRecording) {
            recordingSystem.stopRecordingMetronome();
            uiManager.hideMeasureCounter();
        }
        gameEngine.stopBeatGrid();
        uiManager.hideQuantizationControls();
        uiManager.hideHarmonyControls();
        uiManager.hideMusicalContext();
        uiManager.hideBeatPosition();
        
        if (gameState.isRecording) {
            this.saveRecordedSong();
            uiManager.showMainMenu("Rhythm Beat", "Song Saved!");
        } else {
            uiManager.showGameOverScreen(gameState.score);
        }
    }
    
    startRecording(songName, baseScore) {
        // Recording no longer has duration limits - removed duration adjustment logic
        
        gameState.startRecording(songName, baseScore);
        uiManager.clearPlayArea();
        uiManager.showRecordingUI();
        
        audioSystem.startAudio();
        
        // Start recording with metronome and harmony features
        recordingSystem.startRecordingWithHarmony(gameState.gameStartTime);
        
        // Show quantization and harmony controls and measure counter
        uiManager.showQuantizationControls();
        uiManager.showHarmonyControls();
        uiManager.showMeasureCounter();
        this.updateQuantizationUI();
        this.updateHarmonyUI();
        
        // Show musical context for recording
        const musicalContext = audioSystem.getMusicalContext();
        uiManager.showMusicalContext(musicalContext);
        
        // Start recording timer - no auto-stop based on duration
        gameState.gameTimerId = setInterval(() => {
            // Update timer (recording time counts up indefinitely)
            gameState.updateTimer();
            
            // Update measure counter
            const elapsedTime = performance.now() - gameState.gameStartTime;
            const position = quantizationSystem.getMusicalPosition(elapsedTime);
            uiManager.updateMeasureCounter(position.measure);
        }, 1000);
        
        this.runGameLoop();
    }
    
    stopRecording() {
        this.endGame();
    }
    
    saveRecordedSong() {
        try {
            console.log('Starting song save process...');
            
            // Get the recorded song data
            let recordedSong;
            try {
                recordedSong = gameState.getRecordedSong();
            } catch (error) {
                console.error('Failed to get recorded song data:', error);
                uiManager.showHarmonicFeedback('Error: Could not generate song data', '#ef4444', 3000);
                return;
            }
            
            // Apply quantization and harmonic processing to recorded notes
            if (recordingSystem.quantizationEnabled) {
                try {
                    const processedData = recordingSystem.processRecordedNotesWithHarmony(recordedSong.chart);
                    recordedSong.chart = processedData.notes;
                    recordedSong.quantized = true;
                    recordedSong.harmonicAnalysis = processedData.harmonicAnalysis;
                    recordedSong.musicalScore = processedData.musicalScore;
                    
                    // Show harmonic feedback
                    if (processedData.harmonicAnalysis.harmonicFit > 0.8) {
                        uiManager.showHarmonicFeedback("Excellent Harmony! ✨", '#10b981');
                    } else if (processedData.harmonicAnalysis.harmonicFit > 0.6) {
                        uiManager.showHarmonicFeedback("Good Musical Flow", '#3b82f6');
                    }
                } catch (error) {
                    console.warn('Harmonic processing failed, saving song without processing:', error);
                    uiManager.showHarmonicFeedback('Saved song without harmonic processing', '#f59e0b', 2000);
                }
            }
            
            // Add song to game state
            try {
                gameState.addCustomSong(recordedSong);
            } catch (error) {
                console.error('Failed to add song to game state:', error);
                uiManager.showHarmonicFeedback('Error: Invalid song data', '#ef4444', 3000);
                return;
            }
            
            // Attempt to save to storage with comprehensive error handling
            try {
                storageManager.saveSongs(gameState.customSongs);
                console.log('Song saved successfully!');
                uiManager.toggleButton('mySongsBtn', true);
                
                // Show storage status
                const storageInfo = storageManager.getStorageInfo();
                if (storageInfo.isNearLimit) {
                    uiManager.showHarmonicFeedback(
                        `Song saved! Storage ${storageInfo.usagePercent.toFixed(0)}% full`, 
                        '#f59e0b', 
                        3000
                    );
                }
                
            } catch (error) {
                console.error('Failed to save songs to storage:', error);
                
                // Handle specific storage errors
                if (error.type === 'STORAGE_LIMIT_EXCEEDED') {
                    this.handleStorageFullError(error, recordedSong);
                } else if (error.type === 'QUOTA_EXCEEDED') {
                    this.handleQuotaExceededError(recordedSong);
                } else {
                    // General storage error
                    uiManager.showHarmonicFeedback(
                        'Failed to save song: Storage error', 
                        '#ef4444', 
                        4000
                    );
                    
                    // Offer retry option
                    setTimeout(() => {
                        if (confirm('Song save failed. Would you like to try again?')) {
                            this.saveRecordedSong();
                        } else {
                            // Remove song from memory since it couldn't be saved
                            gameState.customSongs.pop();
                        }
                    }, 4000);
                }
            }
        } catch (error) {
            console.error('Unexpected error during song save:', error);
            uiManager.showHarmonicFeedback('Unexpected error saving song', '#ef4444', 3000);
        }
    }
    
    handleStorageFullError(error, recordedSong) {
        console.log('Storage limit exceeded, attempting automatic cleanup...');
        
        const storageInfo = storageManager.getStorageInfo();
        const message = `Storage full (${storageInfo.usagePercent.toFixed(0)}%). Need ${error.requiredSpace.toFixed(1)}MB space.`;
        
        uiManager.showHarmonicFeedback(message, '#f59e0b', 5000);
        
        // Try to automatically free up space
        setTimeout(() => {
            if (confirm(`${message} Delete oldest songs to make space?`)) {
                const spaceNeeded = error.requiredSpace;
                if (storageManager.freeUpSpace(spaceNeeded)) {
                    uiManager.showHarmonicFeedback('Freed up space, saving song...', '#3b82f6', 2000);
                    
                    // Reload songs after cleanup
                    const savedSongs = storageManager.loadSongs();
                    gameState.setCustomSongs(savedSongs);
                    
                    // Try saving again
                    setTimeout(() => {
                        try {
                            storageManager.saveSongs(gameState.customSongs);
                            uiManager.showHarmonicFeedback('Song saved after cleanup!', '#10b981', 3000);
                            uiManager.toggleButton('mySongsBtn', true);
                        } catch (retryError) {
                            console.error('Failed to save even after cleanup:', retryError);
                            uiManager.showHarmonicFeedback('Save failed even after cleanup', '#ef4444', 3000);
                            gameState.customSongs.pop(); // Remove from memory
                        }
                    }, 2000);
                } else {
                    uiManager.showHarmonicFeedback('Could not free enough space', '#ef4444', 3000);
                    gameState.customSongs.pop(); // Remove from memory
                }
            } else {
                gameState.customSongs.pop(); // Remove from memory
            }
        }, 5000);
    }
    
    handleQuotaExceededError(recordedSong) {
        console.log('Browser storage quota exceeded');
        
        uiManager.showHarmonicFeedback(
            'Browser storage limit reached. Clear browser data or try again.', 
            '#ef4444', 
            5000
        );
        
        setTimeout(() => {
            if (confirm('Browser storage is full. Clear all game data to make space? (This will delete all songs and dancers)')) {
                if (storageManager.clearAllData()) {
                    // Reset game state
                    gameState.setCustomSongs([]);
                    gameState.setCustomDancers([]);
                    uiManager.toggleButton('mySongsBtn', false);
                    uiManager.toggleButton('myDancersBtn', false);
                    
                    // Try saving the current song again
                    gameState.customSongs = [recordedSong];
                    try {
                        storageManager.saveSongs(gameState.customSongs);
                        uiManager.showHarmonicFeedback('Data cleared, song saved!', '#10b981', 3000);
                        uiManager.toggleButton('mySongsBtn', true);
                    } catch (error) {
                        console.error('Failed to save even after clearing all data:', error);
                        uiManager.showHarmonicFeedback('Failed to save even after data clear', '#ef4444', 3000);
                    }
                } else {
                    uiManager.showHarmonicFeedback('Failed to clear data', '#ef4444', 3000);
                }
            } else {
                gameState.customSongs.pop(); // Remove from memory
            }
        }, 5000);
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
    
    // Quantization control methods
    toggleQuantization() {
        const enabled = recordingSystem.toggleQuantization();
        this.updateQuantizationUI();
        return enabled;
    }
    
    setQuantizationType(type) {
        recordingSystem.setQuantizationType(type);
        this.updateQuantizationUI();
    }
    
    toggleBeatGrid() {
        const enabled = gameEngine.toggleBeatGrid();
        this.updateQuantizationUI();
        return enabled;
    }
    
    toggleBeatSync() {
        const enabled = gameEngine.toggleBeatSync();
        this.updateQuantizationUI();
        return enabled;
    }
    
    toggleQuantizePreview() {
        const enabled = recordingSystem.toggleQuantizationPreview();
        this.updateQuantizationUI();
        return enabled;
    }
    
    // Harmony system control methods
    toggleHarmonicSuggestions() {
        const enabled = recordingSystem.toggleHarmonicSuggestions();
        this.updateHarmonyUI();
        return enabled;
    }
    
    toggleAutoHarmonize() {
        const enabled = recordingSystem.toggleAutoHarmonize();
        harmonySystem.toggleAutoHarmonize();
        this.updateHarmonyUI();
        return enabled;
    }
    
    // Update quantization UI with current settings
    updateQuantizationUI() {
        const settings = {
            quantization: recordingSystem.getQuantizationSettings(),
            beatGrid: gameEngine.getBeatGridSettings()
        };
        
        uiManager.updateQuantizationControls(settings);
    }
    
    // Update harmony UI with current settings
    updateHarmonyUI() {
        const settings = recordingSystem.getHarmonySettings();
        uiManager.updateHarmonyControls(settings);
        
        // Update musical context display
        const musicalContext = audioSystem.getMusicalContext();
        if (musicalContext) {
            uiManager.showMusicalContext(musicalContext);
        }
    }
}

// Create global game instance and initialize when page loads
const game = new RhythmGame();
window.game = game; // Make available globally for HTML onclick handlers

// Setup keyboard shortcuts for quantization and harmony
window.addEventListener('keydown', (e) => {
    if (e.key === 'q' && e.ctrlKey) {
        e.preventDefault();
        game.toggleQuantization();
    } else if (e.key === 'g' && e.ctrlKey) {
        e.preventDefault();
        game.toggleBeatGrid();
    } else if (e.key === 's' && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        game.toggleBeatSync();
    } else if (e.key === 'h' && e.ctrlKey) {
        e.preventDefault();
        game.toggleHarmonicSuggestions();
    } else if (e.key === 'm' && e.ctrlKey) {
        e.preventDefault();
        game.toggleAutoHarmonize();
    }
});

window.addEventListener('load', async () => {
    await game.initialize();
});

export default game;