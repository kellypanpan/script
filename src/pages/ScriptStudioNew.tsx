import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Volume2, 
  RotateCcw, 
  FileText, 
  Download,
  Settings,
  Wand2,
  Lightbulb,
  ChevronRight,
  ChevronDown,
  Save,
  Type,
  Clock,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  RefreshCw,
  Copy,
  Eye,
  History,
  Sidebar,
  Play,
  Maximize
} from 'lucide-react';
// import { generateScript } from '../utils/scriptGenerator'; // 移除本地生成器
import { analyzeScript, rewriteText } from '../api/script-doctor';
import { exportScript } from '../utils/pdfExporter';
import { sampleScripts, getRandomScript } from '../data/sampleScripts';
import { shortFilmIdeas } from '../data/shortFilmIdeas';
import { getRandomCharacter } from '../data/characterIdeas';
import appConfig from '../config/app';
import { useAuthWithFallback } from '../components/AuthProvider';
import ProjectContext from '../components/ProjectContext';
import VersionHistory from '../components/VersionHistory';
import LoginPrompt from '../components/LoginPrompt';
import FullscreenEditor from '../components/FullscreenEditor';
import { VersionHistoryManager } from '../utils/versionHistory';

interface ScriptGenerationInput {
  genre: string;
  keywords: string;
  characters: string[];
  tone: 'casual' | 'professional' | 'humorous' | 'dramatic';
  maxLength: 'short' | 'default' | 'extended';
  platform: 'tiktok' | 'reels' | 'youtube' | 'general';
}

