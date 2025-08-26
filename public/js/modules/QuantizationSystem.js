import { BPM } from './Constants.js';

class QuantizationSystem {
    constructor() {
        this.isEnabled = true;
        this.currentQuantization = '16th'; // 16th, 8th, quarter
        this.bpm = BPM;
        this.timeSignature = { numerator: 4, denominator: 4 }; // 4/4 time
        
        // Calculate timing intervals
        this.calculateTimings();
        
        // Beat tracking
        this.lastBeatTime = 0;
        this.currentBeat = 0;
        this.currentMeasure = 0;
        
        // Visual metronome
        this.beatCallbacks = new Set();
        this.isMetronomeActive = false;
        this.metronomeInterval = null;
    }
    
    calculateTimings() {
        // Calculate milliseconds per beat (quarter note)
        this.msPerBeat = (60 / this.bpm) * 1000;
        this.msPerMeasure = this.msPerBeat * this.timeSignature.numerator;
        
        // Calculate quantization intervals
        this.quantizationIntervals = {
            '16th': this.msPerBeat / 4,    // 16th note = 96ms at 128 BPM
            '8th': this.msPerBeat / 2,     // 8th note = 187.5ms at 128 BPM
            'quarter': this.msPerBeat      // Quarter note = 468.75ms at 128 BPM
        };
    }
    
    // Enable/disable quantization
    setEnabled(enabled) {
        this.isEnabled = enabled;
    }
    
    // Set quantization resolution
    setQuantization(type) {
        if (this.quantizationIntervals[type]) {
            this.currentQuantization = type;
        }
    }
    
    // Quantize a timestamp to the nearest grid point
    quantizeTime(timestamp) {
        if (!this.isEnabled) return timestamp;
        
        const interval = this.quantizationIntervals[this.currentQuantization];
        return Math.round(timestamp / interval) * interval;
    }
    
    // Get the next quantized time from current timestamp
    getNextQuantizedTime(timestamp) {
        const interval = this.quantizationIntervals[this.currentQuantization];
        const quantized = Math.ceil(timestamp / interval) * interval;
        return quantized;
    }
    
    // Get musical position from timestamp
    getMusicalPosition(timestamp) {
        const measure = Math.floor(timestamp / this.msPerMeasure);
        const beatInMeasure = Math.floor((timestamp % this.msPerMeasure) / this.msPerBeat);
        const subdivision = Math.floor((timestamp % this.msPerBeat) / this.quantizationIntervals[this.currentQuantization]);
        
        return {
            measure: measure,
            beat: beatInMeasure,
            subdivision: subdivision,
            totalBeats: Math.floor(timestamp / this.msPerBeat)
        };
    }
    
    // Check if timestamp is on a beat
    isOnBeat(timestamp, tolerance = 50) {
        const beatTime = timestamp % this.msPerBeat;
        return beatTime < tolerance || beatTime > (this.msPerBeat - tolerance);
    }
    
    // Check if timestamp is on a measure boundary
    isOnMeasure(timestamp, tolerance = 50) {
        const measureTime = timestamp % this.msPerMeasure;
        return measureTime < tolerance || measureTime > (this.msPerMeasure - tolerance);
    }
    
    // Generate beat markers for visualization
    generateBeatMarkers(startTime, endTime) {
        const markers = [];
        const interval = this.quantizationIntervals[this.currentQuantization];
        
        let currentTime = this.quantizeTime(startTime);
        while (currentTime <= endTime) {
            const position = this.getMusicalPosition(currentTime);
            const isDownbeat = position.beat === 0 && position.subdivision === 0;
            const isBeat = position.subdivision === 0;
            
            markers.push({
                time: currentTime,
                position: position,
                isDownbeat: isDownbeat,
                isBeat: isBeat,
                type: this.getBeatType(position)
            });
            
            currentTime += interval;
        }
        
        return markers;
    }
    
    // Get beat type for styling
    getBeatType(position) {
        if (position.beat === 0 && position.subdivision === 0) {
            return 'downbeat'; // First beat of measure
        } else if (position.subdivision === 0) {
            return 'beat'; // On a quarter note beat
        } else {
            return 'subdivision'; // Subdivision of beat
        }
    }
    
