/**
 * MelodySystem.js
 * Melody and chord playback system using Tone.js
 */

import { MELODY_SYNTH_CONFIGS, DEFAULT_MELODY_DATA, CHORD_MAP } from './DrumConstants.js';

export class MelodySystem {
    constructor() {
        this.melodyGain = null;
        this.melodySynth = null;
        this.chordSynth = null;
        this.initialized = false;
        this.enabled = true;
        this.generatedMelody = { ...DEFAULT_MELODY_DATA };
        this.volume = -15; // Default melody volume
    }

    /**
     * Initialize melody synthesizers
     */
    async init() {
        if (this.initialized) {
            return;
        }

        try {
            // Create melody gain for separate volume control
            this.melodyGain = new Tone.Gain(0.3).toDestination();

            // Create melody synthesizer
            this.melodySynth = new Tone.Synth({
                oscillator: MELODY_SYNTH_CONFIGS.melody.oscillator,
                envelope: MELODY_SYNTH_CONFIGS.melody.envelope
            }).connect(this.melodyGain);

            // Create chord synthesizer
            this.chordSynth = new Tone.PolySynth(Tone.Synth, {
                oscillator: MELODY_SYNTH_CONFIGS.chord.oscillator,
                envelope: MELODY_SYNTH_CONFIGS.chord.envelope,
                filter: MELODY_SYNTH_CONFIGS.chord.filter
            }).connect(this.melodyGain);

            this.chordSynth.volume.value = MELODY_SYNTH_CONFIGS.chord.volume;

            this.initialized = true;
        } catch (error) {
            console.error('Error initializing melody system:', error);
            throw error;
        }
    }

    /**
     * Set melody data
     * @param {Object} melodyData - Object containing melody, chords, and timing arrays
     */
    setMelodyData(melodyData) {
        // Validate structure
        if (melodyData.melody && melodyData.chords && melodyData.melodyTiming && melodyData.chordTiming) {
            this.generatedMelody = melodyData;
            return true;
        }
        console.error('Invalid melody structure received');
        return false;
    }

    /**
     * Get current melody data
     */
    getMelodyData() {
        return this.generatedMelody;
    }

    /**
     * Play melody and chords for a given step
     * @param {number} step - Current sequencer step (0-15)
     * @param {number} time - Scheduled time for playback
     */
    playForStep(step, time) {
        if (!this.initialized || !this.enabled || !this.generatedMelody) {
            return;
        }

        try {
            const currentBeat = (step * 0.25); // Convert step to beat (16 steps = 4 beats)
            
            // Play melody notes
            this.generatedMelody.melodyTiming.forEach((timing, index) => {
                if (Math.abs(timing - currentBeat) < 0.125 && this.generatedMelody.melody[index]) {
                    this.melodySynth.triggerAttackRelease(this.generatedMelody.melody[index], "8n", time);
                }
            });
            
            // Play chords
            this.generatedMelody.chordTiming.forEach((timing, index) => {
                if (Math.abs(timing - currentBeat) < 0.125 && this.generatedMelody.chords[index]) {
                    // Handle both array format and string format for chords
                    const chord = this.generatedMelody.chords[index];
                    if (Array.isArray(chord)) {
                        this.chordSynth.triggerAttackRelease(chord, "2n", time);
                    } else if (typeof chord === 'string') {
                        // Convert chord names to notes if needed
                        const chordNotes = this.convertChordToNotes(chord);
                        if (chordNotes) {
                            this.chordSynth.triggerAttackRelease(chordNotes, "2n", time);
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error playing melody for step:', error);
        }
    }

    /**
     * Convert chord names to note arrays
     * @param {string} chordName - Name of the chord (e.g., 'C', 'Dm', 'G7')
     * @returns {Array|null} Array of notes or null if chord not found
     */
    convertChordToNotes(chordName) {
        return CHORD_MAP[chordName] || null;
    }

    /**
     * Enable/disable melody playback
     * @param {boolean} enabled - Whether melody should be enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Check if melody is enabled
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * Toggle melody on/off
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    /**
     * Set melody volume
     * @param {number} volumeDb - Volume in decibels
     */
    setVolume(volumeDb) {
        this.volume = volumeDb;
        if (this.melodyGain) {
            this.melodyGain.gain.value = Tone.dbToGain(volumeDb);
        }
    }

    /**
     * Get current volume
     */
    getVolume() {
        return this.volume;
    }

    /**
     * Stop all melody sounds
     */
    stopAll() {
        if (!this.initialized) return;

        if (this.melodySynth) {
            this.melodySynth.releaseAll();
        }
        if (this.chordSynth) {
            this.chordSynth.releaseAll();
        }
    }

    /**
     * Get melody notes for a specific step (for UI visualization)
     * @param {number} step - Sequencer step (0-15)
     * @returns {Array} Array of notes playing at this step
     */
    getNotesForStep(step) {
        if (!this.generatedMelody) {
            return [];
        }

        const currentBeat = step * 0.25;
        return this.generatedMelody.melodyTiming
            .map((timing, index) => ({timing, note: this.generatedMelody.melody[index]}))
            .filter(({timing}) => Math.abs(timing - currentBeat) < 0.125)
            .map(({note}) => note);
    }

    /**
     * Check if melody has valid data
     */
    hasValidMelody() {
        return this.generatedMelody && 
               this.generatedMelody.melody && 
               this.generatedMelody.melody.length > 0;
    }

    /**
     * Reset melody to default
     */
    resetToDefault() {
        this.generatedMelody = { ...DEFAULT_MELODY_DATA };
    }

    /**
     * Dispose of melody system and clean up resources
     */
    dispose() {
        if (!this.initialized) return;

        this.stopAll();

        if (this.melodySynth) {
            this.melodySynth.dispose();
            this.melodySynth = null;
        }

        if (this.chordSynth) {
            this.chordSynth.dispose();
            this.chordSynth = null;
        }

        if (this.melodyGain) {
            this.melodyGain.dispose();
            this.melodyGain = null;
        }

        this.initialized = false;
    }

    /**
     * Check if melody system is initialized
     */
    isInitialized() {
        return this.initialized;
    }
}