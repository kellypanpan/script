import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Camera, Mic } from 'lucide-react';

export type ScriptFormat = 'dialogue-only' | 'shooting-script' | 'voiceover';

interface ScriptFormatSwitcherProps {
  currentFormat: ScriptFormat;
  onFormatChange: (format: ScriptFormat) => void;
  disabled?: boolean;
}

interface FormatOption {
  id: ScriptFormat;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  example: string;
}

const formatOptions: FormatOption[] = [
  {
    id: 'dialogue-only',
    name: 'Dialogue Script',
    description: 'Character names and dialogue only',
    icon: FileText,
    example: 'SARAH\nThe usual? Large coffee?\n\nMIKE\nMake it a double shot.',
  },
  {
    id: 'shooting-script',
    name: 'Shooting Script',
    description: 'Full screenplay with camera angles',
    icon: Camera,
    example: 'INT. COFFEE SHOP - DAY\n\nSARAH approaches the counter.\n\nSARAH\n(cheerful)\nThe usual? Large coffee?',
  },
  {
    id: 'voiceover',
    name: 'Voiceover Script',
    description: 'Narration-friendly format',
    icon: Mic,
    example: 'Sarah approaches the counter with a cheerful smile, asking about the usual order...',
  },
];

export const ScriptFormatSwitcher: React.FC<ScriptFormatSwitcherProps> = ({
  currentFormat,
  onFormatChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ScriptFormat>(currentFormat);

  useEffect(() => {
    setSelectedFormat(currentFormat);
  }, [currentFormat]);

  const handleFormatSelect = (format: ScriptFormat) => {
    setSelectedFormat(format);
    onFormatChange(format);
    setIsOpen(false);
  };

  const currentOption = formatOptions.find(option => option.id === selectedFormat);

  return (
    <div className="relative">
      {/* Dropdown Toggle */}
      <div className="flex bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            selectedFormat === 'dialogue-only'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          Dialogue Only
        </button>
        <button
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            selectedFormat === 'shooting-script'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          Shooting Script
        </button>
        <button
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            selectedFormat === 'voiceover'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          Voiceover
        </button>
      </div>

      {/* Format Details Tooltip */}
      {currentOption && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
        >
          <div className="flex items-center space-x-2 mb-2">
            <currentOption.icon className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-900">
              {currentOption.name}
            </span>
          </div>
          <p className="text-xs text-gray-600 mb-2">
            {currentOption.description}
          </p>
          <div className="bg-gray-50 p-2 rounded text-xs font-mono text-gray-700">
            {currentOption.example}
          </div>
        </motion.div>
      )}

      {/* Enhanced Dropdown (for future use) */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
        >
          <div className="p-2">
            {formatOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleFormatSelect(option.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedFormat === option.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <option.icon className="h-5 w-5 text-gray-500" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {option.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {option.description}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs font-mono text-gray-600 bg-gray-50 p-2 rounded">
                  {option.example}
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Format conversion utilities
export class ScriptFormatConverter {
  static convertScript(script: string, fromFormat: ScriptFormat, toFormat: ScriptFormat): string {
    if (fromFormat === toFormat) return script;

    // Parse the script into structured data
    const parsed = this.parseScript(script, fromFormat);
    
    // Convert to target format
    return this.formatScript(parsed, toFormat);
  }

  private static parseScript(script: string, format: ScriptFormat): ScriptElement[] {
    const lines = script.split('\n');
    const elements: ScriptElement[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const element = this.parseScriptLine(line, format);
      if (element) {
        elements.push(element);
      }
    }

    return elements;
  }

  private static parseScriptLine(line: string, format: ScriptFormat): ScriptElement | null {
    // Scene headings
    if (line.match(/^(INT\.|EXT\.)/i)) {
      return { type: 'scene_heading', content: line };
    }

    // Character names
    if (line.match(/^[A-Z][A-Z\s]+$/) && line.length < 30) {
      return { type: 'character', content: line };
    }

    // Parentheticals
    if (line.match(/^\(.+\)$/)) {
      return { type: 'parenthetical', content: line };
    }

    // Transitions
    if (line.match(/^(FADE|CUT|DISSOLVE)/i)) {
      return { type: 'transition', content: line };
    }

    // Dialogue or action (context-dependent)
    if (format === 'dialogue-only') {
      return { type: 'dialogue', content: line };
    } else if (format === 'voiceover') {
      return { type: 'narration', content: line };
    } else {
      // Shooting script - determine by context
      return { type: 'action', content: line };
    }
  }

  private static formatScript(elements: ScriptElement[], format: ScriptFormat): string {
    switch (format) {
      case 'dialogue-only':
        return elements
          .filter(el => el.type === 'character' || el.type === 'dialogue')
          .map(el => el.content)
          .join('\n');

      case 'voiceover':
        return elements
          .filter(el => el.type === 'narration' || el.type === 'action')
          .map(el => el.content)
          .join(' ');

      case 'shooting-script':
      default:
        return elements
          .map(el => this.formatElementForShooting(el))
          .join('\n');
    }
  }

  private static formatElementForShooting(element: ScriptElement): string {
    switch (element.type) {
      case 'scene_heading':
        return element.content.toUpperCase();
      case 'character':
        return `                    ${element.content}`;
      case 'parenthetical':
        return `                ${element.content}`;
      case 'dialogue':
        return `          ${element.content}`;
      case 'transition':
        return `                                        ${element.content}`;
      default:
        return element.content;
    }
  }
}

interface ScriptElement {
  type: 'scene_heading' | 'character' | 'dialogue' | 'parenthetical' | 'action' | 'transition' | 'narration';
  content: string;
}