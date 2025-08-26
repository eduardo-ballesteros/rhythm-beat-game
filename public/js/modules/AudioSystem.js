import { HIT_SOUNDS, MISS_SOUND, MELODY_NOTES, BACKGROUND_COLORS } from './Constants.js';

class AudioSystem {
    constructor() {
        this.synth = null;
        this.melody = null;
        this.colorChangeLoop = null;
        this.playArea = null;
    }
    
    initialize() {
        this.synth = new Tone.Synth().toDestination();
        this.melody = new Tone.Sequence(
            (time, note) => {
                this.synth.triggerAttackRelease(note, '8n', time);
            },
            MELODY_NOTES,
            '4n'
        );
        this.melody.loop = true;
        this.playArea = document.getElementById('play-area');
    }
    
    async startAudio() {
        await Tone.start();
        Tone.Transport.start();
        this.melody.start(0);
        this.startColorChangeLoop();
    }
    
    stopAudio() {
        this.melody.stop();
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
    
    playHitSound(key) {
        const note = HIT_SOUNDS[key];
        if (note) {
            this.synth.triggerAttackRelease(note, '8n');
        }
    }
    
    playMissSound() {
        this.synth.triggerAttackRelease(MISS_SOUND, '8n');
    }
    
    dispose() {
        if (this.colorChangeLoop) {
            this.colorChangeLoop.dispose();
            this.colorChangeLoop = null;
        }
        if (this.melody) {
            this.melody.dispose();
        }
        if (this.synth) {
            this.synth.dispose();
        }
    }
}

// Create singleton instance
const audioSystem = new AudioSystem();
export default audioSystem;