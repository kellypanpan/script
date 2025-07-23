/**
 * Fountain Format Parser and Converter
 * Supports industry-standard screenplay formatting
 */

export interface FountainElement {
  type: 'scene_heading' | 'character' | 'dialogue' | 'parenthetical' | 'action' | 
        'transition' | 'centered' | 'page_break' | 'note' | 'boneyard' | 'section' | 'synopsis';
  content: string;
  dual?: boolean; // For dual dialogue
  emphasis?: 'bold' | 'italic' | 'underline' | 'bold_italic';
  metadata?: {
    character_extension?: string; // (V.O.), (O.S.), (CONT'D)
    scene_number?: string;
    page_break?: boolean;
  };
}

export class FountainParser {
  /**
   * Parse Fountain syntax to structured elements
   */
  static parse(fountainScript: string): FountainElement[] {
    const lines = fountainScript.split('\n');
    const elements: FountainElement[] = [];
    let inBoneyard = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Handle boneyard (comments)
      if (line.includes('/*')) {
        inBoneyard = true;
      }
      if (line.includes('*/')) {
        inBoneyard = false;
        continue;
      }
      if (inBoneyard) {
        continue;
      }

      const element = this.parseElement(line, i, lines);
      if (element) {
        elements.push(element);
      }
    }

