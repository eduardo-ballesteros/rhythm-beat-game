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
    
    clearPlayArea() {
        this.elements.playArea.querySelectorAll('.moving, .recording-arrow, .hit-feedback').forEach(el => el.remove());
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