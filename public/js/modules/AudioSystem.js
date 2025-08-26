import { HIT_SOUNDS, MISS_SOUND, MELODY_NOTES, BACKGROUND_COLORS, BPM, PENTATONIC_SCALE, CHORD_DEFINITIONS } from './Constants.js';
import harmonySystem from './HarmonySystem.js';

class AudioSystem {
    constructor() {
        this.instruments = {};
        this.effects = {};
        this.melody = null;
        this.colorChangeLoop = null;
        this.playArea = null;
        this.leadNoteIndex = 0;
        this.chordSequence = null;
        this.bassSequence = null;
    }
    
    initialize() {
        // Set BPM
        Tone.Transport.bpm.value = BPM;
        
        // Initialize effects
        this.effects.reverb = new Tone.Reverb({ 
            decay: 2.5, 
            wet: 0.3 
        }).toDestination();
        
        this.effects.delay = new Tone.PingPongDelay({
            delayTime: '8n',
            feedback: 0.3,
            wet: 0.2
        }).toDestination();
        
        // Initialize EDM-style instruments
        this.initializeKickDrum();
        this.initializeSnare();
        this.initializeHiHat();
        this.initializeLeadSynth();
        this.initializeMelodySynth();
        this.initializeBassSynth();
        this.initializeChordSynth();
        
        this.playArea = document.getElementById('play-area');
    }
    
