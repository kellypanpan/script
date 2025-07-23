import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Save, 
  Download, 
  RefreshCw, 
  Crown,
  Lightbulb,
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  Type,
  AlignLeft,
  AlignCenter,
  Copy,
  Scissors,
  Clipboard
} from 'lucide-react';
import { useAuthWithFallback } from '../components/AuthProvider';
import ProjectContext from '../components/ProjectContext';

interface ScriptSuggestion {
  id: string;
  type: 'structure' | 'pacing' | 'dialogue' | 'transition';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

interface ScriptDraft {
  id: string;
  content: string;
  timestamp: string;
  name: string;
}

const ScriptDoctor: React.FC = () => {
  const { user, hasFeature, isAuthenticated } = useAuthWithFallback();
  
  // Core state
  const [scriptContent, setScriptContent] = useState('');
  const [suggestions, setSuggestions] = useState<ScriptSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [rewriteOptions, setRewriteOptions] = useState<string[]>([]);
  
  // Draft management
  const [drafts, setDrafts] = useState<ScriptDraft[]>([]);
  const [currentDraftName, setCurrentDraftName] = useState('Untitled Script');
  
  // Undo/Redo functionality
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // UI state
  const [showUploadArea, setShowUploadArea] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Apply suggestion state
  const [isApplyingSuggestion, setIsApplyingSuggestion] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());
  
  // Usage tracking  
  const [dailyUsage, setDailyUsage] = useState(0);
  const maxDailyUsage = user ? 
    (user.plan === 'free' ? 1 : 999) : 1;

  // Load drafts from localStorage on component mount
  useEffect(() => {
    const savedDrafts = localStorage.getItem('script-doctor-drafts');
    if (savedDrafts) {
      setDrafts(JSON.parse(savedDrafts));
    }
    
    const usage = localStorage.getItem('script-doctor-usage-' + new Date().toDateString());
    if (usage) {
      setDailyUsage(parseInt(usage));
    }

    // Check if coming from Dashboard with project data
    const doctorProjectData = localStorage.getItem('doctorProject');
    if (doctorProjectData) {
      try {
        const project = JSON.parse(doctorProjectData);
        setScriptContent(project.content || '');
        setCurrentDraftName(project.title || 'Untitled Script');
        setShowUploadArea(false); // Hide upload area since we have content
        
        // Clear the temporary data
        localStorage.removeItem('doctorProject');
        console.log('Loaded project for diagnosis:', project.title);
      } catch (error) {
        console.error('Failed to load project for diagnosis:', error);
      }
    }
  }, []);

  // Save draft
  const saveDraft = React.useCallback(() => {
    if (!scriptContent.trim()) return;
    
    const draft: ScriptDraft = {
      id: Date.now().toString(),
      content: scriptContent,
      timestamp: new Date().toISOString(),
      name: currentDraftName
    };
    
    const newDrafts = [draft, ...drafts.slice(0, 2)]; // Keep only 3 most recent
    setDrafts(newDrafts);
    localStorage.setItem('script-doctor-drafts', JSON.stringify(newDrafts));
  }, [scriptContent, currentDraftName, drafts]);

