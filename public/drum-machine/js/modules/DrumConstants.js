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
    DEFAULT_MASTER_VOLUME: -10
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


export const API_CONFIG = {
    // TODO: Replace with actual API endpoint configuration
    ANTHROPIC_API_URL: "https://api.anthropic.com/v1/messages",
    MODEL: "claude-sonnet-4-20250514",
    MAX_TOKENS: 1500,
    
    // Mock responses for development
    USE_MOCK_RESPONSES: true
};

