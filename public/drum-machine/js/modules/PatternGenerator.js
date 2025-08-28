/**
 * PatternGenerator.js
 * AI pattern generation (drum + melody) with mock responses
 */

import { API_CONFIG, DRUM_MACHINE_CONFIG } from './DrumConstants.js';

export class PatternGenerator {
    constructor() {
        this.isGenerating = false;
        this.isGeneratingMelody = false;
    }

    /**
     * Generate drum pattern based on user input
     * @param {string} userInput - Description of desired beat
     * @returns {Promise<Object|null>} Generated pattern or null if failed
     */
    async generateDrumPattern(userInput) {
        if (this.isGenerating) {
            return null;
        }
        
        this.isGenerating = true;
        
        try {
            if (API_CONFIG.USE_MOCK_RESPONSES) {
                // Mock response with delay to simulate API call
                await new Promise(resolve => setTimeout(resolve, 1500));
                return this.getMockDrumPattern(userInput);
            } else {
                // TODO: Replace with actual API call
                return await this.callDrumPatternAPI(userInput);
            }
        } catch (error) {
            console.error('Error generating drum pattern:', error);
            return null;
        } finally {
            this.isGenerating = false;
        }
    }

    /**
     * Generate melody based on user input
     * @param {string} userInput - Description of desired melody/style
     * @returns {Promise<Object|null>} Generated melody data or null if failed
     */
    async generateMelody(userInput = '') {
        if (this.isGeneratingMelody) {
            return null;
        }
        
        this.isGeneratingMelody = true;
        
        try {
            if (API_CONFIG.USE_MOCK_RESPONSES) {
                // Mock response with delay to simulate API call
                await new Promise(resolve => setTimeout(resolve, 2000));
                return this.getMockMelodyData(userInput);
            } else {
                // TODO: Replace with actual API call
                return await this.callMelodyAPI(userInput);
            }
        } catch (error) {
            console.error('Error generating melody:', error);
            return null;
        } finally {
            this.isGeneratingMelody = false;
        }
    }

    /**
     * Generate both drum pattern and melody
     * @param {string} userInput - Description of desired beat and melody
     * @returns {Promise<Object>} Object with pattern and melody data
     */
    async generateBoth(userInput) {
        try {
            const [drumPattern, melodyData] = await Promise.all([
                this.generateDrumPattern(userInput),
                this.generateMelody(userInput)
            ]);

            return {
                pattern: drumPattern,
                melody: melodyData
            };
        } catch (error) {
            console.error('Error generating pattern and melody:', error);
            return {
                pattern: null,
                melody: null
            };
        }
    }

