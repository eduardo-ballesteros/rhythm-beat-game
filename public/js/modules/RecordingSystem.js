import quantizationSystem from './QuantizationSystem.js';
import { METRONOME_CONFIG } from './Constants.js';
import harmonySystem from './HarmonySystem.js';

class RecordingSystem {
    constructor() {
        this.playArea = null;
        this.receptorContainer = null;
        this.quantizationEnabled = true;
        this.showQuantizationPreview = true;
        this.recordingMetronome = null;
        this.beatIndicators = new Map();
        
        // Harmonic recording features
        this.harmonicSuggestionsEnabled = true;
        this.autoHarmonizeEnabled = false;
        this.harmonyStrengthDisplay = true;
        this.currentHarmonySuggestions = null;
    }
    
    initialize() {
        this.playArea = document.getElementById('play-area');
        this.receptorContainer = document.getElementById('receptor-container');
        this.createBeatIndicators();
        this.createHarmonySuggestionDisplay();
    }
    
    handleRecordingKeyPress(key, gameState, audioSystem) {
        if (!gameState.isRecording) return;
        
        const elapsedTime = performance.now() - gameState.gameStartTime;
        let recordTime = elapsedTime;
        
        // Apply quantization if enabled
        if (this.quantizationEnabled) {
            recordTime = quantizationSystem.quantizeTime(elapsedTime);
        }
        
        // Visual feedback on receptor
        const receptor = document.querySelector(`.arrow-receptor[data-key="${key}"]`);
        if (receptor) {
            receptor.classList.add('hit');
            setTimeout(() => receptor.classList.remove('hit'), 200);
        }
        
        // Analyze harmonic content if it's a lead synth note
        let harmonicAnalysis = null;
        if (key === 'ArrowRight') { // Lead synth
            const smartNote = harmonySystem.getSmartLeadNote();
            harmonicAnalysis = harmonySystem.analyzeNoteHarmony(smartNote);
            
            // Store harmonic analysis with the note
            gameState.addRecordedNote(recordTime, key, { 
                harmonicAnalysis,
                suggestedNote: smartNote,
                actualNote: smartNote
            });
            
            // Show harmonic feedback
            if (receptor) {
                this.showHarmonicFeedback(receptor, harmonicAnalysis);
            }
            
            // Play harmonized note if auto-harmonize is enabled
            if (this.autoHarmonizeEnabled) {
                audioSystem.playHarmonizedNote(smartNote);
            } else {
                audioSystem.playHitSound(key);
            }
        } else {
            gameState.addRecordedNote(recordTime, key);
            audioSystem.playHitSound(key);
        }
        
        // Show quantization feedback if enabled
        if (this.quantizationEnabled && this.showQuantizationPreview) {
            this.showQuantizationFeedback(receptor, elapsedTime, recordTime);
        }
        
        // Create recording arrow animation
        this.createRecordingArrowAnimation(key, receptor);
    }
    
    createRecordingArrowAnimation(key, receptor) {
        if (!receptor || !this.playArea) return;
        
        const logEl = document.createElement('div');
        logEl.className = `arrow recording-arrow arrow-${key.replace('Arrow', '').toLowerCase()}`;
        logEl.style.left = `${receptor.offsetLeft}px`;
        this.playArea.appendChild(logEl);
        
        // Remove after animation completes
        setTimeout(() => {
            if (logEl.parentNode) {
                logEl.remove();
            }
        }, 2000);
    }
    
    // Create beat indicator elements
    createBeatIndicators() {
        const beatIndicatorContainer = document.createElement('div');
        beatIndicatorContainer.id = 'beat-indicator-container';
        beatIndicatorContainer.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10';
        
        // Create 4 beat indicators for 4/4 time
        for (let i = 0; i < 4; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'beat-indicator w-4 h-4 rounded-full border-2 border-gray-600 transition-all duration-150';
            indicator.dataset.beat = i;
            beatIndicatorContainer.appendChild(indicator);
            this.beatIndicators.set(i, indicator);
        }
        
        document.body.appendChild(beatIndicatorContainer);
    }
    
