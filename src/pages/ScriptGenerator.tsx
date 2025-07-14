import React, { useState } from 'react';
import { 
  Sparkles, 
  Volume2, 
  RotateCcw, 
  Download, 
  FileText, 
  Crown,
  Wand2 
} from 'lucide-react';

const ScriptGenerator: React.FC = () => {
  const [genre, setGenre] = useState('comedy');
  const [keywords, setKeywords] = useState('');
  const [characters, setCharacters] = useState<string[]>([]);
  const [tone, setTone] = useState('casual');
  const [outputFormat, setOutputFormat] = useState('shoot-ready');
  const [newCharacter, setNewCharacter] = useState('');

  const addCharacter = () => {
    if (newCharacter.trim() && !characters.includes(newCharacter.trim())) {
      setCharacters([...characters, newCharacter.trim()]);
      setNewCharacter('');
    }
  };

  const removeCharacter = (character: string) => {
    setCharacters(characters.filter(c => c !== character));
  };

  const sampleScript = `INT. COFFEE SHOP - DAY

SARAH (20s, barista) wipes down the counter as MIKE (30s, freelance writer) approaches with his laptop.

SARAH
(cheerful)
The usual? Large coffee, extra shot of creativity?

MIKE
(sighing)
Make it a double shot. I've got writer's block the size of Mount Everest.

SARAH
(leaning in conspiratorially)
You know what always helps me? 
I pretend I'm writing someone else's story.

Mike looks up, intrigued.

MIKE
That's... actually brilliant.

SARAH
(grinning)
That'll be four-fifty for the coffee, 
and the life advice is on the house.

FADE OUT.`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Script Generator</h1>
          <p className="text-gray-600">Create professional, shoot-ready scripts in minutes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Input Form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
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
                  className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {characters.map((character) => (
                  <span
                    key={character}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {character}
                    <button
                      onClick={() => removeCharacter(character)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
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

            {/* AI Idea Generator */}
            <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center space-x-2 mb-6">
              <Wand2 className="h-5 w-5" />
              <span>AI Idea Generator</span>
            </button>

            {/* Generate Button */}
            <button className="w-full bg-blue-600 text-white p-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
              <Sparkles className="h-5 w-5" />
              <span>Generate Script</span>
            </button>
          </div>

          {/* Right: Script Output */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Generated Script</h2>
              <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>

            {/* Output Format Toggle */}
            <div className="mb-6">
              <div className="flex bg-gray-100 p-1 rounded-lg">
                {[
                  { value: 'dialog-only', label: 'Dialog Only' },
                  { value: 'shoot-ready', label: 'Shoot-Ready' },
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
            <div className="bg-gray-50 p-4 rounded-lg mb-6 h-96 overflow-y-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                {sampleScript}
              </pre>
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
                <button className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>TXT (Free)</span>
                </button>
                <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center space-x-2">
                  <Crown className="h-4 w-4" />
                  <span>PDF (Pro)</span>
                </button>
                <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center space-x-2">
                  <Crown className="h-4 w-4" />
                  <span>FDX (Pro)</span>
                </button>
                <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center space-x-2">
                  <Crown className="h-4 w-4" />
                  <span>Audio (Pro)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptGenerator;