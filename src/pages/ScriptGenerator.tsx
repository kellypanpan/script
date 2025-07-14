import React, { useState } from 'react';
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
import { generateScript } from '../utils/scriptGenerator';
import { useUsageLimit, UsageLimitManager } from '../utils/usageLimit';
import { sampleScripts, getRandomScript } from '../data/sampleScripts';
import appConfig from '../config/app';

const ScriptGenerator: React.FC = () => {
  const [genre, setGenre] = useState('comedy');
  const [keywords, setKeywords] = useState('');
  const [characters, setCharacters] = useState<string[]>([]);
  const [tone, setTone] = useState('casual');
  const [outputFormat, setOutputFormat] = useState('shooting-script');
  const [newCharacter, setNewCharacter] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');
  const [maxLength, setMaxLength] = useState<'short' | 'default' | 'extended'>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Usage limit management
  const { canGenerate, remainingGenerations, timeUntilReset, dailyLimit } = useUsageLimit();
  
  // Get usage manager for direct calls
  const tryUseGeneration = () => {
    const manager = UsageLimitManager.getInstance();
    return manager.useGeneration();
  };

  // Load sample script
  const loadSampleScript = (index: number) => {
    setGeneratedScript(sampleScripts[index].script);
  };

  // Generate random sample
  const loadRandomSample = () => {
    const randomScript = getRandomScript();
    setGeneratedScript(randomScript.script);
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

  const handleGenerateScript = async () => {
    // Check usage limit first
    if (!canGenerate) {
      alert(`Daily limit reached! You can generate ${dailyLimit} scripts per day. Try again in ${timeUntilReset}.`);
      return;
    }

    // Use one generation
    const usageSuccess = tryUseGeneration();
    if (!usageSuccess) {
      alert('Unable to track usage. Please try again.');
      return;
    }

    setIsGenerating(true);
    setIsLoading(true);
    
    try {
      const scriptInput = {
        genre,
        keywords,
        characters,
        tone,
        maxLength,
        mode: outputFormat as 'dialog-only' | 'voiceover' | 'shooting-script'
      };
      
      if (appConfig.generation.useAPI) {
        // API call implementation
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), appConfig.generation.apiTimeout);
          
          const response = await fetch('/api/generate-script', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(scriptInput),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          const data = await response.json();
          
          if (response.ok && data?.script) {
            setGeneratedScript(data.script);
          } else {
            throw new Error('API returned invalid response');
          }
        } catch (apiError) {
          console.log('API failed, using local generation:', apiError);
          if (appConfig.generation.fallbackToLocal) {
            await new Promise(resolve => setTimeout(resolve, appConfig.generation.localDelay));
            const script = generateScript(scriptInput);
            setGeneratedScript(script);
          } else {
            throw apiError;
          }
        }
      } else {
        // Local generation (faster)
        await new Promise(resolve => setTimeout(resolve, appConfig.generation.localDelay));
        const script = generateScript(scriptInput);
        setGeneratedScript(script);
      }
      
    } catch (error) {
      console.error('Script generation error:', error);
      alert('Failed to generate script. Please try again.');
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Script Generator</h1>
          <p className="text-gray-600">Your shoot-ready screenplay assistant.</p>
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

            {/* Keywords Textarea */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords & Concept
              </label>
              <textarea
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your story idea, setting, conflict, or key plot points..."
              />
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
            {remainingGenerations <= 1 && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center space-x-2 text-orange-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {remainingGenerations === 0 
                      ? `Daily limit reached! Resets in ${timeUntilReset}` 
                      : `${remainingGenerations} generation${remainingGenerations === 1 ? '' : 's'} remaining today`
                    }
                  </span>
                </div>
                {remainingGenerations === 0 && (
                  <p className="text-sm text-orange-700 mt-1">
                    Upgrade to Pro for unlimited generations!
                  </p>
                )}
              </div>
            )}

            {/* Generate Button */}
            <button 
              onClick={handleGenerateScript}
              disabled={!canGenerate || isGenerating}
              className="w-full bg-[#1a73e8] text-white p-4 rounded-md text-lg font-semibold hover:bg-[#185abc] transition-colors flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="h-5 w-5" />
              <span>{isGenerating ? 'Generating...' : 'Generate Script'}</span>
            </button>

            {/* Usage counter for normal state */}
            {remainingGenerations > 1 && (
              <div className="mt-3 text-center">
                <p className="text-sm text-gray-500">
                  {remainingGenerations} of {dailyLimit} daily generations remaining
                </p>
              </div>
            )}
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
                    onClick={() => setOutputFormat(option.value)}
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
                  <div className="text-center text-gray-500 py-20">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-2">Ready to create your script?</p>
                    <p className="text-sm">Fill out the form and click "Generate Script" or try a sample script above.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Audio Preview */}
            <div className="mb-6">
              <button className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium hover:bg-green-200 transition-colors flex items-center space-x-2">
                <Volume2 className="h-4 w-4" />
                <span>🔊 Preview Audio</span>
              </button>
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
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white flex items-center justify-center"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1a73e8] border-t-transparent"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ScriptGenerator;