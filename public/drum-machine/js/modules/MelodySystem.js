/**
 * MelodySystem.js
 * Rich melody and chord system inspired by public domain classics
 */

export class MelodySystem {
    constructor() {
        this.leadSynth = null;
        this.chordSynth = null;
        this.masterVolume = null;
        this.initialized = false;
        
        // Current musical state - melody is always active
        this.currentProgression = null;
        this.currentMelody = null;
        this.currentKey = 'C';
        this.currentMode = 'major';
        
        // Chord progression sequence
        this.progressionSequence = null;
        this.melodySequence = null;
        this.currentProgressionStep = 0;
        
        // Musical configurations
        this.initMusicalConfig();
    }

    /**
     * Initialize musical scales, chord progressions, and patterns
     */
    initMusicalConfig() {
        // Note frequencies (C4 = 261.63 Hz)
        this.noteFrequencies = {
            'C': 261.63, 'C#': 277.18, 'Db': 277.18,
            'D': 293.66, 'D#': 311.13, 'Eb': 311.13,
            'E': 329.63, 'F': 349.23, 'F#': 369.99, 'Gb': 369.99,
            'G': 392.00, 'G#': 415.30, 'Ab': 415.30,
            'A': 440.00, 'A#': 466.16, 'Bb': 466.16,
            'B': 493.88
        };

        // Major and minor scales
        this.scales = {
            major: [0, 2, 4, 5, 7, 9, 11], // W W H W W W H
            minor: [0, 2, 3, 5, 7, 8, 10], // W H W W H W W
            dorian: [0, 2, 3, 5, 7, 9, 10], // W H W W W H W
            mixolydian: [0, 2, 4, 5, 7, 9, 10], // W W H W W H W
            pentatonic: [0, 2, 4, 7, 9], // Pentatonic major
            blues: [0, 3, 5, 6, 7, 10] // Blues scale
        };

        // Classic chord progressions inspired by public domain music
        this.chordProgressions = {
            // Rock/Pop progressions
            'Classic Rock': {
                chords: ['I', 'vi', 'IV', 'V'], // C-Am-F-G
                description: 'Timeless rock progression',
                style: 'rock'
            },
            'Pop Ballad': {
                chords: ['vi', 'IV', 'I', 'V'], // Am-F-C-G
                description: 'Emotional pop progression',
                style: 'pop'
            },
            
            // Jazz progressions
            'Jazz ii-V-I': {
                chords: ['ii7', 'V7', 'IMaj7'], // Dm7-G7-CMaj7
                description: 'Classic jazz turnaround',
                style: 'jazz'
            },
            'Jazz Circle': {
                chords: ['IMaj7', 'vi7', 'ii7', 'V7'], // CMaj7-Am7-Dm7-G7
                description: 'Smooth jazz circle progression',
                style: 'jazz'
            },
            
            // Blues progressions
            '12-Bar Blues': {
                chords: ['I7', 'I7', 'I7', 'I7', 'IV7', 'IV7', 'I7', 'I7', 'V7', 'IV7', 'I7', 'V7'],
                description: 'Traditional 12-bar blues',
                style: 'blues'
            },
            'Simple Blues': {
                chords: ['I7', 'IV7', 'I7', 'V7'], // C7-F7-C7-G7
                description: '4-bar blues pattern',
                style: 'blues'
            },
            
            // Folk/Country progressions
            'Folk Classic': {
                chords: ['I', 'IV', 'I', 'V'], // C-F-C-G
                description: 'Traditional folk progression',
                style: 'folk'
            },
            'Country Ballad': {
                chords: ['I', 'V', 'vi', 'IV'], // C-G-Am-F
                description: 'Country storytelling progression',
                style: 'folk'
            },
            
            // Classical-inspired
            'Pachelbel Canon': {
                chords: ['I', 'V', 'vi', 'iii', 'IV', 'I', 'IV', 'V'], // C-G-Am-Em-F-C-F-G
                description: 'Based on Pachelbel\'s Canon',
                style: 'classical'
            },
            'Bach-inspired': {
                chords: ['i', 'VI', 'III', 'VII'], // Am-F-C-G (in A minor)
                description: 'Baroque-style progression',
                style: 'classical'
            },
            
            // Modal progressions
            'Dorian Epic': {
                chords: ['i', 'bVII', 'IV', 'i'], // Em-D-G-Em
                description: 'Epic modal progression',
                style: 'modal'
            },
            'Mixolydian Groove': {
                chords: ['I', 'bVII', 'I', 'bVII'], // G-F-G-F
                description: 'Mixolydian rock groove',
                style: 'modal'
            }
        };

        // Melody patterns inspired by classical themes
        this.melodyPatterns = {
            'Classical Arpeggio': {
                pattern: [0, 2, 4, 2, 0, 2, 4, 2, 0, 2, 4, 7, 4, 2, 0, -1],
                description: 'Bach-inspired arpeggio',
                octave: 5,
                style: 'classical'
            },
            'Folk Melody': {
                pattern: [0, 2, 4, 0, 7, 4, 2, 0, 0, 2, 4, 7, 4, 2, 0, 0],
                description: 'Simple folk tune',
                octave: 5,
                style: 'folk'
            },
            'Blues Riff': {
                pattern: [0, 3, 0, 3, 5, 3, 0, 3, 0, 3, 5, 6, 5, 3, 0, 0],
                description: 'Classic blues lick',
                octave: 4,
                style: 'blues'
            },
            'Jazz Walk': {
                pattern: [0, 2, 4, 7, 9, 7, 4, 2, 0, -2, 0, 2, 4, 2, 0, 0],
                description: 'Jazz walking melody',
                octave: 5,
                style: 'jazz'
            },
            'Rock Anthem': {
                pattern: [0, 0, 4, 4, 7, 7, 4, 4, 0, 0, 4, 4, 2, 2, 0, 0],
                description: 'Anthemic rock melody',
                octave: 5,
                style: 'rock'
            },
            'Electronic Sequence': {
                pattern: [0, 3, 7, 10, 12, 10, 7, 3, 0, 3, 7, 10, 7, 3, 0, 0],
                description: 'Sequencer-style melody',
                octave: 5,
                style: 'electronic'
            },
            'Modal Mystique': {
                pattern: [0, 2, 3, 5, 7, 5, 3, 2, 0, 2, 3, 7, 3, 2, 0, 0],
                description: 'Mysterious dorian melody',
                octave: 5,
                style: 'modal'
            },
            'Pentatonic Flow': {
                pattern: [0, 2, 4, 7, 9, 7, 4, 2, 0, 4, 7, 9, 7, 4, 2, 0],
                description: 'Flowing pentatonic melody',
                octave: 5,
                style: 'world'
            }
        };

        // Chord voicings for rich harmonic content
        this.chordVoicings = {
            // Triads
            'I': [0, 4, 7],           // C major
            'ii': [2, 5, 9],          // D minor
            'iii': [4, 7, 11],        // E minor
            'IV': [5, 9, 0],          // F major
            'V': [7, 11, 2],          // G major
            'vi': [9, 0, 4],          // A minor
            'vii°': [11, 2, 5],       // B diminished
            
            // Minor key
            'i': [0, 3, 7],           // C minor
            'ii°': [2, 5, 8],         // D diminished
            'III': [3, 7, 10],        // Eb major
            'iv': [5, 8, 0],          // F minor
            'V': [7, 11, 2],          // G major (same in minor)
            'VI': [8, 0, 3],          // Ab major
            'VII': [10, 2, 5],        // Bb major
            
            // Seventh chords
            'IMaj7': [0, 4, 7, 11],   // C major 7
            'ii7': [2, 5, 9, 0],      // D minor 7
            'V7': [7, 11, 2, 5],      // G dominant 7
            'vi7': [9, 0, 4, 7],      // A minor 7
            'I7': [0, 4, 7, 10],      // C7 (dominant)
            'IV7': [5, 9, 0, 3],      // F7 (dominant)
            
            // Extended chords
            'IMaj9': [0, 4, 7, 11, 2], // C major 9
            'ii9': [2, 5, 9, 0, 4],    // D minor 9
        };

        // Key centers for transposition
        this.keyRoots = {
            'C': 0, 'C#': 1, 'Db': 1,
            'D': 2, 'D#': 3, 'Eb': 3,
            'E': 4, 'F': 5, 'F#': 6, 'Gb': 6,
            'G': 7, 'G#': 8, 'Ab': 8,
            'A': 9, 'A#': 10, 'Bb': 10,
            'B': 11
        };
    }

