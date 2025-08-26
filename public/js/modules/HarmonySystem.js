import { 
    BPM, 
    CHORD_PROGRESSION, 
    A_MINOR_SCALE, 
    CHORD_DEFINITIONS,
    SCALE_DEGREES,
    CHORD_EXTENSIONS,
    VOICE_LEADING_RULES
} from './Constants.js';

/**
 * HarmonySystem - Musical Intelligence & Harmonic Awareness
 * 
 * This system provides sophisticated musical intelligence including:
 * - Chord progression management (Am - F - C - G cycle)
 * - Scale-aware note generation for lead synth
 * - Automatic harmonization of recorded notes
 * - Musical context awareness
 * - Key center tracking and voice leading
 */
class HarmonySystem {
    constructor() {
        this.currentChordIndex = 0;
        this.currentChord = null;
        this.chordChangeInterval = null;
        this.measureLength = (60 / BPM) * 4 * 1000; // 4 beats per measure in milliseconds
        this.chordChangeMeasures = 2; // Change chord every 2 measures
        this.keyCenter = 'A'; // A minor key
        this.mode = 'minor';
        
        // Musical context tracking
        this.currentScale = A_MINOR_SCALE;
        this.activeNotes = new Set();
        this.lastPlayedNote = null;
        this.chordProgressionStartTime = null;
        
        // Harmonization settings
        this.autoHarmonizeEnabled = false;
        this.harmonizationStrength = 0.7; // How strongly to suggest chord tones
        this.voiceLeadingEnabled = true;
        
        // Initialize with first chord
        this.setCurrentChord(0);
    }
    
    /**
     * Initialize the harmony system
     */
    initialize() {
        this.chordProgressionStartTime = Date.now();
        this.startChordProgression();
    }
    
    /**
     * Start the automatic chord progression
     */
    startChordProgression() {
        const chordChangeTime = this.measureLength * this.chordChangeMeasures;
        
        if (this.chordChangeInterval) {
            clearInterval(this.chordChangeInterval);
        }
        
        this.chordChangeInterval = setInterval(() => {
            this.advanceChordProgression();
        }, chordChangeTime);
    }
    
    /**
     * Stop the chord progression
     */
    stopChordProgression() {
        if (this.chordChangeInterval) {
            clearInterval(this.chordChangeInterval);
            this.chordChangeInterval = null;
        }
    }
    
    /**
     * Advance to the next chord in the progression
     */
    advanceChordProgression() {
        this.currentChordIndex = (this.currentChordIndex + 1) % CHORD_PROGRESSION.length;
        this.setCurrentChord(this.currentChordIndex);
    }
    
    /**
     * Set the current chord by index
     */
    setCurrentChord(index) {
        this.currentChordIndex = index;
        const chordData = CHORD_DEFINITIONS[index];
        this.currentChord = {
            ...chordData,
            notes: CHORD_PROGRESSION[index],
            index: index
        };
    }
    
    /**
     * Get the current chord information
     */
    getCurrentChord() {
        return this.currentChord;
    }
    
    /**
     * Get the current chord name
     */
    getCurrentChordName() {
        return this.currentChord ? this.currentChord.name : 'Am';
    }
    
    /**
     * Get the root note of the current chord (for bass/kick drum)
     */
    getCurrentRootNote() {
        return this.currentChord ? this.currentChord.root : 'A3';
    }
    
    /**
     * Get musically intelligent note for lead synth
     * Instead of sequential notes, this returns harmonious notes based on current chord
     */
    getSmartLeadNote(preferredType = 'chord_tone') {
        if (!this.currentChord) {
            return 'A4'; // Fallback
        }
        
        const chordTones = this.currentChord.notes;
        const scaleTones = this.getAvailableScaleTones();
        
        let candidateNotes = [];
        
        switch (preferredType) {
            case 'chord_tone':
                // Prioritize chord tones
                candidateNotes = [...chordTones];
                break;
                
            case 'scale_tone':
                // Use scale tones that aren't chord tones
                candidateNotes = scaleTones.filter(note => 
                    !chordTones.some(chordNote => 
                        this.getNoteWithoutOctave(note) === this.getNoteWithoutOctave(chordNote)
                    )
                );
                break;
                
            case 'extension':
                // Use chord extensions (7ths, 9ths)
                candidateNotes = this.getChordExtensions();
                break;
                
            case 'passing':
                // Use passing tones
                candidateNotes = this.getPassingTones();
                break;
                
            default:
                // Mix of chord tones and scale tones, weighted toward chord tones
                candidateNotes = [
                    ...chordTones,
                    ...chordTones, // Double weight for chord tones
                    ...scaleTones.slice(0, 3) // Some scale tones
                ];
        }
        
        if (candidateNotes.length === 0) {
            candidateNotes = chordTones;
        }
        
        // Apply voice leading if enabled
        if (this.voiceLeadingEnabled && this.lastPlayedNote) {
            candidateNotes = this.applyVoiceLeading(candidateNotes);
        }
        
        // Select note
        const selectedNote = candidateNotes[Math.floor(Math.random() * candidateNotes.length)];
        this.lastPlayedNote = selectedNote;
        
        return selectedNote;
    }
    
