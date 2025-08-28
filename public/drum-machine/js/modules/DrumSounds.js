/**
 * DrumSounds.js
 * Drum synthesis and sound management using Tone.js
 */

import { DRUM_SYNTH_CONFIGS } from './DrumConstants.js';

export class DrumSounds {
    constructor() {
        this.samplers = {};
        this.masterGain = null;
        this.initialized = false;
    }

    /**
     * Initialize all drum synthesizers
     */
    async init() {
        if (this.initialized) {
            return;
        }

        try {
            // Create master gain for volume control
            this.masterGain = new Tone.Gain(0.5).toDestination();

            // Create drum samplers with synthesized sounds
            this.samplers = {
                kick: new Tone.MembraneSynth({
                    pitchDecay: DRUM_SYNTH_CONFIGS.kick.pitchDecay,
                    octaves: DRUM_SYNTH_CONFIGS.kick.octaves,
                    oscillator: DRUM_SYNTH_CONFIGS.kick.oscillator,
                    envelope: DRUM_SYNTH_CONFIGS.kick.envelope
                }).toDestination(),
                
                snare: new Tone.NoiseSynth({
                    noise: DRUM_SYNTH_CONFIGS.snare.noise,
                    envelope: DRUM_SYNTH_CONFIGS.snare.envelope
                }).toDestination(),
                
                hihat: new Tone.MetalSynth({
                    frequency: DRUM_SYNTH_CONFIGS.hihat.frequency,
                    envelope: DRUM_SYNTH_CONFIGS.hihat.envelope,
                    harmonicity: DRUM_SYNTH_CONFIGS.hihat.harmonicity,
                    modulationIndex: DRUM_SYNTH_CONFIGS.hihat.modulationIndex,
                    resonance: DRUM_SYNTH_CONFIGS.hihat.resonance,
                    octaves: DRUM_SYNTH_CONFIGS.hihat.octaves
                }).toDestination(),
                
                openhat: new Tone.MetalSynth({
                    frequency: DRUM_SYNTH_CONFIGS.openhat.frequency,
                    envelope: DRUM_SYNTH_CONFIGS.openhat.envelope,
                    harmonicity: DRUM_SYNTH_CONFIGS.openhat.harmonicity,
                    modulationIndex: DRUM_SYNTH_CONFIGS.openhat.modulationIndex,
                    resonance: DRUM_SYNTH_CONFIGS.openhat.resonance,
                    octaves: DRUM_SYNTH_CONFIGS.openhat.octaves
                }).toDestination(),
                
                crash: new Tone.MetalSynth({
                    frequency: DRUM_SYNTH_CONFIGS.crash.frequency,
                    envelope: DRUM_SYNTH_CONFIGS.crash.envelope,
                    harmonicity: DRUM_SYNTH_CONFIGS.crash.harmonicity,
                    modulationIndex: DRUM_SYNTH_CONFIGS.crash.modulationIndex,
                    resonance: DRUM_SYNTH_CONFIGS.crash.resonance,
                    octaves: DRUM_SYNTH_CONFIGS.crash.octaves
                }).toDestination(),
                
                clap: new Tone.NoiseSynth({
                    noise: DRUM_SYNTH_CONFIGS.clap.noise,
                    envelope: DRUM_SYNTH_CONFIGS.clap.envelope
                }).toDestination()
            };

            // Set volumes for each drum
            this.samplers.kick.volume.value = DRUM_SYNTH_CONFIGS.kick.volume;
            this.samplers.snare.volume.value = DRUM_SYNTH_CONFIGS.snare.volume;
            this.samplers.hihat.volume.value = DRUM_SYNTH_CONFIGS.hihat.volume;
            this.samplers.openhat.volume.value = DRUM_SYNTH_CONFIGS.openhat.volume;
            this.samplers.crash.volume.value = DRUM_SYNTH_CONFIGS.crash.volume;
            this.samplers.clap.volume.value = DRUM_SYNTH_CONFIGS.clap.volume;

            this.initialized = true;
        } catch (error) {
            console.error('Error initializing drum sounds:', error);
            throw error;
        }
    }

    /**
     * Play a specific drum sound
     * @param {string} drumType - The type of drum to play
     * @param {number} time - When to play the sound (for scheduling)
     */
    playDrum(drumType, time = undefined) {
        if (!this.initialized || !this.samplers[drumType]) {
            console.warn(`Drum sound not initialized or invalid type: ${drumType}`);
            return;
        }

        try {
            switch (drumType) {
                case 'kick':
                    this.samplers.kick.triggerAttackRelease("C1", "8n", time);
                    break;
                case 'snare':
                    this.samplers.snare.triggerAttackRelease("8n", time);
                    break;
                case 'hihat':
                    this.samplers.hihat.triggerAttackRelease("G5", "32n", time);
                    break;
                case 'openhat':
                    this.samplers.openhat.triggerAttackRelease("G5", "8n", time);
                    break;
                case 'crash':
                    this.samplers.crash.triggerAttackRelease("C6", "2n", time);
                    break;
                case 'clap':
                    this.samplers.clap.triggerAttackRelease("16n", time);
                    break;
                default:
                    console.warn(`Unknown drum type: ${drumType}`);
            }
        } catch (error) {
            console.error(`Error playing ${drumType}:`, error);
        }
    }

    /**
     * Test drum sounds (for debugging)
     */
    async testSound() {
        try {
            if (Tone.context.state !== 'running') {
                await Tone.start();
            }
            
            // Test kick drum
            this.playDrum('kick');
            
            // Test snare after a short delay
            setTimeout(() => {
                this.playDrum('snare');
            }, 200);
            
            console.log("Audio context state:", Tone.context.state);
            console.log("Test sound triggered");
        } catch (error) {
            console.error("Error testing sound:", error);
        }
    }

    /**
     * Set master volume
     * @param {number} volumeDb - Volume in decibels
     */
    setMasterVolume(volumeDb) {
        if (this.masterGain) {
            this.masterGain.gain.value = Tone.dbToGain(volumeDb);
        }
    }

    /**
     * Stop all drum sounds
     */
    stopAll() {
        if (!this.initialized) return;

        Object.values(this.samplers).forEach(sampler => {
            if (sampler.releaseAll) {
                sampler.releaseAll();
            }
        });
    }

    /**
     * Dispose of all drum sounds and clean up resources
     */
    dispose() {
        if (!this.initialized) return;

        Object.values(this.samplers).forEach(sampler => {
            if (sampler.dispose) {
                sampler.dispose();
            }
        });

        if (this.masterGain) {
            this.masterGain.dispose();
            this.masterGain = null;
        }

        this.samplers = {};
        this.initialized = false;
    }

    /**
     * Check if drum sounds are initialized
     */
    isInitialized() {
        return this.initialized;
    }

    /**
     * Get all available drum types
     */
    getDrumTypes() {
        return Object.keys(this.samplers);
    }
}