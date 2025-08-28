/**
 * DrumUI.js
 * User interface and grid management for the drum machine
 */

import { DRUM_NAMES, DRUM_COLORS, DRUM_MACHINE_CONFIG } from './DrumConstants.js';

export class DrumUI {
    constructor(sequencer, melodySystem, patternGenerator) {
        this.sequencer = sequencer;
        this.melodySystem = melodySystem;
        this.patternGenerator = patternGenerator;
        
        this.elements = {};
        this.initialized = false;
        
        // Bind methods to maintain context
        this.handleStepClick = this.handleStepClick.bind(this);
        this.handlePlayPause = this.handlePlayPause.bind(this);
        this.handleReset = this.handleReset.bind(this);
        this.handleBpmChange = this.handleBpmChange.bind(this);
        this.handleMelodyToggle = this.handleMelodyToggle.bind(this);
        this.handleGeneratePattern = this.handleGeneratePattern.bind(this);
        this.handleGenerateMelody = this.handleGenerateMelody.bind(this);
        this.handleInputKeyPress = this.handleInputKeyPress.bind(this);
        this.onStepChange = this.onStepChange.bind(this);
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
            melodyButton: document.getElementById('melody-button'),
            generateMelodyButton: document.getElementById('generate-melody-button'),
            generateButton: document.getElementById('generate-button'),
            bpmSlider: document.getElementById('bpm-slider'),
            bpmDisplay: document.getElementById('bpm-display'),
            userInput: document.getElementById('user-input'),
            drumGrid: document.getElementById('drum-grid'),
            melodyRow: document.getElementById('melody-row'),
            stepNumbers: document.getElementById('step-numbers')
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

        // Create melody row (initially hidden)
        this.createMelodyRow();

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
     * Create melody visualization row
     */
    createMelodyRow() {
        const melodyDiv = document.createElement('div');
        melodyDiv.className = 'mb-6 hidden';
        melodyDiv.id = 'melody-row';

        const rowDiv = document.createElement('div');
        rowDiv.className = 'flex gap-2 items-center';

        // Melody label
        const labelDiv = document.createElement('div');
        labelDiv.className = 'w-20 text-right text-sm font-medium text-pink-300 flex-shrink-0';
        labelDiv.textContent = 'Melody';
        rowDiv.appendChild(labelDiv);

        // Melody step cells
        const stepContainerDiv = document.createElement('div');
        stepContainerDiv.className = 'flex gap-2';
        stepContainerDiv.id = 'melody-steps';

        for (let i = 0; i < DRUM_MACHINE_CONFIG.STEPS_COUNT; i++) {
            const stepCell = document.createElement('div');
            stepCell.className = 'w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-mono transition-all duration-75 flex-shrink-0 bg-gray-700 border-gray-600';
            stepCell.id = `melody-step-${i}`;
            stepContainerDiv.appendChild(stepCell);
        }

        rowDiv.appendChild(stepContainerDiv);
        melodyDiv.appendChild(rowDiv);
        this.elements.drumGrid.appendChild(melodyDiv);
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
        if (this.elements.melodyButton) {
            this.elements.melodyButton.addEventListener('click', this.handleMelodyToggle);
        }
        if (this.elements.generateMelodyButton) {
            this.elements.generateMelodyButton.addEventListener('click', this.handleGenerateMelody);
        }
        if (this.elements.generateButton) {
            this.elements.generateButton.addEventListener('click', this.handleGeneratePattern);
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
    handleStepClick(event) {
        const drum = event.target.dataset.drum;
        const step = parseInt(event.target.dataset.step);
        
        if (drum && !isNaN(step)) {
            this.sequencer.toggleStep(drum, step);
            this.updateStepButton(drum, step);
        }
    }

    /**
     * Handle play/pause button
     */
    async handlePlayPause() {
        try {
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
     * Handle melody toggle button
     */
    handleMelodyToggle() {
        if (!this.melodySystem.hasValidMelody()) {
            this.handleGenerateMelody();
        } else {
            this.melodySystem.toggle();
            this.updateMelodyButton();
            this.updateMelodyRow();
        }
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
            const result = await this.patternGenerator.generateBoth(userInput);
            
            if (result.pattern) {
                this.sequencer.setPattern(result.pattern);
            }
            
            if (result.melody) {
                this.melodySystem.setMelodyData(result.melody);
                this.melodySystem.setEnabled(true);
            }

            // Restart if currently playing
            if (this.sequencer.getIsPlaying()) {
                await this.sequencer.restart();
            }

            this.updateUI();
        } catch (error) {
            console.error('Error generating pattern:', error);
        } finally {
            this.updateGenerateButton(false);
        }
    }

    /**
     * Handle generate melody button
     */
    async handleGenerateMelody() {
        if (this.patternGenerator.isGeneratingMelodyData()) {
            return;
        }

        this.updateGenerateMelodyButton(true);

        try {
            const userInput = this.elements.userInput?.value.trim() || '';
            const melodyData = await this.patternGenerator.generateMelody(userInput);
            
            if (melodyData) {
                this.melodySystem.setMelodyData(melodyData);
                this.melodySystem.setEnabled(true);

                // Restart if currently playing
                if (this.sequencer.getIsPlaying()) {
                    await this.sequencer.restart();
                }

                this.updateUI();
            }
        } catch (error) {
            console.error('Error generating melody:', error);
        } finally {
            this.updateGenerateMelodyButton(false);
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
        this.updateMelodyButton();
        this.updateMelodyRow();
        this.updateGenerateButton(false);
        this.updateGenerateMelodyButton(false);
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

        // Add to melody row if visible
        if (this.melodySystem.isEnabled() && this.melodySystem.hasValidMelody()) {
            const melodyStep = document.getElementById(`melody-step-${currentStep}`);
            if (melodyStep) {
                melodyStep.classList.add('step-playing', 'ring-2', 'ring-yellow-400', 'ring-opacity-75');
            }
        }
    }

    /**
     * Update melody button
     */
    updateMelodyButton() {
        if (!this.elements.melodyButton) return;

        const isEnabled = this.melodySystem.isEnabled();
        const hasValidMelody = this.melodySystem.hasValidMelody();

        if (isEnabled && hasValidMelody) {
            this.elements.melodyButton.className = 'p-3 rounded-full transition-colors bg-purple-600 hover:bg-purple-700';
        } else {
            this.elements.melodyButton.className = 'p-3 rounded-full transition-colors bg-gray-600 hover:bg-gray-500';
        }

        const title = hasValidMelody ? 
            (isEnabled ? "Melody On" : "Melody Off") : 
            "Generate Melody";
        this.elements.melodyButton.title = title;
    }

    /**
     * Update melody row visibility and content
     */
    updateMelodyRow() {
        const melodyRow = document.getElementById('melody-row');
        if (!melodyRow) return;

        const shouldShow = this.melodySystem.isEnabled() && this.melodySystem.hasValidMelody();
        melodyRow.classList.toggle('hidden', !shouldShow);

        if (shouldShow) {
            // Update melody step visualization
            for (let step = 0; step < DRUM_MACHINE_CONFIG.STEPS_COUNT; step++) {
                const stepElement = document.getElementById(`melody-step-${step}`);
                if (!stepElement) continue;

                const notes = this.melodySystem.getNotesForStep(step);
                const hasNote = notes.length > 0;
                const displayNote = hasNote ? notes[0]?.replace(/\d+/, '') : '';

                if (hasNote) {
                    stepElement.className = 'w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-mono transition-all duration-75 flex-shrink-0 bg-pink-500 border-white shadow-lg text-white';
                    stepElement.textContent = displayNote;
                } else {
                    stepElement.className = 'w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-mono transition-all duration-75 flex-shrink-0 bg-gray-700 border-gray-600';
                    stepElement.textContent = '';
                }
            }
        }
    }

    /**
     * Update generate button state
     * @param {boolean} isGenerating - Whether generation is in progress
     */
    updateGenerateButton(isGenerating) {
        if (!this.elements.generateButton) return;

        if (isGenerating || this.patternGenerator.isBusy()) {
            this.elements.generateButton.disabled = true;
            this.elements.generateButton.textContent = 'Generating...';
            this.elements.generateButton.className = 'bg-gray-600 cursor-not-allowed px-6 py-2 rounded-lg font-medium transition-colors';
        } else {
            this.elements.generateButton.disabled = false;
            this.elements.generateButton.textContent = 'Generate Beats + Melody';
            this.elements.generateButton.className = 'bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-2 rounded-lg font-medium transition-colors';
        }
    }

    /**
     * Update generate melody button state
     * @param {boolean} isGenerating - Whether melody generation is in progress
     */
    updateGenerateMelodyButton(isGenerating) {
        if (!this.elements.generateMelodyButton) return;

        const button = this.elements.generateMelodyButton;
        
        if (isGenerating || this.patternGenerator.isGeneratingMelodyData()) {
            button.disabled = true;
            button.className = 'w-12 h-12 rounded-full transition-colors flex items-center justify-center bg-gray-600 cursor-not-allowed';
            button.innerHTML = '<div class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>';
        } else {
            button.disabled = false;
            button.className = 'w-12 h-12 rounded-full transition-colors flex items-center justify-center bg-blue-600 hover:bg-blue-700';
            button.innerHTML = '<div class="w-3 h-3 border-2 border-white rounded-full"></div>';
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
        if (this.elements.melodyButton) {
            this.elements.melodyButton.removeEventListener('click', this.handleMelodyToggle);
        }
        if (this.elements.generateMelodyButton) {
            this.elements.generateMelodyButton.removeEventListener('click', this.handleGenerateMelody);
        }
        if (this.elements.generateButton) {
            this.elements.generateButton.removeEventListener('click', this.handleGeneratePattern);
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