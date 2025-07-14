interface ScriptInput {
  genre: string;
  keywords: string;
  characters: string[];
  tone: string;
  extra?: string;
  maxLength?: "short" | "default" | "extended";
  mode?: "dialog-only" | "voiceover" | "shooting-script";
}

interface Character {
  name: string;
  age?: string;
  description?: string;
}

interface ScriptLine {
  type: "scene" | "action" | "character" | "dialogue" | "parenthetical" | "transition";
  content: string;
  character?: string;
}

interface StoryBeat {
  type: string;
  action?: string;
  dialogue?: string;
}

export class ScriptGenerator {
  private readonly wordLimits = {
    short: 300,
    default: 800,
    extended: 1500
  };

  private readonly genreTemplates = {
    comedy: {
      sceneStarters: ["INT. APARTMENT", "EXT. PARK", "INT. COFFEE SHOP", "EXT. STREET"],
      tones: ["light-hearted", "awkward", "witty", "sarcastic"],
      situations: ["misunderstanding", "awkward encounter", "failed attempt", "unexpected discovery"]
    },
    drama: {
      sceneStarters: ["INT. BEDROOM", "EXT. CEMETERY", "INT. HOSPITAL", "EXT. BRIDGE"],
      tones: ["emotional", "tense", "heartfelt", "contemplative"],
      situations: ["confrontation", "revelation", "loss", "reconciliation"]
    },
    thriller: {
      sceneStarters: ["INT. DARK ALLEY", "EXT. ABANDONED WAREHOUSE", "INT. CAR", "EXT. ROOFTOP"],
      tones: ["suspenseful", "urgent", "mysterious", "dangerous"],
      situations: ["chase", "discovery", "trap", "escape"]
    },
    horror: {
      sceneStarters: ["INT. BASEMENT", "EXT. FOREST", "INT. OLD HOUSE", "EXT. GRAVEYARD"],
      tones: ["eerie", "terrifying", "unsettling", "ominous"],
      situations: ["stalking", "trapped", "haunting", "revelation"]
    },
    romance: {
      sceneStarters: ["INT. CAFE", "EXT. BEACH", "INT. BOOKSTORE", "EXT. GARDEN"],
      tones: ["tender", "passionate", "sweet", "longing"],
      situations: ["first meeting", "confession", "misunderstanding", "reunion"]
    },
    action: {
      sceneStarters: ["EXT. HIGHWAY", "INT. BUILDING", "EXT. ROOFTOP", "INT. WAREHOUSE"],
      tones: ["intense", "explosive", "fast-paced", "heroic"],
      situations: ["fight", "chase", "rescue", "showdown"]
    }
  };

  generate(input: ScriptInput): string {
    const maxWords = this.wordLimits[input.maxLength || "default"];
    const mode = input.mode || "shooting-script";
    
    const script = this.buildScript(input, maxWords);
    return this.formatScript(script, mode);
  }

  private buildScript(input: ScriptInput, maxWords: number): ScriptLine[] {
    const lines: ScriptLine[] = [];
    const template = this.genreTemplates[input.genre as keyof typeof this.genreTemplates] || this.genreTemplates.comedy;
    
    // Scene heading
    const sceneLocation = this.generateSceneHeading(template, input.keywords);
    lines.push({ type: "scene", content: sceneLocation });
    lines.push({ type: "action", content: "" }); // Empty line
    
    // Character setup
    const characters = this.setupCharacters(input.characters);
    
    // Generate story beats
    const beats = this.generateStoryBeats(input, template, characters);
    
    // Convert beats to script lines
    for (const beat of beats) {
      lines.push(...this.beatToScriptLines(beat, characters, input.tone));
      
      // Check word count
      const currentWords = this.countWords(lines);
      if (currentWords >= maxWords * 0.9) break;
    }
    
    // Add ending if we have room
    if (this.countWords(lines) < maxWords * 0.8) {
      lines.push({ type: "action", content: "" });
      lines.push({ type: "transition", content: "FADE OUT." });
    }
    
    return lines;
  }

