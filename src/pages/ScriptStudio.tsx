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
  Sidebar
} from 'lucide-react';
import { generateScript } from '../utils/scriptGenerator';
import { analyzeScript, rewriteText } from '../api/script-doctor';
import { exportScript } from '../utils/pdfExporter';
import { sampleScripts, getRandomScript } from '../data/sampleScripts';
import { shortFilmIdeas } from '../data/shortFilmIdeas';
import appConfig from '../config/app';
import { useAuthWithFallback } from '../components/AuthProvider';
import ProjectContext from '../components/ProjectContext';
import ProfessionalScriptEditor from '../components/ProfessionalScriptEditor';
import VersionHistory from '../components/VersionHistory';
import LoginPrompt from '../components/LoginPrompt';
import { VersionHistoryManager } from '../utils/versionHistory';

interface ScriptGenerationInput {
  genre: string;
  keywords: string;
  characters: string[];
  tone: 'casual' | 'professional' | 'humorous' | 'dramatic';
  maxLength: 'short' | 'default' | 'extended';
  platform: 'tiktok' | 'reels' | 'youtube' | 'general';
}

const ScriptStudio: React.FC = () => {
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
    if (!currentProject || !scriptContent) {
      alert('No project to save or content is empty');
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

  // Load sample script
  const loadSampleScript = (index: number) => {
    const script = sampleScripts[index].script;
    const formattedScript = convertScriptFormat(script, outputFormat);
    setScriptContent(formattedScript);
    updateScriptStats(formattedScript);
    // Initialize history with loaded script
    setScriptHistory([formattedScript]);
    setHistoryIndex(0);
  };

  // Load random sample
  const loadRandomSample = () => {
    const randomScript = getRandomScript();
    const formattedScript = convertScriptFormat(randomScript.script, outputFormat);
    setScriptContent(formattedScript);
    updateScriptStats(formattedScript);
    // Initialize history with loaded script
    setScriptHistory([formattedScript]);
    setHistoryIndex(0);
  };

  // Suggest idea
  const suggestIdea = () => {
    const randomIdea = shortFilmIdeas[Math.floor(Math.random() * shortFilmIdeas.length)];
    setScriptInput(prev => ({ ...prev, keywords: randomIdea }));
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

  // Add character
  const addCharacter = () => {
    if (newCharacter.trim() && scriptInput.characters.length < 5) {
      setScriptInput(prev => ({
        ...prev,
        characters: [...prev.characters, newCharacter.trim()]
      }));
      setNewCharacter('');
    }
  };

  // Remove character
  const removeCharacter = (index: number) => {
    setScriptInput(prev => ({
      ...prev,
      characters: prev.characters.filter((_, i) => i !== index)
    }));
  };

  // Generate script
  const handleGenerateScript = async () => {
    if (!scriptInput.genre || (!scriptInput.keywords && scriptInput.characters.length === 0)) {
      alert('Please provide at least a genre and keywords or characters.');
      return;
    }

    setIsGenerating(true);

    try {
      let script;
      
      // Try API first, fallback to local generation
      try {
        const response = await fetch('http://localhost:4000/api/generate-script', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(scriptInput),
        });

        if (response.ok) {
          const data = await response.json();
          script = data.script;
        } else {
          throw new Error('API failed');
        }
      } catch (apiError) {
        console.warn('API failed, using local generation:', apiError);
        script = generateScript(scriptInput);
      }

      const formattedScript = convertScriptFormat(script, outputFormat);
      setScriptContent(formattedScript);
      updateScriptStats(formattedScript);
      // Initialize history with generated script
      setScriptHistory([formattedScript]);
      setHistoryIndex(0);

    } catch (error) {
      console.error('Script generation failed:', error);
      alert('Failed to generate script. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle format change
  const handleFormatChange = (newFormat: string) => {
    setOutputFormat(newFormat);
    if (scriptContent) {
      // We need the raw script to reconvert, for now just keep current content
      // In a real implementation, you'd store both raw and formatted versions
    }
  };

  // Export script
  const handleExportScript = async (format: 'fdx' | 'pdf' | 'txt') => {
    if (!scriptContent) {
      alert('No script to export');
      return;
    }

    try {
      const { blob, filename } = await exportScript(scriptContent, format, {
        title: 'My Script',
        author: user?.name || 'ScriptStudio User'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  // Handle text selection for AI features
  const handleTextSelection = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = scriptContent.substring(start, end);
      setSelectedText(selected);
      setSelectedStart(start);
      setSelectedEnd(end);
    }
  };

  // AI Assistant functions - Now shows preview instead of auto-applying
  const handleAiAction = async (action: string) => {
    let prompt = '';
    let targetText = selectedText || scriptContent;
    
    if (!targetText.trim()) {
      alert('Please select some text or generate a script first.');
      return;
    }

    setCurrentAiAction(action);
    setIsAiProcessing(true);
    setAiPreviewOpen(true);
    
    try {
      // Define prompts for different actions
      switch (action) {
        case 'improve':
          prompt = `Please improve the following script text while keeping the same structure and format. Make the dialogue more natural and engaging:\n\n${targetText}`;
          break;
        case 'rewrite':
          prompt = `Please rewrite the following script text with different wording but the same meaning and format:\n\n${targetText}`;
          break;
        case 'depth':
          prompt = `Please add more character depth and emotional nuance to the following script text:\n\n${targetText}`;
          break;
        case 'continue':
          prompt = `Please continue this script naturally, maintaining the same tone and style:\n\n${targetText}`;
          break;
        case 'grammar':
          prompt = `Please fix any grammar, spelling, or formatting issues in this script text:\n\n${targetText}`;
          break;
        case 'shorten':
          prompt = `Please shorten the following script text while keeping the essential elements:\n\n${targetText}`;
          break;
        default:
          prompt = `Please improve the following script text:\n\n${targetText}`;
      }

      // Try Script Doctor API for text improvement
      try {
        const rewriteResult = await rewriteText({
          text: targetText,
          context: prompt,
          tone: scriptInput.tone,
          genre: scriptInput.genre,
          preserveStructure: true
        });

        if (rewriteResult.options && rewriteResult.options.length > 0) {
          setAiSuggestions(rewriteResult.options);
        } else {
          throw new Error('No AI result returned');
        }
      } catch (apiError) {
        console.warn('Script Doctor API failed, using fallback processing:', apiError);
        
        // Fallback: Simple text processing
        let fallbackSuggestions: string[] = [];
        switch (action) {
          case 'continue':
            fallbackSuggestions = [
              targetText + '\n\n[AI continuation option 1]',
              targetText + '\n\n[AI continuation option 2]',
              targetText + '\n\n[AI continuation option 3]'
            ];
            break;
          case 'shorten':
            fallbackSuggestions = [
              targetText.split('\n').map(line => line.length > 50 ? line.substring(0, 40) + '...' : line).join('\n'),
              targetText.replace(/\b(very|really|quite|actually)\b/g, '').replace(/\s+/g, ' '),
              targetText.split('.').slice(0, -1).join('.') + '.'
            ];
            break;
          case 'grammar':
            fallbackSuggestions = [
              targetText.replace(/\s+/g, ' ').replace(/([.!?])([a-z])/g, '$1 $2'),
              targetText.replace(/([a-z])([A-Z])/g, '$1 $2'),
              targetText + ' [Grammar checked]'
            ];
            break;
          default:
            fallbackSuggestions = [
              `[${action} option 1]\n\n` + targetText,
              `[${action} option 2]\n\n` + targetText,
              `[${action} option 3]\n\n` + targetText
            ];
        }
        setAiSuggestions(fallbackSuggestions);
      }
      
      console.log(`AI ${action} suggestions generated successfully`);
      
    } catch (error) {
      console.error(`AI ${action} failed:`, error);
      alert(`AI ${action} failed. Please try again.`);
      setAiPreviewOpen(false);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Apply selected AI suggestion
  const applyAiSuggestion = (suggestionIndex: number) => {
    const selectedSuggestion = aiSuggestions[suggestionIndex];
    
    // Add current state to history before making changes
    addToHistory(scriptContent);
    
    // Apply the suggestion
    if (selectedText && selectedStart !== selectedEnd) {
      // Replace selected text
      const newContent = scriptContent.substring(0, selectedStart) + selectedSuggestion + scriptContent.substring(selectedEnd);
      setScriptContent(newContent);
      updateScriptStats(newContent);
    } else if (currentAiAction === 'continue') {
      // Append for continue action
      const newContent = scriptContent + '\n\n' + selectedSuggestion;
      setScriptContent(newContent);
      updateScriptStats(newContent);
    } else {
      // Replace entire content
      setScriptContent(selectedSuggestion);
      updateScriptStats(selectedSuggestion);
    }
    
    // Close preview and clear state
    setAiPreviewOpen(false);
    setAiSuggestions([]);
    setSelectedText('');
    setCurrentAiAction('');
  };

  // Cancel AI suggestion
  const cancelAiSuggestion = () => {
    setAiPreviewOpen(false);
    setAiSuggestions([]);
    setCurrentAiAction('');
  };

  // Regenerate AI suggestions
  const regenerateAiSuggestions = () => {
    if (currentAiAction) {
      handleAiAction(currentAiAction);
    }
  };

  // Audio preview functionality
  const handleAudioPreview = async () => {
    if (!scriptContent) {
      alert('Please generate a script first!');
      return;
    }

    if (isPlayingAudio) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      return;
    }

    try {
      setIsPlayingAudio(true);
      
      // Extract dialogue for TTS
      const extractDialogueForTTS = (script: string): string => {
        const lines = script.split('\n');
        const dialogueLines: string[] = [];
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line || line.match(/^(INT\.|EXT\.|FADE|CUT)/i)) continue;
          
          if (line.match(/^[A-Z][A-Z\s]+$/) && line.length < 30) {
            const nextLine = lines[i + 1]?.trim();
            if (nextLine && !nextLine.match(/^[A-Z][A-Z\s]+$/)) {
              dialogueLines.push(`${line} says:`);
            }
            continue;
          }
          
          if (line && !line.match(/^[A-Z][A-Z\s]+$/) && !line.includes('(') && !line.includes(')')) {
            dialogueLines.push(line);
          }
        }
        
        return dialogueLines.join(' ').substring(0, 500);
      };

      const scriptForTTS = extractDialogueForTTS(scriptContent);
      
      // Use Web Speech API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(scriptForTTS);
        utterance.rate = 1.1;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        
        window.speechSynthesis.speak(utterance);
      } else {
        throw new Error('Speech synthesis not supported');
      }

    } catch (error) {
      console.error('Audio preview error:', error);
      alert(`Audio preview failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Project Context */}
      <ProjectContext currentProject={currentProject} />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🎬 AI Script Studio
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Professional script creation workspace
            </p>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {lastSaved && (
              <div className="flex items-center space-x-1">
                <Save className="w-4 h-4" />
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              </div>
            )}
            <div className="flex items-center space-x-4 text-xs">
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
      </div>

      {/* Main Content - Three Column Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Generation Controls */}
        <div 
          className="bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto"
          style={{ width: leftPanelWidth }}
        >
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              ✨ Generate Script
            </h2>

            {/* Genre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Genre
              </label>
              <select
                value={scriptInput.genre}
                onChange={(e) => setScriptInput(prev => ({ ...prev, genre: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="comedy">Comedy</option>
                <option value="drama">Drama</option>
                <option value="thriller">Thriller</option>
                <option value="horror">Horror</option>
                <option value="romance">Romance</option>
                <option value="action">Action</option>
              </select>
            </div>

            {/* Platform Target */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform Target
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { value: 'tiktok', label: 'TikTok', desc: '15-60s vertical' },
                  { value: 'reels', label: 'Instagram Reels', desc: '15-90s vertical' },
                  { value: 'youtube', label: 'YouTube Shorts', desc: '15-60s vertical' },
                  { value: 'general', label: 'General Short Film', desc: '1-5min any format' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setScriptInput(prev => ({ ...prev, platform: option.value as any }))}
                    className={`p-3 rounded-lg border text-sm transition-colors text-left ${
                      scriptInput.platform === option.value
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

            {/* Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords & Concept
              </label>
              <div className="space-y-2">
                <textarea
                  value={scriptInput.keywords}
                  onChange={(e) => setScriptInput(prev => ({ ...prev, keywords: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg h-20 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Describe your story idea, setting, conflict..."
                />
                <button
                  type="button"
                  onClick={suggestIdea}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm flex items-center justify-center space-x-1"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>Suggest Idea</span>
                </button>
              </div>
            </div>

            {/* Characters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Characters
              </label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newCharacter}
                    onChange={(e) => setNewCharacter(e.target.value)}
                    placeholder="Character name"
                    className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && addCharacter()}
                  />
                  <button
                    onClick={addCharacter}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                    disabled={scriptInput.characters.length >= 5}
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {scriptInput.characters.map((char, idx) => (
                      <motion.span
                        key={char}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                      >
                        {char}
                        <button
                          onClick={() => removeCharacter(idx)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Tone & Style */}
            <div>
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
                    onClick={() => setScriptInput(prev => ({ ...prev, tone: option.value as any }))}
                    className={`p-2 rounded-lg border text-sm font-medium transition-colors ${
                      scriptInput.tone === option.value
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Script Length */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Script Length
              </label>
              <div className="space-y-2">
                {[
                  { value: 'short', label: 'Short (15-30s)' },
                  { value: 'default', label: 'Default (1-3min)' },
                  { value: 'extended', label: 'Extended (5min+)' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setScriptInput(prev => ({ ...prev, maxLength: option.value as any }))}
                    className={`w-full p-2 rounded-lg border text-sm font-medium transition-colors text-left ${
                      scriptInput.maxLength === option.value
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-4 border-t border-gray-200">
              <button 
                onClick={loadRandomSample}
                className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm"
              >
                <Wand2 className="h-4 w-4" />
                <span>Load Sample</span>
              </button>

              <button
                onClick={handleGenerateScript}
                disabled={isGenerating}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Script</span>
                  </>
                )}
              </button>
            </div>

            {/* Sample Scripts */}
            {!scriptContent && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Start</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {sampleScripts.slice(0, 3).map((sample, index) => (
                    <div 
                      key={sample.id}
                      onClick={() => loadSampleScript(index)}
                      className="p-2 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-gray-900 text-xs">{sample.title}</h4>
                        <span className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded">
                          {sample.duration}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{sample.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Panel - Script Editor */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <h3 className="font-medium text-gray-800">Professional Script Editor</h3>
            <div className="flex items-center space-x-2">
              {scriptContent && (
                <>
                  {/* Save Version Button */}
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        showLoginPrompt(
                          'Save Your Work',
                          'Create an account to save versions of your script and never lose your progress.'
                        );
                        return;
                      }
                      saveVersion('Manual save', false);
                    }}
                    className="px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 bg-blue-100 text-blue-800 hover:bg-blue-200"
                    title="Save Current Version"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Version</span>
                  </button>
                  {/* AI Assistant Button */}
                  <button
                    onClick={() => setAiPanelExpanded(!aiPanelExpanded)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                      aiPanelExpanded
                        ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Wand2 className="h-4 w-4" />
                    <span>AI Assistant</span>
                  </button>
                  <button
                    onClick={handleAudioPreview}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                      isPlayingAudio 
                        ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    <Volume2 className="h-4 w-4" />
                    <span>{isPlayingAudio ? 'Stop' : 'Preview'}</span>
                  </button>
                  <button
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Undo (Ctrl+Z)"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleRedo}
                    disabled={historyIndex >= scriptHistory.length - 1}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Redo (Ctrl+Y)"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={clearScript}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Clear script"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* AI Assistant Panel - Now under editor header */}
          <AnimatePresence>
            {aiPanelExpanded && scriptContent && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-b border-gray-200 px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Wand2 className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-800">AI Writing Assistant</span>
                    {isAiProcessing && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="ml-2"
                      >
                        <Settings className="h-3 w-3 text-purple-600" />
                      </motion.div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedText ? `${selectedText.length} chars selected` : 'Select text for targeted suggestions'}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => handleAiAction('improve')}
                    disabled={isAiProcessing}
                    className="text-left p-2 text-xs bg-white rounded border hover:bg-gray-50 transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-sm">💡</span>
                    <span>{isAiProcessing ? 'Processing...' : 'Improve'}</span>
                  </button>
                  <button 
                    onClick={() => handleAiAction('rewrite')}
                    disabled={isAiProcessing}
                    className="text-left p-2 text-xs bg-white rounded border hover:bg-gray-50 transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-sm">✍️</span>
                    <span>{isAiProcessing ? 'Processing...' : 'Rewrite'}</span>
                  </button>
                  <button 
                    onClick={() => handleAiAction('depth')}
                    disabled={isAiProcessing}
                    className="text-left p-2 text-xs bg-white rounded border hover:bg-gray-50 transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-sm">🎭</span>
                    <span>{isAiProcessing ? 'Processing...' : 'Add Depth'}</span>
                  </button>
                  <button 
                    onClick={() => handleAiAction('continue')}
                    disabled={isAiProcessing}
                    className="text-left p-2 text-xs bg-white rounded border hover:bg-gray-50 transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-sm">🔄</span>
                    <span>{isAiProcessing ? 'Processing...' : 'Continue'}</span>
                  </button>
                  <button 
                    onClick={() => handleAiAction('grammar')}
                    disabled={isAiProcessing}
                    className="text-left p-2 text-xs bg-white rounded border hover:bg-gray-50 transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-sm">⚡</span>
                    <span>{isAiProcessing ? 'Processing...' : 'Fix Grammar'}</span>
                  </button>
                  <button 
                    onClick={() => handleAiAction('shorten')}
                    disabled={isAiProcessing}
                    className="text-left p-2 text-xs bg-white rounded border hover:bg-gray-50 transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-sm">🎯</span>
                    <span>{isAiProcessing ? 'Processing...' : 'Shorten'}</span>
                  </button>
                </div>
                
                {/* Selection info */}
                {selectedText && (
                  <div className="mt-2 p-2 bg-white rounded border text-xs text-gray-600">
                    <strong>Selected:</strong> {selectedText.length > 50 ? selectedText.substring(0, 50) + '...' : selectedText}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex-1 overflow-hidden">
            {scriptContent ? (
              <ProfessionalScriptEditor
                content={scriptContent}
                onChange={(content) => {
                  handleScriptChange(content);
                  updateScriptStats(content);
                }}
                format={scriptFormat}
                onFormatChange={setScriptFormat}
                showPreview={true}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-center p-6">
                <div className="space-y-4">
                  <FileText className="w-16 h-16 mx-auto text-gray-300" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      Ready to create your script?
                    </h3>
                    <p className="text-gray-500 max-w-md">
                      Use the controls on the left to generate a new script, or click one of the sample scripts to get started.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <audio ref={audioRef} style={{ display: 'none' }} />
        </div>

        {/* Right Panel - Tools & Export */}
        <div 
          className="bg-white border-l border-gray-200 flex-shrink-0 overflow-y-auto"
          style={{ width: rightPanelWidth }}
        >
          <div className="p-4 space-y-6">
            {/* Format & Preview */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Format</h3>
              
              {/* Format Toggle */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Output Format
                </label>
                <div className="space-y-1">
                  {[
                    { value: 'shooting-script', label: 'Shooting Script', desc: 'Full screenplay format' },
                    { value: 'dialog-only', label: 'Dialog Only', desc: 'Characters and dialogue' },
                    { value: 'voiceover', label: 'Voiceover', desc: 'Narrative format' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFormatChange(option.value)}
                      className={`w-full p-3 rounded-lg border text-left transition-colors ${
                        outputFormat === option.value
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs opacity-75">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Script Statistics */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Statistics</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Words</span>
                  <span className="text-sm font-medium">{scriptStats.wordCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Est. Duration</span>
                  <span className="text-sm font-medium">{scriptStats.estimatedDuration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Scenes</span>
                  <span className="text-sm font-medium">{scriptStats.scenes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Characters</span>
                  <span className="text-sm font-medium">{scriptStats.characters}</span>
                </div>
              </div>
            </div>

            {/* Version History Toggle */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Version History</h3>
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      showLoginPrompt(
                        'Version History',
                        'Track changes, restore previous versions, and collaborate with others. Create an account to unlock version history.'
                      );
                      return;
                    }
                    setShowVersionHistory(!showVersionHistory);
                  }}
                  className={`p-2 rounded-lg transition-colors flex items-center space-x-1 ${
                    showVersionHistory
                      ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <History className="h-4 w-4" />
                  <span className="text-sm">{showVersionHistory ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              
              {showVersionHistory && currentProject && user && (
                <div className="h-64">
                  <VersionHistory
                    projectId={currentProject.id}
                    userId={user.id}
                    currentContent={scriptContent}
                    currentTitle={currentProject.title}
                    onRestoreVersion={handleVersionRestore}
                  />
                </div>
              )}
              
              {isAuthenticated && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="autoSave"
                      checked={autoSaveEnabled}
                      onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="autoSave" className="text-sm text-gray-700">
                      Auto-save every 30s
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Export Options */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Export</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => handleExportScript('txt')}
                  disabled={!scriptContent}
                  className="w-full bg-blue-100 text-blue-700 px-4 py-3 rounded-lg font-medium hover:bg-blue-200 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText className="h-4 w-4" />
                  <span>Export TXT</span>
                </button>
                <button 
                  onClick={() => {
                    if (!scriptContent) return;
                    
                    if (!hasFeature('canExportPDF')) {
                      showLoginPrompt(
                        'Professional Export',
                        'Export your scripts to professional PDF format. Upgrade to Pro for advanced export features.',
                        'upgrade'
                      );
                      return;
                    }
                    
                    handleExportScript('pdf');
                  }}
                  disabled={!scriptContent}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4" />
                  <span>Export PDF</span>
                </button>
                <button 
                  onClick={() => {
                    if (!scriptContent) return;
                    
                    if (!hasFeature('canExportFDX')) {
                      showLoginPrompt(
                        'Final Draft Export',
                        'Export directly to Final Draft format (FDX). Perfect for professional screenwriting workflows. Upgrade to Pro.',
                        'upgrade'
                      );
                      return;
                    }
                    
                    handleExportScript('fdx');
                  }}
                  disabled={!scriptContent}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4" />
                  <span>Export FDX</span>
                </button>
              </div>
            </div>

            {/* AI Assistant moved to editor toolbar */}
          </div>
        </div>
      </div>

      {/* AI Suggestion Preview Modal */}
      <AnimatePresence>
        {aiPreviewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && cancelAiSuggestion()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Wand2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      AI Suggestions - {currentAiAction.charAt(0).toUpperCase() + currentAiAction.slice(1)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedText ? `Selected: ${selectedText.length} chars` : 'Entire script'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={regenerateAiSuggestions}
                    disabled={isAiProcessing}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                    title="Regenerate suggestions"
                  >
                    <RefreshCw className={`h-4 w-4 ${isAiProcessing ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={cancelAiSuggestion}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex max-h-[60vh] overflow-hidden">
                {/* Left: Original Text */}
                <div className="w-1/2 border-r border-gray-200">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>Original Text</span>
                    </h4>
                  </div>
                  <div className="p-4 h-full overflow-y-auto">
                    <div 
                      className="text-sm leading-relaxed text-gray-800 font-mono whitespace-pre-wrap"
                      style={{
                        fontFamily: 'Courier New, monospace',
                        lineHeight: '1.6'
                      }}
                    >
                      {selectedText || scriptContent || 'No content selected'}
                    </div>
                  </div>
                </div>

                {/* Right: AI Suggestions */}
                <div className="w-1/2">
                  <div className="px-4 py-3 bg-blue-50 border-b border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                      <Sparkles className="h-4 w-4" />
                      <span>AI Suggestions</span>
                      {isAiProcessing && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Settings className="h-3 w-3 text-blue-600" />
                        </motion.div>
                      )}
                    </h4>
                  </div>
                  <div className="h-full overflow-y-auto">
                    {isAiProcessing ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="text-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="mx-auto mb-2"
                          >
                            <Sparkles className="h-6 w-6 text-blue-500" />
                          </motion.div>
                          <p className="text-sm text-gray-500">Generating AI suggestions...</p>
                        </div>
                      </div>
                    ) : aiSuggestions.length > 0 ? (
                      <div className="space-y-4 p-4">
                        {aiSuggestions.map((suggestion, index) => (
                          <motion.div
                            key={index}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer group"
                            onClick={() => applyAiSuggestion(index)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                Option {index + 1}
                              </span>
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(suggestion);
                                  }}
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                  title="Copy"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                                <Check className="h-3 w-3 text-green-500" />
                              </div>
                            </div>
                            <div 
                              className="text-sm leading-relaxed text-gray-800 font-mono whitespace-pre-wrap"
                              style={{
                                fontFamily: 'Courier New, monospace',
                                lineHeight: '1.6'
                              }}
                            >
                              {suggestion}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32">
                        <p className="text-sm text-gray-500">No suggestions available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-xs text-gray-500">
                    {aiSuggestions.length > 0 ? (
                      <span>Click on any suggestion to apply it</span>
                    ) : (
                      <span>AI is generating suggestions...</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={cancelAiSuggestion}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={regenerateAiSuggestions}
                    disabled={isAiProcessing}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    <RefreshCw className={`h-4 w-4 ${isAiProcessing ? 'animate-spin' : ''}`} />
                    <span>Try Again</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
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
    </div>
  );
};

export default ScriptStudio;