const ScriptStudioNew: React.FC = () => {
  const { user, hasFeature, isAuthenticated } = useAuthWithFallback();
  
  // Script generation and editing state
  const [scriptInput, setScriptInput] = useState<ScriptGenerationInput>({
    genre: 'comedy',
    keywords: '',
    characters: [],
    tone: 'casual',
    maxLength: 'default',
    platform: 'general'
  });
  const [newCharacter, setNewCharacter] = useState('');
  const [scriptContent, setScriptContent] = useState(''); // Main editable content
  const [scriptFormat, setScriptFormat] = useState<'fountain' | 'screenplay' | 'dialogue' | 'treatment'>('fountain');
  const [isGenerating, setIsGenerating] = useState(false);
  const [outputFormat, setOutputFormat] = useState('shooting-script');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Project management state
  const [currentProject, setCurrentProject] = useState<any | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  
  // Version history state
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // UI state
  const [leftPanelWidth, setLeftPanelWidth] = useState(320);
  const [rightPanelWidth, setRightPanelWidth] = useState(300);
  const [aiPanelExpanded, setAiPanelExpanded] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // AI Assistant state
  const [selectedText, setSelectedText] = useState('');
  const [selectedStart, setSelectedStart] = useState(0);
  const [selectedEnd, setSelectedEnd] = useState(0);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiPreviewOpen, setAiPreviewOpen] = useState(false);
  const [currentAiAction, setCurrentAiAction] = useState('');
  
  // Undo/Redo functionality
  const [scriptHistory, setScriptHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Script statistics
  const [scriptStats, setScriptStats] = useState({
    wordCount: 0,
    estimatedDuration: '0s',
    scenes: 0,
    characters: 0
  });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Auto-save cleanup function
  const autoSaveCleanup = useRef<(() => void) | null>(null);

  // Login prompt state
  const [loginPrompt, setLoginPrompt] = useState({
    isOpen: false,
    title: '',
    message: '',
    actionType: 'login' as 'login' | 'upgrade'
  });

  // Setup auto-save for version history
  useEffect(() => {
    if (currentProject && user && autoSaveEnabled) {
      autoSaveCleanup.current = VersionHistoryManager.setupAutoSave(
        currentProject.id,
        user.id,
        () => scriptContent,
        () => currentProject.title
      );
    }

    return () => {
      if (autoSaveCleanup.current) {
        autoSaveCleanup.current();
        autoSaveCleanup.current = null;
      }
    };
  }, [currentProject, user, scriptContent, autoSaveEnabled]);

  // Save version manually
  const saveVersion = useCallback((message?: string, isMajorVersion = false) => {
    if (currentProject && user) {
      VersionHistoryManager.saveVersion(
        currentProject.id,
        user.id,
        scriptContent,
        currentProject.title,
        message,
        false,
        isMajorVersion
      );
    }
  }, [currentProject, user, scriptContent]);

  // Handle version restore
  const handleVersionRestore = useCallback((content: string, title: string) => {
    setScriptContent(content);
    if (currentProject) {
      const updatedProject = { ...currentProject, title, content };
      setCurrentProject(updatedProject);
      // Update localStorage
      const projects = JSON.parse(localStorage.getItem('scriptProjects') || '[]');
      const index = projects.findIndex((p: any) => p.id === currentProject.id);
      if (index >= 0) {
        projects[index] = updatedProject;
        localStorage.setItem('scriptProjects', JSON.stringify(projects));
      }
    }
  }, [currentProject]);

  // Show login prompt helper
  const showLoginPrompt = useCallback((title: string, message: string, actionType: 'login' | 'upgrade' = 'login') => {
    setLoginPrompt({
      isOpen: true,
      title,
      message,
      actionType
    });
  }, []);

  // Calculate script statistics
  const updateScriptStats = useCallback((content: string) => {
    const words = content.split(/\s+/).filter(word => word.length > 0).length;
    const scenes = (content.match(/^(INT\.|EXT\.)/gm) || []).length;
    const characterNames = new Set(
      (content.match(/^[A-Z][A-Z\s]+$/gm) || [])
        .filter(line => line.trim().length < 30)
    ).size;
    
    // Rough estimation: 150 words per minute for script reading
    const estimatedMinutes = Math.ceil(words / 150);
    const estimatedDuration = estimatedMinutes > 0 
      ? `${Math.floor(estimatedMinutes / 60)}:${(estimatedMinutes % 60).toString().padStart(2, '0')}`
      : `${Math.ceil(words / 2.5)}s`; // For very short scripts, estimate in seconds

    setScriptStats({
      wordCount: words,
      estimatedDuration,
      scenes,
      characters: characterNames
    });
  }, []);

  // Auto-save functionality
  const autoSave = useCallback(() => {
    if (currentProject && scriptContent) {
      try {
        // Update current project with latest content
        const updatedProject = {
          ...currentProject,
          content: scriptContent,
          lastEdited: new Date(),
          wordCount: scriptStats.wordCount,
          estimatedDuration: scriptStats.estimatedDuration,
          sceneCount: scriptStats.scenes,
          version: currentProject.version + 1
        };
        
        // Update in localStorage
        const savedProjects = localStorage.getItem('scriptProjects');
        if (savedProjects) {
          const projects = JSON.parse(savedProjects);
          const projectIndex = projects.findIndex((p: any) => p.id === currentProject.id);
          if (projectIndex !== -1) {
            projects[projectIndex] = updatedProject;
            localStorage.setItem('scriptProjects', JSON.stringify(projects));
            setCurrentProject(updatedProject);
            setLastSaved(new Date());
            console.log('Auto-saved project:', updatedProject.title);
          }
        }
      } catch (error) {
        console.error('Failed to auto-save project:', error);
      }
    }
  }, [currentProject, scriptContent, scriptStats]);

  // Manual save function
  const handleSaveProject = useCallback(() => {
    if (!scriptContent) {
      alert('No content to save');
      return;
    }

    // If no current project, create a new one
    if (!currentProject) {
      const newProject = {
        id: Date.now().toString(),
        title: `Script ${new Date().toLocaleDateString()}`,
        content: scriptContent,
        genre: scriptInput.genre,
        platform: scriptInput.platform,
        tags: scriptInput.keywords.split(',').map(k => k.trim()).filter(k => k),
        createdAt: new Date(),
        lastEdited: new Date(),
        wordCount: scriptStats.wordCount,
        estimatedDuration: scriptStats.estimatedDuration,
        sceneCount: scriptStats.scenes,
        version: 1,
        isTemplate: false
      };
      
      // Save to localStorage
      const savedProjects = localStorage.getItem('scriptProjects');
      const projects = savedProjects ? JSON.parse(savedProjects) : [];
      projects.unshift(newProject);
      localStorage.setItem('scriptProjects', JSON.stringify(projects));
      setCurrentProject(newProject);
      setLastSaved(new Date());
      
      console.log('New project created and saved:', newProject.title);
      alert('New project created and saved successfully!');
      return;
    }

    try {
      // Update current project with latest content
      const updatedProject = {
        ...currentProject,
        content: scriptContent,
        lastEdited: new Date(),
        wordCount: scriptStats.wordCount,
        estimatedDuration: scriptStats.estimatedDuration,
        sceneCount: scriptStats.scenes,
        version: currentProject.version + 1
      };
      
      // Update in localStorage
      const savedProjects = localStorage.getItem('scriptProjects');
      if (savedProjects) {
        const projects = JSON.parse(savedProjects);
        const projectIndex = projects.findIndex((p: any) => p.id === currentProject.id);
        if (projectIndex !== -1) {
          projects[projectIndex] = updatedProject;
          localStorage.setItem('scriptProjects', JSON.stringify(projects));
          setCurrentProject(updatedProject);
          setLastSaved(new Date());
          
          console.log('Project saved manually:', updatedProject.title);
          alert('Project saved successfully!');
        }
      }
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Failed to save project. Please try again.');
    }
  }, [currentProject, scriptContent, scriptStats]);

  // Handle script content changes
  const handleScriptChange = (content: string) => {
    setScriptContent(content);
    updateScriptStats(content);
    
    // Add to history for undo/redo
    addToHistory(content);
    
    // Auto-save after 2 seconds of no typing
    const timeoutId = setTimeout(autoSave, 2000);
    return () => clearTimeout(timeoutId);
  };

  // Add to undo/redo history
  const addToHistory = (content: string) => {
    const newHistory = scriptHistory.slice(0, historyIndex + 1);
    newHistory.push(content);
    
    // Limit history to 50 items
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(prev => prev + 1);
    }
    
    setScriptHistory(newHistory);
  };

  // Undo function
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevContent = scriptHistory[prevIndex];
      setScriptContent(prevContent);
      updateScriptStats(prevContent);
      setHistoryIndex(prevIndex);
    }
  };

  // Redo function
  const handleRedo = () => {
    if (historyIndex < scriptHistory.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextContent = scriptHistory[nextIndex];
      setScriptContent(nextContent);
      updateScriptStats(nextContent);
      setHistoryIndex(nextIndex);
    }
  };

  // Project loading on mount
  useEffect(() => {
    const loadProject = async () => {
      setIsLoadingProject(true);
      
      try {
        // Check if coming from Dashboard with editing project
        const editingProjectData = localStorage.getItem('editingProject');
        if (editingProjectData) {
          const project = JSON.parse(editingProjectData);
          setCurrentProject(project);
          setScriptContent(project.content || '');
          updateScriptStats(project.content || '');
          
          // Update script input based on project data
          setScriptInput({
            genre: project.genre || 'comedy',
            keywords: project.tags?.join(', ') || '',
            characters: [],
            tone: 'casual',
            maxLength: 'default',
            platform: project.platform || 'general'
          });
          
          // Clear the temporary data
          localStorage.removeItem('editingProject');
          console.log('Loaded project for editing:', project.title);
        } else {
          // Check URL params for template loading
          const urlParams = new URLSearchParams(window.location.search);
          const template = urlParams.get('template');
          
          if (template) {
            // Set script input based on template
            switch (template) {
              case 'tiktok':
                setScriptInput(prev => ({ ...prev, platform: 'tiktok', maxLength: 'short' }));
                break;
              case 'youtube':
                setScriptInput(prev => ({ ...prev, platform: 'youtube', maxLength: 'default' }));
                break;
              case 'commercial':
                setScriptInput(prev => ({ ...prev, platform: 'general', genre: 'commercial' }));
                break;
              default:
                break;
            }
            console.log('Loaded template:', template);
          }
        }
      } catch (error) {
        console.error('Failed to load project:', error);
      } finally {
        setIsLoadingProject(false);
      }
    };

    loadProject();
  }, [updateScriptStats]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
    } else if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      handleRedo();
    } else if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      handleSaveProject();
    }
  };

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportMenu) {
        const target = event.target as HTMLElement;
        if (!target.closest('.export-dropdown')) {
          setShowExportMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

  // Convert script format based on output format
  const convertScriptFormat = (script: string, format: string): string => {
    if (!script) return script;
    
    const lines = script.split('\n').filter(line => line.trim());
    
    switch (format) {
      case 'dialog-only':
        return lines
          .filter(line => {
            const trimmed = line.trim();
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
            return !trimmed.match(/^[A-Z][A-Z\s]+$/) && 
                   !trimmed.match(/^\(.+\)$/) &&
                   trimmed.length > 0;
          })
          .map(line => {
            if (line.match(/^(INT\.|EXT\.)/)) {
              return line.replace(/^(INT\.|EXT\.\s*)/, '').replace(/\s*–\s*DAY|NIGHT$/i, '');
            }
            return line;
          })
          .join(' ');
          
      case 'shooting-script':
      default:
        return script;
    }
  };

  // Generate script function
  const handleGenerateScript = async () => {
    if (!scriptInput.keywords.trim()) {
      alert('Please enter some keywords or story ideas');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('🎬 Starting AI script generation...');
      
      // 调用我们的 API 而不是本地生成器
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          genre: scriptInput.genre,
          keywords: scriptInput.keywords,
          characters: scriptInput.characters,
          tone: scriptInput.tone,
          maxLength: scriptInput.maxLength,
          platform: scriptInput.platform
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.script) {
        console.log('✅ AI script generated successfully!');
        const formattedScript = convertScriptFormat(data.script, outputFormat);
        setScriptContent(formattedScript);
        updateScriptStats(formattedScript);
        addToHistory(formattedScript);
        setLastSaved(new Date());
      } else {
        throw new Error(data.error || 'API returned invalid response');
      }
    } catch (error) {
      console.error('Script generation error:', error);
      alert('Failed to generate AI script: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsGenerating(false);
    }
  };

  // Load sample script
  const loadSample = () => {
    const sample = getRandomScript();
    const formattedScript = convertScriptFormat(sample.script, outputFormat);
    setScriptContent(formattedScript);
    updateScriptStats(formattedScript);
    setScriptInput({
      ...scriptInput,
      genre: sample.genre.toLowerCase(),
      keywords: sample.title,
      tone: 'professional' // Set a default tone since sample doesn't have tone property
    });
    // Initialize history with loaded script
    setScriptHistory([formattedScript]);
    setHistoryIndex(0);
  };

  // Export script in specific format
  const handleExport = async (format: 'pdf' | 'fdx' | 'txt') => {
    // Check permissions based on format
    if (format === 'pdf' && !hasFeature('canExportPDF')) {
      showLoginPrompt(
        'Unlock PDF Export',
        'Create a free account to export your scripts as PDF files.',
        'login'
      );
      return;
    }
    
    if (format === 'fdx' && !hasFeature('canExportFDX')) {
      showLoginPrompt(
        'Unlock FDX Export',
        'Upgrade to Pro to export scripts in Final Draft format (FDX).',
        'upgrade'
      );
      return;
    }
    
    if (!scriptContent.trim()) {
      alert('No script content to export');
      return;
    }

    try {
      const { blob, filename } = await exportScript(scriptContent, format, {
        title: scriptInput.keywords || 'Untitled Script'
      });
      
      // Create download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Close export menu
      setShowExportMenu(false);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // Add character
  const addCharacter = () => {
    if (newCharacter.trim() && !scriptInput.characters.includes(newCharacter.trim()) && scriptInput.characters.length < 5) {
      setScriptInput({
        ...scriptInput,
        characters: [...scriptInput.characters, newCharacter.trim()]
      });
      setNewCharacter('');
    }
  };

  // Remove character
  const removeCharacter = (character: string) => {
    setScriptInput({
      ...scriptInput,
      characters: scriptInput.characters.filter(c => c !== character)
    });
  };

  // Suggest idea
  const suggestIdea = () => {
    const randomIdea = shortFilmIdeas[Math.floor(Math.random() * shortFilmIdeas.length)];
    setScriptInput(prev => ({ ...prev, keywords: randomIdea }));
  };

  // Suggest random character
  const suggestRandomCharacter = () => {
    const randomCharacter = getRandomCharacter();
    setNewCharacter(randomCharacter);
  };

  // Clear script
  const clearScript = () => {
    const emptyContent = '';
    setScriptContent(emptyContent);
    setScriptStats({ wordCount: 0, estimatedDuration: '0s', scenes: 0, characters: 0 });
    // Reset history
    setScriptHistory([emptyContent]);
    setHistoryIndex(0);
  };


  // Handle text selection for AI features
  const handleTextSelection = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const selected = scriptContent.substring(start, end);
      
      if (selected.trim()) {
        setSelectedText(selected);
        setSelectedStart(start);
        setSelectedEnd(end);
      }
    }
  };

  // AI Rewrite function
  const handleAiRewrite = async (action: string) => {
    if (!selectedText.trim()) {
      alert('Please select text to rewrite.');
      return;
    }

    if (!hasFeature('canUseAI')) {
      showLoginPrompt(
        'Unlock AI Features',
        'Upgrade to Pro to access AI-powered script rewriting and suggestions.',
        'upgrade'
      );
      return;
    }

    setIsAiProcessing(true);
    setCurrentAiAction(action);
    
    try {
      const result = await rewriteText({
        text: selectedText,
        context: scriptContent.substring(Math.max(0, selectedStart - 100), selectedEnd + 100),
        tone: scriptInput.tone,
        genre: scriptInput.genre,
        preserveStructure: action !== 'expand'
      });

      if (result && result.options) {
        setAiSuggestions(result.options);
        setAiPreviewOpen(true);
      } else {
        alert('AI rewrite failed: No suggestions returned');
      }
    } catch (error) {
      console.error('AI rewrite error:', error);
      alert('AI rewrite failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Apply AI suggestion
  const applyAiSuggestion = (suggestion: string) => {
    const newContent = scriptContent.substring(0, selectedStart) + suggestion + scriptContent.substring(selectedEnd);
    setScriptContent(newContent);
    updateScriptStats(newContent);
    addToHistory(newContent);
    
    // Clear selection and suggestions
    setSelectedText('');
    setAiSuggestions([]);
    setAiPreviewOpen(false);
  };

  // Audio playback
  const toggleAudioPlayback = () => {
    if (!hasFeature('canPlayAudio')) {
      showLoginPrompt(
        'Unlock Audio Features',
        'Upgrade to Pro to listen to your scripts with text-to-speech.',
        'upgrade'
      );
      return;
    }

    if (!scriptContent.trim()) {
      alert('No script content to play');
      return;
    }

    if (isPlayingAudio) {
      // Stop audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      speechSynthesis.cancel(); // Stop any ongoing speech synthesis
      setIsPlayingAudio(false);
    } else {
      // Start audio
      try {
        const utterance = new SpeechSynthesisUtterance(scriptContent);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        
        utterance.onstart = () => setIsPlayingAudio(true);
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => {
          setIsPlayingAudio(false);
          alert('Audio playback failed');
        };
        
        speechSynthesis.speak(utterance);
      } catch (error) {
        alert('Audio playback not supported in this browser');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" onKeyDown={handleKeyDown}>
      <ProjectContext />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Pro Features Banner */}
        {!hasFeature('canUseAI') && (
          <div className="mb-6 bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Sparkles className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Unlock Pro Features</h3>
                  <p className="text-xs text-gray-600">
                    Get AI script rewriting, audio preview, PDF/FDX exports and more
                  </p>
                </div>
              </div>
              <Link
                to="/pricing"
                className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
              >
                Upgrade to Pro
              </Link>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Script Studio</h1>
              <p className="text-gray-600 text-sm">Create professional scripts with AI assistance</p>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              {lastSaved && (
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              )}
              <div className="flex items-center space-x-1">
                <Type className="w-4 h-4" />
                <span>{scriptStats.wordCount} words</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>~{scriptStats.estimatedDuration}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Three Column Layout */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Panel - Script Setup */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Script Setup</h2>
              
              {/* Story Ideas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Story Ideas & Keywords
                </label>
                <textarea
                  value={scriptInput.keywords}
                  onChange={(e) => setScriptInput({...scriptInput, keywords: e.target.value})}
                  placeholder="Describe your story idea, characters, or keywords..."
                  className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                />
                <button
                  onClick={suggestIdea}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                >
                  💡 Get random idea
                </button>
              </div>

              {/* Characters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Characters ({scriptInput.characters.length}/5)
                </label>
                <div className="flex mb-2">
                  <input
                    type="text"
                    value={newCharacter}
                    onChange={(e) => setNewCharacter(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCharacter()}
                    placeholder="Character name"
                    className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={addCharacter}
                    disabled={!newCharacter.trim() || scriptInput.characters.length >= 5}
                    className="px-3 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Add
                  </button>
                </div>
                <button
                  onClick={suggestRandomCharacter}
                  className="mb-2 text-xs text-blue-600 hover:text-blue-800"
                >
                  🎭 Get random character
                </button>
                <div className="flex flex-wrap gap-1">
                  {scriptInput.characters.map((character, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {character}
                      <button
                        onClick={() => removeCharacter(character)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
                  <select
                    value={scriptInput.genre}
                    onChange={(e) => setScriptInput({...scriptInput, genre: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="comedy">Comedy</option>
                    <option value="drama">Drama</option>
                    <option value="action">Action</option>
                    <option value="romance">Romance</option>
                    <option value="thriller">Thriller</option>
                    <option value="horror">Horror</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                  <select
                    value={scriptInput.tone}
                    onChange={(e) => setScriptInput({...scriptInput, tone: e.target.value as any})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="casual">Casual</option>
                    <option value="professional">Professional</option>
                    <option value="humorous">Humorous</option>
                    <option value="dramatic">Dramatic</option>
                  </select>
                </div>
              </div>

              {/* Length & Platform */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Length</label>
                  <select
                    value={scriptInput.maxLength}
                    onChange={(e) => setScriptInput({...scriptInput, maxLength: e.target.value as any})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="short">Short (15-30s)</option>
                    <option value="default">Medium (1-3min)</option>
                    <option value="extended">Long (5min+)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                  <select
                    value={scriptInput.platform}
                    onChange={(e) => setScriptInput({...scriptInput, platform: e.target.value as any})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="general">General</option>
                    <option value="tiktok">TikTok</option>
                    <option value="reels">Instagram Reels</option>
                    <option value="youtube">YouTube</option>
                  </select>
                </div>
              </div>

              {/* Output Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Output Format</label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="shooting-script">Full Shooting Script</option>
                  <option value="dialog-only">Dialogue Only</option>
                  <option value="voiceover">Voiceover Script</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleGenerateScript}
                  disabled={isGenerating || !scriptInput.keywords.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Script</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={loadSample}
                  className="w-full border-2 border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                >
                  Load Sample Script
                </button>
                
                <button
                  onClick={clearScript}
                  className="w-full text-gray-500 hover:text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                >
                  Clear Script
                </button>
              </div>
            </div>
          </div>

          {/* Middle Panel - Script Editor */}
          <div className="col-span-12 lg:col-span-6">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Editor Header */}
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Script Editor</h3>
                  <div className="flex items-center space-x-2">
                    {/* Undo/Redo */}
                    <button
                      onClick={handleUndo}
                      disabled={historyIndex <= 0}
                      className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Undo (Ctrl+Z)"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleRedo}
                      disabled={historyIndex >= scriptHistory.length - 1}
                      className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Redo (Ctrl+Y)"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    
                    {/* Audio Playback */}
                    <button
                      onClick={toggleAudioPlayback}
                      className={`p-2 rounded-lg transition-colors relative ${
                        isPlayingAudio 
                          ? 'bg-red-100 text-red-600' 
                          : !hasFeature('canPlayAudio')
                            ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                      title={!hasFeature('canPlayAudio') ? 'Upgrade to Pro for Audio Features' : 'Play/Stop Audio'}
                    >
                      {isPlayingAudio ? <X className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      {!hasFeature('canPlayAudio') && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                          🔒
                        </span>
                      )}
                    </button>

                    {/* Export Dropdown */}
                    <div className="relative export-dropdown">
                      <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        className="flex items-center space-x-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {showExportMenu && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <div className="py-1">
                            <button
                              onClick={() => handleExport('txt')}
                              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              <div className="text-left">
                                <div className="font-medium">Text File (.txt)</div>
                                <div className="text-xs text-gray-500">Plain text format</div>
                              </div>
                            </button>
                            
                            <button
                              onClick={() => handleExport('pdf')}
                              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              <div className="text-left">
                                <div className="font-medium">PDF File (.pdf)</div>
                                <div className="text-xs text-gray-500">Professional format</div>
                              </div>
                              {!hasFeature('canExportPDF') && (
                                <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Login</span>
                              )}
                            </button>
                            
                            <button
                              onClick={() => handleExport('fdx')}
                              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              <div className="text-left">
                                <div className="font-medium">Final Draft (.fdx)</div>
                                <div className="text-xs text-gray-500">Industry standard</div>
                              </div>
                              {!hasFeature('canExportFDX') && (
                                <span className="ml-auto text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Pro</span>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Fullscreen Button */}
                    <button
                      onClick={() => setIsFullscreen(true)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Fullscreen Editor"
                    >
                      <Maximize className="w-4 h-4" />
                    </button>

                    {/* Save */}
                    <button
                      onClick={handleSaveProject}
                      className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>

                    {/* Version History */}
                    {user && (
                      <button
                        onClick={() => setShowVersionHistory(true)}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Version History"
                      >
                        <History className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Editor Content */}
              <div className="p-4">
                {scriptContent ? (
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={scriptContent}
                      onChange={(e) => handleScriptChange(e.target.value)}
                      onMouseUp={handleTextSelection}
                      onKeyUp={handleTextSelection}
                      className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm leading-relaxed"
                      placeholder="Your generated script will appear here..."
                      style={{ fontFamily: 'Courier New, monospace' }}
                    />
                    
                    {/* Character count */}
                    <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded">
                      {scriptContent.length} chars
                    </div>
                  </div>
                ) : (
                  <div className="h-96 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Create</h3>
                      <p className="text-gray-500 mb-4">
                        Enter your story ideas and click "Generate Script" to get started
                      </p>
                      <div className="text-sm text-gray-400">
                        Or load a sample script to see how it works
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - AI Assistant */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
                <button
                  onClick={() => setAiPanelExpanded(!aiPanelExpanded)}
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  {aiPanelExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>

              {/* Selected Text Actions */}
              {selectedText && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm font-medium text-blue-900 mb-2">
                    Selected: "{selectedText.substring(0, 30)}{selectedText.length > 30 ? '...' : ''}"
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleAiRewrite('improve')}
                      disabled={isAiProcessing || !hasFeature('canUseAI')}
                      className={`w-full px-3 py-2 rounded text-sm transition-colors ${
                        !hasFeature('canUseAI') 
                          ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white cursor-pointer hover:from-orange-500 hover:to-orange-600' 
                          : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                      }`}
                    >
                      {!hasFeature('canUseAI') 
                        ? '🔒 Upgrade for AI Features' 
                        : isAiProcessing && currentAiAction === 'improve' 
                          ? 'Improving...' 
                          : 'Improve'
                      }
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleAiRewrite('shorten')}
                        disabled={isAiProcessing || !hasFeature('canUseAI')}
                        className={`px-2 py-1 rounded text-xs transition-colors ${
                          !hasFeature('canUseAI')
                            ? 'bg-gray-400 text-gray-200 cursor-pointer'
                            : 'bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50'
                        }`}
                      >
                        {!hasFeature('canUseAI') ? '🔒 Pro' : 'Shorten'}
                      </button>
                      <button
                        onClick={() => handleAiRewrite('expand')}
                        disabled={isAiProcessing || !hasFeature('canUseAI')}
                        className={`px-2 py-1 rounded text-xs transition-colors ${
                          !hasFeature('canUseAI')
                            ? 'bg-gray-400 text-gray-200 cursor-pointer'
                            : 'bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50'
                        }`}
                      >
                        {!hasFeature('canUseAI') ? '🔒 Pro' : 'Expand'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Suggestions */}
              <AnimatePresence>
                {aiPreviewOpen && aiSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-2"
                  >
                    <h4 className="text-sm font-medium text-gray-900">AI Suggestions:</h4>
                    {aiSuggestions.map((suggestion, index) => (
                      <div key={index} className="p-2 border border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-700 mb-2">{suggestion}</p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => applyAiSuggestion(suggestion)}
                            className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                          >
                            Apply
                          </button>
                          <button
                            onClick={() => {
                              setAiSuggestions(aiSuggestions.filter((_, i) => i !== index));
                              if (aiSuggestions.length === 1) setAiPreviewOpen(false);
                            }}
                            className="bg-gray-400 text-white px-2 py-1 rounded text-xs hover:bg-gray-500"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Script Statistics */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">Script Statistics</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Words:</span>
                    <span>{scriptStats.wordCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Scenes:</span>
                    <span>{scriptStats.scenes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Characters:</span>
                    <span>{scriptStats.characters}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. Duration:</span>
                    <span>{scriptStats.estimatedDuration}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Version History Modal */}
      <AnimatePresence>
        {showVersionHistory && currentProject && user && (
          <VersionHistory
            projectId={currentProject.id}
            userId={user.id}
            isOpen={showVersionHistory}
            onClose={() => setShowVersionHistory(false)}
            onRestore={handleVersionRestore}
          />
        )}
      </AnimatePresence>

      {/* Login Prompt Modal */}
      <LoginPrompt
        isOpen={loginPrompt.isOpen}
        onClose={() => setLoginPrompt(prev => ({ ...prev, isOpen: false }))}
        title={loginPrompt.title}
        message={loginPrompt.message}
        actionType={loginPrompt.actionType}
      />

      {/* Fullscreen Editor */}
      <FullscreenEditor
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        content={scriptContent}
        onChange={(newContent) => {
          setScriptContent(newContent);
          addToHistory(newContent);
          updateScriptStats(newContent);
        }}
        title="AI Script Studio - Fullscreen Editor"
        placeholder="Your generated script will appear here..."
        onSave={handleSaveProject}
        onExport={() => {
          if (scriptContent) {
            const blob = new Blob([scriptContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${currentProject?.title || 'script'}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
        }}
      />
    </div>
  );
};

export default ScriptStudioNew;