    /**
     * Initialize audio systems
     */
    async init() {
        if (this.initialized) {
            return;
        }

        try {
            // Create master volume control
            this.masterVolume = new Tone.Volume(-15).toDestination();

            // Create lead synthesizer (triangle wave with ADSR)
            this.leadSynth = new Tone.PolySynth({
                voice: Tone.Synth,
                options: {
                    oscillator: {
                        type: "triangle"
                    },
                    envelope: {
                        attack: 0.02,
                        decay: 0.1,
                        sustain: 0.3,
                        release: 1.0
                    },
                    filter: {
                        type: "lowpass",
                        frequency: 2000,
                        Q: 1
                    },
                    filterEnvelope: {
                        attack: 0.02,
                        decay: 0.2,
                        sustain: 0.5,
                        release: 0.8,
                        baseFrequency: 800,
                        octaves: 2
                    }
                }
            }).connect(this.masterVolume);

            // Create chord synthesizer (sawtooth with filtering)
            this.chordSynth = new Tone.PolySynth({
                voice: Tone.Synth,
                options: {
                    oscillator: {
                        type: "sawtooth"
                    },
                    envelope: {
                        attack: 0.05,
                        decay: 0.3,
                        sustain: 0.4,
                        release: 1.5
                    },
                    filter: {
                        type: "lowpass",
                        frequency: 1500,
                        Q: 0.8
                    },
                    filterEnvelope: {
                        attack: 0.1,
                        decay: 0.4,
                        sustain: 0.3,
                        release: 1.0,
                        baseFrequency: 500,
                        octaves: 1.5
                    }
                }
            }).connect(this.masterVolume);

            // Set volumes
            this.leadSynth.volume.value = -8;
            this.chordSynth.volume.value = -12;

            this.initialized = true;
            console.log('MelodySystem initialized successfully');

        } catch (error) {
            console.error('Error initializing MelodySystem:', error);
            throw error;
        }
    }

