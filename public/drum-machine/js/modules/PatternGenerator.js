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
     * Check if drum pattern generation is in progress
     */
    isGeneratingDrumPattern() {
        return this.isGenerating;
    }

    /**
     * Generate melody and chord progression based on user input
     * @param {string} userInput - Description of desired musical style
     * @param {string} key - Musical key (default: C)
     * @returns {Promise<Object|null>} Generated musical content or null if failed
     */
    async generateMelodyAndChords(userInput, key = 'C') {
        if (this.isGeneratingMelody) {
            return null;
        }
        
        this.isGeneratingMelody = true;
        
        try {
            if (API_CONFIG.USE_MOCK_RESPONSES) {
                // Mock response with delay to simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                return this.getMockMelodyAndChords(userInput, key);
            } else {
                // TODO: Replace with actual API call
                return await this.callMelodyAPI(userInput, key);
            }
        } catch (error) {
            console.error('Error generating melody and chords:', error);
            return null;
        } finally {
            this.isGeneratingMelody = false;
        }
    }

    /**
     * Mock melody and chord generator for development
     * @param {string} userInput - User description
     * @param {string} key - Musical key
     * @returns {Object} Mock musical content
     */
    getMockMelodyAndChords(userInput, key) {
        const input = userInput.toLowerCase();
        
        // Style-based generation
        let style = 'rock';
        if (input.includes('jazz')) style = 'jazz';
        else if (input.includes('blues')) style = 'blues';
        else if (input.includes('folk') || input.includes('country')) style = 'folk';
        else if (input.includes('classical') || input.includes('bach') || input.includes('mozart')) style = 'classical';
        else if (input.includes('electronic') || input.includes('techno') || input.includes('house')) style = 'electronic';
        else if (input.includes('latin') || input.includes('salsa')) style = 'folk';

        // Chord progressions based on style
        const chordProgressions = {
            rock: ['I', 'vi', 'IV', 'V'],
            jazz: ['ii7', 'V7', 'IMaj7'],
            blues: ['I7', 'IV7', 'I7', 'V7'],
            folk: ['I', 'IV', 'I', 'V'],
            classical: ['I', 'V', 'vi', 'iii', 'IV', 'I', 'IV', 'V'],
            electronic: ['vi', 'IV', 'I', 'V'],
        };

        // Melody patterns based on style
        const melodyPatterns = {
            rock: [0, 0, 4, 4, 7, 7, 4, 4, 0, 0, 4, 4, 2, 2, 0, 0],
            jazz: [0, 2, 4, 7, 9, 7, 4, 2, 0, -2, 0, 2, 4, 2, 0, 0],
            blues: [0, 3, 0, 3, 5, 3, 0, 3, 0, 3, 5, 6, 5, 3, 0, 0],
            folk: [0, 2, 4, 0, 7, 4, 2, 0, 0, 2, 4, 7, 4, 2, 0, 0],
            classical: [0, 2, 4, 2, 0, 2, 4, 2, 0, 2, 4, 7, 4, 2, 0, -1],
            electronic: [0, 3, 7, 10, 12, 10, 7, 3, 0, 3, 7, 10, 7, 3, 0, 0],
        };

        return {
            style: style,
            key: key,
            chords: chordProgressions[style] || chordProgressions.rock,
            melody: melodyPatterns[style] || melodyPatterns.rock,
            description: `${style} progression in ${key}`
        };
    }

    /**
     * Call actual melody API (placeholder for real implementation)
     * @param {string} userInput - User description
     * @param {string} key - Musical key
     * @returns {Promise<Object>} API response
     */
    async callMelodyAPI(userInput, key) {
        // TODO: Implement actual API call for melody generation
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
                        content: `Create a melody and chord progression for: "${userInput}" in the key of ${key}. 

Return ONLY a valid JSON object with this exact structure:
{
  "style": "rock",
  "key": "${key}",
  "chords": ["I", "vi", "IV", "V"],
  "melody": [0, 2, 4, 0, 7, 4, 2, 0, 0, 2, 4, 7, 4, 2, 0, 0],
  "description": "Rock progression in ${key}"
}

- chords: Array of chord symbols (I, ii, iii, IV, V, vi, vii°, IMaj7, ii7, V7, etc.)
- melody: Array of 16 scale degrees (0=root, 1=second, 2=third, etc., negatives for below root)
- Create musically coherent progressions and melodies that match the described style
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
     * Check if melody generation is in progress
     */
    isGeneratingMelodyPattern() {
        return this.isGeneratingMelody;
    }

    /**
     * Check if drum pattern generation is in progress
     */
    isGeneratingDrumPattern() {
        return this.isGenerating;
    }

    /**
     * Check if any generation is in progress
     */
    isBusy() {
        return this.isGenerating || this.isGeneratingMelody;
    }
}