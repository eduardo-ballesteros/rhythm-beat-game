/**
 * DrumSequencer.js
 * Core sequencing and playback logic
 */

import { DRUM_MACHINE_CONFIG, DEFAULT_PATTERN } from './DrumConstants.js';

export class DrumSequencer {
    constructor(drumSounds, onStepChange) {
        this.drumSounds = drumSounds;
        this.onStepChange = onStepChange || (() => {});
        
        this.isPlaying = false;
        this.currentStep = 0;
        this.bpm = DRUM_MACHINE_CONFIG.DEFAULT_BPM;
        this.sequence = null;
        this.pattern = { ...DEFAULT_PATTERN };
        
        // Melody system integration
        this.melodySystem = null;
        
        // Initialize Tone.js Transport
        this.initTransport();
    }

    /**
     * Initialize Tone.js Transport settings
     */
    initTransport() {
        Tone.Transport.bpm.value = this.bpm;
    }

    /**
     * Start playback
     */
    async start() {
        if (this.isPlaying) {
            return;
        }

        try {
            // Ensure audio context is started FIRST
            if (Tone.context.state !== 'running') {
                console.log("Starting audio context in DrumSequencer...");
                await Tone.start();
            }

            // Ensure audio systems are initialized AFTER context is running
            if (!this.drumSounds.isInitialized()) {
                console.log("Initializing drum sounds...");
                await this.drumSounds.init();
            }

            // Initialize melody system if available
            if (this.melodySystem && !this.melodySystem.initialized) {
                console.log("Initializing melody system...");
                await this.melodySystem.init();
            }

            console.log("Audio context state:", Tone.context.state);
            console.log("Drum sounds initialized:", this.drumSounds.isInitialized());
            console.log("Melody system available:", !!this.melodySystem);

            // Dispose existing sequence before creating new one
            if (this.sequence) {
                this.sequence.dispose();
                this.sequence = null;
            }

            // Create and start sequence
            // CRITICAL: The callback closure must reference this.pattern directly, not a copy
            // This ensures real-time updates when pattern changes during playback
            this.sequence = new Tone.Sequence((time, step) => {
                this.currentStep = step;
                this.onStepChange(step);
                
                // Play active drums for this step - always read current pattern state
                // DO NOT cache pattern - read directly from this.pattern each time
                Object.keys(this.pattern).forEach(drum => {
                    if (this.pattern[drum] && this.pattern[drum][step] === 1) {
                        this.drumSounds.playDrum(drum, time);
                    }
                });
            }, Array.from({length: DRUM_MACHINE_CONFIG.STEPS_COUNT}, (_, i) => i), "16n");

            this.sequence.start(0);
            
            // Always start melody system if available
            if (this.melodySystem) {
                this.melodySystem.start(this);
            }
            
            Tone.Transport.start();
            this.isPlaying = true;
            
        } catch (error) {
            console.error("Error starting drum sequencer:", error);
            this.isPlaying = false;
            throw error;
        }
    }

    /**
     * Stop playback
     */
    stop() {
        if (!this.isPlaying) {
            return;
        }

        try {
            // Stop Transport and cancel all scheduled events
            Tone.Transport.stop();
            Tone.Transport.cancel();
            
            // Dispose of current sequence
            if (this.sequence) {
                this.sequence.dispose();
                this.sequence = null;
            }
            
            // Stop melody system
            if (this.melodySystem) {
                this.melodySystem.stop();
            }
            
            // Stop any lingering sounds
            this.drumSounds.stopAll();
            
            this.isPlaying = false;
            this.currentStep = 0;
            this.onStepChange(0);
            
        } catch (error) {
            console.error("Error stopping drum sequencer:", error);
        }
    }

    /**
     * Toggle playback (pause/resume or start if stopped)
     */
    async toggle() {
        if (this.isPlaying) {
            this.stop();
        } else {
            await this.start();
        }
        return this.isPlaying;
    }

    /**
     * Pause playback (preserves current position)
     */
    pause() {
        // Use stop instead of pause to ensure clean state
        this.stop();
    }

    /**
     * Resume playback from paused state
     */
    async resume() {
        // Use start instead of resume to ensure clean state
        await this.start();
    }

    /**
     * Set BPM (tempo)
     * @param {number} newBpm - New BPM value
     */
    setBpm(newBpm) {
        this.bpm = Math.max(
            DRUM_MACHINE_CONFIG.MIN_BPM, 
            Math.min(DRUM_MACHINE_CONFIG.MAX_BPM, newBpm)
        );
        Tone.Transport.bpm.value = this.bpm;
    }

    /**
     * Get current BPM
     */
    getBpm() {
        return this.bpm;
    }