    /**
     * Melody is always enabled - this method maintained for compatibility
     * @param {boolean} enabled - Ignored, melody is always on
     */
    setEnabled(enabled) {
        // Melody is always enabled in the simplified system
        // This method is kept for compatibility but does nothing
    }

    /**
     * Check if melody system is enabled - always true now
     */
    isPlaying() {
        return true;
    }

    /**
     * Generate a new melody and chord progression
     * @param {string} style - Musical style (rock, jazz, blues, etc.)
     * @param {string} key - Root key (C, F, G, etc.)
     * @returns {Object} Generated musical content
     */
    generateMusic(style = 'rock', key = 'C') {
        this.currentKey = key;
        
        // Select chord progression based on style
        const progressionsForStyle = Object.keys(this.chordProgressions).filter(name => {
            return this.chordProgressions[name].style === style ||
                   (style === 'electronic' && this.chordProgressions[name].style === 'pop') ||
                   (style === 'latin' && this.chordProgressions[name].style === 'folk');
        });

        // Fallback to all progressions if style not found
        const availableProgressions = progressionsForStyle.length > 0 ? 
            progressionsForStyle : Object.keys(this.chordProgressions);
        
        const progressionName = availableProgressions[Math.floor(Math.random() * availableProgressions.length)];
        this.currentProgression = this.chordProgressions[progressionName];

        // Select melody pattern based on style
        const melodiesForStyle = Object.keys(this.melodyPatterns).filter(name => {
            return this.melodyPatterns[name].style === style;
        });

        // Fallback to compatible melody
        const availableMelodies = melodiesForStyle.length > 0 ? 
            melodiesForStyle : Object.keys(this.melodyPatterns);
        
        const melodyName = availableMelodies[Math.floor(Math.random() * availableMelodies.length)];
        this.currentMelody = this.melodyPatterns[melodyName];

        console.log(`Generated ${progressionName} progression and ${melodyName} melody in key of ${key}`);

        return {
            progression: this.currentProgression,
            melody: this.currentMelody,
            progressionName,
            melodyName
        };
    }