    // Start recording with metronome
    startRecordingWithMetronome(gameStartTime) {
        // Start quantization metronome
        quantizationSystem.startMetronome(gameStartTime, (position, beatType) => {
            this.onMetronomeBeat(position, beatType);
        });
        
        // Show beat indicators
        const container = document.getElementById('beat-indicator-container');
        if (container) {
            container.classList.remove('hidden');
        }
    }
    
    // Stop recording and metronome
    stopRecordingMetronome() {
        quantizationSystem.stopMetronome();
        
        // Hide beat indicators
        const container = document.getElementById('beat-indicator-container');
        if (container) {
            container.classList.add('hidden');
        }
        
        // Reset all indicators
        this.beatIndicators.forEach(indicator => {
            indicator.className = 'beat-indicator w-4 h-4 rounded-full border-2 border-gray-600 transition-all duration-150';
        });
    }
    
    // Handle metronome beat events
    onMetronomeBeat(position, beatType) {
        const config = METRONOME_CONFIG[beatType];
        if (!config) return;
        
        // Light up the appropriate beat indicator
        const indicator = this.beatIndicators.get(position.beat);
        if (indicator) {
            // Remove previous classes
            indicator.className = 'beat-indicator w-4 h-4 rounded-full border-2 transition-all duration-150';
            
            // Add beat-specific styling
            if (beatType === 'downbeat') {
                indicator.className += ' bg-yellow-400 border-yellow-400 scale-125';
            } else {
                indicator.className += ' bg-blue-400 border-blue-400 scale-110';
            }
            
            // Reset after duration
            setTimeout(() => {
                indicator.className = 'beat-indicator w-4 h-4 rounded-full border-2 border-gray-600 transition-all duration-150';
            }, config.duration);
        }
        
        // Flash screen border for visual feedback
        this.flashScreenBorder(config.color, config.duration);
    }
    
    // Flash screen border for metronome
    flashScreenBorder(color, duration) {
        const flash = document.createElement('div');
        flash.className = 'fixed inset-0 pointer-events-none border-4 transition-opacity';
        flash.style.borderColor = color;
        flash.style.opacity = '0.3';
        document.body.appendChild(flash);
        
        setTimeout(() => {
            flash.style.opacity = '0';
            setTimeout(() => flash.remove(), 150);
        }, duration / 2);
    }
    
    // Show quantization feedback
    showQuantizationFeedback(receptor, originalTime, quantizedTime) {
        if (Math.abs(originalTime - quantizedTime) < 10) return; // Too small to show
        
        const feedbackEl = document.createElement('div');
        feedbackEl.textContent = quantizedTime > originalTime ? '↑ SNAP' : '↓ SNAP';
        feedbackEl.className = 'quantization-feedback text-xs font-bold';
        feedbackEl.style.color = '#10b981'; // Green
        feedbackEl.style.position = 'absolute';
        feedbackEl.style.zIndex = '1000';
        
        const receptorRect = receptor.getBoundingClientRect();
        const playAreaRect = this.playArea.getBoundingClientRect();
        
        feedbackEl.style.left = `${receptorRect.left - playAreaRect.left + (receptorRect.width / 2)}px`;
        feedbackEl.style.top = `${receptorRect.bottom - playAreaRect.top - 30}px`;
        feedbackEl.style.transform = 'translateX(-50%)';
        
        this.playArea.appendChild(feedbackEl);
        setTimeout(() => feedbackEl.remove(), 300);
    }
    
    // Toggle quantization
    toggleQuantization() {
        this.quantizationEnabled = !this.quantizationEnabled;
        quantizationSystem.setEnabled(this.quantizationEnabled);
        return this.quantizationEnabled;
    }
    
    // Set quantization type
    setQuantizationType(type) {
        quantizationSystem.setQuantization(type);
    }
    
    // Toggle quantization preview
    toggleQuantizationPreview() {
        this.showQuantizationPreview = !this.showQuantizationPreview;
        return this.showQuantizationPreview;
    }
    
    // Get current quantization settings
    getQuantizationSettings() {
        return {
            enabled: this.quantizationEnabled,
            preview: this.showQuantizationPreview,
            ...quantizationSystem.getQuantizationInfo()
        };
    }
    
