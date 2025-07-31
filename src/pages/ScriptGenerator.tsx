import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Volume2, 
  RotateCcw, 
  FileText, 
  Crown,
  Wand2,
  AlertCircle
} from 'lucide-react';
// 移除本地脚本生成器的导入，强制使用API
// import { generateScript } from '../utils/scriptGenerator';
// Usage limit disabled
import { sampleScripts, getRandomScript } from '../data/sampleScripts';
import appConfig from '../config/app';
import { shortFilmIdeas } from '../data/shortFilmIdeas';

const ScriptGenerator: React.FC = () => {
  const [genre, setGenre] = useState('comedy');
  const [keywords, setKeywords] = useState('');
  const [characters, setCharacters] = useState<string[]>([]);
  const [tone, setTone] = useState('casual');
  const [outputFormat, setOutputFormat] = useState('shooting-script');
  const [newCharacter, setNewCharacter] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');
  const [maxLength, setMaxLength] = useState<'short' | 'default' | 'extended'>('default');
  const [platform, setPlatform] = useState<'tiktok' | 'reels' | 'youtube' | 'general'>('general');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressTimer = useRef<NodeJS.Timeout | null>(null);
  const [formatted, setFormatted] = useState(false);
  const [rawScript, setRawScript] = useState(''); // Store the original script
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Usage limit disabled
  const canGenerate = true;
  
  // Load sample script
  const loadSampleScript = (index: number) => {
    const script = sampleScripts[index].script;
    setRawScript(script);
    setGeneratedScript(convertScriptFormat(script, outputFormat));
  };

  // Generate random sample
  const loadRandomSample = () => {
    const randomScript = getRandomScript();
    setRawScript(randomScript.script);
    setGeneratedScript(convertScriptFormat(randomScript.script, outputFormat));
  };

  // Convert script format based on output format
  const convertScriptFormat = (script: string, format: string): string => {
    if (!script) return script;
    
    const lines = script.split('\n').filter(line => line.trim());
    
    switch (format) {
      case 'dialog-only':
        return lines
          .filter(line => {
            const trimmed = line.trim();
            // Keep character names (ALL CAPS) and dialogue
            return trimmed.match(/^[A-Z][A-Z\s]+$/) || 
                   (!trimmed.match(/^(INT\.|EXT\.)/) && 
                    !trimmed.match(/^\(.+\)$/) && 
                    !trimmed.match(/^(FADE|CUT|DISSOLVE)/) &&
                    trimmed.length > 0);
          })
          .join('\n');
          
      case 'voiceover':
        return lines
          .filter(line => {
            const trimmed = line.trim();
            // Keep action lines and convert dialogue to narration
            return !trimmed.match(/^[A-Z][A-Z\s]+$/) && 
                   !trimmed.match(/^\(.+\)$/) &&
                   trimmed.length > 0;
          })
          .map(line => {
            // Remove scene headings formatting, make it narrative
            if (line.match(/^(INT\.|EXT\.)/)) {
              return line.replace(/^(INT\.|EXT\.\s*)/, '').replace(/\s*–\s*DAY|NIGHT$/i, '');
            }
            return line;
          })
          .join(' ');
          
      case 'shooting-script':
      default:
        return script; // Keep original format
    }
  };

  // Handle format change
  const handleFormatChange = (newFormat: string) => {
    setOutputFormat(newFormat);
    if (rawScript) {
      setGeneratedScript(convertScriptFormat(rawScript, newFormat));
    }
  };

  // Export script as TXT file
  const exportTXT = () => {
    const scriptContent = generatedScript;
    const blob = new Blob([scriptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `script-${timestamp}.txt`;
    
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Format script for enhanced display
  const formatScriptForDisplay = (script: string) => {
    if (!script) return script;
    
    return script
      .split('\n')
      .map((line, index) => {
        const trimmedLine = line.trim();
        
        // Scene headings (INT./EXT.)
        if (trimmedLine.match(/^(INT\.|EXT\.)/)) {
          return (
            <div key={index} className="font-bold text-gray-900 mb-3 mt-4 first:mt-0">
              {trimmedLine}
            </div>
          );
        }
        
        // Character names (ALL CAPS at start of line)
        if (trimmedLine.match(/^[A-Z][A-Z\s]+$/) && trimmedLine.length < 30) {
          return (
            <div key={index} className="font-semibold text-gray-800 mt-4 mb-1 ml-20">
              {trimmedLine}
            </div>
          );
        }
        
        // Parentheticals
        if (trimmedLine.match(/^\(.+\)$/)) {
          return (
            <div key={index} className="text-gray-600 italic ml-16 mb-1">
              {trimmedLine}
            </div>
          );
        }
        
        // Dialogue (indented)
        if (line.match(/^\s{8,}/)) {
          return (
            <div key={index} className="ml-12 mb-2 text-gray-800">
              {trimmedLine}
            </div>
          );
        }
        
        // Transitions (FADE OUT, etc.)
        if (trimmedLine.match(/^(FADE|CUT|DISSOLVE)/)) {
          return (
            <div key={index} className="text-right font-medium text-gray-700 mt-4 mb-3">
              {trimmedLine}
            </div>
          );
        }
        
        // Action lines
        if (trimmedLine) {
          return (
            <div key={index} className="mb-3 text-gray-800">
              {trimmedLine}
            </div>
          );
        }
        
        // Empty lines
        return <div key={index} className="h-2"></div>;
      });
  };

  const addCharacter = () => {
    if (newCharacter.trim() && !characters.includes(newCharacter.trim())) {
      setCharacters([...characters, newCharacter.trim()]);
      setNewCharacter('');
    }
  };

  const removeCharacter = (character: string) => {
    setCharacters(characters.filter(c => c !== character));
  };

  // Handle audio preview
  const handleAudioPreview = async () => {
    if (!generatedScript) {
      alert('Please generate a script first!');
      return;
    }

    if (isPlayingAudio) {
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      // Stop speech synthesis
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      return;
    }

    try {
      setIsPlayingAudio(true);
      
      // Extract dialogue from script for TTS
      const scriptForTTS = extractDialogueForTTS(generatedScript);
      
      console.log('🔊 Generating audio preview...');
      
      // Try Google Cloud TTS first, fallback to Web Speech API
      try {
        const response = await fetch(`${appConfig.api.baseUrl}/api/generate-audio`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`
          },
          body: JSON.stringify({
            text: scriptForTTS,
            languageCode: 'en-US',
            voiceName: 'en-US-Wavenet-D',
            speakingRate: 1.1
          }),
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.audioContent) {
            // Create audio element and play
            const audioBlob = new Blob([
              Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))
            ], { type: 'audio/mp3' });
            
            const audioUrl = URL.createObjectURL(audioBlob);
            
            if (audioRef.current) {
              audioRef.current.src = audioUrl;
              audioRef.current.onended = () => setIsPlayingAudio(false);
              await audioRef.current.play();
              return; // Success, don't fallback
            }
          }
        }
        
        throw new Error('Google TTS not available');
      } catch (gcloudError) {
        console.log('Google TTS failed, using browser TTS:', gcloudError);
        
        // Fallback to Web Speech API
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(scriptForTTS);
          utterance.rate = 1.1;
          utterance.pitch = 1.0;
          utterance.volume = 0.8;
          
          utterance.onend = () => setIsPlayingAudio(false);
          utterance.onerror = () => {
            setIsPlayingAudio(false);
            throw new Error('Speech synthesis failed');
          };
          
          window.speechSynthesis.speak(utterance);
          console.log('✅ Using browser speech synthesis');
        } else {
          throw new Error('No TTS options available');
        }
      }
    } catch (error) {
      console.error('Audio preview error:', error);
      alert(`Audio preview failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nNote: For better quality audio, configure Google Cloud TTS API key in the backend.`);
      setIsPlayingAudio(false);
    }
  };

  // Extract dialogue for TTS (remove action lines, keep dialogue)
  const extractDialogueForTTS = (script: string): string => {
    const lines = script.split('\n');
    const dialogueLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines, scene headings, action lines
      if (!line || line.match(/^(INT\.|EXT\.|FADE|CUT)/i)) continue;
      
      // Character names (ALL CAPS)
      if (line.match(/^[A-Z][A-Z\s]+$/) && line.length < 30) {
        // Look ahead for dialogue
        const nextLine = lines[i + 1]?.trim();
        if (nextLine && !nextLine.match(/^[A-Z][A-Z\s]+$/)) {
          dialogueLines.push(`${line} says:`);
        }
        continue;
      }
      
      // Dialogue lines (not action descriptions)
      if (line && !line.match(/^[A-Z][A-Z\s]+$/) && !line.includes('(') && !line.includes(')')) {
        dialogueLines.push(line);
      }
    }
    
    return dialogueLines.join(' ').substring(0, 500); // Limit to 500 chars for demo
  };

  const handleGenerateScript = async () => {
    console.log('🎬 Starting script generation...');
    console.log('Config:', { useAPI: appConfig.generation.useAPI, baseUrl: appConfig.api.baseUrl });
    
    setIsGenerating(true);
    setIsLoading(true);
    setProgress(0);
    // Simulate progress while waiting for API (will go up to 90%)
    progressTimer.current && clearInterval(progressTimer.current);
    progressTimer.current = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 3 : prev));
    }, 500);

    try {
      const scriptInput = {
        genre,
        keywords,
        characters,
        tone,
        maxLength,
        mode: outputFormat as 'dialog-only' | 'voiceover' | 'shooting-script',
        platform
      };
      
      console.log('📝 Script input:', scriptInput);
      
      if (appConfig.generation.useAPI) {
        // API call implementation
        try {
          console.log('🌐 Attempting API call...');
          console.log('⏳ AI generation may take 15-30 seconds...');
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), appConfig.generation.apiTimeout);
          
          // 获取正确的API端点
          const getApiEndpoint = () => {
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
              return 'http://localhost:4000/api/generate-script';
            }
            return '/api/generate-script';
          };
          
          const apiEndpoint = getApiEndpoint();
          console.log('Calling API endpoint:', apiEndpoint);
          
          const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(scriptInput),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          console.log('📡 Response status:', response.status);
          
          const data = await response.json();
          console.log('📄 Response data:', data);
          
          if (response.ok && data?.success && data?.script) {
            const rawGeneratedScript = data.script;
            console.log('✅ API Success! Script length:', rawGeneratedScript.length);
            setRawScript(rawGeneratedScript);
            setGeneratedScript(convertScriptFormat(rawGeneratedScript, outputFormat));
          } else {
            throw new Error(`API returned invalid response: ${JSON.stringify(data)}`);
          }
        } catch (apiError) {
          console.log('❌ API failed, using local generation:', apiError);
          
          // 提供更详细的错误信息
          let errorMessage = 'API request failed';
          if (apiError instanceof Error) {
            if (apiError.name === 'AbortError') {
              errorMessage = 'API request timed out (>30s)';
            } else if (apiError.message.includes('Failed to fetch')) {
              errorMessage = 'Network connection failed';
            } else {
              errorMessage = apiError.message;
            }
          }
          
          console.log('🔍 Error details:', errorMessage);
          
          // 不再回退到本地生成，直接抛出错误
          throw new Error(`API Error: ${errorMessage}`);
        }
      } else {
        // 强制使用API，不再支持本地生成
        throw new Error('API generation is required. Please check your configuration.');
      }
      
      console.log('🎉 Script generation completed successfully!');
      
    } catch (error) {
      console.error('💥 Script generation error:', error);
      alert(`Failed to generate script: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      progressTimer.current && clearInterval(progressTimer.current!);
      setProgress(100);
      setIsLoading(false);
      setIsGenerating(false);
      // reset progress after small delay so bar hides smoothly next time
      setTimeout(() => setProgress(0), 400);
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gray-50 py-8 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ReadyScriptPro</h1>
          <p className="text-gray-600">Not just a script — a camera-ready screenplay.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Input Form */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Script Details</h2>
            
            {/* Genre Dropdown */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Genre
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="comedy">Comedy</option>
                <option value="drama">Drama</option>
                <option value="thriller">Thriller</option>
                <option value="horror">Horror</option>
                <option value="romance">Romance</option>
                <option value="action">Action</option>
                <option value="documentary">Documentary</option>
              </select>
            </div>

            {/* Platform Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform Target
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'tiktok', label: 'TikTok', desc: '15-60s vertical' },
                  { value: 'reels', label: 'Instagram Reels', desc: '15-90s vertical' },
                  { value: 'youtube', label: 'YouTube Shorts', desc: '15-60s vertical' },
                  { value: 'general', label: 'General Short Film', desc: '1-5min any format' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPlatform(option.value as 'tiktok' | 'reels' | 'youtube' | 'general')}
                    className={`p-3 rounded-lg border text-sm transition-colors ${
                      platform === option.value
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs opacity-75">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Keywords Textarea */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords & Concept
              </label>
              <div className="flex items-start gap-2">
              <textarea
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your story idea, setting, conflict, or key plot points..."
              />
                <button
                  type="button"
                  onClick={() => setKeywords(shortFilmIdeas[Math.floor(Math.random() * shortFilmIdeas.length)])}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm whitespace-nowrap"
                >
                  Suggest Idea
                </button>
              </div>
            </div>

            {/* Characters */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Characters
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newCharacter}
                  onChange={(e) => setNewCharacter(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCharacter()}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add character name..."
                />
                <button
                  onClick={addCharacter}
                  className="bg-[#1a73e8] text-white px-4 py-3 rounded-md hover:bg-[#185abc] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/50"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                {characters.map((character) => (
                    <motion.span
                    key={character}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {character}
                    <button
                      onClick={() => removeCharacter(character)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                    </motion.span>
                ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Tone/Style Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tone & Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'casual', label: 'Casual' },
                  { value: 'professional', label: 'Professional' },
                  { value: 'humorous', label: 'Humorous' },
                  { value: 'dramatic', label: 'Dramatic' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTone(option.value)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      tone === option.value
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sample Script Loader */}
            <button 
              onClick={loadRandomSample}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors mb-6 focus:outline-none focus:ring-2 focus:ring-gray-300/50"
            >
              <Wand2 className="h-5 w-5" />
              <span>Load Sample Script</span>
            </button>

            {/* Length Control */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Script Length
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'short', label: 'Short (15-30s)' },
                  { value: 'default', label: 'Default (1-3min)' },
                  { value: 'extended', label: 'Extended (5min+)' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setMaxLength(option.value as 'short' | 'default' | 'extended')}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      maxLength === option.value
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Usage Limit Info */}
            {/* usage limit UI removed */}

            {/* Generate Button */}
            <button 
              onClick={handleGenerateScript}
              disabled={!canGenerate || isGenerating}
              className="w-full bg-[#1a73e8] text-white p-4 rounded-md text-lg font-semibold hover:bg-[#185abc] transition-colors flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="h-5 w-5" />
              <span>{isGenerating ? (appConfig.generation.useAPI ? 'AI Writing Script...' : 'Generating...') : 'Generate Script'}</span>
            </button>

            {/* usage limit UI removed */}
          </motion.div>

          {/* Right: Script Output */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Generated Script</h2>
              <button 
                onClick={() => setGeneratedScript('')}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Clear script"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>

            {/* Sample Scripts Selector */}
            {!generatedScript && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Sample Scripts</h3>
                <div className="grid gap-3">
                  {sampleScripts.map((sample, index) => (
                    <div 
                      key={sample.id}
                      onClick={() => loadSampleScript(index)}
                      className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{sample.title}</h4>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {sample.duration}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {sample.category}
                        </span>
                        <span className="text-xs text-gray-500">{sample.genre}</span>
                      </div>
                      <p className="text-sm text-gray-600">{sample.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Output Format Toggle */}
            <div className="mb-6">
              <div className="flex bg-gray-200 p-1 rounded-md">
                {[
                  { value: 'dialog-only', label: 'Dialog Only' },
                  { value: 'shooting-script', label: 'Shoot-Ready' },
                  { value: 'voiceover', label: 'Voiceover Format' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleFormatChange(option.value)}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      outputFormat === option.value
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Script Display */}
            <div className="bg-gray-50 border rounded-lg mb-6 h-96 overflow-y-auto">
              <div className="p-6">
                {generatedScript ? (
                  formatted ? (
                    <div 
                      className="screenplay-format text-sm leading-relaxed text-gray-900"
                      style={{
                        fontFamily: 'Courier New, monospace',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {formatScriptForDisplay(generatedScript)}
                    </div>
                  ) : (
                    <div 
                      className="text-sm leading-relaxed text-gray-900"
                      style={{
                        fontFamily: 'Courier New, monospace',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {generatedScript}
                    </div>
                  )
                ) : (
                  <div className="text-center text-gray-500 py-20">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-2">Ready to create your script?</p>
                    <p className="text-sm">Fill out the form and click "Generate Script" or try a sample script above.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Format toggle */}
            <div className="mb-4">
              <button
                onClick={() => setFormatted((prev) => !prev)}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
              >
                {formatted ? 'Show Raw Text' : 'Format Script'}
              </button>
            </div>

            {/* Audio Preview */}
            <div className="mb-6">
              <button 
                onClick={handleAudioPreview}
                disabled={!generatedScript}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isPlayingAudio 
                    ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                <Volume2 className="h-4 w-4" />
                <span>
                  {isPlayingAudio ? '⏹️ Stop Audio' : '🔊 Preview Audio'}
                </span>
              </button>
              <audio ref={audioRef} style={{ display: 'none' }} />
            </div>

            {/* Export Buttons */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Export Options</h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={exportTXT}
                  disabled={!generatedScript}
                  className="bg-blue-100 text-blue-700 px-4 py-3 rounded-lg font-medium hover:bg-blue-200 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText className="h-4 w-4" />
                  <span>TXT (Free)</span>
                </button>
                <button 
                  disabled
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-lg font-medium opacity-50 cursor-not-allowed flex items-center justify-center space-x-2"
                  title="Upgrade to Pro for PDF export"
                >
                  <Crown className="h-4 w-4" />
                  <span>PDF (Pro)</span>
                </button>
                <button 
                  disabled
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-lg font-medium opacity-50 cursor-not-allowed flex items-center justify-center space-x-2"
                  title="Upgrade to Pro for FDX export"
                >
                  <Crown className="h-4 w-4" />
                  <span>FDX (Pro)</span>
                </button>
                <button 
                  disabled
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-lg font-medium opacity-50 cursor-not-allowed flex items-center justify-center space-x-2"
                  title="Upgrade to Pro for Audio export"
                >
                  <Crown className="h-4 w-4" />
                  <span>Audio (Pro)</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white flex flex-col items-center justify-center space-y-6"
          >
            <p className="text-lg font-medium text-gray-700">Generating your script…</p>
            <div className="w-64 bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
    </div>
            <p className="text-sm text-gray-500">This usually takes about 15–20 seconds</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ScriptGenerator;