    // Start visual metronome
    startMetronome(gameStartTime, onBeat = null) {
        if (this.isMetronomeActive) return;
        
        this.isMetronomeActive = true;
        this.gameStartTime = gameStartTime;
        
        // Add beat callback if provided
        if (onBeat) {
            this.beatCallbacks.add(onBeat);
        }
        
        // Start metronome loop
        this.metronomeInterval = setInterval(() => {
            this.updateMetronome();
        }, 10); // Update every 10ms for smooth timing
    }
    
    // Stop visual metronome
    stopMetronome() {
        if (!this.isMetronomeActive) return;
        
        this.isMetronomeActive = false;
        if (this.metronomeInterval) {
            clearInterval(this.metronomeInterval);
            this.metronomeInterval = null;
        }
        this.beatCallbacks.clear();
    }
    
    // Update metronome and trigger beat callbacks
    updateMetronome() {
        if (!this.isMetronomeActive || !this.gameStartTime) return;
        
        const currentTime = performance.now() - this.gameStartTime;
        const currentBeatTime = Math.floor(currentTime / this.msPerBeat) * this.msPerBeat;
        
        // Check if we've hit a new beat
        if (currentBeatTime > this.lastBeatTime) {
            this.lastBeatTime = currentBeatTime;
            const position = this.getMusicalPosition(currentTime);
            
            // Trigger beat callbacks
            this.beatCallbacks.forEach(callback => {
                callback(position, this.getBeatType(position));
            });
        }
    }
    
    // Add beat callback
    addBeatCallback(callback) {
        this.beatCallbacks.add(callback);
    }
    
    // Remove beat callback
    removeBeatCallback(callback) {
        this.beatCallbacks.delete(callback);
    }
    
    // Get current quantization info for UI
    getQuantizationInfo() {
        return {
            enabled: this.isEnabled,
            type: this.currentQuantization,
            interval: this.quantizationIntervals[this.currentQuantization],
            bpm: this.bpm,
            timeSignature: this.timeSignature
        };
    }
    
    // Snap recorded notes to grid and organize by measures
    quantizeRecordedChart(recordedNotes) {
        if (!this.isEnabled || recordedNotes.length === 0) {
            return recordedNotes;
        }
        
        // Quantize each note
        const quantizedNotes = recordedNotes.map(note => ({
            ...note,
            time: this.quantizeTime(note.time),
            originalTime: note.time // Keep original for reference
        }));
        
        // Remove duplicate notes at same quantized time and key
        const uniqueNotes = [];
        const seenNotes = new Set();
        
        quantizedNotes.forEach(note => {
            const noteKey = `${note.time}_${note.key}`;
            if (!seenNotes.has(noteKey)) {
                seenNotes.add(noteKey);
                uniqueNotes.push(note);
            }
        });
        
        // Sort by time
        uniqueNotes.sort((a, b) => a.time - b.time);
        
        return uniqueNotes;
    }
    
    // Get measure boundaries for a song
    getMeasureBoundaries(songDuration) {
        const boundaries = [];
        let currentTime = 0;
        
        while (currentTime < songDuration) {
            boundaries.push({
                time: currentTime,
                measure: Math.floor(currentTime / this.msPerMeasure),
                isDownbeat: true
            });
            currentTime += this.msPerMeasure;
        }
        
        return boundaries;
    }
    
    // Calculate ideal recording duration in complete measures
    getIdealRecordingDuration(requestedDuration) {
        const measuresNeeded = Math.ceil((requestedDuration * 1000) / this.msPerMeasure);
        return (measuresNeeded * this.msPerMeasure) / 1000; // Convert back to seconds
    }
    
    // Preview quantization - show where notes would snap to
    previewQuantization(notes) {
        return notes.map(note => {
            const quantizedTime = this.quantizeTime(note.time);
            const position = this.getMusicalPosition(quantizedTime);
            
            return {
                ...note,
                quantizedTime,
                originalTime: note.time,
                position,
                adjustment: quantizedTime - note.time
            };
        });
    }
}

// Create singleton instance
const quantizationSystem = new QuantizationSystem();
export default quantizationSystem;