  private generateTitle(input: ScriptInput): string {
    const keywords = input.keywords.toLowerCase();
    if (keywords.includes("coffee")) return "Coffee Break";
    if (keywords.includes("love")) return "Unexpected Love";
    if (keywords.includes("chase")) return "The Chase";
    if (keywords.includes("mystery")) return "Hidden Truth";
    return "Untitled Script";
  }

  private generateSceneHeading(template: typeof this.genreTemplates.comedy, keywords: string): string {
    const time = Math.random() > 0.5 ? "DAY" : "NIGHT";
    const location = template.sceneStarters[Math.floor(Math.random() * template.sceneStarters.length)];
    
    // Customize based on keywords
    if (keywords.toLowerCase().includes("coffee")) {
      return "INT. COFFEE SHOP – DAY";
    }
    if (keywords.toLowerCase().includes("park")) {
      return "EXT. PARK – DAY";
    }
    
    return `${location} – ${time}`;
  }

  private setupCharacters(characterNames: string[]): Character[] {
    return characterNames.map(name => ({
      name: name.toUpperCase(),
      age: Math.random() > 0.5 ? "20s" : "30s",
      description: this.generateCharacterDescription()
    }));
  }

  private generateCharacterDescription(): string {
    const descriptions = [
      "nervous energy",
      "confident demeanor", 
      "casual attitude",
      "professional appearance",
      "artistic flair",
      "athletic build"
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  private generateStoryBeats(input: ScriptInput, template: typeof this.genreTemplates.comedy, characters: Character[]): StoryBeat[] {
    const beats = [];
    
    // Opening beat
    beats.push({
      type: "setup",
      action: this.generateOpeningAction(input, characters[0]),
      dialogue: characters.length > 0 ? this.generateDialogue(characters[0], input.tone, "opening") : null
    });
    
    // Conflict/turning point
    if (characters.length > 1) {
      beats.push({
        type: "conflict",
        action: this.generateConflictAction(input, characters),
        dialogue: this.generateDialogue(characters[1], input.tone, "conflict")
      });
    }
    
    // Resolution
    beats.push({
      type: "resolution", 
      action: this.generateResolutionAction(input, characters),
      dialogue: characters.length > 0 ? this.generateDialogue(characters[0], input.tone, "resolution") : null
    });
    
    return beats;
  }

  private generateOpeningAction(input: ScriptInput, character?: Character): string {
    const keywords = input.keywords.toLowerCase();
    
    if (keywords.includes("coffee")) {
      return `${character?.name || "PERSON"} (${character?.age || "20s"}, ${character?.description || "casual"}) approaches the counter with nervous energy.`;
    }
    if (keywords.includes("date")) {
      return `${character?.name || "PERSON"} checks their phone anxiously, glancing around the room.`;
    }
    if (keywords.includes("work")) {
      return `${character?.name || "PERSON"} stares at their computer screen, clearly frustrated.`;
    }
    
    return `${character?.name || "PERSON"} enters the scene with purpose.`;
  }

  private generateConflictAction(input: ScriptInput, characters: Character[]): string {
    const keywords = input.keywords.toLowerCase();
    
    if (keywords.includes("spill")) {
      return `${characters[1]?.name || "PERSON"} accidentally bumps into ${characters[0]?.name || "PERSON"}, causing a spill.`;
    }
    if (keywords.includes("misunderstanding")) {
      return `${characters[1]?.name || "PERSON"} looks confused by ${characters[0]?.name || "PERSON"}'s comment.`;
    }
    
    return `${characters[1]?.name || "PERSON"} suddenly appears, changing the dynamic.`;
  }

  private generateResolutionAction(input: ScriptInput, characters: Character[]): string {
    if (input.extra && input.extra.includes("glitch")) {
      return "Suddenly, everything freezes for a moment before returning to normal.";
    }
    
    return `${characters[0]?.name || "PERSON"} and ${characters[1]?.name || "PERSON"} share a meaningful look.`;
  }

  private generateDialogue(character: Character, tone: string, beatType: string): string {
    const dialogues = {
      opening: {
        casual: ["Hey there.", "So... this is awkward.", "Well, here goes nothing."],
        professional: ["Good morning.", "I believe we have an appointment.", "Thank you for your time."],
        humorous: ["Did someone order a disaster?", "Well, this is going well.", "Plot twist!"],
        dramatic: ["I can't do this anymore.", "There's something I need to tell you.", "This changes everything."]
      },
      conflict: {
        casual: ["Wait, what?", "That's not what I meant.", "This is getting weird."],
        professional: ["I'm afraid there's been a misunderstanding.", "Perhaps we should reconsider.", "That's quite unexpected."],
        humorous: ["Did you just...?", "That's one way to do it.", "Comedy gold right there."],
        dramatic: ["You don't understand!", "How could you?", "This can't be happening."]
      },
      resolution: {
        casual: ["Actually, that worked out.", "Not bad.", "See you around."],
        professional: ["Thank you for your understanding.", "I believe we've reached an agreement.", "Good day."],
        humorous: ["And that's how you break the ice.", "Mission accomplished?", "Well, that happened."],
        dramatic: ["Maybe there's hope after all.", "I understand now.", "Thank you."]
      }
    };
    
    const options = dialogues[beatType as keyof typeof dialogues][tone as keyof typeof dialogues.opening] || 
                   dialogues[beatType as keyof typeof dialogues].casual;
    
    return options[Math.floor(Math.random() * options.length)];
  }

  private beatToScriptLines(beat: StoryBeat, characters: Character[], tone: string): ScriptLine[] {
    const lines: ScriptLine[] = [];
    
    // Action line
    if (beat.action) {
      lines.push({ type: "action", content: beat.action });
      lines.push({ type: "action", content: "" }); // Empty line
    }
    
    // Dialogue
    if (beat.dialogue && characters.length > 0) {
      const character = characters[0];
      lines.push({ type: "character", content: character.name, character: character.name });
      
      // Add parenthetical based on tone
      if (tone === "humorous") {
        lines.push({ type: "parenthetical", content: "(grinning)" });
      } else if (tone === "dramatic") {
        lines.push({ type: "parenthetical", content: "(intensely)" });
      }
      
      lines.push({ type: "dialogue", content: beat.dialogue, character: character.name });
      lines.push({ type: "action", content: "" }); // Empty line
    }
    
    return lines;
  }

  private formatScript(lines: ScriptLine[], mode: string): string {
    switch (mode) {
      case "dialog-only":
        return this.formatDialogOnly(lines);
      case "voiceover":
        return this.formatVoiceover(lines);
      case "shooting-script":
      default:
        return this.formatShootingScript(lines);
    }
  }

  private formatDialogOnly(lines: ScriptLine[]): string {
    return lines
      .filter(line => line.type === "character" || line.type === "dialogue")
      .map(line => {
        if (line.type === "character") {
          return line.content;
        }
        return line.content;
      })
      .join("\n");
  }

  private formatVoiceover(lines: ScriptLine[]): string {
    const narrative = lines
      .filter(line => line.type === "action" && line.content.trim())
      .map(line => line.content)
      .join(" ");
    
    const dialogue = lines
      .filter(line => line.type === "dialogue")
      .map(line => `"${line.content}"`)
      .join(" ");
    
    return `${narrative} ${dialogue}`.trim();
  }

  private formatShootingScript(lines: ScriptLine[]): string {
    return lines.map(line => {
      switch (line.type) {
        case "scene":
          return line.content.toUpperCase();
        case "action":
          return line.content;
        case "character":
          return `                    ${line.content}`;
        case "parenthetical":
          return `                ${line.content}`;
        case "dialogue":
          return `          ${line.content}`;
        case "transition":
          return `                                        ${line.content}`;
        default:
          return line.content;
      }
    }).join("\n");
  }

  private countWords(lines: ScriptLine[]): number {
    return lines.reduce((count, line) => {
      return count + (line.content?.split(" ").length || 0);
    }, 0);
  }
}

export const generateScript = (input: ScriptInput): string => {
  const generator = new ScriptGenerator();
  return generator.generate(input);
};