    /**
     * Start melody and chord sequences with the drum sequencer
     * @param {Object} drumSequencer - Reference to drum sequencer for timing
     */
    start(drumSequencer) {
        if (!this.initialized || !this.currentProgression) {
            return;
        }

        this.stop(); // Clean up existing sequences

        try {
            // Create chord progression sequence (changes every 4 steps for now)
            const progressionLength = this.currentProgression.chords.length;
            
            this.progressionSequence = new Tone.Sequence((time, step) => {
                // Calculate which chord in the progression
                const progressionStep = Math.floor(step / 4) % progressionLength;
                const chord = this.currentProgression.chords[progressionStep];
                
                this.playChord(chord, time);
                this.currentProgressionStep = progressionStep;

            }, Array.from({length: 16}, (_, i) => i), "16n");

            // Create melody sequence
            if (this.currentMelody) {
                this.melodySequence = new Tone.Sequence((time, step) => {
                    const noteIndex = this.currentMelody.pattern[step];
                    if (noteIndex !== undefined && noteIndex >= -12 && noteIndex <= 12) {
                        this.playMelodyNote(noteIndex, this.currentMelody.octave || 5, time);
                    }

                }, Array.from({length: 16}, (_, i) => i), "16n");
            }

            // Start sequences
            if (this.progressionSequence) {
                this.progressionSequence.start(0);
            }
            if (this.melodySequence) {
                this.melodySequence.start(0);
            }

            console.log('Melody system sequences started');

        } catch (error) {
            console.error('Error starting melody sequences:', error);
        }
    }

    /**
     * Stop melody and chord sequences
     */
    stop() {
        try {
            if (this.progressionSequence) {
                this.progressionSequence.dispose();
                this.progressionSequence = null;
            }

            if (this.melodySequence) {
                this.melodySequence.dispose();
                this.melodySequence = null;
            }

            this.stopAllSounds();
            
        } catch (error) {
            console.error('Error stopping melody sequences:', error);
        }
    }

    /**
     * Play a chord
     * @param {string} chordSymbol - Chord symbol (I, vi, IV, etc.)
     * @param {number} time - Tone.js time
     */
    playChord(chordSymbol, time = undefined) {
        if (!this.initialized || !this.chordSynth) {
            return;
        }

        try {
            const voicing = this.chordVoicings[chordSymbol];
            if (!voicing) {
                console.warn(`Unknown chord: ${chordSymbol}`);
                return;
            }

            // Convert intervals to frequencies in the key
            const keyRoot = this.keyRoots[this.currentKey] || 0;
            const baseOctave = 3; // Lower octave for chords
            const frequencies = voicing.map(interval => {
                const semitone = (keyRoot + interval) % 12;
                const octave = baseOctave + Math.floor((keyRoot + interval) / 12);
                return this.semitoneToFrequency(semitone, octave);
            });

            // Play chord with duration
            const duration = "2n"; // Half note duration
            if (time !== undefined) {
                this.chordSynth.triggerAttackRelease(frequencies, duration, time);
            } else {
                this.chordSynth.triggerAttackRelease(frequencies, duration);
            }

        } catch (error) {
            console.error('Error playing chord:', error);
        }
    }