    /**
     * Mock drum pattern generator for development
     * @param {string} userInput - User description
     * @returns {Object} Mock drum pattern
     */
    getMockDrumPattern(userInput) {
        const input = userInput.toLowerCase();
        
        // Different patterns based on keywords
        if (input.includes('house') || input.includes('four on the floor')) {
            return {
                kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                hihat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
                openhat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                crash: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            };
        } else if (input.includes('funk') || input.includes('breakbeat')) {
            return {
                kick: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0],
                snare: [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
                hihat: [1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1],
                openhat: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                crash: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]
            };
        } else if (input.includes('rock') || input.includes('punk')) {
            return {
                kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
                snare: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
                hihat: [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
                openhat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
                crash: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
                clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            };
        } else if (input.includes('latin') || input.includes('salsa')) {
            return {
                kick: [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0],
                snare: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
                hihat: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
                openhat: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                crash: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                clap: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1]
            };
        } else {
            // Default pattern with some randomization
            return {
                kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
                openhat: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
                crash: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            };
        }
    }

    /**
     * Mock melody data generator for development
     * @param {string} userInput - User description
     * @returns {Object} Mock melody data
     */
    getMockMelodyData(userInput) {
        const input = userInput.toLowerCase();
        
        // Different melodies based on keywords
        if (input.includes('house') || input.includes('electronic')) {
            return {
                melody: ["C4", "E4", "G4", "C5", "G4", "E4", "C4", "E4", 
                        "F4", "A4", "C5", "F5", "C5", "A4", "F4", "A4",
                        "G4", "B4", "D5", "G5", "D5", "B4", "G4", "B4",
                        "C5", "E5", "G5", "C6", "G5", "E5", "C5", "E5"],
                chords: [["C4", "E4", "G4"], ["F4", "A4", "C5"], ["G4", "B4", "D5"], ["C4", "E4", "G4"]],
                melodyTiming: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5,
                              8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5],
                chordTiming: [0, 4, 8, 12]
            };
        } else if (input.includes('funk') || input.includes('jazz')) {
            return {
                melody: ["F4", "G4", "A4", "Bb4", "C5", "D5", "Eb5", "F5",
                        "Eb5", "D5", "C5", "Bb4", "A4", "G4", "F4", "G4",
                        "A4", "C5", "F5", "E5", "D5", "C5", "Bb4", "A4",
                        "G4", "F4", "E4", "F4", "G4", "A4", "Bb4", "C5"],
                chords: [["F4", "A4", "C5"], ["Bb4", "D5", "F5"], ["C5", "E5", "G5"], ["F4", "A4", "C5"]],
                melodyTiming: [0, 0.33, 0.67, 1, 1.5, 2, 2.33, 2.67, 3, 3.5, 4, 4.33, 4.67, 5, 5.5, 6,
                              6.33, 6.67, 7, 7.5, 8, 8.33, 8.67, 9, 9.5, 10, 10.33, 10.67, 11, 11.5, 12, 12.5],
                chordTiming: [0, 4, 8, 12]
            };
        } else if (input.includes('rock') || input.includes('blues')) {
            return {
                melody: ["E4", "G4", "B4", "D5", "B4", "G4", "E4", "G4",
                        "A4", "C5", "E5", "G5", "E5", "C5", "A4", "C5",
                        "B4", "D5", "F#5", "B5", "F#5", "D5", "B4", "D5",
                        "E5", "G5", "B5", "E6", "B5", "G5", "E5", "G5"],
                chords: [["E4", "G#4", "B4"], ["A4", "C#5", "E5"], ["B4", "D#5", "F#5"], ["E4", "G#4", "B4"]],
                melodyTiming: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5,
                              8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5],
                chordTiming: [0, 4, 8, 12]
            };
        } else {
            // Default melodic pattern
            return {
                melody: ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", 
                        "B4", "A4", "G4", "F4", "E4", "D4", "C4", "D4",
                        "E4", "G4", "C5", "B4", "A4", "G4", "F4", "E4",
                        "D4", "C4", "E4", "F4", "G4", "A4", "B4", "C5"],
                chords: [["C4", "E4", "G4"], ["F4", "A4", "C5"], ["G4", "B4", "D5"], ["C4", "E4", "G4"]],
                melodyTiming: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5,
                              8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5],
                chordTiming: [0, 4, 8, 12]
            };
        }
    }

    /**
     * Call actual drum pattern API (placeholder for real implementation)
     * @param {string} userInput - User description
     * @returns {Promise<Object>} API response
     */
    async callDrumPatternAPI(userInput) {
        // TODO: Implement actual API call
        const response = await fetch(API_CONFIG.ANTHROPIC_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // TODO: Add API key header
            },
            body: JSON.stringify({
                model: API_CONFIG.MODEL,
                max_tokens: API_CONFIG.MAX_TOKENS,
                messages: [
                    {
                        role: "user",
                        content: `Create a drum pattern for: "${userInput}". 

Return ONLY a valid JSON object with this exact structure:
{
  "kick": [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
  "snare": [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
  "hihat": [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
  "openhat": [0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0],
  "crash": [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "clap": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
}

Each array has exactly 16 steps. Use 1 for hit, 0 for rest. Create a pattern that matches the style described. DO NOT include any text outside the JSON.`
                    }
                ]
            })
        });

        const data = await response.json();
        const responseText = data.content[0].text.trim();
        const cleanedResponse = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        
        return JSON.parse(cleanedResponse);
    }

    /**
     * Call actual melody API (placeholder for real implementation)
     * @param {string} userInput - User description
     * @returns {Promise<Object>} API response
     */
    async callMelodyAPI(userInput) {
        // TODO: Implement actual API call
        const response = await fetch(API_CONFIG.ANTHROPIC_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // TODO: Add API key header
            },
            body: JSON.stringify({
                model: API_CONFIG.MODEL,
                max_tokens: 1500,
                messages: [
                    {
                        role: "user",
                        content: `Generate a catchy, memorable melody with rich chord progressions that matches the style: "${userInput}". Create something that sounds full and musical with both interesting melodies and harmonic backing.

Return ONLY a valid JSON object with this structure:
{
  "melody": ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", ...],
  "chords": [["C4", "E4", "G4"], ["D4", "F#4", "A4"], ["E4", "G#4", "B4"], ...],
  "melodyTiming": [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, ...],
  "chordTiming": [0, 4, 8, 12, 16, 20, 24, 28, ...]
}

Requirements:
- melody: array of 80-120 notes spanning 64 beats with interesting intervals and melodic variety
- chords: array of 16-32 rich chord progressions as note arrays like ["C4", "E4", "G4", "C5"]
- melodyTiming: when each melody note plays (0 to 64 beats, fractional allowed)
- chordTiming: when each chord plays (0 to 64 beats)
- Create melodies that use interesting intervals - not just stepwise motion  
- Make chord voicings full and rich with 3-4 notes spanning different octaves
- Match the musical style and energy of "${userInput}"
- Include both high and low notes for dynamic range
- Create memorable melodic hooks that repeat with variation

DO NOT include any text outside the JSON.`
                    }
                ]
            })
        });

        const data = await response.json();
        const responseText = data.content[0].text.trim();
        const cleanedResponse = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        
        return JSON.parse(cleanedResponse);
    }

    /**
     * Check if drum pattern generation is in progress
     */
    isGeneratingDrumPattern() {
        return this.isGenerating;
    }

    /**
     * Check if melody generation is in progress
     */
    isGeneratingMelodyData() {
        return this.isGeneratingMelody;
    }

    /**
     * Check if any generation is in progress
     */
    isBusy() {
        return this.isGenerating || this.isGeneratingMelody;
    }
}