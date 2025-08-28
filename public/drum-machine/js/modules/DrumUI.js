/**
 * DrumUI.js
 * User interface and grid management for the drum machine
 */

import { DRUM_NAMES, DRUM_COLORS, DRUM_MACHINE_CONFIG } from './DrumConstants.js';

export class DrumUI {
    constructor(sequencer, patternGenerator) {
        this.sequencer = sequencer;
        this.patternGenerator = patternGenerator;
        
        this.elements = {};
        this.initialized = false;
        
        // Bind methods to maintain context
        this.handleStepClick = this.handleStepClick.bind(this);
        this.handlePlayPause = this.handlePlayPause.bind(this);
        this.handleReset = this.handleReset.bind(this);
        this.handleBpmChange = this.handleBpmChange.bind(this);
        this.handleGeneratePattern = this.handleGeneratePattern.bind(this);
        this.handleInputKeyPress = this.handleInputKeyPress.bind(this);
        this.onStepChange = this.onStepChange.bind(this);
        this.handleMelodyToggle = this.handleMelodyToggle.bind(this);
        this.handleNewMelody = this.handleNewMelody.bind(this);
    }

    /**
     * Initialize UI elements and event listeners
     */
    init() {
        if (this.initialized) {
            return;
        }

        this.cacheElements();
        this.createDrumGrid();
        this.attachEventListeners();
        this.updateUI();
        
        this.initialized = true;
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            playButton: document.getElementById('play-button'),
            resetButton: document.getElementById('reset-button'),
            generateButton: document.getElementById('generate-button'),
            bpmSlider: document.getElementById('bpm-slider'),
            bpmDisplay: document.getElementById('bpm-display'),
            userInput: document.getElementById('user-input'),
            drumGrid: document.getElementById('drum-grid'),
            stepNumbers: document.getElementById('step-numbers'),
            melodyToggle: document.getElementById('melody-toggle'),
            newMelodyButton: document.getElementById('new-melody-button'),
            chordDisplay: document.getElementById('chord-display')
        };
    }

    /**
     * Create the drum grid UI
     */
    createDrumGrid() {
        if (!this.elements.drumGrid) {
            console.error('Drum grid element not found');
            return;
        }

        // Clear existing content
        this.elements.drumGrid.innerHTML = '';

        // Create step numbers row
        this.createStepNumbers();

        // Create drum rows
        const drumTypes = this.sequencer.getDrumTypes();
        drumTypes.forEach(drumType => {
            this.createDrumRow(drumType);
        });
    }

    /**
     * Create step numbers header
     */
    createStepNumbers() {
        const stepNumbersDiv = document.createElement('div');
        stepNumbersDiv.className = 'flex gap-2 mb-4';
        stepNumbersDiv.id = 'step-numbers';
        
        // Empty space for drum name column
        const emptyCell = document.createElement('div');
        emptyCell.className = 'w-20 flex-shrink-0';
        stepNumbersDiv.appendChild(emptyCell);

        // Step number cells
        for (let i = 0; i < DRUM_MACHINE_CONFIG.STEPS_COUNT; i++) {
            const stepCell = document.createElement('div');
            stepCell.className = 'w-12 text-center text-xs text-gray-400 font-mono';
            stepCell.textContent = (i + 1).toString();
            stepNumbersDiv.appendChild(stepCell);
        }

        this.elements.drumGrid.appendChild(stepNumbersDiv);
    }


    /**
     * Create a drum row
     * @param {string} drumType - Type of drum (kick, snare, etc.)
     */
    createDrumRow(drumType) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'flex gap-2 items-center mb-3';
        rowDiv.id = `${drumType}-row`;

        // Drum name label
        const labelDiv = document.createElement('div');
        labelDiv.className = 'w-20 text-right text-sm font-medium text-gray-300 flex-shrink-0';
        labelDiv.textContent = DRUM_NAMES[drumType] || drumType;
        rowDiv.appendChild(labelDiv);

        // Step buttons container
        const stepsContainerDiv = document.createElement('div');
        stepsContainerDiv.className = 'flex gap-2';

        // Create step buttons
        for (let i = 0; i < DRUM_MACHINE_CONFIG.STEPS_COUNT; i++) {
            const stepButton = document.createElement('button');
            stepButton.className = `w-12 h-12 rounded-lg border-2 transition-all duration-75 flex-shrink-0 bg-gray-700 border-gray-600 hover:border-gray-500`;
            stepButton.id = `${drumType}-step-${i}`;
            stepButton.dataset.drum = drumType;
            stepButton.dataset.step = i;
            stepButton.addEventListener('click', this.handleStepClick);
            
            stepsContainerDiv.appendChild(stepButton);
        }

        rowDiv.appendChild(stepsContainerDiv);
        this.elements.drumGrid.appendChild(rowDiv);
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Control buttons
        if (this.elements.playButton) {
            this.elements.playButton.addEventListener('click', this.handlePlayPause);
        }
        if (this.elements.resetButton) {
            this.elements.resetButton.addEventListener('click', this.handleReset);
        }
        if (this.elements.generateButton) {
            this.elements.generateButton.addEventListener('click', this.handleGeneratePattern);
        }

        // Melody controls
        if (this.elements.melodyToggle) {
            this.elements.melodyToggle.addEventListener('click', this.handleMelodyToggle);
        }
        if (this.elements.newMelodyButton) {
            this.elements.newMelodyButton.addEventListener('click', this.handleNewMelody);
        }

        // BPM control
        if (this.elements.bpmSlider) {
            this.elements.bpmSlider.addEventListener('input', this.handleBpmChange);
        }

        // User input
        if (this.elements.userInput) {
            this.elements.userInput.addEventListener('keypress', this.handleInputKeyPress);
        }
    }

    /**
     * Handle step button clicks
     * @param {Event} event - Click event
     */
    async handleStepClick(event) {
        const drum = event.target.dataset.drum;
        const step = parseInt(event.target.dataset.step);
        
        if (drum && !isNaN(step)) {
            // Ensure audio context is activated on user interaction
            if (Tone.context.state !== 'running') {
                console.log("Activating audio context on step click...");
                await Tone.start();
            }
            
            this.sequencer.toggleStep(drum, step);
            this.updateStepButton(drum, step);
            
            // Play the drum sound immediately for user feedback
            if (this.sequencer.drumSounds && this.sequencer.drumSounds.isInitialized()) {
                try {
                    // Check if step is now active (just turned on)
                    if (this.sequencer.isStepActive(drum, step)) {
                        this.sequencer.drumSounds.playDrum(drum);
                    }
                } catch (error) {
                    console.error('Error playing drum sound:', error);
                }
            }
        }
    }

    /**
     * Handle play/pause button
     */
    async handlePlayPause() {
        try {
            // Ensure audio context is activated on first user interaction
            if (Tone.context.state !== 'running') {
                console.log("Activating audio context on user interaction...");
                await Tone.start();
            }
            
            await this.sequencer.toggle();
            this.updatePlayButton();
        } catch (error) {
            console.error('Error toggling playback:', error);
        }
    }

    /**
     * Handle reset button
     */
    handleReset() {
        this.sequencer.stop();
        this.sequencer.clearPattern();
        this.updateUI();
    }

    /**
     * Handle BPM slider change
     * @param {Event} event - Input event
     */
    handleBpmChange(event) {
        const bpm = parseInt(event.target.value);
        this.sequencer.setBpm(bpm);
        this.updateBpmDisplay();
    }


    /**
     * Handle generate pattern button
     */
    async handleGeneratePattern() {
        if (this.patternGenerator.isBusy()) {
            return;
        }

        const userInput = this.elements.userInput?.value.trim();
        if (!userInput) {
            return;
        }

        this.updateGenerateButton(true);

        try {
            const pattern = await this.patternGenerator.generateDrumPattern(userInput);
            
            if (pattern) {
                this.sequencer.setPattern(pattern);

                // Restart if currently playing
                if (this.sequencer.getIsPlaying()) {
                    await this.sequencer.restart();
                }

                this.updateUI();
            }
        } catch (error) {
            console.error('Error generating pattern:', error);
        } finally {
            this.updateGenerateButton(false);
        }
    }


    /**
     * Handle user input key press
     * @param {Event} event - Keypress event
     */
    handleInputKeyPress(event) {
        if (event.key === 'Enter') {
            this.handleGeneratePattern();
        }
    }

    /**
     * Handle melody toggle button
     */
    async handleMelodyToggle() {
        try {
            // Ensure audio context is activated
            if (Tone.context.state !== 'running') {
                console.log("Activating audio context on melody toggle...");
                await Tone.start();
            }

            const currentlyEnabled = this.sequencer.isMelodyEnabled();
            this.sequencer.setMelodyEnabled(!currentlyEnabled);
            this.updateMelodyControls();

        } catch (error) {
            console.error('Error toggling melody:', error);
        }
    }

    /**
     * Handle new melody generation
     */
    async handleNewMelody() {
        try {
            // Ensure audio context is activated
            if (Tone.context.state !== 'running') {
                console.log("Activating audio context on melody generation...");
                await Tone.start();
            }

            // Determine style from user input or default to rock
            const userInput = this.elements.userInput?.value.trim().toLowerCase() || '';
            let style = 'rock';

            if (userInput.includes('jazz')) style = 'jazz';
            else if (userInput.includes('blues')) style = 'blues';
            else if (userInput.includes('folk') || userInput.includes('country')) style = 'folk';
            else if (userInput.includes('classical') || userInput.includes('bach') || userInput.includes('mozart')) style = 'classical';
            else if (userInput.includes('electronic') || userInput.includes('techno') || userInput.includes('house')) style = 'electronic';
            else if (userInput.includes('latin') || userInput.includes('salsa')) style = 'folk';
            else if (userInput.includes('modal') || userInput.includes('dorian')) style = 'modal';

            // Random key selection (common keys)
            const keys = ['C', 'F', 'G', 'Am', 'Dm'];
            const randomKey = keys[Math.floor(Math.random() * keys.length)];

            const music = this.sequencer.generateNewMelody(style, randomKey);
            
            if (music) {
                console.log(`Generated new ${style} melody in ${randomKey}`);
                // Enable melody if it wasn't already
                if (!this.sequencer.isMelodyEnabled()) {
                    this.sequencer.setMelodyEnabled(true);
                }
            }

            this.updateMelodyControls();

        } catch (error) {
            console.error('Error generating new melody:', error);
        }
    }

    /**
     * Step change callback from sequencer
     * @param {number} step - Current step
     */
    onStepChange(step) {
        this.updateCurrentStepIndicator(step);
    }

    /**
     * Update entire UI
     */
    updateUI() {
        this.updatePlayButton();
        this.updateBpmDisplay();
        this.updateDrumGrid();
        this.updateGenerateButton(false);
        this.updateMelodyControls();
    }

    /**
     * Update play/pause button
     */
    updatePlayButton() {
        if (!this.elements.playButton) return;

        const isPlaying = this.sequencer.getIsPlaying();
        const icon = this.elements.playButton.querySelector('svg');
        
        if (icon) {
            // Update icon (assuming Play/Pause icons are already in the DOM)
            icon.style.display = isPlaying ? 'none' : 'block';
            const pauseIcon = this.elements.playButton.querySelector('.pause-icon');
            if (pauseIcon) {
                pauseIcon.style.display = isPlaying ? 'block' : 'none';
            }
        } else {
            // Fallback text update
            this.elements.playButton.textContent = isPlaying ? 'Pause' : 'Play';
        }
    }

    /**
     * Update BPM display
     */
    updateBpmDisplay() {
        if (this.elements.bpmDisplay) {
            this.elements.bpmDisplay.textContent = this.sequencer.getBpm().toString();
        }
        if (this.elements.bpmSlider) {
            this.elements.bpmSlider.value = this.sequencer.getBpm();
        }
    }

    /**
     * Update entire drum grid
     */
    updateDrumGrid() {
        const pattern = this.sequencer.getPattern();
        Object.keys(pattern).forEach(drumType => {
            for (let step = 0; step < DRUM_MACHINE_CONFIG.STEPS_COUNT; step++) {
                this.updateStepButton(drumType, step);
            }
        });
    }

    /**
     * Update a specific step button
     * @param {string} drumType - Type of drum
     * @param {number} step - Step index
     */
    updateStepButton(drumType, step) {
        const button = document.getElementById(`${drumType}-step-${step}`);
        if (!button) return;

        const isActive = this.sequencer.isStepActive(drumType, step);
        const drumColor = DRUM_COLORS[drumType] || 'bg-gray-500';

        if (isActive) {
            button.className = `w-12 h-12 rounded-lg border-2 transition-all duration-75 flex-shrink-0 ${drumColor} border-white shadow-lg`;
        } else {
            button.className = 'w-12 h-12 rounded-lg border-2 transition-all duration-75 flex-shrink-0 bg-gray-700 border-gray-600 hover:border-gray-500';
        }
    }

    /**
     * Update current step indicator
     * @param {number} currentStep - Currently playing step
     */
    updateCurrentStepIndicator(currentStep) {
        // Remove previous indicators
        document.querySelectorAll('.step-playing').forEach(el => {
            el.classList.remove('step-playing', 'ring-2', 'ring-yellow-400', 'ring-opacity-75');
        });

        // Add current step indicator to all rows
        const drumTypes = this.sequencer.getDrumTypes();
        drumTypes.forEach(drumType => {
            const button = document.getElementById(`${drumType}-step-${currentStep}`);
            if (button) {
                button.classList.add('step-playing', 'ring-2', 'ring-yellow-400', 'ring-opacity-75');
            }
        });

    }


    /**
     * Update generate button state
     * @param {boolean} isGenerating - Whether generation is in progress
     */
    updateGenerateButton(isGenerating) {
        if (!this.elements.generateButton) return;

        if (isGenerating || this.patternGenerator.isGeneratingDrumPattern()) {
            this.elements.generateButton.disabled = true;
            this.elements.generateButton.textContent = 'Generating...';
            this.elements.generateButton.className = 'bg-gray-600 cursor-not-allowed px-8 py-4 rounded-xl font-medium text-lg transition-colors';
        } else {
            this.elements.generateButton.disabled = false;
            this.elements.generateButton.textContent = 'Generate Beat';
            this.elements.generateButton.className = 'control-button bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-8 py-4 rounded-xl font-medium text-lg transition-colors';
        }
    }

    /**
     * Update melody controls state
     */
    updateMelodyControls() {
        // Update melody toggle button
        if (this.elements.melodyToggle) {
            const isEnabled = this.sequencer.isMelodyEnabled();
            
            if (isEnabled) {
                this.elements.melodyToggle.textContent = 'Melody: ON';
                this.elements.melodyToggle.className = 'control-button bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium text-sm transition-colors';
            } else {
                this.elements.melodyToggle.textContent = 'Melody: OFF';
                this.elements.melodyToggle.className = 'control-button bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-medium text-sm transition-colors';
            }
        }

        // Update chord display
        if (this.elements.chordDisplay) {
            const chordName = this.sequencer.getCurrentChordName();
            this.elements.chordDisplay.textContent = chordName || '---';
        }

        // Update new melody button state
        if (this.elements.newMelodyButton) {
            const melodySystem = this.sequencer.getMelodySystem();
            if (melodySystem && melodySystem.initialized) {
                this.elements.newMelodyButton.disabled = false;
                this.elements.newMelodyButton.className = 'control-button bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium text-sm transition-colors';
            } else {
                this.elements.newMelodyButton.disabled = true;
                this.elements.newMelodyButton.className = 'control-button bg-gray-600 cursor-not-allowed px-6 py-3 rounded-lg font-medium text-sm transition-colors';
            }
        }
    }


    /**
     * Dispose of UI and clean up event listeners
     */
    dispose() {
        // Remove event listeners
        if (this.elements.playButton) {
            this.elements.playButton.removeEventListener('click', this.handlePlayPause);
        }
        if (this.elements.resetButton) {
            this.elements.resetButton.removeEventListener('click', this.handleReset);
        }
        if (this.elements.generateButton) {
            this.elements.generateButton.removeEventListener('click', this.handleGeneratePattern);
        }
        if (this.elements.melodyToggle) {
            this.elements.melodyToggle.removeEventListener('click', this.handleMelodyToggle);
        }
        if (this.elements.newMelodyButton) {
            this.elements.newMelodyButton.removeEventListener('click', this.handleNewMelody);
        }
        if (this.elements.bpmSlider) {
            this.elements.bpmSlider.removeEventListener('input', this.handleBpmChange);
        }
        if (this.elements.userInput) {
            this.elements.userInput.removeEventListener('keypress', this.handleInputKeyPress);
        }

        // Remove step button listeners
        document.querySelectorAll('[data-drum]').forEach(button => {
            button.removeEventListener('click', this.handleStepClick);
        });

        this.initialized = false;
    }
}