    initializeKickDrum() {
        // Deep sub-bass kick drum (40-80Hz range)
        this.instruments.kick = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 2,
            oscillator: {
                type: 'sine'
            },
            envelope: {
                attack: 0.001,
                decay: 0.4,
                sustain: 0.01,
                release: 1.4,
                attackCurve: 'exponential'
            }
        }).toDestination();
    }
    
    initializeSnare() {
        // Crispy snare with high-frequency snap (2-8kHz)
        this.instruments.snare = new Tone.NoiseSynth({
            noise: {
                type: 'white'
            },
            envelope: {
                attack: 0.005,
                decay: 0.1,
                sustain: 0.0,
                release: 0.1
            }
        }).connect(new Tone.Filter({
            frequency: 3000,
            type: 'highpass'
        })).toDestination();
    }
    
    initializeHiHat() {
        // Bright, short hi-hat sounds (8kHz+)
        this.instruments.hihat = new Tone.MetalSynth({
            frequency: 200,
            envelope: {
                attack: 0.001,
                decay: 0.05,
                release: 0.02
            },
            harmonicity: 12,
            modulationIndex: 40,
            resonance: 4000,
            octaves: 1.5
        }).connect(new Tone.Filter({
            frequency: 8000,
            type: 'highpass'
        })).connect(this.effects.reverb);
    }
    
    initializeLeadSynth() {
        // Melodic synthesizer with filter sweeps
        this.instruments.lead = new Tone.FMSynth({
            harmonicity: 3,
            modulationIndex: 10,
            detune: 0,
            oscillator: {
                type: 'sine'
            },
            envelope: {
                attack: 0.01,
                decay: 0.2,
                sustain: 0.5,
                release: 0.5
            },
            modulation: {
                type: 'square'
            },
            modulationEnvelope: {
                attack: 0.5,
                decay: 0,
                sustain: 1,
                release: 0.5
            }
        }).connect(new Tone.Filter({
            frequency: 2000,
            type: 'lowpass',
            Q: 5
        })).connect(this.effects.delay);
    }
    
    initializeMelodySynth() {
        // Enhanced melody synth for background
        this.instruments.melody = new Tone.PolySynth(Tone.Synth, {
            oscillator: {
                type: 'triangle'
            },
            envelope: {
                attack: 0.1,
                decay: 0.3,
                sustain: 0.3,
                release: 0.8
            }
        }).connect(this.effects.reverb);
        
        // Create melody sequence
        this.melody = new Tone.Sequence(
            (time, note) => {
                this.instruments.melody.triggerAttackRelease(note, '8n', time);
            },
            MELODY_NOTES,
            '4n'
        );
        this.melody.loop = true;
    }
    
    initializeBassSynth() {
        // Deep bass synth for chord root notes
        this.instruments.bass = new Tone.MonoSynth({
            oscillator: {
                type: 'sawtooth'
            },
            filter: {
                frequency: 200,
                type: 'lowpass',
                Q: 1
            },
            envelope: {
                attack: 0.02,
                decay: 0.3,
                sustain: 0.4,
                release: 1.2
            }
        }).connect(new Tone.Filter({
            frequency: 120,
            type: 'lowpass'
        })).connect(this.effects.reverb);
    }
    
    initializeChordSynth() {
        // Harmonic chord pad synth
        this.instruments.chords = new Tone.PolySynth(Tone.Synth, {
            oscillator: {
                type: 'triangle'
            },
            envelope: {
                attack: 0.8,
                decay: 0.5,
                sustain: 0.6,
                release: 2.0
            }
        }).connect(new Tone.Filter({
            frequency: 1000,
            type: 'lowpass',
            Q: 2
        })).connect(this.effects.reverb);
    }
    
    async startAudio() {
        await Tone.start();
        
        // Initialize harmony system
        harmonySystem.initialize();
        
        Tone.Transport.start();
        this.melody.start(0);
        this.startColorChangeLoop();
        this.startChordProgression();
    }
    
    stopAudio() {
        if (this.melody) {
            this.melody.stop();
        }
        
        this.stopChordProgression();
        harmonySystem.stopChordProgression();
        
        Tone.Transport.stop();
        if (this.colorChangeLoop) {
            this.colorChangeLoop.dispose();
            this.colorChangeLoop = null;
        }
    }
    
    startColorChangeLoop() {
        if (this.colorChangeLoop) this.colorChangeLoop.dispose();
        let colorIndex = 0;
        this.colorChangeLoop = new Tone.Loop(() => {
            if (this.playArea) {
                this.playArea.style.backgroundColor = BACKGROUND_COLORS[colorIndex++ % BACKGROUND_COLORS.length];
            }
        }, "4n").start(0);
    }
    
    startChordProgression() {
        // Stop existing sequences
        this.stopChordProgression();
        
        // Create chord progression sequence (every 2 measures)
        this.chordSequence = new Tone.Loop(() => {
            const currentChord = harmonySystem.getCurrentChord();
            if (currentChord && this.instruments.chords) {
                // Play chord with soft attack
                this.instruments.chords.triggerAttackRelease(
                    currentChord.notes, 
                    '2m', // 2 measures duration
                    undefined,
                    0.3 // Soft volume
                );
            }
        }, "2m").start(0);
        
        // Create bass line sequence (every measure on beats 1 and 3)
        this.bassSequence = new Tone.Sequence((time, note) => {
            if (this.instruments.bass) {
                this.instruments.bass.triggerAttackRelease(note, '4n', time, 0.8);
            }
        }, [], '2n');
        
        // Update bass sequence when chord changes
        this.updateBassLine();
        this.bassSequence.start(0);
    }
    
    stopChordProgression() {
        if (this.chordSequence) {
            this.chordSequence.dispose();
            this.chordSequence = null;
        }
        if (this.bassSequence) {
            this.bassSequence.dispose();
            this.bassSequence = null;
        }
    }
    
    updateBassLine() {
        if (!this.bassSequence) return;
        
        const currentChord = harmonySystem.getCurrentChord();
        if (!currentChord) return;
        
        const rootNote = harmonySystem.getCurrentRootNote();
        const bassPattern = [rootNote, null, rootNote, null]; // On beats 1 and 3
        
        this.bassSequence.events = bassPattern;
    }
    
    playHitSound(key) {
        const instrumentType = HIT_SOUNDS[key];
        if (instrumentType && this.instruments[instrumentType]) {
            switch (instrumentType) {
                case 'kick':
                    // Play root note of current chord for musically intelligent kick
                    const rootNote = harmonySystem.getCurrentRootNote() || 'C1';
                    this.instruments.kick.triggerAttackRelease(rootNote, '8n');
                    break;
                case 'snare':
                    this.instruments.snare.triggerAttackRelease('8n');
                    break;
                case 'hihat':
                    this.instruments.hihat.triggerAttackRelease('C6', '32n');
                    break;
                case 'lead':
                    // Use harmony system for musically intelligent note selection
                    const smartNote = harmonySystem.getSmartLeadNote();
                    this.instruments.lead.triggerAttackRelease(smartNote, '4n');
                    
                    // Also update bass line if chord has changed
                    this.updateBassLine();
                    break;
            }
        }
    }
    
    playMissSound() {
        // Use a simple synth for miss sound
        if (!this.instruments.miss) {
            this.instruments.miss = new Tone.Synth().toDestination();
        }
        this.instruments.miss.triggerAttackRelease(MISS_SOUND, '8n');
    }
    
    dispose() {
        if (this.colorChangeLoop) {
            this.colorChangeLoop.dispose();
            this.colorChangeLoop = null;
        }
        if (this.melody) {
            this.melody.dispose();
        }
        
        // Dispose all instruments
        Object.values(this.instruments).forEach(instrument => {
            if (instrument && instrument.dispose) {
                instrument.dispose();
            }
        });
        
        // Dispose effects
        Object.values(this.effects).forEach(effect => {
            if (effect && effect.dispose) {
                effect.dispose();
            }
        });
        
        // Dispose harmony system
        harmonySystem.dispose();
    }
    
    // Get current musical context for UI
    getMusicalContext() {
        return harmonySystem.getMusicalContext();
    }
    
    // Play harmonized notes (for auto-harmonization feature)
    playHarmonizedNote(noteName) {
        const harmonizedNotes = harmonySystem.harmonizeNote(noteName);
        harmonizedNotes.forEach((note, index) => {
            const delay = index * 0.02; // Slight staggering for richness
            setTimeout(() => {
                if (index === 0) {
                    // Main note with lead synth
                    this.instruments.lead.triggerAttackRelease(note, '4n');
                } else {
                    // Harmony notes with chord synth at lower volume
                    this.instruments.chords.triggerAttackRelease(note, '4n', undefined, 0.2);
                }
            }, delay * 1000);
        });
    }
}

// Create singleton instance
const audioSystem = new AudioSystem();
export default audioSystem;