    /**
     * Set drum pattern
     * @param {Object} newPattern - Pattern object with drum arrays
     */
    setPattern(newPattern) {
        // Validate pattern structure
        const requiredKeys = ['kick', 'snare', 'hihat', 'openhat', 'crash', 'clap'];
        const isValidPattern = requiredKeys.every(key => 
            newPattern[key] && 
            Array.isArray(newPattern[key]) && 
            newPattern[key].length === DRUM_MACHINE_CONFIG.STEPS_COUNT &&
            newPattern[key].every(val => val === 0 || val === 1)
        );

        if (isValidPattern) {
            this.pattern = { ...newPattern };
            return true;
        }
        
        console.error('Invalid pattern structure');
        return false;
    }

    /**
     * Get current pattern
     */
    getPattern() {
        return { ...this.pattern };
    }

    /**
     * Toggle a step in the pattern
     * @param {string} drum - Drum type (kick, snare, etc.)
     * @param {number} step - Step index (0-15)
     */
    toggleStep(drum, step) {
        if (this.pattern[drum] && step >= 0 && step < DRUM_MACHINE_CONFIG.STEPS_COUNT) {
            this.pattern[drum][step] = this.pattern[drum][step] === 1 ? 0 : 1;
            return true;
        }
        return false;
    }

    /**
     * Clear all patterns
     */
    clearPattern() {
        Object.keys(this.pattern).forEach(drum => {
            this.pattern[drum] = Array(DRUM_MACHINE_CONFIG.STEPS_COUNT).fill(0);
        });
    }

    /**
     * Reset to default pattern
     */
    resetToDefault() {
        this.pattern = { ...DEFAULT_PATTERN };
    }

    /**
     * Get current step
     */
    getCurrentStep() {
        return this.currentStep;
    }

    /**
     * Check if sequencer is playing
     */
    getIsPlaying() {
        return this.isPlaying;
    }

    /**
     * Restart sequence with current settings (useful after pattern/melody changes)
     */
    async restart() {
        if (this.isPlaying) {
            this.stop();
            // Brief delay to ensure clean stop and proper disposal
            await new Promise(resolve => setTimeout(resolve, 50));
            await this.start();
        }
    }

    /**
     * Get available drum types
     */
    getDrumTypes() {
        return Object.keys(this.pattern);
    }

    /**
     * Check if a step is active for a drum
     * @param {string} drum - Drum type
     * @param {number} step - Step index
     */
    isStepActive(drum, step) {
        return this.pattern[drum] && this.pattern[drum][step] === 1;
    }

    /**
     * Set master volume for drums
     * @param {number} volumeDb - Volume in decibels
     */
    setMasterVolume(volumeDb) {
        this.drumSounds.setMasterVolume(volumeDb);
    }

    /**
     * Test audio system (for debugging)
     */
    async testAudio() {
        try {
            console.log("Testing audio system...");
            
            // Ensure audio context is started
            if (Tone.context.state !== 'running') {
                console.log("Starting audio context for test...");
                await Tone.start();
            }

            // Ensure drum sounds are initialized
            if (!this.drumSounds.isInitialized()) {
                console.log("Initializing drum sounds for test...");
                await this.drumSounds.init();
            }

            // Test kick drum
            console.log("Testing kick drum...");
            await this.drumSounds.testSound();
            
            console.log("Audio test completed.");
            return true;
        } catch (error) {
            console.error("Audio test failed:", error);
            return false;
        }
    }

    /**
     * Set melody system reference
     * @param {MelodySystem} melodySystem - Melody system instance
     */
    setMelodySystem(melodySystem) {
        this.melodySystem = melodySystem;
    }

    /**
     * Get melody system reference
     * @returns {MelodySystem|null} Current melody system
     */
    getMelodySystem() {
        return this.melodySystem;
    }

    /**
     * Melody is always enabled - method maintained for compatibility
     * @param {boolean} enabled - Ignored, melody is always on
     */
    setMelodyEnabled(enabled) {
        // Melody is always enabled in the simplified system
        if (this.melodySystem) {
            this.melodySystem.setEnabled(true);
        }
    }

    /**
     * Generate new melody for current style
     * @param {string} style - Musical style
     * @param {string} key - Musical key
     */
    generateNewMelody(style = 'rock', key = 'C') {
        if (this.melodySystem) {
            const music = this.melodySystem.generateMusic(style, key);
            
            // If currently playing, restart to apply new melody
            if (this.isPlaying) {
                this.restart();
            }
            
            return music;
        }
        return null;
    }

    /**
     * Get current chord name from melody system
     * @returns {string} Current chord name
     */
    getCurrentChordName() {
        if (this.melodySystem) {
            return this.melodySystem.getCurrentChordName();
        }
        return '';
    }

    /**
     * Check if melody is currently enabled - always true now
     * @returns {boolean} Whether melody is enabled
     */
    isMelodyEnabled() {
        return this.melodySystem ? true : false;
    }

    /**
     * Dispose of sequencer and clean up resources
     */
    dispose() {
        this.stop();
        
        // Dispose melody system
        if (this.melodySystem) {
            this.melodySystem.dispose();
            this.melodySystem = null;
        }
        
        // Clean up Transport (but don't dispose it as it's global)
        Tone.Transport.cancel();
    }
}