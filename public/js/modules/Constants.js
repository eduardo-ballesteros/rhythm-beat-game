// Game configuration constants
export const ARROW_SPEED = 200;
export const HIT_TOLERANCE = 75;

export const BACKGROUND_COLORS = ['#ff00ff', '#00ffff', '#ffff00', '#ff007f', '#7f00ff', '#00ff7f'];

// EDM-style instrument assignments
export const HIT_SOUNDS = {
    'ArrowLeft': 'kick',    // Deep sub-bass drum
    'ArrowDown': 'snare',   // Crispy snare with high-frequency snap
    'ArrowUp': 'hihat',     // Bright, short hi-hat sounds
    'ArrowRight': 'lead'    // Melodic synthesizer with filter sweeps
};

export const MISS_SOUND = 'C#2';

// Musical definitions for EDM coherence
export const BPM = 128;
export const BASE_KEY = 'A';

// A minor pentatonic scale (A, C, D, E, G)
export const PENTATONIC_SCALE = ['A3', 'C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5'];

// Full A minor natural scale
export const A_MINOR_SCALE = ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5'];

// Chord progression: Am - F - C - G
export const CHORD_PROGRESSION = [
    ['A3', 'C4', 'E4'],  // Am
    ['F3', 'A3', 'C4'],  // F
    ['C4', 'E4', 'G4'],  // C
    ['G3', 'B3', 'D4']   // G
];

// Comprehensive chord definitions with musical context
export const CHORD_DEFINITIONS = [
    {
        name: 'Am',
        fullName: 'A minor',
        root: 'A3',
        quality: 'minor',
        function: 'tonic',
        degree: 'i',
        notes: ['A', 'C', 'E'],
        bassNote: 'A2'
    },
    {
        name: 'F',
        fullName: 'F major',
        root: 'F3',
        quality: 'major',
        function: 'subdominant',
        degree: 'VI',
        notes: ['F', 'A', 'C'],
        bassNote: 'F2'
    },
    {
        name: 'C',
        fullName: 'C major',
        root: 'C3',
        quality: 'major',
        function: 'dominant',
        degree: 'III',
        notes: ['C', 'E', 'G'],
        bassNote: 'C3'
    },
    {
        name: 'G',
        fullName: 'G major',
        root: 'G3',
        quality: 'major',
        function: 'subtonic',
        degree: 'VII',
        notes: ['G', 'B', 'D'],
        bassNote: 'G2'
    }
];

// Scale degrees for A minor
export const SCALE_DEGREES = {
    'A': 1, // Tonic
    'B': 2, // Supertonic
    'C': 3, // Mediant (minor third)
    'D': 4, // Subdominant
    'E': 5, // Dominant
    'F': 6, // Submediant
    'G': 7  // Subtonic (leading tone)
};

// Chord extensions and color tones
export const CHORD_EXTENSIONS = {
    'Am': ['G4', 'F4', 'B4'], // Am7, Am6, Am9
    'F': ['E4', 'D5', 'G4'],  // Fmaj7, Fadd9, F6
    'C': ['B4', 'D5', 'F4'],  // Cmaj7, Cadd9, C6
    'G': ['F4', 'A4', 'E5']   // G7, Gadd9, G6
};

// Voice leading rules for smooth melodic lines
export const VOICE_LEADING_RULES = {
    preferStepwise: true,      // Prefer movement by step
    maxLeap: 5,               // Maximum interval leap (in semitones)
    avoidParallels: true,     // Avoid parallel fifths/octaves
    resolveDissonance: true   // Resolve dissonant intervals
};

// Musical context for intelligent note selection
export const NOTE_PRIORITIES = {
    CHORD_TONE: 1.0,      // Strongest - notes in current chord
    SCALE_TONE: 0.7,      // Good - notes in current scale
    EXTENSION: 0.9,       // Sophisticated - chord extensions
    PASSING_TONE: 0.5,    // Weak - chromatic passing tones
    AVOID_NOTE: 0.2       // Weak - notes that clash
};

// Harmonic rhythm - how often chords change
export const HARMONIC_RHYTHM = {
    measuresPerChord: 2,      // Change chord every 2 measures
    beatsPerMeasure: 4,       // 4/4 time signature
    allowSyncopation: false   // Keep chord changes on strong beats
};

// EDM-appropriate melody using pentatonic scale
export const MELODY_NOTES = ['A3', 'C4', 'E4', 'G4', 'E4', 'D4', 'C4', 'A3'];

export const DEFAULT_SONG_CHART = {
    name: "Default Song",
    score: 350,
    chart: [
        { time: 1000, key: "ArrowLeft" },
        { time: 2500, key: "ArrowRight" },
        { time: 4000, key: "ArrowDown" },
        { time: 5500, key: "ArrowUp" },
        { time: 7000, key: "ArrowLeft" },
        { time: 8500, key: "ArrowRight" },
        { time: 10000, key: "ArrowDown" },
        { time: 11500, key: "ArrowUp" },
        { time: 13000, key: "ArrowLeft" },
        { time: 14500, key: "ArrowRight" },
        { time: 16000, key: "ArrowDown" },
        { time: 17500, key: "ArrowUp" },
        { time: 19000, key: "ArrowLeft" },
        { time: 20500, key: "ArrowRight" },
        { time: 22000, key: "ArrowDown" },
        { time: 23500, key: "ArrowUp" },
        { time: 25000, key: "ArrowLeft" },
        { time: 26500, key: "ArrowRight" },
        { time: 28000, key: "ArrowDown" },
        { time: 29500, key: "ArrowUp" },
        { time: 32000, key: "END" }
    ]
};

export const ARROW_KEYS = ['ArrowLeft', 'ArrowDown', 'ArrowUp', 'ArrowRight'];

// Quantization and Beat Grid Constants
export const QUANTIZATION_TYPES = {
    '16th': { name: '16th Notes', value: '16th' },
    '8th': { name: '8th Notes', value: '8th' },
    'quarter': { name: 'Quarter Notes', value: 'quarter' }
};

export const TIME_SIGNATURE = { numerator: 4, denominator: 4 };

// Visual Beat Marker Configuration
export const BEAT_MARKER_CONFIG = {
    downbeat: { color: '#facc15', size: 4, opacity: 0.9 }, // Yellow, larger for downbeats
    beat: { color: '#3b82f6', size: 3, opacity: 0.7 },     // Blue for beats
    subdivision: { color: '#6b7280', size: 2, opacity: 0.5 } // Gray for subdivisions
};

// Metronome Visual Configuration
export const METRONOME_CONFIG = {
    downbeat: { color: '#facc15', duration: 200 }, // Yellow flash for downbeat
    beat: { color: '#3b82f6', duration: 150 },     // Blue flash for beat
    subdivision: { color: '#6b7280', duration: 100 } // Gray flash for subdivision
};