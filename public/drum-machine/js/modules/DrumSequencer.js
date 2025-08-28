/**
 * DrumSequencer.js
 * Core sequencing and playback logic
 */

import { DRUM_MACHINE_CONFIG, DEFAULT_PATTERN } from './DrumConstants.js';

export class DrumSequencer {
    constructor(drumSounds, melodySystem, onStepChange) {
        this.drumSounds = drumSounds;
        this.melodySystem = melodySystem;
        this.onStepChange = onStepChange || (() => {});
        
        this.isPlaying = false;
        this.currentStep = 0;
        this.bpm = DRUM_MACHINE_CONFIG.DEFAULT_BPM;
        this.sequence = null;
        this.pattern = { ...DEFAULT_PATTERN };
        
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
            // Ensure audio context is started
            if (Tone.context.state !== 'running') {
                await Tone.start();
            }

            // Ensure audio systems are initialized
            if (!this.drumSounds.isInitialized()) {
                await this.drumSounds.init();
            }
            if (!this.melodySystem.isInitialized()) {
                await this.melodySystem.init();
            }

            // Create and start sequence
            this.sequence = new Tone.Sequence((time, step) => {
                this.currentStep = step;
                this.onStepChange(step);
                
                // Play active drums for this step
                Object.keys(this.pattern).forEach(drum => {
                    if (this.pattern[drum][step] === 1) {
                        this.drumSounds.playDrum(drum, time);
                    }
                });

                // Play melody and chords if enabled
                if (this.melodySystem.isEnabled()) {
                    this.melodySystem.playForStep(step, time);
                }

            }, Array.from({length: DRUM_MACHINE_CONFIG.STEPS_COUNT}, (_, i) => i), "16n");

            this.sequence.start(0);
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
            
            // Stop any lingering sounds
            this.drumSounds.stopAll();
            this.melodySystem.stopAll();
            
            this.isPlaying = false;
            this.currentStep = 0;
            this.onStepChange(0);
            
        } catch (error) {
            console.error("Error stopping drum sequencer:", error);
        }
    }

    /**
     * Toggle playback (start/stop)
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
            // Brief delay to ensure clean stop
            setTimeout(async () => {
                await this.start();
            }, 200);
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
     * Dispose of sequencer and clean up resources
     */
    dispose() {
        this.stop();
        
        // Clean up Transport (but don't dispose it as it's global)
        Tone.Transport.cancel();
    }
}