    // Process recorded notes with quantization
    processRecordedNotes(notes) {
        if (this.quantizationEnabled) {
            return quantizationSystem.quantizeRecordedChart(notes);
        }
        return notes;
    }
    
    // Get measure boundaries for recording
    getRecordingMeasures(duration) {
        return quantizationSystem.getMeasureBoundaries(duration * 1000);
    }
    
    // Get ideal recording duration in complete measures
    getIdealRecordingDuration(requestedDuration) {
        if (this.quantizationEnabled) {
            return quantizationSystem.getIdealRecordingDuration(requestedDuration);
        }
        return requestedDuration;
    }
    
    // Create harmony suggestion display
    createHarmonySuggestionDisplay() {
        const harmonySuggestionContainer = document.createElement('div');
        harmonySuggestionContainer.id = 'harmony-suggestion-container';
        harmonySuggestionContainer.className = 'fixed top-16 right-4 bg-gray-800 p-3 rounded-lg border border-gray-600 z-10 hidden';
        
        harmonySuggestionContainer.innerHTML = `
            <div class="text-white text-sm font-bold mb-2">Musical Context</div>
            <div class="text-xs text-gray-300 mb-1">
                Current Chord: <span id="current-chord-display" class="text-yellow-400 font-bold">Am</span>
            </div>
            <div class="text-xs text-gray-300 mb-1">
                Key: <span id="key-display" class="text-blue-400">A minor</span>
            </div>
            <div class="text-xs text-gray-300 mb-2">
                Progression: <span id="progression-display" class="text-green-400">1/4</span>
            </div>
            <div class="text-xs text-gray-300 mb-1">Strong Notes (Chord):</div>
            <div id="chord-tones-display" class="text-xs text-yellow-300 mb-1">A, C, E</div>
            <div class="text-xs text-gray-300 mb-1">Good Notes (Scale):</div>
            <div id="scale-tones-display" class="text-xs text-blue-300">A, B, C, D, E, F, G</div>
        `;
        
        document.body.appendChild(harmonySuggestionContainer);
    }
    
    // Show harmonic feedback for played notes
    showHarmonicFeedback(receptor, harmonicAnalysis) {
        if (!this.harmonyStrengthDisplay || !receptor) return;
        
        const feedback = document.createElement('div');
        feedback.className = 'harmonic-feedback text-xs font-bold absolute z-50';
        feedback.style.position = 'absolute';
        feedback.style.zIndex = '1000';
        
        // Color and text based on harmonic strength
        let color, text;
        switch (harmonicAnalysis.reason) {
            case 'chord_tone':
                color = '#10b981'; // Green
                text = 'CHORD TONE ✓';
                break;
            case 'scale_tone':
                color = '#3b82f6'; // Blue
                text = 'SCALE TONE';
                break;
            case 'extension':
                color = '#8b5cf6'; // Purple
                text = 'EXTENSION ✨';
                break;
            case 'clash':
                color = '#ef4444'; // Red
                text = harmonicAnalysis.suggestion ? 'TRY ' + harmonicAnalysis.suggestion : 'OFF-KEY';
                break;
            default:
                color = '#6b7280'; // Gray
                text = 'PASSING';
        }
        
        feedback.style.color = color;
        feedback.textContent = text;
        
        const receptorRect = receptor.getBoundingClientRect();
        const playAreaRect = this.playArea.getBoundingClientRect();
        
        feedback.style.left = `${receptorRect.left - playAreaRect.left + (receptorRect.width / 2)}px`;
        feedback.style.top = `${receptorRect.top - playAreaRect.top - 20}px`;
        feedback.style.transform = 'translateX(-50%)';
        
        this.playArea.appendChild(feedback);
        
        // Animate up and fade
        setTimeout(() => {
            feedback.style.transform = 'translateX(-50%) translateY(-10px)';
            feedback.style.opacity = '0';
            setTimeout(() => feedback.remove(), 300);
        }, 100);
    }
    
