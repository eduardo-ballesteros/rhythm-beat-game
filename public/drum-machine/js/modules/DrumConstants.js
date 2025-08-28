/**
 * DrumConstants.js
 * Constants and configurations for the drum machine
 */

export const DRUM_MACHINE_CONFIG = {
    STEPS_COUNT: 16,
    DEFAULT_BPM: 120,
    MIN_BPM: 60,
    MAX_BPM: 180,
    BEATS_PER_MEASURE: 4,
    MEASURES_COUNT: 4,
    TOTAL_BEATS: 64, // 16 measures for melody
    DEFAULT_MASTER_VOLUME: -10,
    DEFAULT_MELODY_VOLUME: -15
};

export const DRUM_NAMES = {
    kick: 'Kick',
    snare: 'Snare',
    hihat: 'Hi-Hat',
    openhat: 'Open Hat',
    crash: 'Crash',
    clap: 'Clap'
};

export const DRUM_COLORS = {
    kick: 'bg-red-500',
    snare: 'bg-blue-500',
    hihat: 'bg-yellow-400',
    openhat: 'bg-orange-500',
    crash: 'bg-purple-500',
    clap: 'bg-green-500'
};

export const DEFAULT_PATTERN = {
    kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    openhat: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    crash: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
};

export const DEFAULT_MELODY_DATA = {
    melody: ["C4", "E4", "G4", "C5", "G4", "E4", "F4", "A4", "C5", "F4", "G4", "B4", "D5", "G4", "E4", "C4"],
    chords: [["C4", "E4", "G4"], ["F4", "A4", "C5"], ["G4", "B4", "D5"], ["C4", "E4", "G4"]],
    melodyTiming: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5],
    chordTiming: [0, 2, 4, 6]
};

export const DRUM_SYNTH_CONFIGS = {
    kick: {
        pitchDecay: 0.05,
        octaves: 10,
        oscillator: { type: "sine" },
        envelope: { 
            attack: 0.001, 
            decay: 0.4, 
            sustain: 0.01, 
            release: 1.4, 
            attackCurve: "exponential" 
        },
        volume: 0 // Boost from -10
    },
    
    snare: {
        noise: { type: "white" },
        envelope: { 
            attack: 0.005, 
            decay: 0.1, 
            sustain: 0.0, 
            release: 0.4 
        },
        volume: -5 // Boost from -15
    },
    
    hihat: {
        frequency: 200,
        envelope: { 
            attack: 0.001, 
            decay: 0.1, 
            release: 0.01 
        },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5,
        volume: -8 // Boost from -20
    },
    
    openhat: {
        frequency: 200,
        envelope: { 
            attack: 0.001, 
            decay: 0.3, 
            release: 0.3 
        },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5,
        volume: -6 // Boost from -18
    },
    
    crash: {
        frequency: 300,
        envelope: { 
            attack: 0.001, 
            decay: 1, 
            release: 2 
        },
        harmonicity: 5.1,
        modulationIndex: 64,
        resonance: 4000,
        octaves: 1.5,
        volume: -6 // Boost from -18
    },
    
    clap: {
        noise: { type: "white" },
        envelope: { 
            attack: 0.005, 
            decay: 0.05, 
            sustain: 0.0, 
            release: 0.1 
        },
        volume: -3 // Boost from -15
    }
};

export const MELODY_SYNTH_CONFIGS = {
    melody: {
        oscillator: { type: "triangle" },
        envelope: { 
            attack: 0.05, 
            decay: 0.3, 
            sustain: 0.4, 
            release: 0.8 
        }
    },
    
    chord: {
        oscillator: { type: "sawtooth" },
        envelope: { 
            attack: 0.3, 
            decay: 0.4, 
            sustain: 0.6, 
            release: 1.2 
        },
        filter: { 
            frequency: 1200, 
            type: "lowpass", 
            rolloff: -24 
        },
        volume: -8
    }
};

export const API_CONFIG = {
    // TODO: Replace with actual API endpoint configuration
    ANTHROPIC_API_URL: "https://api.anthropic.com/v1/messages",
    MODEL: "claude-sonnet-4-20250514",
    MAX_TOKENS: 1500,
    
    // Mock responses for development
    USE_MOCK_RESPONSES: true
};

export const CHORD_MAP = {
    'C': ['C4', 'E4', 'G4'], 
    'Dm': ['D4', 'F4', 'A4'], 
    'Em': ['E4', 'G4', 'B4'], 
    'F': ['F4', 'A4', 'C5'],
    'G': ['G4', 'B4', 'D5'], 
    'Am': ['A4', 'C5', 'E5'], 
    'Bdim': ['B4', 'D5', 'F5'],
    'C7': ['C4', 'E4', 'G4', 'Bb4'], 
    'F7': ['F4', 'A4', 'C5', 'Eb5'], 
    'G7': ['G4', 'B4', 'D5', 'F5'],
    'Am7': ['A4', 'C5', 'E5', 'G5'], 
    'Dm7': ['D4', 'F4', 'A4', 'C5'], 
    'Em7': ['E4', 'G4', 'B4', 'D5']
};