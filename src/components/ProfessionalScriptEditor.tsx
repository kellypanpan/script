import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Eye, 
  EyeOff, 
  Type, 
  Settings,
  Zap,
  CheckCircle,
  AlertTriangle,
  Maximize
} from 'lucide-react';
import { FountainParser, FountainElement } from '../utils/fountainParser';
import FullscreenEditor from './FullscreenEditor';

export type ScriptFormat = 'fountain' | 'screenplay' | 'dialogue' | 'treatment';

interface ProfessionalScriptEditorProps {
  content: string;
  onChange: (content: string) => void;
  format: ScriptFormat;
  onFormatChange: (format: ScriptFormat) => void;
  readOnly?: boolean;
  showPreview?: boolean;
}

interface FormatSettings {
  fontFamily: 'courier' | 'arial' | 'times';
  fontSize: number;
  lineSpacing: number;
  pageMargins: { top: number; bottom: number; left: number; right: number };
  autoFormat: boolean;
  showLineNumbers: boolean;
}

const ProfessionalScriptEditor: React.FC<ProfessionalScriptEditorProps> = ({
  content,
  onChange,
  format,
  onFormatChange,
  readOnly = false,
  showPreview = false
}) => {
  const [localContent, setLocalContent] = useState(content);
  const [parsedElements, setParsedElements] = useState<FountainElement[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(showPreview);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [formatSettings, setFormatSettings] = useState<FormatSettings>({
    fontFamily: 'courier',
    fontSize: 12,
    lineSpacing: 1.2,
    pageMargins: { top: 1, bottom: 1, left: 1.5, right: 1 },
    autoFormat: true,
    showLineNumbers: false
  });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Parse content when it changes
  useEffect(() => {
    if (format === 'fountain') {
      const elements = FountainParser.parse(localContent);
      setParsedElements(elements);
      
      // Validate
      const validation = FountainParser.validate(localContent);
      setValidationErrors(validation.errors);
    }
  }, [localContent, format]);

  // Auto-format on Enter key
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!formatSettings.autoFormat || readOnly) return;

    if (e.key === 'Enter') {
      const textarea = e.currentTarget;
      const cursorPos = textarea.selectionStart;
      const lines = localContent.split('\n');
      const currentLineIndex = localContent.substring(0, cursorPos).split('\n').length - 1;
      const currentLine = lines[currentLineIndex];

      // Smart formatting based on current line type
      const nextLineFormat = getNextLineFormat(currentLine);
      if (nextLineFormat) {
        e.preventDefault();
        const newContent = localContent.substring(0, cursorPos) + 
                          '\n' + nextLineFormat + 
                          localContent.substring(cursorPos);
        setLocalContent(newContent);
        onChange(newContent);
        
        // Position cursor after the formatted text
        setTimeout(() => {
          if (textareaRef.current) {
            const newCursorPos = cursorPos + 1 + nextLineFormat.length;
            textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
          }
        }, 0);
      }
    }

    // Tab for dialogue indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const newContent = localContent.substring(0, start) + 
                        '          ' + 
                        localContent.substring(end);
      setLocalContent(newContent);
      onChange(newContent);
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(start + 10, start + 10);
        }
      }, 0);
    }
  }, [localContent, formatSettings.autoFormat, readOnly, onChange]);

  // Smart formatting helper
  const getNextLineFormat = (currentLine: string): string | null => {
    const trimmed = currentLine.trim();
    
    // After scene heading, suggest action
    if (FountainParser.parse(currentLine + '\n')[0]?.type === 'scene_heading') {
      return '';
    }
    
    // After character name, suggest parenthetical or dialogue
    if (FountainParser.parse(currentLine + '\n')[0]?.type === 'character') {
      return '          ';
    }
    
    // After action, suggest new paragraph
    if (trimmed && !trimmed.match(/^(INT\.|EXT\.|[A-Z]+\s*$|\(.*\)$)/)) {
      return '';
    }
    
    return null;
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    onChange(newContent);
    setCursorPosition(e.target.selectionStart);
  };

  const exportScript = useCallback((exportFormat: 'fountain' | 'pdf' | 'fdx' | 'html') => {
    let exportContent = '';
    
    switch (exportFormat) {
      case 'fountain':
        exportContent = localContent;
        break;
      case 'html':
        exportContent = FountainParser.toHTML(parsedElements);
        break;
      case 'pdf':
        exportContent = FountainParser.toPDFFormat(parsedElements);
        break;
      default:
        exportContent = localContent;
    }

    const blob = new Blob([exportContent], { 
      type: exportFormat === 'html' ? 'text/html' : 'text/plain' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `script.${exportFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [localContent, parsedElements]);

  const formatOptions = [
    { id: 'fountain', name: 'Fountain', description: 'Industry standard plain-text format' },
    { id: 'screenplay', name: 'Screenplay', description: 'Traditional formatted screenplay' },
    { id: 'dialogue', name: 'Dialogue Only', description: 'Character names and dialogue' },
    { id: 'treatment', name: 'Treatment', description: 'Narrative treatment format' }
  ];

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          {/* Format Selector */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {formatOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => onFormatChange(option.id as ScriptFormat)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  format === option.id 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title={option.description}
              >
                {option.name}
              </button>
            ))}
          </div>

          {/* Validation Status */}
          {format === 'fountain' && (
            <div className="flex items-center space-x-2">
              {validationErrors.length === 0 ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">Valid</span>
                </div>
              ) : (
                <div className="flex items-center text-amber-600">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  <span className="text-sm">{validationErrors.length} issues</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Preview Toggle */}
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`p-2 rounded-md transition-colors ${
              isPreviewMode 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title={isPreviewMode ? 'Hide Preview' : 'Show Preview'}
          >
            {isPreviewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>

          {/* Auto-format Toggle */}
          <button
            onClick={() => setFormatSettings(prev => ({ ...prev, autoFormat: !prev.autoFormat }))}
            className={`p-2 rounded-md transition-colors ${
              formatSettings.autoFormat 
                ? 'bg-green-100 text-green-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Auto-format"
          >
            <Zap className="h-4 w-4" />
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md transition-colors"
            title="Format Settings"
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md transition-colors"
            title="Fullscreen Editor"
          >
            <Maximize className="h-4 w-4" />
          </button>

          {/* Export Menu */}
          <div className="relative">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  exportScript(e.target.value as any);
                  e.target.value = '';
                }
              }}
              className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors appearance-none cursor-pointer"
              defaultValue=""
            >
              <option value="" disabled>Export</option>
              <option value="fountain">Fountain (.fountain)</option>
              <option value="html">HTML (.html)</option>
              <option value="pdf">PDF Ready (.txt)</option>
            </select>
            <Download className="h-4 w-4 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-white" />
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-200 bg-gray-50"
          >
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Family
                  </label>
                  <select
                    value={formatSettings.fontFamily}
                    onChange={(e) => setFormatSettings(prev => ({ 
                      ...prev, 
                      fontFamily: e.target.value as any 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="courier">Courier New</option>
                    <option value="arial">Arial</option>
                    <option value="times">Times New Roman</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Size
                  </label>
                  <input
                    type="number"
                    min="8"
                    max="18"
                    value={formatSettings.fontSize}
                    onChange={(e) => setFormatSettings(prev => ({ 
                      ...prev, 
                      fontSize: parseInt(e.target.value) 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Line Spacing
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="2"
                    step="0.1"
                    value={formatSettings.lineSpacing}
                    onChange={(e) => setFormatSettings(prev => ({ 
                      ...prev, 
                      lineSpacing: parseFloat(e.target.value) 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formatSettings.showLineNumbers}
                    onChange={(e) => setFormatSettings(prev => ({ 
                      ...prev, 
                      showLineNumbers: e.target.checked 
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Show line numbers</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Validation Errors */}
      <AnimatePresence>
        {validationErrors.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-amber-50 border-b border-amber-200"
          >
            <div className="p-3">
              <h4 className="text-sm font-medium text-amber-800 mb-2">Formatting Issues:</h4>
              <ul className="text-xs text-amber-700 space-y-1">
                {validationErrors.slice(0, 3).map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
                {validationErrors.length > 3 && (
                  <li>• ... and {validationErrors.length - 3} more issues</li>
                )}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor/Preview Container */}
      <div className="flex-1 flex">
        {/* Script Editor */}
        <div className={`${isPreviewMode ? 'w-1/2 border-r border-gray-200' : 'w-full'} flex`}>
          {formatSettings.showLineNumbers && (
            <div className="w-12 bg-gray-50 border-r border-gray-200 text-xs text-gray-500 font-mono">
              {localContent.split('\n').map((_, index) => (
                <div key={index} className="px-2 py-1 text-right">
                  {index + 1}
                </div>
              ))}
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={localContent}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            readOnly={readOnly}
            className={`flex-1 p-4 resize-none focus:outline-none font-mono text-sm leading-relaxed ${
              formatSettings.fontFamily === 'courier' ? 'font-mono' :
              formatSettings.fontFamily === 'arial' ? 'font-sans' : 'font-serif'
            }`}
            style={{
              fontSize: `${formatSettings.fontSize}px`,
              lineHeight: formatSettings.lineSpacing,
              fontFamily: formatSettings.fontFamily === 'courier' ? 'Courier New, monospace' :
                          formatSettings.fontFamily === 'arial' ? 'Arial, sans-serif' :
                          'Times New Roman, serif'
            }}
            placeholder={`Type your ${format} script here...\n\n${
              format === 'fountain' ? 
                'Example:\nINT. COFFEE SHOP - DAY\n\nSARAH enters, looking around nervously.\n\nSARAH\nIs this seat taken?' :
                'Start writing your script...'
            }`}
          />
        </div>

        {/* Live Preview */}
        {isPreviewMode && (
          <div className="w-1/2 bg-gray-50 overflow-auto">
            <div className="p-4">
              <div
                ref={previewRef}
                className="bg-white p-8 shadow-sm rounded script-preview"
                style={{
                  fontFamily: 'Courier New, monospace',
                  fontSize: '12px',
                  lineHeight: '1.2',
                  maxWidth: '8.5in',
                  minHeight: '11in'
                }}
                dangerouslySetInnerHTML={{
                  __html: format === 'fountain' ? 
                    FountainParser.toHTML(parsedElements) : 
                    localContent.split('\n').map(line => `<p>${line || '&nbsp;'}</p>`).join('')
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span>{localContent.length} characters</span>
          <span>{localContent.split('\n').length} lines</span>
          <span>{Math.ceil(localContent.length / 250)} pages (est.)</span>
        </div>
        <div className="flex items-center space-x-2">
          <Type className="h-3 w-3" />
          <span>{format.toUpperCase()} Format</span>
        </div>
      </div>

      {/* Custom CSS for script preview */}
      <style jsx>{`
        .script-preview .script-scene_heading {
          font-weight: bold;
          text-transform: uppercase;
          margin: 24px 0 12px 0;
        }
        .script-preview .script-character {
          text-align: center;
          font-weight: bold;
          margin: 12px 0 0 0;
        }
        .script-preview .script-parenthetical {
          text-align: center;
          margin: 0 0 6px 0;
          font-style: italic;
        }
        .script-preview .script-dialogue {
          margin: 0 auto 12px auto;
          max-width: 4in;
          text-align: left;
        }
        .script-preview .script-action {
          margin: 12px 0;
          line-height: 1.2;
        }
        .script-preview .script-transition {
          text-align: right;
          font-weight: bold;
          margin: 12px 0;
        }
        .script-preview .script-centered {
          text-align: center;
          margin: 12px 0;
        }
        .script-preview .page-break {
          page-break-before: always;
          margin: 48px 0;
          border-top: 1px dashed #ccc;
        }
      `}</style>

      {/* Fullscreen Editor */}
      <FullscreenEditor
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        content={localContent}
        onChange={(newContent) => {
          setLocalContent(newContent);
          onChange(newContent);
        }}
        title={`${format.charAt(0).toUpperCase() + format.slice(1)} Script Editor`}
        placeholder={`Type your ${format} script here...\n\n${
          format === 'fountain' ? 
            'Example:\nINT. COFFEE SHOP - DAY\n\nSARAH enters, looking around nervously.\n\nSARAH\nIs this seat taken?' :
            'Start writing your script...'
        }`}
        onSave={() => {
          // Could add save functionality here
          console.log('Save script');
        }}
        onExport={() => exportScript('fountain')}
      />
    </div>
  );
};

export default ProfessionalScriptEditor;