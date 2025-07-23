import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Minimize, 
  Bold, 
  Italic, 
  Underline, 
  Type,
  AlignCenter,
  Copy,
  Scissors,
  Clipboard,
  Undo2,
  Redo2,
  Save,
  Download
} from 'lucide-react';

interface FullscreenEditorProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onChange: (content: string) => void;
  title: string;
  placeholder?: string;
  showRichToolbar?: boolean;
  onSave?: () => void;
  onExport?: () => void;
}

const FullscreenEditor: React.FC<FullscreenEditorProps> = ({
  isOpen,
  onClose,
  content,
  onChange,
  title,
  placeholder = "Start writing...",
  showRichToolbar = true,
  onSave,
  onExport
}) => {
  const [localContent, setLocalContent] = useState(content);
  const [history, setHistory] = useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync with external content changes
  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Undo/Redo functionality
  const addToHistory = (newContent: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newContent);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const newContent = history[historyIndex - 1];
      setLocalContent(newContent);
      onChange(newContent);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const newContent = history[historyIndex + 1];
      setLocalContent(newContent);
      onChange(newContent);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    onChange(newContent);
    addToHistory(newContent);
  };

  // Rich text formatting functions
  const formatText = (command: string) => {
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
        }
        
        const newContent = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
        setLocalContent(newContent);
        onChange(newContent);
        addToHistory(newContent);
        
        // Set cursor position after formatted text
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
        }, 0);
      }
    }
  };

  // Clipboard functions
  const copyText = async () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      
      if (selectedText) {
        try {
          await navigator.clipboard.writeText(selectedText);
        } catch {
          textarea.select();
          document.execCommand('copy');
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
          setLocalContent(newContent);
          onChange(newContent);
          addToHistory(newContent);
        } catch {
          console.error('Cut operation failed');
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
        setLocalContent(newContent);
        onChange(newContent);
        addToHistory(newContent);
        
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + clipboardText.length, start + clipboardText.length);
        }, 0);
      } catch {
        console.error('Paste operation failed');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="absolute inset-4 bg-white rounded-2xl shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <div className="text-sm text-gray-500">
                {localContent.length} characters • {localContent.split('\n').length} lines
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {onSave && (
                <button
                  onClick={onSave}
                  className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Save"
                >
                  <Save className="h-4 w-4" />
                  <span className="hidden sm:inline">Save</span>
                </button>
              )}
              {onExport && (
                <button
                  onClick={onExport}
                  className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  title="Export"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Exit Fullscreen (ESC)"
              >
                <Minimize className="h-5 w-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Rich Text Toolbar */}
          {showRichToolbar && (
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-1">
                {/* Undo/Redo */}
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 className="h-4 w-4" />
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo2 className="h-4 w-4" />
                </button>
                
                <div className="h-6 w-px bg-gray-300 mx-2"></div>
                
                {/* Text Formatting */}
                <button
                  onClick={() => formatText('bold')}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
                  title="Bold (Ctrl+B)"
                >
                  <Bold className="h-4 w-4" />
                </button>
                <button
                  onClick={() => formatText('italic')}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
                  title="Italic (Ctrl+I)"
                >
                  <Italic className="h-4 w-4" />
                </button>
                <button
                  onClick={() => formatText('underline')}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
                  title="Underline (Ctrl+U)"
                >
                  <Underline className="h-4 w-4" />
                </button>
                
                <div className="h-6 w-px bg-gray-300 mx-2"></div>
                
                {/* Screenplay Formatting */}
                <button
                  onClick={() => formatText('uppercase')}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
                  title="Character Name (Uppercase)"
                >
                  <Type className="h-4 w-4" />
                </button>
                <button
                  onClick={() => formatText('center')}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
                  title="Center Text"
                >
                  <AlignCenter className="h-4 w-4" />
                </button>
                
                <div className="h-6 w-px bg-gray-300 mx-2"></div>
                
                {/* Clipboard Operations */}
                <button
                  onClick={copyText}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
                  title="Copy (Ctrl+C)"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={cutText}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
                  title="Cut (Ctrl+X)"
                >
                  <Scissors className="h-4 w-4" />
                </button>
                <button
                  onClick={pasteText}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
                  title="Paste (Ctrl+V)"
                >
                  <Clipboard className="h-4 w-4" />
                </button>
              </div>
              
              <div className="text-sm text-gray-500">
                Select text to format • ESC to exit fullscreen
              </div>
            </div>
          )}

          {/* Editor */}
          <div className="flex-1 p-6">
            <textarea
              ref={textareaRef}
              value={localContent}
              onChange={handleContentChange}
              className="w-full h-full resize-none border-none outline-none text-gray-900 text-lg leading-relaxed font-mono"
              style={{ 
                fontFamily: 'Courier New, monospace',
                fontSize: '16px',
                lineHeight: '1.6'
              }}
              placeholder={placeholder}
            />
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                Press <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">ESC</kbd> to exit fullscreen
              </div>
              <div className="flex items-center space-x-4">
                <span>{localContent.length} characters</span>
                <span>{localContent.split('\n').length} lines</span>
                <span>{Math.ceil(localContent.length / 250)} pages (est.)</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FullscreenEditor;