    /**
     * Play a melody note
     * @param {number} scaleIndex - Index in the scale (0 = root, 1 = second, etc.)
     * @param {number} octave - Octave number
     * @param {number} time - Tone.js time
     */
    playMelodyNote(scaleIndex, octave = 5, time = undefined) {
        if (!this.initialized || !this.leadSynth) {
            return;
        }

        try {
            const keyRoot = this.keyRoots[this.currentKey] || 0;
            const scale = this.scales[this.currentMode] || this.scales.major;
            
            // Handle negative indices (below root)
            let actualOctave = octave;
            let actualIndex = scaleIndex;
            
            if (scaleIndex < 0) {
                actualOctave = octave - 1;
                actualIndex = scale.length + (scaleIndex % scale.length);
            }

            const scaleStep = actualIndex % scale.length;
            const octaveOffset = Math.floor(actualIndex / scale.length);
            
            const semitone = (keyRoot + scale[scaleStep]) % 12;
            const noteOctave = actualOctave + octaveOffset;
            const frequency = this.semitoneToFrequency(semitone, noteOctave);

            const duration = "8n"; // Eighth note duration
            if (time !== undefined) {
                this.leadSynth.triggerAttackRelease(frequency, duration, time);
            } else {
                this.leadSynth.triggerAttackRelease(frequency, duration);
            }

        } catch (error) {
            console.error('Error playing melody note:', error);
        }
    }

    /**
     * Convert semitone and octave to frequency
     * @param {number} semitone - Semitone (0-11, where 0=C)
     * @param {number} octave - Octave number
     * @returns {number} Frequency in Hz
     */
    semitoneToFrequency(semitone, octave) {
        // C4 = 261.63 Hz is our reference
        const referenceFreq = 261.63;
        const referenceOctave = 4;
        
        const octaveDiff = octave - referenceOctave;
        const baseFreq = referenceFreq * Math.pow(2, octaveDiff);
        
        // Apply semitone offset
        return baseFreq * Math.pow(2, semitone / 12);
    }

    /**
     * Get current chord name for display
     * @returns {string} Current chord name
     */
    getCurrentChordName() {
        if (!this.currentProgression || this.currentProgressionStep === undefined) {
            return '';
        }

        const chordSymbol = this.currentProgression.chords[this.currentProgressionStep];
        return `${this.currentKey}${chordSymbol}`;
    }

    /**
     * Get available styles for music generation
     * @returns {Array<string>} List of available styles
     */
    getAvailableStyles() {
        const styles = new Set();
        Object.values(this.chordProgressions).forEach(prog => styles.add(prog.style));
        return Array.from(styles);
    }

    /**
     * Stop all currently playing sounds
     */
    stopAllSounds() {
        if (this.leadSynth) {
            this.leadSynth.releaseAll();
        }
        if (this.chordSynth) {
            this.chordSynth.releaseAll();
        }
    }

    /**
     * Set master volume for melody system
     * @param {number} volumeDb - Volume in decibels
     */
    setMasterVolume(volumeDb) {
        if (this.masterVolume) {
            this.masterVolume.volume.value = Math.max(-60, Math.min(0, volumeDb));
        }
    }

    /**
     * Test melody system (for debugging)
     */
    async testMelody() {
        try {
            console.log('Testing melody system...');
            
            if (!this.initialized) {
                await this.init();
            }

            // Generate test music
            this.generateMusic('rock', 'C');
            
            // Test chord
            console.log('Playing test chord...');
            this.playChord('I');
            
            // Test melody note
            setTimeout(() => {
                console.log('Playing test melody note...');
                this.playMelodyNote(0, 5);
            }, 500);

            console.log('Melody test completed');
            return true;

        } catch (error) {
            console.error('Melody test failed:', error);
            return false;
        }
    }

    /**
     * Dispose and clean up resources
     */
    dispose() {
        this.stop();
        
        if (this.leadSynth) {
            this.leadSynth.dispose();
            this.leadSynth = null;
        }
        
        if (this.chordSynth) {
            this.chordSynth.dispose();
            this.chordSynth = null;
        }
        
        if (this.masterVolume) {
            this.masterVolume.dispose();
            this.masterVolume = null;
        }
        
        this.initialized = false;
        console.log('MelodySystem disposed');
    }
}