    // Start recording with harmony suggestions
    startRecordingWithHarmony(gameStartTime) {
        this.startRecordingWithMetronome(gameStartTime);
        
        // Show harmony suggestions
        const harmonySuggestionContainer = document.getElementById('harmony-suggestion-container');
        if (harmonySuggestionContainer && this.harmonicSuggestionsEnabled) {
            harmonySuggestionContainer.classList.remove('hidden');
            this.updateHarmonySuggestionDisplay();
            
            // Update suggestions periodically as chords change
            this.harmonySuggestionInterval = setInterval(() => {
                this.updateHarmonySuggestionDisplay();
            }, 1000);
        }
    }
    
    // Stop recording and hide harmony suggestions
    stopRecordingWithHarmony() {
        this.stopRecordingMetronome();
        
        // Hide harmony suggestions
        const harmonySuggestionContainer = document.getElementById('harmony-suggestion-container');
        if (harmonySuggestionContainer) {
            harmonySuggestionContainer.classList.add('hidden');
        }
        
        if (this.harmonySuggestionInterval) {
            clearInterval(this.harmonySuggestionInterval);
            this.harmonySuggestionInterval = null;
        }
    }
    
    // Update harmony suggestion display with current musical context
    updateHarmonySuggestionDisplay() {
        const musicalContext = harmonySystem.getMusicalContext();
        
        const currentChordEl = document.getElementById('current-chord-display');
        const keyEl = document.getElementById('key-display');
        const progressionEl = document.getElementById('progression-display');
        const chordTonesEl = document.getElementById('chord-tones-display');
        const scaleTonesEl = document.getElementById('scale-tones-display');
        
        if (currentChordEl) currentChordEl.textContent = musicalContext.currentChord;
        if (keyEl) keyEl.textContent = musicalContext.keyCenter;
        if (progressionEl) progressionEl.textContent = musicalContext.progressPosition;
        
        if (chordTonesEl && musicalContext.chordTones) {
            const chordToneNames = musicalContext.chordTones.map(note => 
                note.replace(/\d+/, '')).join(', ');
            chordTonesEl.textContent = chordToneNames;
        }
        
        if (scaleTonesEl) {
            scaleTonesEl.textContent = 'A, B, C, D, E, F, G';
        }
    }
    
    // Toggle harmonic suggestions
    toggleHarmonicSuggestions() {
        this.harmonicSuggestionsEnabled = !this.harmonicSuggestionsEnabled;
        
        const container = document.getElementById('harmony-suggestion-container');
        if (container) {
            if (this.harmonicSuggestionsEnabled) {
                container.classList.remove('hidden');
                this.updateHarmonySuggestionDisplay();
            } else {
                container.classList.add('hidden');
            }
        }
        
        return this.harmonicSuggestionsEnabled;
    }
    
    // Toggle auto-harmonization
    toggleAutoHarmonize() {
        this.autoHarmonizeEnabled = !this.autoHarmonizeEnabled;
        return this.autoHarmonizeEnabled;
    }
    
    // Process recorded notes with harmonic analysis
    processRecordedNotesWithHarmony(notes) {
        const processedNotes = this.processRecordedNotes(notes);
        
        // Add harmonic analysis for the sequence
        const harmonicAnalysis = harmonySystem.analyzeRecordedSequence(processedNotes);
        
        return {
            notes: processedNotes,
            harmonicAnalysis: harmonicAnalysis,
            musicalScore: this.calculateMusicalScore(harmonicAnalysis)
        };
    }
    
    // Calculate musical score based on harmonic analysis
    calculateMusicalScore(harmonicAnalysis) {
        const baseScore = harmonicAnalysis.harmonicFit * 100;
        const bonusPoints = harmonicAnalysis.suggestions.length === 0 ? 20 : 0;
        
        return Math.round(baseScore + bonusPoints);
    }
    
    // Get harmony settings for UI
    getHarmonySettings() {
        return {
            harmonicSuggestions: this.harmonicSuggestionsEnabled,
            autoHarmonize: this.autoHarmonizeEnabled,
            harmonyStrengthDisplay: this.harmonyStrengthDisplay,
            currentChord: harmonySystem.getCurrentChordName(),
            musicalContext: harmonySystem.getMusicalContext()
        };
    }
}

// Create singleton instance
const recordingSystem = new RecordingSystem();
export default recordingSystem;