  // Auto-save current script
  useEffect(() => {
    if (scriptContent) {
      const timer = setTimeout(() => {
        saveDraft();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [scriptContent, currentDraftName, saveDraft]);

  // Handle file upload
  const handleFileUpload = (file: File) => {
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content.length > 5000) {
          alert('Script is too long. Maximum 5000 characters allowed.');
          return;
        }
        setScriptContent(content);
        setShowUploadArea(false);
        addToHistory(content);
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a .txt file only.');
    }
  };

  // Handle paste
  const handlePaste = (content: string) => {
    if (content.length > 5000) {
      alert('Script is too long. Maximum 5000 characters allowed.');
      return;
    }
    setScriptContent(content);
    setShowUploadArea(false);
    addToHistory(content);
  };

  // Undo/Redo functionality
  const addToHistory = (content: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(content);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setScriptContent(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setScriptContent(history[historyIndex + 1]);
    }
  };

  // AI Analysis function
  const analyzeScript = async () => {
    if (!scriptContent.trim()) {
      alert('Please enter a script first.');
      return;
    }

    if (user?.plan === 'free' && dailyUsage >= maxDailyUsage) {
      alert('Daily limit reached. Upgrade to Pro for unlimited analysis.');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/script-doctor/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script: scriptContent,
          focus: 'all'
        }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.suggestions) {
        setSuggestions(data.suggestions);
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
      
      // Update usage
      const newUsage = dailyUsage + 1;
      setDailyUsage(newUsage);
      localStorage.setItem('script-doctor-usage-' + new Date().toDateString(), newUsage.toString());
      
    } catch (error) {
      console.error('Analysis error:', error);
      alert(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // AI Rewrite function
  const rewriteSelection = async () => {
    if (!selectedText.trim()) {
      alert('Please select text to rewrite.');
      return;
    }

    if (!hasFeature('canRewriteScenes')) {
      alert('Rewriting is a Pro feature. Please upgrade your plan.');
      return;
    }

    setIsRewriting(true);
    
    try {
      const response = await fetch('/api/script-doctor/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: selectedText,
          context: scriptContent.substring(0, 200), // Provide context
          tone: 'professional',
          genre: 'general',
          preserveStructure: true
        }),
      });

      if (!response.ok) {
        throw new Error(`Rewrite failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.options) {
        setRewriteOptions(data.options);
      } else {
        throw new Error(data.error || 'Rewrite failed');
      }
      
    } catch (error) {
      console.error('Rewrite error:', error);
      alert(`Rewrite failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRewriting(false);
    }
  };

  // Apply rewrite option
  const applyRewrite = (option: string) => {
    const newContent = scriptContent.replace(selectedText, option);
    setScriptContent(newContent);
    addToHistory(newContent);
    setRewriteOptions([]);
    setSelectedText('');
  };

  // Apply suggestion function
  const applySuggestion = async (suggestion: ScriptSuggestion) => {
    if (appliedSuggestions.has(suggestion.id)) {
      alert('This suggestion has already been applied.');
      return;
    }

    setIsApplyingSuggestion(true);
    
    try {
      const response = await fetch('/api/script-doctor/apply-suggestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script: scriptContent,
          suggestion: suggestion,
          context: `This is a ${currentDraftName} script analysis.`
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to apply suggestion: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.improvedScript) {
        // Update script content with improved version
        setScriptContent(data.improvedScript);
        addToHistory(data.improvedScript);
        
        // Mark suggestion as applied
        setAppliedSuggestions(prev => new Set([...prev, suggestion.id]));
        
        // Clear suggestions to encourage re-analysis of improved script
        setSuggestions([]);
        
        alert(`✅ Applied: ${suggestion.title}\n\nThe script has been improved based on this suggestion. Click "Analyze" again to see remaining improvements.`);
      } else {
        throw new Error(data.error || 'Failed to apply suggestion');
      }
      
    } catch (error) {
      console.error('Apply suggestion error:', error);
      alert(`Failed to apply suggestion: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsApplyingSuggestion(false);
    }
  };

  // Export functions
  const exportTXT = () => {
    if (!scriptContent.trim()) {
      alert('No script content to export.');
      return;
    }
    
    const blob = new Blob([scriptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentDraftName.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    if (!hasFeature('canExportPDF')) {
      alert('PDF export is a Pro feature. Please upgrade your plan.');
      return;
    }
    alert('PDF export functionality will be implemented with Pro plan.');
  };

  // Handle text selection
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim());
    }
  };

  // Rich text editing functions
  const formatText = (command: string, value?: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      
      if (selectedText) {
        let formattedText = selectedText;
        
        switch (command) {
          case 'bold':
            formattedText = `**${selectedText}**`;
            break;
          case 'italic':
            formattedText = `*${selectedText}*`;
            break;
          case 'underline':
            formattedText = `_${selectedText}_`;
            break;
          case 'center':
            formattedText = `                    ${selectedText}`;
            break;
          case 'uppercase':
            formattedText = selectedText.toUpperCase();
            break;
          case 'character':
            formattedText = selectedText.toUpperCase();
            break;
        }
        
        const newContent = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
        setScriptContent(newContent);
        addToHistory(newContent);
        
        // Set cursor position after formatted text
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
        }, 0);
      }
    }
  };

  // Copy, cut, paste functions
  const copyText = async () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      
      if (selectedText) {
        try {
          await navigator.clipboard.writeText(selectedText);
          alert('Text copied to clipboard');
        } catch {
          // Fallback for older browsers
          textarea.select();
          document.execCommand('copy');
          alert('Text copied to clipboard');
        }
      }
    }
  };

  const cutText = async () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      
      if (selectedText) {
        try {
          await navigator.clipboard.writeText(selectedText);
          const newContent = textarea.value.substring(0, start) + textarea.value.substring(end);
          setScriptContent(newContent);
          addToHistory(newContent);
          alert('Text cut to clipboard');
        } catch {
          alert('Cut operation failed');
        }
      }
    }
  };

  const pasteText = async () => {
    if (textareaRef.current) {
      try {
        const clipboardText = await navigator.clipboard.readText();
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        
        const newContent = textarea.value.substring(0, start) + clipboardText + textarea.value.substring(end);
        setScriptContent(newContent);
        addToHistory(newContent);
        
        // Set cursor position after pasted text
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + clipboardText.length, start + clipboardText.length);
        }, 0);
      } catch {
        alert('Paste operation failed');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gray-50 py-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Project Context */}
        <ProjectContext />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Script Doctor™
          </h1>
          <p className="text-gray-600">
            Professional script editing and optimization powered by AI
          </p>
          
          {/* Usage indicator */}
          {user?.plan === 'free' && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                Free Plan: {dailyUsage}/{maxDailyUsage} daily analysis used
                {dailyUsage >= maxDailyUsage && ' • Upgrade to Pro for unlimited access'}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload/Input Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {showUploadArea ? (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Upload or Paste Your Script</h2>
                  
                  {/* File Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      const file = e.dataTransfer.files[0];
                      if (file) handleFileUpload(file);
                    }}
                  >
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Drop your script file here
                    </h3>
                    <p className="text-gray-600 mb-4">
                      or click to browse (.txt files, max 5000 characters)
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Choose File
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      className="hidden"
                    />
                  </div>
                  
                  {/* Or divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">or</span>
                    </div>
                  </div>
                  
                  {/* Paste Area */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paste Your Script
                    </label>
                    <textarea
                      placeholder="Paste your script here (max 5000 characters)..."
                      className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      maxLength={5000}
                      onChange={(e) => {
                        if (e.target.value.length > 0) {
                          handlePaste(e.target.value);
                        }
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum 5000 characters
                    </p>
                  </div>
                </div>
              ) : (
                /* Script Editor */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Script Editor</h2>
                    <div className="flex items-center space-x-2">
                      {/* Draft name */}
                      <input
                        value={currentDraftName}
                        onChange={(e) => setCurrentDraftName(e.target.value)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded"
                        placeholder="Script name"
                      />
                    </div>
                  </div>
                  
                  {/* Rich Text Toolbar */}
                  <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border">
                    <div className="flex items-center space-x-1">
                      {/* Undo/Redo */}
                      <button
                        onClick={undo}
                        disabled={historyIndex <= 0}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Undo (Ctrl+Z)"
                      >
                        <Undo2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={redo}
                        disabled={historyIndex >= history.length - 1}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Redo (Ctrl+Y)"
                      >
                        <Redo2 className="h-4 w-4" />
                      </button>
                      
                      <div className="h-4 w-px bg-gray-300 mx-2"></div>
                      
                      {/* Text Formatting */}
                      <button
                        onClick={() => formatText('bold')}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded"
                        title="Bold (Ctrl+B)"
                      >
                        <Bold className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => formatText('italic')}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded"
                        title="Italic (Ctrl+I)"
                      >
                        <Italic className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => formatText('underline')}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded"
                        title="Underline (Ctrl+U)"
                      >
                        <Underline className="h-4 w-4" />
                      </button>
                      
                      <div className="h-4 w-px bg-gray-300 mx-2"></div>
                      
                      {/* Screenplay Formatting */}
                      <button
                        onClick={() => formatText('character')}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded"
                        title="Character Name (Uppercase)"
                      >
                        <Type className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => formatText('center')}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded"
                        title="Center Text"
                      >
                        <AlignCenter className="h-4 w-4" />
                      </button>
                      
                      <div className="h-4 w-px bg-gray-300 mx-2"></div>
                      
                      {/* Clipboard Operations */}
                      <button
                        onClick={copyText}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded"
                        title="Copy (Ctrl+C)"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={cutText}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded"
                        title="Cut (Ctrl+X)"
                      >
                        <Scissors className="h-4 w-4" />
                      </button>
                      <button
                        onClick={pasteText}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded"
                        title="Paste (Ctrl+V)"
                      >
                        <Clipboard className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Select text to format
                    </div>
                  </div>
                  
                  {/* Editor */}
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={scriptContent}
                      onChange={(e) => {
                        setScriptContent(e.target.value);
                        addToHistory(e.target.value);
                      }}
                      onMouseUp={handleTextSelection}
                      onKeyUp={handleTextSelection}
                      className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm leading-relaxed"
                      placeholder="Your script content will appear here..."
                      style={{ fontFamily: 'Courier New, monospace' }}
                    />
                    
                    {/* Character count */}
                    <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded">
                      {scriptContent.length}/5000
                    </div>
                  </div>
                  
                  {/* Selected text rewrite options */}
                  <AnimatePresence>
                    {selectedText && hasFeature('canRewriteScenes') && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-blue-900">
                            Selected: "{selectedText.substring(0, 50)}{selectedText.length > 50 ? '...' : ''}"
                          </p>
                          <button
                            onClick={rewriteSelection}
                            disabled={isRewriting}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                          >
                            {isRewriting ? 'Rewriting...' : 'Rewrite'}
                          </button>
                        </div>
                        
                        {rewriteOptions.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs text-blue-700">Choose a rewrite option:</p>
                            {rewriteOptions.map((option, index) => (
                              <button
                                key={index}
                                onClick={() => applyRewrite(option)}
                                className="block w-full p-2 text-left text-sm bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setShowUploadArea(true)}
                        className="text-gray-600 hover:text-gray-800 text-sm"
                      >
                        ← Upload Different Script
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={saveDraft}
                        className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
                        title="Save Draft"
                      >
                        <Save className="h-4 w-4" />
                        <span className="text-sm">Save</span>
                      </button>
                      
                      <button
                        onClick={exportTXT}
                        className="flex items-center space-x-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
                      >
                        <Download className="h-4 w-4" />
                        <span className="text-sm">Export TXT</span>
                      </button>
                      
                      <button
                        onClick={exportPDF}
                        disabled={!hasFeature('canExportPDF')}
                        className="flex items-center space-x-1 bg-orange-600 text-white px-3 py-2 rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Crown className="h-4 w-4" />
                        <span className="text-sm">Export PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* AI Suggestions Panel */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
                  AI Suggestions
                </h3>
                <button
                  onClick={analyzeScript}
                  disabled={isAnalyzing || !scriptContent.trim()}
                  className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzing ? 'Analyzing...' : 'Analyze'}</span>
                </button>
              </div>
              
              {suggestions.length > 0 ? (
                <div className="space-y-3">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className={`p-3 rounded-lg border-l-4 ${
                        appliedSuggestions.has(suggestion.id)
                          ? 'border-gray-400 bg-gray-100 opacity-75'
                          : suggestion.severity === 'high' 
                          ? 'border-red-500 bg-red-50'
                          : suggestion.severity === 'medium'
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-green-500 bg-green-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm flex items-center">
                            {appliedSuggestions.has(suggestion.id) && (
                              <span className="text-green-600 mr-2">✓</span>
                            )}
                            {suggestion.title}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            {suggestion.description}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`inline-block px-2 py-1 rounded text-xs ${
                              suggestion.severity === 'high'
                                ? 'bg-red-100 text-red-800'
                                : suggestion.severity === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {suggestion.type}
                            </span>
                            {!appliedSuggestions.has(suggestion.id) && (
                              <button
                                onClick={() => applySuggestion(suggestion)}
                                disabled={isApplyingSuggestion}
                                className="ml-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {isApplyingSuggestion ? 'Applying...' : 'Apply'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      {appliedSuggestions.has(suggestion.id) && (
                        <p className="text-xs text-green-600 mt-2 font-medium">
                          ✓ Applied to script
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">
                    Upload a script and click "Analyze" to get AI-powered suggestions for improvement.
                  </p>
                </div>
              )}
            </div>

            {/* Recent Drafts */}
            {drafts.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Drafts</h3>
                <div className="space-y-2">
                  {drafts.map((draft) => (
                    <button
                      key={draft.id}
                      onClick={() => {
                        setScriptContent(draft.content);
                        setCurrentDraftName(draft.name);
                        setShowUploadArea(false);
                        addToHistory(draft.content);
                      }}
                      className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900 text-sm truncate">
                        {draft.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(draft.timestamp).toLocaleString()}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ScriptDoctor;