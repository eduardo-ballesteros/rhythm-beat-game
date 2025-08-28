import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Play, Pause, RotateCcw, Music } from 'lucide-react';

const DrumMachine = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [masterVolume, setMasterVolume] = useState(-10);
  const [isGeneratingMelody, setIsGeneratingMelody] = useState(false);
  const [generatedMelody, setGeneratedMelody] = useState({
    melody: ["C4", "E4", "G4", "C5", "G4", "E4", "F4", "A4", "C5", "F4", "G4", "B4", "D5", "G4", "E4", "C4"],
    chords: [["C4", "E4", "G4"], ["F4", "A4", "C5"], ["G4", "B4", "D5"], ["C4", "E4", "G4"]],
    melodyTiming: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5],
    chordTiming: [0, 2, 4, 6]
  });
  const [melodyEnabled, setMelodyEnabled] = useState(true);
  const [melodyVolume, setMelodyVolume] = useState(-15);
  const [currentChord, setCurrentChord] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [pattern, setPattern] = useState({
    kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    openhat: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    crash: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  });

  const samplers = useRef({});
  const masterGain = useRef(null);
  const melodyGain = useRef(null);
  const melodySynth = useRef(null);
  const chordSynth = useRef(null);
  const sequenceRef = useRef(null);

  // Initialize audio
  useEffect(() => {
    const initAudio = async () => {
      // Don't start audio context automatically - wait for user interaction
      
      // Create master gain for volume control
      masterGain.current = new Tone.Gain(0.5).toDestination();
      
      // Create melody gain for separate melody volume control
      melodyGain.current = new Tone.Gain(0.3).toDestination();
      
      // Create melody synthesizers
      melodySynth.current = new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: { attack: 0.05, decay: 0.3, sustain: 0.4, release: 0.8 }
      }).connect(melodyGain.current);
      
      chordSynth.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.3, decay: 0.4, sustain: 0.6, release: 1.2 },
        filter: { frequency: 1200, type: "lowpass", rolloff: -24 }
      }).connect(melodyGain.current);
      
      chordSynth.current.volume.value = -8;
      
      // Create drum samplers with synthesized sounds
      samplers.current = {
        kick: new Tone.MembraneSynth({
          pitchDecay: 0.05,
          octaves: 10,
          oscillator: { type: "sine" },
          envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4, attackCurve: "exponential" }
        }).toDestination(),
        
        snare: new Tone.NoiseSynth({
          noise: { type: "white" },
          envelope: { attack: 0.005, decay: 0.1, sustain: 0.0, release: 0.4 }
        }).toDestination(),
        
        hihat: new Tone.MetalSynth({
          frequency: 200,
          envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
          harmonicity: 5.1,
          modulationIndex: 32,
          resonance: 4000,
          octaves: 1.5
        }).toDestination(),
        
        openhat: new Tone.MetalSynth({
          frequency: 200,
          envelope: { attack: 0.001, decay: 0.3, release: 0.3 },
          harmonicity: 5.1,
          modulationIndex: 32,
          resonance: 4000,
          octaves: 1.5
        }).toDestination(),
        
        crash: new Tone.MetalSynth({
          frequency: 300,
          envelope: { attack: 0.001, decay: 1, release: 2 },
          harmonicity: 5.1,
          modulationIndex: 64,
          resonance: 4000,
          octaves: 1.5
        }).toDestination(),
        
        clap: new Tone.NoiseSynth({
          noise: { type: "white" },
          envelope: { attack: 0.005, decay: 0.05, sustain: 0.0, release: 0.1 }
        }).toDestination()
      };

      // Set volumes - boosting them significantly
      samplers.current.kick.volume.value = 0;  // was -10
      samplers.current.snare.volume.value = -5;  // was -15
      samplers.current.hihat.volume.value = -8;  // was -20
      samplers.current.openhat.volume.value = -6;  // was -18
      samplers.current.crash.volume.value = -6;  // was -18
      samplers.current.clap.volume.value = -3;  // was -15
    };

    initAudio();

    return () => {
      Object.values(samplers.current).forEach(sampler => sampler.dispose());
      if (masterGain.current) {
        masterGain.current.dispose();
      }
      if (melodyGain.current) {
        melodyGain.current.dispose();
      }
      if (melodySynth.current) {
        melodySynth.current.dispose();
      }
      if (chordSynth.current) {
        chordSynth.current.dispose();
      }
      if (sequenceRef.current) {
        sequenceRef.current.dispose();
      }
    };
  }, []);

  // Update master volume
  useEffect(() => {
    if (masterGain.current) {
      masterGain.current.gain.value = Tone.dbToGain(masterVolume);
    }
  }, [masterVolume]);
  useEffect(() => {
    Tone.Transport.bpm.value = bpm;
  }, [bpm]);

  // Helper function to convert chord names to note arrays
  const convertChordToNotes = (chordName) => {
    const chordMap = {
      'C': ['C4', 'E4', 'G4'], 'Dm': ['D4', 'F4', 'A4'], 'Em': ['E4', 'G4', 'B4'], 'F': ['F4', 'A4', 'C5'],
      'G': ['G4', 'B4', 'D5'], 'Am': ['A4', 'C5', 'E5'], 'Bdim': ['B4', 'D5', 'F5'],
      'C7': ['C4', 'E4', 'G4', 'Bb4'], 'F7': ['F4', 'A4', 'C5', 'Eb5'], 'G7': ['G4', 'B4', 'D5', 'F5'],
      'Am7': ['A4', 'C5', 'E5', 'G5'], 'Dm7': ['D4', 'F4', 'A4', 'C5'], 'Em7': ['E4', 'G4', 'B4', 'D5'],
    };
    return chordMap[chordName] || null;
  };

  // Generate AI melody
  const generateMelody = async () => {
    if (isGeneratingMelody) return;
    
    setIsGeneratingMelody(true);
    
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages: [
            {
              role: "user",
              content: `Generate a catchy, memorable melody with rich chords that loops over 64 beats (16 bars of 4/4 time). Create something that sounds full and musical - not flat or boring.

Return ONLY a valid JSON object with this structure:
{
  "melody": ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", ...],
  "chords": [["C4", "E4", "G4"], ["D4", "F#4", "A4"], ["E4", "G#4", "B4"], ...],
  "melodyTiming": [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, ...],
  "chordTiming": [0, 4, 8, 12, 16, 20, 24, 28, ...]
}

Requirements:
- melody: array of 80-120 notes spanning 64 beats with melodic variety and interesting intervals
- chords: array of 16-32 chord progressions as note arrays like ["C4", "E4", "G4"] 
- melodyTiming: when each melody note plays (0 to 64 beats, fractional allowed)
- chordTiming: when each chord plays (0 to 64 beats)
- Use interesting melodic intervals - not just stepwise motion
- Create rich, full chord voicings with 3-4 notes each
- Include both high and low melody notes for dynamic range
- Make chord progressions that create musical momentum and interest
- Think like you're composing an actual catchy song hook

DO NOT include any text outside the JSON.`
            }
          ]
        })
      });

      const data = await response.json();
      const responseText = data.content[0].text.trim();
      
      const cleanedResponse = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      try {
        const melodyData = JSON.parse(cleanedResponse);
        
        // Validate structure
        if (melodyData.melody && melodyData.chords && melodyData.melodyTiming && melodyData.chordTiming) {
          setGeneratedMelody(melodyData);
          setMelodyEnabled(true);
          
          // If currently playing, restart sequence with new melody
          if (isPlaying) {
            // Stop everything completely
            Tone.Transport.stop();
            Tone.Transport.cancel();
            if (sequenceRef.current) {
              sequenceRef.current.dispose();
              sequenceRef.current = null;
            }
            // Stop any lingering sounds
            if (melodySynth.current) {
              melodySynth.current.releaseAll();
            }
            if (chordSynth.current) {
              chordSynth.current.releaseAll();
            }
            // Restart with new melody after a brief delay
            setTimeout(() => {
              togglePlayback();
            }, 200);
          }
        } else {
          console.error('Invalid melody structure received');
        }
      } catch (parseError) {
        console.error('Failed to parse melody response as JSON:', parseError);
      }
      
    } catch (error) {
      console.error('Error generating melody:', error);
    } finally {
      setIsGeneratingMelody(false);
    }
  };

  // Toggle melody (generate if not exists)
  const toggleMelody = async () => {
    if (!melodyEnabled && !generatedMelody) {
      await generateMelody();
    } else {
      setMelodyEnabled(!melodyEnabled);
    }
  };
  const testSound = async () => {
    try {
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }
      
      // Test kick drum
      samplers.current.kick.triggerAttackRelease("C1", "8n");
      
      // Test snare after a short delay
      setTimeout(() => {
        samplers.current.snare.triggerAttackRelease("8n");
      }, 200);
      
      console.log("Audio context state:", Tone.context.state);
      console.log("Test sound triggered");
    } catch (error) {
      console.error("Error testing sound:", error);
    }
  };
  const togglePlayback = async () => {
    if (isPlaying) {
      // Stop everything completely
      Tone.Transport.stop();
      Tone.Transport.cancel(); // Cancel all scheduled events
      
      if (sequenceRef.current) {
        sequenceRef.current.dispose();
        sequenceRef.current = null;
      }
      
      // Stop any lingering sounds
      if (melodySynth.current) {
        melodySynth.current.releaseAll();
      }
      if (chordSynth.current) {
        chordSynth.current.releaseAll();
      }
      Object.values(samplers.current).forEach(sampler => {
        if (sampler.releaseAll) {
          sampler.releaseAll();
        }
      });
      
      setIsPlaying(false);
      setCurrentStep(0);
      return; // Exit early to prevent creating new sequence
    } 
    
    // Starting playback
    try {
      // Ensure audio context is started
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }
      
      const sequence = new Tone.Sequence((time, step) => {
        setCurrentStep(step);
        
        // Play active drums for this step
        Object.keys(pattern).forEach(drum => {
          if (pattern[drum][step] === 1) {
            if (drum === 'kick') {
              samplers.current.kick.triggerAttackRelease("C1", "8n", time);
            } else if (drum === 'snare') {
              samplers.current.snare.triggerAttackRelease("8n", time);
            } else if (drum === 'hihat') {
              samplers.current.hihat.triggerAttackRelease("G5", "32n", time);
            } else if (drum === 'openhat') {
              samplers.current.openhat.triggerAttackRelease("G5", "8n", time);
            } else if (drum === 'crash') {
              samplers.current.crash.triggerAttackRelease("C6", "2n", time);
            } else if (drum === 'clap') {
              samplers.current.clap.triggerAttackRelease("16n", time);
            }
          }
        });

        // Play melody and chords if enabled and generated
        if (melodyEnabled && generatedMelody && melodySynth.current && chordSynth.current) {
          const currentBeat = (step * 0.25); // Convert step to beat (16 steps = 4 beats)
          
          // Play melody notes
          generatedMelody.melodyTiming.forEach((timing, index) => {
            if (Math.abs(timing - currentBeat) < 0.125 && generatedMelody.melody[index]) {
              melodySynth.current.triggerAttackRelease(generatedMelody.melody[index], "8n", time);
            }
          });
          
          // Play chords
          generatedMelody.chordTiming.forEach((timing, index) => {
            if (Math.abs(timing - currentBeat) < 0.125 && generatedMelody.chords[index]) {
              // Handle both array format and string format for chords
              const chord = generatedMelody.chords[index];
              if (Array.isArray(chord)) {
                chordSynth.current.triggerAttackRelease(chord, "2n", time);
              } else if (typeof chord === 'string') {
                // Convert chord names to notes if needed
                const chordNotes = convertChordToNotes(chord);
                if (chordNotes) {
                  chordSynth.current.triggerAttackRelease(chordNotes, "2n", time);
                }
              }
            }
          });
        }
      }, Array.from({length: 16}, (_, i) => i), "16n");

      sequenceRef.current = sequence;
      sequence.start(0);
      Tone.Transport.start();
      setIsPlaying(true);
    } catch (error) {
      console.error("Error starting playback:", error);
      setIsPlaying(false);
    }
  };

  // Generate pattern from user input
  const generatePattern = async () => {
    if (!userInput.trim()) return;
    
    setIsGenerating(true);
    
    try {
      // Generate both drum pattern and melody
      const drumResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
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

      const melodyResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
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

      // Process drum pattern
      const drumData = await drumResponse.json();
      const drumText = drumData.content[0].text.trim();
      const cleanedDrumResponse = drumText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      // Process melody
      const melodyResponseData = await melodyResponse.json();
      const melodyText = melodyResponseData.content[0].text.trim();
      const cleanedMelodyResponse = melodyText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      try {
        // Apply drum pattern
        const newPattern = JSON.parse(cleanedDrumResponse);
        const requiredKeys = ['kick', 'snare', 'hihat', 'openhat', 'crash', 'clap'];
        const isValidPattern = requiredKeys.every(key => 
          newPattern[key] && 
          Array.isArray(newPattern[key]) && 
          newPattern[key].length === 16 &&
          newPattern[key].every(val => val === 0 || val === 1)
        );
        
        // Apply melody
        const melodyData = JSON.parse(cleanedMelodyResponse);
        const isValidMelody = melodyData.melody && melodyData.chords && melodyData.melodyTiming && melodyData.chordTiming;
        
        if (isValidPattern) {
          setPattern(newPattern);
        }
        
        if (isValidMelody) {
          setGeneratedMelody(melodyData);
          setMelodyEnabled(true);
        }
        
        // If currently playing, restart sequence with new pattern/melody
        if (isPlaying && (isValidPattern || isValidMelody)) {
          // Stop everything completely  
          Tone.Transport.stop();
          Tone.Transport.cancel();
          if (sequenceRef.current) {
            sequenceRef.current.dispose();
            sequenceRef.current = null;
          }
          // Stop any lingering sounds
          if (melodySynth.current) {
            melodySynth.current.releaseAll();
          }
          if (chordSynth.current) {
            chordSynth.current.releaseAll();
          }
          // Restart with new content after a brief delay
          setTimeout(() => {
            togglePlayback();
          }, 200);
        }
        
      } catch (parseError) {
        console.error('Failed to parse Claude response as JSON:', parseError);
      }
      
    } catch (error) {
      console.error('Error generating pattern and melody:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle step in pattern
  const toggleStep = (drum, step) => {
    setPattern(prev => ({
      ...prev,
      [drum]: prev[drum].map((val, idx) => idx === step ? (val === 1 ? 0 : 1) : val)
    }));
  };

  // Clear pattern and stop playback
  const resetAll = () => {
    // Stop playback completely
    if (isPlaying) {
      Tone.Transport.stop();
      Tone.Transport.cancel(); // Cancel all scheduled events
      if (sequenceRef.current) {
        sequenceRef.current.dispose();
        sequenceRef.current = null;
      }
      
      // Stop any lingering sounds
      if (melodySynth.current) {
        melodySynth.current.releaseAll();
      }
      if (chordSynth.current) {
        chordSynth.current.releaseAll();
      }
      Object.values(samplers.current).forEach(sampler => {
        if (sampler.releaseAll) {
          sampler.releaseAll();
        }
      });
      
      setIsPlaying(false);
      setCurrentStep(0);
    }
    
    // Clear pattern
    setPattern({
      kick: Array(16).fill(0),
      snare: Array(16).fill(0),
      hihat: Array(16).fill(0),
      openhat: Array(16).fill(0),
      crash: Array(16).fill(0),
      clap: Array(16).fill(0)
    });
  };

  const drumNames = {
    kick: 'Kick',
    snare: 'Snare',
    hihat: 'Hi-Hat',
    openhat: 'Open Hat',
    crash: 'Crash',
    clap: 'Clap'
  };

  const drumColors = {
    kick: 'bg-red-500',
    snare: 'bg-blue-500',
    hihat: 'bg-yellow-400',
    openhat: 'bg-orange-500',
    crash: 'bg-purple-500',
    clap: 'bg-green-500'
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          AI Drum Machine
        </h1>

        {/* Input Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Describe Your Beat</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="e.g., 'four on the floor house beat', 'funky breakbeat', 'simple rock pattern'"
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              onKeyPress={(e) => e.key === 'Enter' && generatePattern()}
            />
            <button
              onClick={generatePattern}
              disabled={isGenerating || !userInput.trim()}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {isGenerating ? 'Generating...' : 'Generate Beats + Melody'}
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlayback}
                className="bg-green-600 hover:bg-green-700 p-3 rounded-full transition-colors"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button
                onClick={resetAll}
                className="bg-red-600 hover:bg-red-700 p-3 rounded-full transition-colors"
                title="Stop and Clear"
              >
                <RotateCcw size={24} />
              </button>
              <button
                onClick={toggleMelody}
                disabled={isGeneratingMelody}
                className={`
                  p-3 rounded-full transition-colors relative
                  ${melodyEnabled 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'bg-gray-600 hover:bg-gray-500'
                  }
                  ${isGeneratingMelody ? 'animate-pulse' : ''}
                `}
                title={isGeneratingMelody ? "Generating melody..." : melodyEnabled ? "Melody On" : "Generate Melody"}
              >
                <Music size={24} />
                {isGeneratingMelody && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </button>
              <button
                onClick={generateMelody}
                disabled={isGeneratingMelody}
                className={`
                  w-12 h-12 rounded-full transition-colors flex items-center justify-center
                  ${isGeneratingMelody 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                  }
                `}
                title="Regenerate Melody"
              >
                {isGeneratingMelody ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <div className="w-3 h-3 border-2 border-white rounded-full"></div>
                )}
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">BPM:</label>
              <input
                type="range"
                min="60"
                max="180"
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value))}
                className="w-32"
              />
              <span className="text-sm font-mono w-10">{bpm}</span>
            </div>
          </div>
        </div>

        {/* Drum Grid */}
        <div className="bg-gray-800 rounded-lg p-6 overflow-x-auto">
          <div className="min-w-max">
            {/* Step Numbers */}
            <div className="flex gap-2 mb-4">
              <div className="w-20 flex-shrink-0"></div>
              {Array.from({length: 16}, (_, i) => (
                <div key={i} className="w-12 text-center text-xs text-gray-400 font-mono">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Melody Row */}
            {generatedMelody && melodyEnabled && (
              <div className="mb-6">
                <div className="flex gap-2 items-center">
                  <div className="w-20 text-right text-sm font-medium text-pink-300 flex-shrink-0">
                    Melody
                  </div>
                  <div className="flex gap-2">
                    {Array.from({length: 16}, (_, stepIndex) => {
                      const currentBeat = stepIndex * 0.25;
                      const notesAtStep = generatedMelody.melodyTiming
                        .map((timing, index) => ({timing, note: generatedMelody.melody[index]}))
                        .filter(({timing}) => Math.abs(timing - currentBeat) < 0.125)
                        .map(({note}) => note);
                      
                      const hasNote = notesAtStep.length > 0;
                      const displayNote = hasNote ? notesAtStep[0]?.replace(/\d+/, '') : '';
                      
                      return (
                        <div
                          key={stepIndex}
                          className={`
                            w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-mono transition-all duration-75 flex-shrink-0
                            ${hasNote
                              ? 'bg-pink-500 border-white shadow-lg text-white' 
                              : 'bg-gray-700 border-gray-600'
                            }
                            ${currentStep === stepIndex && isPlaying 
                              ? 'ring-2 ring-yellow-400 ring-opacity-75' 
                              : ''
                            }
                          `}
                        >
                          {displayNote}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Drum Rows */}
            <div className="space-y-3">
              {Object.keys(pattern).map(drum => (
                <div key={drum} className="flex gap-2 items-center">
                  <div className="w-20 text-right text-sm font-medium text-gray-300 flex-shrink-0">
                    {drumNames[drum]}
                  </div>
                  <div className="flex gap-2">
                    {pattern[drum].map((active, stepIndex) => (
                      <button
                        key={stepIndex}
                        onClick={() => toggleStep(drum, stepIndex)}
                        className={`
                          w-12 h-12 rounded-lg border-2 transition-all duration-75 flex-shrink-0
                          ${active 
                            ? `${drumColors[drum]} border-white shadow-lg` 
                            : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                          }
                          ${currentStep === stepIndex && isPlaying 
                            ? 'ring-2 ring-yellow-400 ring-opacity-75' 
                            : ''
                          }
                        `}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Type a description of your desired beat and melody, then click Generate Beats + Melody.</p>
          <p>Try: "boom bap hip hop", "minimal techno", "latin percussion", "punk rock beat"</p>
          <p>Use the circle button to regenerate just the melody. Melodies are 64 beats long for variety!</p>
        </div>
      </div>
    </div>
  );
};

export default DrumMachine;