    /**
     * Get available scale tones in the current key
     */
    getAvailableScaleTones() {
        // Return different octaves of the A minor scale
        return [
            'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4',
            'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5'
        ];
    }
    
    /**
     * Get chord extensions for the current chord
     */
    getChordExtensions() {
        if (!this.currentChord || !CHORD_EXTENSIONS[this.currentChord.name]) {
            return [];
        }
        
        return CHORD_EXTENSIONS[this.currentChord.name];
    }
    
    /**
     * Get passing tones for melodic movement
     */
    getPassingTones() {
        const passingTones = [];
        const scaleNotes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
        const chordNoteNames = this.currentChord.notes.map(note => this.getNoteWithoutOctave(note));
        
        scaleNotes.forEach(note => {
            if (!chordNoteNames.includes(note)) {
                passingTones.push(`${note}4`);
            }
        });
        
        return passingTones;
    }
    
    /**
     * Apply voice leading rules to note selection
     */
    applyVoiceLeading(candidateNotes) {
        if (!this.lastPlayedNote) return candidateNotes;
        
        const lastNoteNumber = this.getNoteNumber(this.lastPlayedNote);
        
        // Prefer notes that are close in pitch (good voice leading)
        const scoredNotes = candidateNotes.map(note => ({
            note,
            distance: Math.abs(this.getNoteNumber(note) - lastNoteNumber)
        }));
        
        // Sort by distance (closer is better)
        scoredNotes.sort((a, b) => a.distance - b.distance);
        
        // Return notes weighted toward closer intervals
        const result = [];
        scoredNotes.forEach((scored, index) => {
            const weight = Math.max(1, 5 - index); // Higher weight for closer notes
            for (let i = 0; i < weight; i++) {
                result.push(scored.note);
            }
        });
        
        return result;
    }
    
    /**
     * Convert note name to a number for distance calculation
     */
    getNoteNumber(noteName) {
        const noteMap = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 };
        const match = noteName.match(/([A-G])#?(\d+)/);
        if (!match) return 60; // Default to middle C
        
        const [, note, octave] = match;
        const sharp = noteName.includes('#') ? 1 : 0;
        
        return (parseInt(octave) * 12) + noteMap[note] + sharp;
    }
    
    /**
     * Get note name without octave
     */
    getNoteWithoutOctave(noteName) {
        return noteName.replace(/\d+/, '');
    }
    
    /**
     * Analyze if a played note fits the current harmony
     */
    analyzeNoteHarmony(noteName) {
        if (!this.currentChord) return { fits: true, strength: 1.0, reason: 'No chord context' };
        
        const noteWithoutOctave = this.getNoteWithoutOctave(noteName);
        const chordNotes = this.currentChord.notes.map(n => this.getNoteWithoutOctave(n));
        const scaleNotes = this.currentScale.map(n => this.getNoteWithoutOctave(n));
        
        // Check if it's a chord tone (strongest)
        if (chordNotes.includes(noteWithoutOctave)) {
            return { 
                fits: true, 
                strength: 1.0, 
                reason: 'chord_tone',
                suggestion: null 
            };
        }
        
        // Check if it's in the scale (good)
        if (scaleNotes.includes(noteWithoutOctave)) {
            return { 
                fits: true, 
                strength: 0.7, 
                reason: 'scale_tone',
                suggestion: null 
            };
        }
        
        // Check if it's a chord extension (sophisticated)
        const extensions = this.getChordExtensions();
        if (extensions.some(ext => this.getNoteWithoutOctave(ext) === noteWithoutOctave)) {
            return { 
                fits: true, 
                strength: 0.9, 
                reason: 'extension',
                suggestion: null 
            };
        }
        
        // Note doesn't fit - suggest correction
        const closestChordTone = this.findClosestChordTone(noteName);
        return { 
            fits: false, 
            strength: 0.3, 
            reason: 'clash',
            suggestion: closestChordTone 
        };
    }
    
    /**
     * Find the closest chord tone to a given note
     */
    findClosestChordTone(noteName) {
        const noteNumber = this.getNoteNumber(noteName);
        const chordTones = this.currentChord.notes;
        
        let closest = chordTones[0];
        let minDistance = Math.abs(this.getNoteNumber(closest) - noteNumber);
        
        chordTones.forEach(chordTone => {
            const distance = Math.abs(this.getNoteNumber(chordTone) - noteNumber);
            if (distance < minDistance) {
                minDistance = distance;
                closest = chordTone;
            }
        });
        
        return closest;
    }
    
    /**
     * Auto-harmonize a melody note by adding harmony lines
     */
    harmonizeNote(noteName) {
        if (!this.autoHarmonizeEnabled || !this.currentChord) {
            return [noteName];
        }
        
        const harmony = [noteName]; // Include original note
        const chordTones = this.currentChord.notes;
        const noteWithoutOctave = this.getNoteWithoutOctave(noteName);
        
        // Add harmony notes from current chord
        chordTones.forEach(chordTone => {
            const chordNoteWithoutOctave = this.getNoteWithoutOctave(chordTone);
            if (chordNoteWithoutOctave !== noteWithoutOctave) {
                // Add harmony note in appropriate octave
                const octave = this.getHarmonyOctave(noteName, chordTone);
                harmony.push(`${chordNoteWithoutOctave}${octave}`);
            }
        });
        
        return harmony;
    }
    