    return elements;
  }

  private static parseElement(line: string, index: number, allLines: string[]): FountainElement | null {
    const trimmed = line.trim();
    
    // Empty lines
    if (!trimmed) {
      return null;
    }

    // Page breaks
    if (trimmed === '===') {
      return { type: 'page_break', content: '' };
    }

    // Section headings (# Header)
    if (trimmed.match(/^#+\s/)) {
      return { 
        type: 'section', 
        content: trimmed.replace(/^#+\s/, '').trim() 
      };
    }

    // Synopsis (= This is a synopsis)
    if (trimmed.startsWith('=') && !trimmed.startsWith('===')) {
      return { 
        type: 'synopsis', 
        content: trimmed.replace(/^=\s*/, '').trim() 
      };
    }

    // Notes [[This is a note]]
    if (trimmed.match(/^\[\[.*\]\]$/)) {
      return { 
        type: 'note', 
        content: trimmed.replace(/^\[\[|\]\]$/g, '').trim() 
      };
    }

    // Forced scene headings (.SCENE HEADING)
    if (trimmed.startsWith('.') && !trimmed.startsWith('..')) {
      return { 
        type: 'scene_heading', 
        content: trimmed.substring(1).trim() 
      };
    }

    // Scene headings (INT./EXT./EST./etc)
    if (this.isSceneHeading(trimmed)) {
      const sceneNumber = this.extractSceneNumber(trimmed);
      return { 
        type: 'scene_heading', 
        content: trimmed,
        metadata: { scene_number: sceneNumber }
      };
    }

    // Transitions (FADE IN:, CUT TO:, etc)
    if (this.isTransition(trimmed)) {
      return { 
        type: 'transition', 
        content: trimmed 
      };
    }

    // Forced transitions (> FADE IN:)
    if (trimmed.startsWith('>') && !trimmed.startsWith('>>')) {
      return { 
        type: 'transition', 
        content: trimmed.substring(1).trim() 
      };
    }

    // Centered text (> This is centered <)
    if (trimmed.startsWith('>') && trimmed.endsWith('<')) {
      return { 
        type: 'centered', 
        content: trimmed.slice(1, -1).trim() 
      };
    }

    // Character names
    if (this.isCharacterName(trimmed, index, allLines)) {
      const { name, extension } = this.parseCharacterName(trimmed);
      return { 
        type: 'character', 
        content: name,
        metadata: { character_extension: extension }
      };
    }

    // Parentheticals
    if (trimmed.match(/^\(.+\)$/)) {
      return { 
        type: 'parenthetical', 
        content: trimmed 
      };
    }

    // Dialogue (if previous element was character or parenthetical)
    if (index > 0) {
      const prevElement = this.parseElement(allLines[index - 1], index - 1, allLines);
      if (prevElement && (prevElement.type === 'character' || prevElement.type === 'parenthetical')) {
        return { 
          type: 'dialogue', 
          content: trimmed 
        };
      }
    }

    // Action (default)
    return { 
      type: 'action', 
      content: trimmed,
      emphasis: this.parseEmphasis(trimmed)
    };
  }

  private static isSceneHeading(line: string): boolean {
    const sceneStarters = /^(INT\.|EXT\.|EST\.|I\/E\.|INT\/EXT\.|EXTERIOR\.|INTERIOR\.)/i;
    return sceneStarters.test(line.trim());
  }

  private static isTransition(line: string): boolean {
    const transitions = /^(FADE IN:|FADE OUT\.|CUT TO:|DISSOLVE TO:|MATCH CUT:|SMASH CUT:|JUMP CUT:|CROSS CUT:)$/i;
    return transitions.test(line.trim()) || 
           (line.trim().endsWith(':') && line.trim().toUpperCase() === line.trim());
  }

  private static isCharacterName(line: string, index: number, allLines: string[]): boolean {
    const trimmed = line.trim();
    
    // Must be all caps
    if (trimmed !== trimmed.toUpperCase()) {
      return false;
    }

    // Can't be a scene heading or transition
    if (this.isSceneHeading(trimmed) || this.isTransition(trimmed)) {
      return false;
    }

    // Check if followed by dialogue
    const nextLine = allLines[index + 1];
    if (nextLine) {
      const nextTrimmed = nextLine.trim();
      // Followed by parenthetical or dialogue
      if (nextTrimmed.match(/^\(.+\)$/) || 
          (nextTrimmed && !this.isSceneHeading(nextTrimmed) && !this.isTransition(nextTrimmed))) {
        return true;
      }
    }

    return false;
  }

  private static parseCharacterName(line: string): { name: string; extension?: string } {
    const match = line.match(/^(.+?)(\s+\(.*\))?$/);
    if (match) {
      return {
        name: match[1].trim(),
        extension: match[2]?.trim()
      };
    }
    return { name: line.trim() };
  }

  private static extractSceneNumber(line: string): string | undefined {
    const match = line.match(/#(\w+)#?$/);
    return match ? match[1] : undefined;
  }

  private static parseEmphasis(text: string): 'bold' | 'italic' | 'underline' | 'bold_italic' | undefined {
    const hasBold = text.includes('**') || text.includes('__');
    const hasItalic = text.includes('*') && !text.includes('**');
    const hasUnderline = text.includes('_') && !text.includes('__');

    if (hasBold && hasItalic) return 'bold_italic';
    if (hasBold) return 'bold';
    if (hasItalic) return 'italic';
    if (hasUnderline) return 'underline';
    return undefined;
  }

  /**
   * Convert structured elements back to Fountain format
   */
  static stringify(elements: FountainElement[]): string {
    return elements.map(element => {
      switch (element.type) {
        case 'scene_heading':
          return element.content.toUpperCase();
        
        case 'character':
          const extension = element.metadata?.character_extension || '';
          return `${element.content}${extension}`.toUpperCase();
        
        case 'parenthetical':
          return `          ${element.content}`;
        
        case 'dialogue':
          return `     ${element.content}`;
        
        case 'transition':
          return `                                   ${element.content}`;
        
        case 'centered':
          return `                    ${element.content}`;
        
        case 'page_break':
          return '===';
        
        case 'section':
          return `# ${element.content}`;
        
        case 'synopsis':
          return `= ${element.content}`;
        
        case 'note':
          return `[[${element.content}]]`;
        
        case 'action':
        default:
          return element.content;
      }
    }).join('\n\n');
  }

  /**
   * Convert to HTML with proper screenplay formatting
   */
  static toHTML(elements: FountainElement[]): string {
    return elements.map(element => {
      const className = `script-${element.type}`;
      const content = this.applyEmphasis(element.content, element.emphasis);

      switch (element.type) {
        case 'scene_heading':
          return `<h3 class="${className}">${content}</h3>`;
        
        case 'character':
          const extension = element.metadata?.character_extension || '';
          return `<div class="${className}">${content}${extension}</div>`;
        
        case 'parenthetical':
          return `<div class="${className}">${content}</div>`;
        
        case 'dialogue':
          return `<div class="${className}">${content}</div>`;
        
        case 'transition':
          return `<div class="${className}">${content}</div>`;
        
        case 'centered':
          return `<div class="${className}">${content}</div>`;
        
        case 'section':
          return `<h2 class="${className}">${content}</h2>`;
        
        case 'synopsis':
          return `<div class="${className}"><em>${content}</em></div>`;
        
        case 'note':
          return `<div class="${className}"><small>[${content}]</small></div>`;
        
        case 'page_break':
          return '<div class="page-break"></div>';
        
        case 'action':
        default:
          return `<p class="${className}">${content}</p>`;
      }
    }).join('\n');
  }

  private static applyEmphasis(text: string, emphasis?: string): string {
    if (!emphasis) return text;

    switch (emphasis) {
      case 'bold':
        return `<strong>${text}</strong>`;
      case 'italic':
        return `<em>${text}</em>`;
      case 'underline':
        return `<u>${text}</u>`;
      case 'bold_italic':
        return `<strong><em>${text}</em></strong>`;
      default:
        return text;
    }
  }

  /**
   * Convert to PDF-ready format (for export)
   */
  static toPDFFormat(elements: FountainElement[]): string {
    return elements.map(element => {
      switch (element.type) {
        case 'scene_heading':
          return element.content.toUpperCase();
        
        case 'character':
          return `                    ${element.content}${element.metadata?.character_extension || ''}`;
        
        case 'parenthetical':
          return `               ${element.content}`;
        
        case 'dialogue':
          return `          ${element.content}`;
        
        case 'transition':
          return `                                        ${element.content}`;
        
        case 'centered':
          return `                    ${element.content}`;
        
        case 'action':
        default:
          return element.content;
      }
    }).join('\n\n');
  }

  /**
   * Validate Fountain syntax
   */
  static validate(fountainScript: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const lines = fountainScript.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check for common formatting errors
      if (line.match(/^[a-z]/)) {
        // Character names should be uppercase
        const nextLine = lines[i + 1]?.trim();
        if (nextLine && !this.isSceneHeading(line) && !this.isTransition(line)) {
          if (nextLine.match(/^\(.+\)$/) || 
              (nextLine && nextLine !== nextLine.toUpperCase())) {
            errors.push(`Line ${i + 1}: Character name "${line}" should be uppercase`);
          }
        }
      }

      // Check for malformed parentheticals
      if (line.startsWith('(') && !line.endsWith(')')) {
        errors.push(`Line ${i + 1}: Malformed parenthetical - missing closing parenthesis`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}