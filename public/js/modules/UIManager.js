class UIManager {
    constructor() {
        this.elements = {};
        this.callbacks = {};
    }
    
    initializeElements() {
        // Get all UI elements
        this.elements = {
            gameContainer: document.getElementById('game-container'),
            gameUi: document.getElementById('game-ui'),
            recordUi: document.getElementById('record-ui'),
            playArea: document.getElementById('play-area'),
            messageScreen: document.getElementById('message-screen'),
            messageTitle: document.getElementById('message-title'),
            messageText: document.getElementById('message-text'),
            finalScore: document.getElementById('final-score'),
            
            // Buttons
            createDancerBtn: document.getElementById('create-dancer-btn'),
            recordSongBtn: document.getElementById('record-song-btn'),
            mySongsBtn: document.getElementById('my-songs-btn'),
            myDancersBtn: document.getElementById('my-dancers-btn'),
            stopRecordingBtn: document.getElementById('stop-recording-btn'),
            duration30sBtn: document.getElementById('duration-30s'),
            duration120sBtn: document.getElementById('duration-120s'),
            
            // Quantization controls
            quantizeToggleBtn: document.getElementById('quantize-toggle-btn'),
            quantizeTypeSelect: document.getElementById('quantize-type-select'),
            beatGridToggleBtn: document.getElementById('beat-grid-toggle-btn'),
            beatSyncToggleBtn: document.getElementById('beat-sync-toggle-btn'),
            quantizePreviewBtn: document.getElementById('quantize-preview-btn'),
            
            // Modals
            cameraModal: document.getElementById('camera-modal'),
            mySongsModal: document.getElementById('my-songs-modal'),
            myDancersModal: document.getElementById('my-dancers-modal'),
            namePromptModal: document.getElementById('name-prompt-modal'),
            
            // Modal content
            mySongsList: document.getElementById('my-songs-list'),
            myDancersList: document.getElementById('my-dancers-list'),
            namePromptTitle: document.getElementById('name-prompt-title'),
            namePromptInput: document.getElementById('name-prompt-input'),
            scoreSelector: document.getElementById('score-selector'),
            
            // Camera elements
            videoFeed: document.getElementById('video-feed'),
            photoCanvas: document.getElementById('photo-canvas'),
            cameraLoading: document.getElementById('camera-loading'),
            cameraButtons: document.getElementById('camera-buttons'),
            
            // Other elements
            receptorContainer: document.getElementById('receptor-container'),
            dancerImg: document.getElementById('dancer-img')
        };
    }
    
    setCallbacks(callbacks) {
        this.callbacks = callbacks;
    }
    
    setupEventListeners() {
        // Main menu buttons
        this.elements.createDancerBtn.addEventListener('click', () => {
            this.showNamePrompt('Enter Dancer Name', `Dancer ${this.callbacks.getDancerCount() + 1}`, false, this.callbacks.openCamera);
        });
        
        this.elements.recordSongBtn.addEventListener('click', () => {
            this.showNamePrompt('Enter Song Name', `My Song ${this.callbacks.getSongCount() + 1}`, true, this.callbacks.startRecording);
        });
        
        this.elements.mySongsBtn.addEventListener('click', this.callbacks.showMySongs);
        this.elements.myDancersBtn.addEventListener('click', this.callbacks.showMyDancers);
        this.elements.stopRecordingBtn.addEventListener('click', this.callbacks.stopRecording);
        
        // Duration buttons
        this.elements.duration30sBtn.addEventListener('click', () => this.callbacks.setDuration(30));
        this.elements.duration120sBtn.addEventListener('click', () => this.callbacks.setDuration(120));
        
        // Quantization controls (if they exist)
        if (this.elements.quantizeToggleBtn) {
            this.elements.quantizeToggleBtn.addEventListener('click', this.callbacks.toggleQuantization);
        }
        if (this.elements.quantizeTypeSelect) {
            this.elements.quantizeTypeSelect.addEventListener('change', (e) => 
                this.callbacks.setQuantizationType(e.target.value));
        }
        if (this.elements.beatGridToggleBtn) {
            this.elements.beatGridToggleBtn.addEventListener('click', this.callbacks.toggleBeatGrid);
        }
        if (this.elements.beatSyncToggleBtn) {
            this.elements.beatSyncToggleBtn.addEventListener('click', this.callbacks.toggleBeatSync);
        }
        if (this.elements.quantizePreviewBtn) {
            this.elements.quantizePreviewBtn.addEventListener('click', this.callbacks.toggleQuantizePreview);
        }
        
        // Harmony control event listeners
        document.addEventListener('click', (e) => {
            if (e.target.id === 'harmony-suggestions-btn') {
                this.callbacks.toggleHarmonicSuggestions();
            } else if (e.target.id === 'auto-harmonize-btn') {
                this.callbacks.toggleAutoHarmonize();
            }
        });
        
        // Modal close buttons
        document.getElementById('close-songs-btn').addEventListener('click', () => this.hideModal('mySongsModal'));
        document.getElementById('close-dancers-btn').addEventListener('click', () => this.hideModal('myDancersModal'));
        document.getElementById('close-camera-btn').addEventListener('click', this.callbacks.closeCamera);
        document.getElementById('name-prompt-cancel').addEventListener('click', () => this.hideModal('namePromptModal'));
        
        // Score selector
        this.elements.scoreSelector.addEventListener('click', (e) => {
            if (e.target.classList.contains('score-option')) {
                document.querySelectorAll('.score-option').forEach(btn => 
                    btn.classList.replace('border-yellow-400', 'border-transparent'));
                e.target.classList.replace('border-transparent', 'border-yellow-400');
            }
        });
    }
    
    showGameUI() {
        this.elements.messageScreen.style.display = 'none';
        this.elements.gameUi.classList.remove('hidden');
        this.elements.recordUi.classList.add('hidden');
        this.elements.stopRecordingBtn.classList.add('hidden');
    }
    
    showRecordingUI() {
        this.elements.messageScreen.style.display = 'none';
        this.elements.recordUi.classList.remove('hidden');
        this.elements.gameUi.classList.add('hidden');
        this.elements.stopRecordingBtn.classList.remove('hidden');
    }
    
    showMainMenu(title = "Rhythm Beat", text = "Press Enter to Start") {
        this.elements.messageScreen.style.display = 'flex';
        this.elements.gameUi.classList.add('hidden');
        this.elements.recordUi.classList.add('hidden');
        this.elements.stopRecordingBtn.classList.add('hidden');
        this.elements.messageTitle.textContent = title;
        this.elements.messageText.textContent = text;
        this.elements.finalScore.classList.add('hidden');
    }
    
    showGameOverScreen(score) {
        this.showMainMenu("Time's Up!", 'Press Enter to play again.');
        this.elements.finalScore.textContent = `Final Score: ${score}`;
        this.elements.finalScore.classList.remove('hidden');
    }
    
    showModal(modalName) {
        if (this.elements[modalName]) {
            this.elements[modalName].style.display = 'flex';
        }
    }
    
    hideModal(modalName) {
        if (this.elements[modalName]) {
            this.elements[modalName].style.display = 'none';
        }
    }
    
    showNamePrompt(title, placeholder, showScores, callback) {
        this.elements.namePromptTitle.textContent = title;
        this.elements.namePromptInput.placeholder = placeholder;
        this.elements.namePromptInput.value = '';
        this.elements.scoreSelector.style.display = showScores ? 'block' : 'none';
        this.showModal('namePromptModal');
        
        // Remove any existing click handlers
        const newSaveBtn = this.elements.namePromptModal.querySelector('#name-prompt-save').cloneNode(true);
        this.elements.namePromptModal.querySelector('#name-prompt-save').parentNode.replaceChild(
            newSaveBtn, this.elements.namePromptModal.querySelector('#name-prompt-save')
        );
        
        newSaveBtn.onclick = () => {
            const name = this.elements.namePromptInput.value.trim() || placeholder;
            const selectedScore = document.querySelector('.score-option.border-yellow-400').dataset.score;
            this.hideModal('namePromptModal');
            if (showScores) {
                callback(name, parseInt(selectedScore));
            } else {
                callback(name);
            }
        };
    }
    
    populateSongsList(songs, onSongSelect) {
        this.elements.mySongsList.innerHTML = '';
        if (songs.length === 0) {
            this.elements.mySongsList.innerHTML = '<p>No songs recorded yet!</p>';
        } else {
            songs.forEach((song) => {
                const songEl = document.createElement('button');
                songEl.textContent = `${song.name} (Score: ${song.score})`;
                songEl.className = 'block w-full text-left p-2 bg-gray-700 hover:bg-gray-600 rounded mb-2';
                songEl.onclick = () => {
                    this.hideModal('mySongsModal');
                    onSongSelect(song);
                };
                this.elements.mySongsList.appendChild(songEl);
            });
        }
    }
    
    populateDancersList(dancers, onDancerSelect) {
        this.elements.myDancersList.innerHTML = '';
        if (dancers.length === 0) {
            this.elements.myDancersList.innerHTML = '<p>No dancers created yet!</p>';
        } else {
            dancers.forEach((dancer) => {
                const dancerEl = document.createElement('button');
                dancerEl.textContent = dancer.name;
                dancerEl.className = 'block w-full text-left p-2 bg-gray-700 hover:bg-gray-600 rounded mb-2';
                dancerEl.onclick = () => {
                    this.hideModal('myDancersModal');
                    onDancerSelect(dancer);
                };
                this.elements.myDancersList.appendChild(dancerEl);
            });
        }
    }
    
    toggleButton(buttonName, show) {
        if (this.elements[buttonName]) {
            this.elements[buttonName].classList.toggle('hidden', !show);
        }
    }
    
    showHitFeedback(text, receptor, color, size) {
        const feedbackEl = document.createElement('div');
        feedbackEl.textContent = text;
        feedbackEl.className = 'hit-feedback';
        feedbackEl.style.fontSize = `${size}px`;
        feedbackEl.style.color = color;
        
        const receptorRect = receptor.getBoundingClientRect();
        const playAreaRect = this.elements.playArea.getBoundingClientRect();
        
        feedbackEl.style.left = `${receptorRect.left - playAreaRect.left + (receptorRect.width / 2)}px`;
        feedbackEl.style.top = `${receptorRect.bottom - playAreaRect.top + 10}px`;
        feedbackEl.style.transform = 'translateX(-50%)';
        
        this.elements.playArea.appendChild(feedbackEl);
        setTimeout(() => feedbackEl.remove(), 500);
    }
    
    addShakeAnimation() {
        this.elements.gameContainer.classList.add('animate-shake');
        setTimeout(() => this.elements.gameContainer.classList.remove('animate-shake'), 300);
    }
    
    // Create quantization controls
    createQuantizationControls() {
        const quantizationPanel = document.createElement('div');
        quantizationPanel.id = 'quantization-panel';
        quantizationPanel.className = 'fixed bottom-4 right-4 bg-gray-800 p-4 rounded-lg border border-gray-600 z-20';
        quantizationPanel.style.display = 'none';
        
        quantizationPanel.innerHTML = `
            <div class="text-white text-sm font-bold mb-2">Quantization</div>
            
            <div class="flex items-center gap-2 mb-2">
                <button id="quantize-toggle-btn" 
                        class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                    Quantize: ON
                </button>
                
                <select id="quantize-type-select" 
                        class="px-2 py-1 bg-gray-700 text-white rounded border border-gray-600">
                    <option value="16th">16th Notes</option>
                    <option value="8th">8th Notes</option>
                    <option value="quarter">Quarter Notes</option>
                </select>
            </div>
            
            <div class="flex gap-2 mb-2">
                <button id="beat-grid-toggle-btn" 
                        class="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors text-xs">
                    Grid: OFF
                </button>
                
                <button id="beat-sync-toggle-btn" 
                        class="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors text-xs">
                    Sync: OFF
                </button>
                
                <button id="quantize-preview-btn" 
                        class="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors text-xs">
                    Preview: ON
                </button>
            </div>
            
            <div class="text-xs text-gray-400">
                <div id="quantization-info">BPM: 128 | 4/4 Time</div>
            </div>
        `;
        
        document.body.appendChild(quantizationPanel);
        
        // Re-query elements to include new controls
        this.initializeElements();
    }
    
    // Show quantization controls
    showQuantizationControls() {
        const panel = document.getElementById('quantization-panel');
        if (!panel) {
            this.createQuantizationControls();
        } else {
            panel.style.display = 'block';
        }
    }
    
    // Hide quantization controls
    hideQuantizationControls() {
        const panel = document.getElementById('quantization-panel');
        if (panel) {
            panel.style.display = 'none';
        }
    }
    
    // Create harmony controls
    createHarmonyControls() {
        const harmonyPanel = document.createElement('div');
        harmonyPanel.id = 'harmony-panel';
        harmonyPanel.className = 'fixed bottom-20 right-4 bg-gray-800 p-4 rounded-lg border border-gray-600 z-20';
        harmonyPanel.style.display = 'none';
        
        harmonyPanel.innerHTML = `
            <div class="text-white text-sm font-bold mb-2">Musical Intelligence</div>
            
            <div class="flex items-center gap-2 mb-2">
                <button id="harmony-suggestions-btn" 
                        class="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-xs">
                    Suggestions: ON
                </button>
                
                <button id="auto-harmonize-btn" 
                        class="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors text-xs">
                    Auto-Harmony: OFF
                </button>
            </div>
            
            <div class="text-xs text-gray-400 mb-2">
                <div id="current-chord-info">Current: Am</div>
                <div id="progression-info">Progression: Am → F → C → G</div>
            </div>
            
            <div class="text-xs text-gray-400">
                <div class="mb-1">Lead Synth (→) plays:</div>
                <div class="text-yellow-300">Smart chord-aware notes</div>
            </div>
        `;
        
        document.body.appendChild(harmonyPanel);
        
        // Re-query elements to include new controls
        this.initializeElements();
    }
    
    // Show harmony controls
    showHarmonyControls() {
        const panel = document.getElementById('harmony-panel');
        if (!panel) {
            this.createHarmonyControls();
        } else {
            panel.style.display = 'block';
        }
    }
    
    // Hide harmony controls
    hideHarmonyControls() {
        const panel = document.getElementById('harmony-panel');
        if (panel) {
            panel.style.display = 'none';
        }
    }
    
    // Update harmony button states
    updateHarmonyControls(settings) {
        const suggestionsBtn = document.getElementById('harmony-suggestions-btn');
        const autoHarmonizeBtn = document.getElementById('auto-harmonize-btn');
        const chordInfoDiv = document.getElementById('current-chord-info');
        
        if (suggestionsBtn) {
            suggestionsBtn.textContent = `Suggestions: ${settings.harmonicSuggestions ? 'ON' : 'OFF'}`;
            suggestionsBtn.className = settings.harmonicSuggestions
                ? 'px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-xs'
                : 'px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors text-xs';
        }
        
        if (autoHarmonizeBtn) {
            autoHarmonizeBtn.textContent = `Auto-Harmony: ${settings.autoHarmonize ? 'ON' : 'OFF'}`;
            autoHarmonizeBtn.className = settings.autoHarmonize
                ? 'px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-xs'
                : 'px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors text-xs';
        }
        
        if (chordInfoDiv && settings.currentChord) {
            chordInfoDiv.textContent = `Current: ${settings.currentChord}`;
        }
    }
    
    // Show musical context indicator
    showMusicalContext(context) {
        let contextIndicator = document.getElementById('musical-context-indicator');
        if (!contextIndicator) {
            contextIndicator = document.createElement('div');
            contextIndicator.id = 'musical-context-indicator';
            contextIndicator.className = 'fixed top-4 left-4 bg-gray-800 px-4 py-2 rounded-lg text-white font-bold z-10 border border-gray-600';
            document.body.appendChild(contextIndicator);
        }
        
        contextIndicator.innerHTML = `
            <div class="text-sm">
                <span class="text-yellow-400">${context.currentChord}</span> 
                <span class="text-gray-400">|</span> 
                <span class="text-blue-400">${context.keyCenter}</span>
            </div>
            <div class="text-xs text-gray-400">${context.progressPosition}</div>
        `;
        
        contextIndicator.style.display = 'block';
    }
    
    // Hide musical context indicator
    hideMusicalContext() {
        const indicator = document.getElementById('musical-context-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }
    
    // Show harmonic feedback popup
    showHarmonicFeedback(message, color = '#10b981', duration = 2000) {
        const feedback = document.createElement('div');
        feedback.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-6 py-3 rounded-lg font-bold text-white z-50';
        feedback.style.backgroundColor = color;
        feedback.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        feedback.textContent = message;
        
        document.body.appendChild(feedback);
        
        // Animate in
        feedback.style.opacity = '0';
        feedback.style.transform = 'translate(-50%, -50%) scale(0.8)';
        setTimeout(() => {
            feedback.style.transition = 'all 0.3s ease';
            feedback.style.opacity = '1';
            feedback.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 10);
        
        // Animate out
        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transform = 'translate(-50%, -50%) scale(0.8)';
            setTimeout(() => feedback.remove(), 300);
        }, duration);
    }
    
    // Update quantization button states
    updateQuantizationControls(settings) {
        const quantizeBtn = document.getElementById('quantize-toggle-btn');
        const beatGridBtn = document.getElementById('beat-grid-toggle-btn');
        const beatSyncBtn = document.getElementById('beat-sync-toggle-btn');
        const previewBtn = document.getElementById('quantize-preview-btn');
        const typeSelect = document.getElementById('quantize-type-select');
        const infoDiv = document.getElementById('quantization-info');
        
        if (quantizeBtn) {
            quantizeBtn.textContent = `Quantize: ${settings.quantization?.enabled ? 'ON' : 'OFF'}`;
            quantizeBtn.className = settings.quantization?.enabled 
                ? 'px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
                : 'px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors';
        }
        
        if (beatGridBtn) {
            beatGridBtn.textContent = `Grid: ${settings.beatGrid?.showGrid ? 'ON' : 'OFF'}`;
            beatGridBtn.className = settings.beatGrid?.showGrid
                ? 'px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs'
                : 'px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors text-xs';
        }
        
        if (beatSyncBtn) {
            beatSyncBtn.textContent = `Sync: ${settings.beatGrid?.beatSync ? 'ON' : 'OFF'}`;
            beatSyncBtn.className = settings.beatGrid?.beatSync
                ? 'px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs'
                : 'px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors text-xs';
        }
        
        if (previewBtn) {
            previewBtn.textContent = `Preview: ${settings.quantization?.preview ? 'ON' : 'OFF'}`;
            previewBtn.className = settings.quantization?.preview
                ? 'px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs'
                : 'px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors text-xs';
        }
        
        if (typeSelect && settings.quantization?.type) {
            typeSelect.value = settings.quantization.type;
        }
        
        if (infoDiv && settings.quantization) {
            const interval = Math.round(settings.quantization.interval);
            infoDiv.textContent = `BPM: ${settings.quantization.bpm} | Interval: ${interval}ms`;
        }
    }
    
    // Show measure counter
    showMeasureCounter() {
        let measureCounter = document.getElementById('measure-counter');
        if (!measureCounter) {
            measureCounter = document.createElement('div');
            measureCounter.id = 'measure-counter';
            measureCounter.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-gray-800 px-4 py-2 rounded text-white font-bold z-10';
            document.body.appendChild(measureCounter);
        }
        measureCounter.style.display = 'block';
        measureCounter.textContent = 'Measure: 1';
    }
    
    // Update measure counter
    updateMeasureCounter(measureNumber) {
        const counter = document.getElementById('measure-counter');
        if (counter) {
            counter.textContent = `Measure: ${measureNumber + 1}`;
        }
    }
    
    // Hide measure counter
    hideMeasureCounter() {
        const counter = document.getElementById('measure-counter');
        if (counter) {
            counter.style.display = 'none';
        }
    }
    
    // Show beat position indicator
    showBeatPosition(position) {
        let beatPos = document.getElementById('beat-position');
        if (!beatPos) {
            beatPos = document.createElement('div');
            beatPos.id = 'beat-position';
            beatPos.className = 'fixed top-32 left-1/2 transform -translate-x-1/2 bg-blue-900 px-3 py-1 rounded text-white text-sm z-10';
            document.body.appendChild(beatPos);
        }
        
        beatPos.textContent = `${position.measure + 1}.${position.beat + 1}.${position.subdivision + 1}`;
    }
    
    // Hide beat position indicator
    hideBeatPosition() {
        const beatPos = document.getElementById('beat-position');
        if (beatPos) {
            beatPos.style.display = 'none';
        }
    }
    
    clearPlayArea() {
        this.elements.playArea.querySelectorAll('.moving, .recording-arrow, .hit-feedback, .beat-marker, .quantization-feedback').forEach(el => el.remove());
    }
    
    updateCameraLoading(text, showButtons = true) {
        this.elements.cameraLoading.textContent = text;
        this.elements.cameraLoading.classList.toggle('hidden', false);
        this.elements.cameraButtons.classList.toggle('hidden', !showButtons);
    }
    
    resetCameraLoading() {
        this.elements.cameraLoading.textContent = "AI is creating your character...";
        this.elements.cameraLoading.classList.add('hidden');
        this.elements.cameraButtons.classList.remove('hidden');
    }
}

// Create singleton instance
const uiManager = new UIManager();
export default uiManager;