    /**
     * Get appropriate octave for harmony note
     */
    getHarmonyOctave(melodyNote, chordTone) {
        const melodyOctave = parseInt(melodyNote.match(/\d+/)?.[0] || '4');
        const chordOctave = parseInt(chordTone.match(/\d+/)?.[0] || '4');
        
        // Keep harmony notes in a reasonable range around the melody
        if (chordOctave < melodyOctave - 1) {
            return melodyOctave - 1;
        } else if (chordOctave > melodyOctave + 1) {
            return melodyOctave + 1;
        }
        
        return chordOctave;
    }
    
    /**
     * Get suggested notes for recording based on current harmony
     */
    getRecordingSuggestions() {
        if (!this.currentChord) return [];
        
        const suggestions = {
            strong: [...this.currentChord.notes], // Chord tones
            good: this.getAvailableScaleTones().slice(0, 4), // Scale tones
            sophisticated: this.getChordExtensions() // Extensions
        };
        
        return suggestions;
    }
    
    /**
     * Get the current musical context for UI display
     */
    getMusicalContext() {
        return {
            currentChord: this.getCurrentChordName(),
            keyCenter: `${this.keyCenter} ${this.mode}`,
            chordTones: this.currentChord ? this.currentChord.notes : [],
            scaleTones: this.getAvailableScaleTones(),
            suggestions: this.getRecordingSuggestions(),
            progressPosition: `${this.currentChordIndex + 1}/4`,
            rootNote: this.getCurrentRootNote()
        };
    }
    
    /**
     * Toggle auto-harmonization
     */
    toggleAutoHarmonize() {
        this.autoHarmonizeEnabled = !this.autoHarmonizeEnabled;
        return this.autoHarmonizeEnabled;
    }
    
    /**
     * Set harmonization strength (0.0 to 1.0)
     */
    setHarmonizationStrength(strength) {
        this.harmonizationStrength = Math.max(0, Math.min(1, strength));
    }
    
    /**
     * Toggle voice leading
     */
    toggleVoiceLeading() {
        this.voiceLeadingEnabled = !this.voiceLeadingEnabled;
        return this.voiceLeadingEnabled;
    }
    
    /**
     * Get next smart note with specified characteristics
     */
    getNextSmartNote(characteristics = {}) {
        const {
            preferChordTones = true,
            allowExtensions = true,
            preferStepwise = this.voiceLeadingEnabled,
            avoidRepeats = true
        } = characteristics;
        
        let noteType = 'chord_tone';
        
        if (Math.random() > this.harmonizationStrength) {
            noteType = allowExtensions && Math.random() > 0.7 ? 'extension' : 'scale_tone';
        }
        
        return this.getSmartLeadNote(noteType);
    }
    
    /**
     * Process a recorded sequence for harmonic analysis
     */
    analyzeRecordedSequence(notes) {
        const analysis = {
            harmonicFit: 0,
            suggestions: [],
            chordProgression: [],
            improvements: []
        };
        
        let totalFit = 0;
        let noteCount = 0;
        
        notes.forEach((noteData, index) => {
            // Determine which chord was active when this note was played
            const chordAtTime = this.getChordAtTime(noteData.time);
            const harmonyAnalysis = this.analyzeNoteHarmony(noteData.key);
            
            totalFit += harmonyAnalysis.strength;
            noteCount++;
            
            if (!harmonyAnalysis.fits && harmonyAnalysis.suggestion) {
                analysis.suggestions.push({
                    index,
                    original: noteData.key,
                    suggested: harmonyAnalysis.suggestion,
                    reason: harmonyAnalysis.reason,
                    time: noteData.time
                });
            }
        });
        
        analysis.harmonicFit = noteCount > 0 ? totalFit / noteCount : 0;
        
        return analysis;
    }
    
    /**
     * Get which chord was active at a specific time
     */
    getChordAtTime(time) {
        if (!this.chordProgressionStartTime) return this.currentChord;
        
        const elapsed = time - this.chordProgressionStartTime;
        const chordChangeTime = this.measureLength * this.chordChangeMeasures;
        const chordIndex = Math.floor(elapsed / chordChangeTime) % CHORD_PROGRESSION.length;
        
        return {
            index: chordIndex,
            name: CHORD_DEFINITIONS[chordIndex].name,
            notes: CHORD_PROGRESSION[chordIndex]
        };
    }
    
    /**
     * Dispose of the harmony system
     */
    dispose() {
        this.stopChordProgression();
        this.activeNotes.clear();
        this.currentChord = null;
        this.lastPlayedNote = null;
    }
}

// Create singleton instance
const harmonySystem = new HarmonySystem();
export default harmonySystem;