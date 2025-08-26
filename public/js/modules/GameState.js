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
        } else {
            this.timeLeft--;
        }
        this.updateUI();
        return !this.isRecording && this.timeLeft <= 0;
    }
    
    updateUI() {
        let minutes, seconds, timeString;
        if (this.isRecording) {
            minutes = Math.floor(this.recordingTime / 60);
            seconds = this.recordingTime % 60;
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
    
    addRecordedNote(time, key) {
        this.recordedNotes.push({ time: Math.round(time), key });
        this.updateUI();
    }
    
    setSongChart(chart) {
        this.songChart = chart;
        this.currentBaseScore = chart.score || 350;
    }
    
    addCustomSong(song) {
        this.customSongs.push(song);
    }
    
    addCustomDancer(dancer) {
        this.customDancers.push(dancer);
    }
    
    setCustomSongs(songs) {
        this.customSongs = songs;
    }
    
    setCustomDancers(dancers) {
        this.customDancers = dancers;
    }
    
    getRecordedSong() {
        const lastNoteTime = this.recordedNotes.length > 0 ? 
            this.recordedNotes[this.recordedNotes.length - 1].time : 0;
        const chart = [...this.recordedNotes];
        chart.push({ time: lastNoteTime + 2000, key: 'END' });
        
        return {
            name: this.currentRecordingName,
            score: this.currentBaseScore,
            chart: chart
        };
    }
}

// Create singleton instance
const gameState = new GameState();
export default gameState;