import { DEFAULT_SONG_CHART } from './Constants.js';

class GameState {
    constructor() {
        // Game duration settings
        this.GAME_DURATION = 30;
        
        // Game state variables
        this.score = 0;
        this.timeLeft = this.GAME_DURATION;
        this.activeArrows = [];
        this.gameStartTime = 0;
        this.isGameRunning = false;
        this.isRecording = false;
        this.animationFrameId = null;
        this.gameTimerId = null;
        this.nextNoteIndex = 0;
        this.currentlyPressedKeys = new Set();
        
        // Recording state
        this.recordedNotes = [];
        this.currentRecordingName = '';
        this.currentBaseScore = 350;
        this.recordingTime = 0;
        
        // Song and dancer data
        this.songChart = { ...DEFAULT_SONG_CHART };
        this.customSongs = [];
        this.customDancers = [];
        
        // UI references
        this.scoreDisplay = null;
        this.timerDisplay = null;
        this.recordTimerDisplay = null;
        this.recordCountDisplay = null;
    }
    
    initializeUIReferences() {
        this.scoreDisplay = document.getElementById('score');
        this.timerDisplay = document.getElementById('timer');
        this.recordTimerDisplay = document.getElementById('record-timer');
        this.recordCountDisplay = document.getElementById('record-count');
    }
    
    setDuration(seconds) {
        this.GAME_DURATION = seconds;
        this.timeLeft = seconds;
        this.updateDurationUI();
        this.updateTimerDisplay();
    }
    
    get duration() {
        return this.GAME_DURATION;
    }
    
