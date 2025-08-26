// Game configuration constants
export const ARROW_SPEED = 200;
export const HIT_TOLERANCE = 75;

export const BACKGROUND_COLORS = ['#ff00ff', '#00ffff', '#ffff00', '#ff007f', '#7f00ff', '#00ff7f'];

export const HIT_SOUNDS = {
    'ArrowLeft': 'C4',
    'ArrowDown': 'D4', 
    'ArrowUp': 'E4',
    'ArrowRight': 'F4'
};

export const MISS_SOUND = 'C#2';

export const MELODY_NOTES = ['G3', 'A3', 'B3', 'G3', 'A3', 'C4', 'D4', 'B3'];

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