    updateDurationUI() {
        const duration30sBtn = document.getElementById('duration-30s');
        const duration120sBtn = document.getElementById('duration-120s');
        
        duration30sBtn.classList.toggle('border-yellow-400', this.GAME_DURATION === 30);
        duration30sBtn.classList.toggle('border-transparent', this.GAME_DURATION !== 30);
        duration120sBtn.classList.toggle('border-yellow-400', this.GAME_DURATION === 120);
        duration120sBtn.classList.toggle('border-transparent', this.GAME_DURATION !== 120);
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.GAME_DURATION / 60);
        const secs = this.GAME_DURATION % 60;
        const timeString = `${minutes}:${secs.toString().padStart(2, '0')}`;
        if (this.timerDisplay) this.timerDisplay.textContent = timeString;
        if (this.recordTimerDisplay) this.recordTimerDisplay.textContent = timeString;
    }
    
    startGame() {
        this.isRecording = false;
        this.isGameRunning = true;
        this.score = 0;
        this.timeLeft = this.GAME_DURATION;
        this.nextNoteIndex = 0;
        this.activeArrows.forEach(arrow => arrow.element.remove());
        this.activeArrows = [];
        this.currentlyPressedKeys.clear();
        this.currentBaseScore = this.songChart.score || 350;
        this.gameStartTime = performance.now();
    }
    
    startRecording(songName, baseScore) {
        this.currentRecordingName = songName;
        this.currentBaseScore = baseScore;
        this.isRecording = true;
        this.isGameRunning = true;
        this.recordedNotes = [];
        this.recordingTime = 0;
        this.gameStartTime = performance.now();
    }
    
    endGame() {
        this.isGameRunning = false;
        this.isRecording = false;
        this.currentlyPressedKeys.clear();
        
        if (this.gameTimerId) {
            clearInterval(this.gameTimerId);
            this.gameTimerId = null;
        }
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    
    updateTimer() {
        if (this.isRecording) {
            this.recordingTime++;
            // Check if recording duration limit is reached
            if (this.recordingTime >= this.GAME_DURATION) {
                return true; // Signal to end recording
            }
        } else {
            this.timeLeft--;
        }
        this.updateUI();
        return !this.isRecording && this.timeLeft <= 0;
    }
    
    updateUI() {
        let minutes, seconds, timeString;
        if (this.isRecording) {
            // Show remaining recording time instead of elapsed time
            const remainingTime = this.GAME_DURATION - this.recordingTime;
            minutes = Math.floor(remainingTime / 60);
            seconds = remainingTime % 60;
            timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            if (this.recordTimerDisplay) this.recordTimerDisplay.textContent = timeString;
            if (this.recordCountDisplay) this.recordCountDisplay.textContent = this.recordedNotes.length;
        } else {
            minutes = Math.floor(this.timeLeft / 60);
            seconds = this.timeLeft % 60;
            timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            if (this.scoreDisplay) this.scoreDisplay.textContent = this.score;
            if (this.timerDisplay) this.timerDisplay.textContent = timeString;
        }
    }
    
    addScore(points) {
        this.score += points;
        this.updateUI();
    }
    
    addRecordedNote(time, key, harmonicData = null) {
        const note = { time: Math.round(time), key };
        
        // Add harmonic analysis data if provided
        if (harmonicData) {
            note.harmonicAnalysis = harmonicData.harmonicAnalysis;
            note.suggestedNote = harmonicData.suggestedNote;
            note.actualNote = harmonicData.actualNote;
        }
        
        this.recordedNotes.push(note);
        this.updateUI();
    }
    
    setSongChart(chart) {
        this.songChart = chart;
        this.currentBaseScore = chart.score || 350;
    }
    
    addCustomSong(song) {
        // Validate song data
        if (!song || typeof song !== 'object') {
            console.error('addCustomSong: Invalid song data', song);
            throw new Error('Invalid song data provided');
        }
        
        if (!song.name || typeof song.name !== 'string') {
            console.error('addCustomSong: Song missing valid name', song);
            throw new Error('Song must have a valid name');
        }
        
        if (!song.chart || !Array.isArray(song.chart)) {
            console.error('addCustomSong: Song missing valid chart', song);
            throw new Error('Song must have a valid chart array');
        }
        
        if (typeof song.score !== 'number' || song.score <= 0) {
            console.warn('addCustomSong: Invalid song score, defaulting to 350', song.score);
            song.score = 350;
        }
        
        console.log(`Adding custom song: "${song.name}" with ${song.chart.length} notes (score: ${song.score})`);
        
        // Check for duplicate names and add suffix if needed
        const existingNames = this.customSongs.map(s => s.name);
        let finalName = song.name;
        let counter = 1;
        
        while (existingNames.includes(finalName)) {
            finalName = `${song.name} (${counter})`;
            counter++;
        }
        
        if (finalName !== song.name) {
            console.log(`Renamed song from "${song.name}" to "${finalName}" to avoid duplicate`);
            song.name = finalName;
        }
        
        this.customSongs.push(song);
        console.log(`Successfully added song. Total custom songs: ${this.customSongs.length}`);
    }
    
    addCustomDancer(dancer) {
        // Validate dancer data
        if (!dancer || typeof dancer !== 'object') {
            console.error('addCustomDancer: Invalid dancer data', dancer);
            throw new Error('Invalid dancer data provided');
        }
        
        if (!dancer.name || typeof dancer.name !== 'string') {
            console.error('addCustomDancer: Dancer missing valid name', dancer);
            throw new Error('Dancer must have a valid name');
        }
        
        if (!dancer.poses || !Array.isArray(dancer.poses)) {
            console.error('addCustomDancer: Dancer missing valid poses', dancer);
            throw new Error('Dancer must have a valid poses array');
        }
        
        console.log(`Adding custom dancer: "${dancer.name}" with ${dancer.poses.length} poses`);
        
        // Check for duplicate names and add suffix if needed
        const existingNames = this.customDancers.map(d => d.name);
        let finalName = dancer.name;
        let counter = 1;
        
        while (existingNames.includes(finalName)) {
            finalName = `${dancer.name} (${counter})`;
            counter++;
        }
        
        if (finalName !== dancer.name) {
            console.log(`Renamed dancer from "${dancer.name}" to "${finalName}" to avoid duplicate`);
            dancer.name = finalName;
        }
        
        this.customDancers.push(dancer);
        console.log(`Successfully added dancer. Total custom dancers: ${this.customDancers.length}`);
    }
    
    setCustomSongs(songs) {
        if (!Array.isArray(songs)) {
            console.error('setCustomSongs: Invalid songs array', songs);
            this.customSongs = [];
            return;
        }
        
        console.log(`Loading ${songs.length} custom songs from storage`);
        
        // Validate each song
        const validSongs = [];
        songs.forEach((song, index) => {
            try {
                if (song && typeof song === 'object' && 
                    song.name && typeof song.name === 'string' &&
                    song.chart && Array.isArray(song.chart) &&
                    typeof song.score === 'number') {
                    validSongs.push(song);
                } else {
                    console.warn(`Skipping invalid song at index ${index}:`, song);
                }
            } catch (error) {
                console.warn(`Error validating song at index ${index}:`, error);
            }
        });
        
        this.customSongs = validSongs;
        console.log(`Successfully loaded ${validSongs.length} valid custom songs`);
        
        if (validSongs.length !== songs.length) {
            console.warn(`Filtered out ${songs.length - validSongs.length} invalid songs`);
        }
    }
    
    setCustomDancers(dancers) {
        if (!Array.isArray(dancers)) {
            console.error('setCustomDancers: Invalid dancers array', dancers);
            this.customDancers = [];
            return;
        }
        
        console.log(`Loading ${dancers.length} custom dancers from storage`);
        
        // Validate each dancer
        const validDancers = [];
        dancers.forEach((dancer, index) => {
            try {
                if (dancer && typeof dancer === 'object' && 
                    dancer.name && typeof dancer.name === 'string' &&
                    dancer.poses && Array.isArray(dancer.poses)) {
                    validDancers.push(dancer);
                } else {
                    console.warn(`Skipping invalid dancer at index ${index}:`, dancer);
                }
            } catch (error) {
                console.warn(`Error validating dancer at index ${index}:`, error);
            }
        });
        
        this.customDancers = validDancers;
        console.log(`Successfully loaded ${validDancers.length} valid custom dancers`);
        
        if (validDancers.length !== dancers.length) {
            console.warn(`Filtered out ${dancers.length - validDancers.length} invalid dancers`);
        }
    }
    
    getRecordedSong() {
        if (!this.currentRecordingName) {
            console.error('getRecordedSong: No recording name set');
            throw new Error('Recording name is required');
        }
        
        if (this.recordedNotes.length === 0) {
            console.warn('getRecordedSong: No notes recorded');
        }
        
        const lastNoteTime = this.recordedNotes.length > 0 ? 
            this.recordedNotes[this.recordedNotes.length - 1].time : 0;
        const chart = [...this.recordedNotes];
        chart.push({ time: lastNoteTime + 2000, key: 'END' });
        
        const song = {
            name: this.currentRecordingName,
            score: this.currentBaseScore,
            chart: chart,
            recordedAt: Date.now(),
            duration: this.recordingTime
        };
        
        console.log(`Generated recorded song: "${song.name}" with ${this.recordedNotes.length} notes`);
        
        return song;
    }
}

// Create singleton instance
const gameState = new GameState();
export default gameState;