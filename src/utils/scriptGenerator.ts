interface ScriptInput {
  genre: string;
  keywords: string;
  characters: string[];
  tone: string;
  extra?: string;
  maxLength?: "short" | "default" | "extended";
  mode?: "dialog-only" | "voiceover" | "shooting-script";
  platform?: "tiktok" | "reels" | "youtube" | "general";
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
    let maxWords = this.wordLimits[input.maxLength || "default"];
    const mode = input.mode || "shooting-script";
    const platform = input.platform || "general";
    
    // Adjust word limits based on platform
    maxWords = this.adjustForPlatform(maxWords, platform);
    
    const script = this.buildScript(input, maxWords, platform);
    return this.formatScript(script, mode, platform);
  }

  private adjustForPlatform(maxWords: number, platform: string): number {
    const platformLimits = {
      tiktok: { multiplier: 0.6, max: 400 },    // Shorter, punchier content
      reels: { multiplier: 0.7, max: 500 },     // Slightly longer than TikTok
      youtube: { multiplier: 0.8, max: 600 },   // Can be a bit longer
      general: { multiplier: 1.0, max: 2000 }   // No restriction
    };
    
    const config = platformLimits[platform as keyof typeof platformLimits] || platformLimits.general;
    return Math.min(Math.floor(maxWords * config.multiplier), config.max);
  }

  private buildScript(input: ScriptInput, maxWords: number, platform: string = "general"): ScriptLine[] {
    const lines: ScriptLine[] = [];
    const template = this.genreTemplates[input.genre as keyof typeof this.genreTemplates] || this.genreTemplates.comedy;
    
    // Scene heading
    const sceneLocation = this.generateSceneHeading(template, input.keywords);
    lines.push({ type: "scene", content: sceneLocation });
    lines.push({ type: "action", content: "" }); // Empty line
    
    // Character setup
    const characters = this.setupCharacters(input.characters);
    
    // Generate story beats
    const beats = this.generateStoryBeats(input, template, characters, maxWords, platform);
    
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
    const keywordsLower = keywords.toLowerCase();
    
    // Extensive keyword-based location generation
    if (keywordsLower.includes("coffee") || keywordsLower.includes("cafe") || keywordsLower.includes("barista")) {
      return "INT. COFFEE SHOP – DAY";
    }
    if (keywordsLower.includes("park") || keywordsLower.includes("outdoor") || keywordsLower.includes("bench")) {
      return "EXT. PARK – DAY";
    }
    if (keywordsLower.includes("office") || keywordsLower.includes("work") || keywordsLower.includes("meeting")) {
      return "INT. OFFICE – DAY";
    }
    if (keywordsLower.includes("restaurant") || keywordsLower.includes("dinner") || keywordsLower.includes("food")) {
      return "INT. RESTAURANT – NIGHT";
    }
    if (keywordsLower.includes("car") || keywordsLower.includes("drive") || keywordsLower.includes("road")) {
      return "INT. CAR – DAY";
    }
    if (keywordsLower.includes("home") || keywordsLower.includes("apartment") || keywordsLower.includes("living")) {
      return "INT. LIVING ROOM – NIGHT";
    }
    if (keywordsLower.includes("school") || keywordsLower.includes("class") || keywordsLower.includes("student")) {
      return "INT. CLASSROOM – DAY";
    }
    if (keywordsLower.includes("hospital") || keywordsLower.includes("doctor") || keywordsLower.includes("medical")) {
      return "INT. HOSPITAL ROOM – DAY";
    }
    if (keywordsLower.includes("store") || keywordsLower.includes("shop") || keywordsLower.includes("buy")) {
      return "INT. STORE – DAY";
    }
    if (keywordsLower.includes("beach") || keywordsLower.includes("ocean") || keywordsLower.includes("sand")) {
      return "EXT. BEACH – DAY";
    }
    if (keywordsLower.includes("night") || keywordsLower.includes("dark") || keywordsLower.includes("late")) {
      const location = template.sceneStarters[Math.floor(Math.random() * template.sceneStarters.length)];
      return `${location} – NIGHT`;
    }
    
    // Fall back to genre template
    const location = template.sceneStarters[Math.floor(Math.random() * template.sceneStarters.length)];
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

  private generateStoryBeats(input: ScriptInput, template: typeof this.genreTemplates.comedy, characters: Character[], maxWords: number, platform: string = "general"): StoryBeat[] {
    const beats = [];
    
    // Determine number of beats based on script length and platform
    let targetBeats = 3; // default
    
    // Platform-specific beat adjustments
    if (platform === "tiktok" || platform === "reels") {
      targetBeats = Math.min(targetBeats, 2); // Keep it snappy for short-form
    } else if (platform === "youtube") {
      targetBeats = Math.min(targetBeats, 3); // Slightly more room
    }
    
    if (maxWords <= 300) {
      targetBeats = 2; // short: just setup and resolution
    } else if (maxWords >= 1200) {
      targetBeats = Math.min(5, targetBeats + 2); // extended: setup, conflict, climax, twist, resolution
    } else {
      targetBeats = Math.max(2, targetBeats); // default: setup, conflict, resolution
    }
    
    // Opening beat (always present)
    beats.push({
      type: "setup",
      action: this.generateOpeningAction(input, characters[0]),
      dialogue: characters.length > 0 ? this.generateDialogue(characters[0], input.tone, "opening") : null
    });
    
    // Add middle beats based on length
    if (targetBeats >= 3) {
      // Conflict/turning point
      if (characters.length > 1) {
        beats.push({
          type: "conflict",
          action: this.generateConflictAction(input, characters),
          dialogue: this.generateDialogue(characters[1], input.tone, "conflict")
        });
      }
    }
    
    if (targetBeats >= 4) {
      // Additional development beat for longer scripts
      beats.push({
        type: "development",
        action: this.generateDevelopmentAction(input, characters),
        dialogue: characters.length > 0 ? this.generateDialogue(characters[0], input.tone, "development") : null
      });
    }
    
    if (targetBeats >= 5) {
      // Climax beat for extended scripts
      beats.push({
        type: "climax",
        action: this.generateClimaxAction(input, characters),
        dialogue: characters.length > 1 ? this.generateDialogue(characters[1], input.tone, "climax") : null
      });
    }
    
    // Resolution beat (always present)
    beats.push({
      type: "resolution", 
      action: this.generateResolutionAction(input, characters),
      dialogue: characters.length > 0 ? this.generateDialogue(characters[0], input.tone, "resolution") : null
    });
    
    return beats;
  }

  private generateOpeningAction(input: ScriptInput, character?: Character): string {
    const keywords = input.keywords.toLowerCase();
    const characterName = character?.name || "PERSON";
    const characterAge = character?.age || "20s";
    const characterDesc = character?.description || "casual";
    
    // Keyword-driven opening actions
    if (keywords.includes("coffee") || keywords.includes("cafe")) {
      return `${characterName} (${characterAge}, ${characterDesc}) approaches the counter with nervous energy.`;
    }
    if (keywords.includes("date") || keywords.includes("meeting") || keywords.includes("appointment")) {
      return `${characterName} checks their phone anxiously, glancing around the room.`;
    }
    if (keywords.includes("work") || keywords.includes("office") || keywords.includes("job")) {
      return `${characterName} stares at their computer screen, clearly frustrated.`;
    }
    if (keywords.includes("phone") || keywords.includes("call") || keywords.includes("text")) {
      return `${characterName} frantically searches through their pockets for their phone.`;
    }
    if (keywords.includes("late") || keywords.includes("hurry") || keywords.includes("rush")) {
      return `${characterName} bursts through the door, clearly running late.`;
    }
    if (keywords.includes("money") || keywords.includes("wallet") || keywords.includes("broke")) {
      return `${characterName} counts the crumpled bills in their wallet with growing concern.`;
    }
    if (keywords.includes("secret") || keywords.includes("hide") || keywords.includes("mysterious")) {
      return `${characterName} glances around nervously before pulling out a hidden envelope.`;
    }
    if (keywords.includes("surprise") || keywords.includes("party") || keywords.includes("celebration")) {
      return `${characterName} quietly arranges decorations, checking the time repeatedly.`;
    }
    if (keywords.includes("accident") || keywords.includes("mistake") || keywords.includes("error")) {
      return `${characterName} stares in horror at the mess they've just created.`;
    }
    if (keywords.includes("love") || keywords.includes("romance") || keywords.includes("heart")) {
      return `${characterName} takes a deep breath, clutching a small gift nervously.`;
    }
    
    // Genre-specific defaults when no keywords match
    if (input.genre === "horror") {
      return `${characterName} enters slowly, sensing something is wrong.`;
    }
    if (input.genre === "comedy") {
      return `${characterName} trips slightly while trying to look confident.`;
    }
    if (input.genre === "drama") {
      return `${characterName} pauses at the threshold, gathering courage.`;
    }
    
    return `${characterName} enters the scene with purpose.`;
  }

  private generateConflictAction(input: ScriptInput, characters: Character[]): string {
    const keywords = input.keywords.toLowerCase();
    const char1 = characters[0]?.name || "PERSON";
    const char2 = characters[1]?.name || "PERSON";
    
    // Keyword-driven conflicts
    if (keywords.includes("spill") || keywords.includes("accident") || keywords.includes("clumsy")) {
      return `${char2} accidentally bumps into ${char1}, causing a spill.`;
    }
    if (keywords.includes("misunderstanding") || keywords.includes("confused") || keywords.includes("wrong")) {
      return `${char2} looks confused by ${char1}'s comment.`;
    }
    if (keywords.includes("phone") || keywords.includes("call") || keywords.includes("interrupt")) {
      return `${char1}'s phone rings loudly, interrupting the moment.`;
    }
    if (keywords.includes("secret") || keywords.includes("reveal") || keywords.includes("discovery")) {
      return `${char2} discovers something ${char1} was trying to hide.`;
    }
    if (keywords.includes("money") || keywords.includes("wallet") || keywords.includes("payment")) {
      return `${char1} realizes they don't have enough money to pay.`;
    }
    if (keywords.includes("late") || keywords.includes("time") || keywords.includes("deadline")) {
      return `${char2} checks their watch and realizes they're running out of time.`;
    }
    if (keywords.includes("ex") || keywords.includes("past") || keywords.includes("history")) {
      return `${char2} recognizes ${char1} from their past.`;
    }
    if (keywords.includes("competition") || keywords.includes("rival") || keywords.includes("challenge")) {
      return `${char2} challenges ${char1} to prove themselves.`;
    }
    if (keywords.includes("weather") || keywords.includes("rain") || keywords.includes("storm")) {
      return `Suddenly, it starts raining heavily, forcing them to take shelter.`;
    }
    
    // Genre-specific conflicts
    if (input.genre === "horror") {
      return `The lights flicker ominously as ${char2} appears in the shadows.`;
    }
    if (input.genre === "comedy") {
      return `${char2} walks into a glass door they didn't see.`;
    }
    if (input.genre === "thriller") {
      return `${char2} suddenly grabs ${char1}'s arm with urgency.`;
    }
    
    return `${char2} suddenly appears, changing the dynamic.`;
  }

  private generateDevelopmentAction(input: ScriptInput, characters: Character[]): string {
    const keywords = input.keywords.toLowerCase();
    const char1 = characters[0]?.name || "PERSON";
    const char2 = characters[1]?.name || "PERSON";
    
    // Keyword-driven developments
    if (keywords.includes("coffee") || keywords.includes("drink") || keywords.includes("taste")) {
      return `${char1} takes a sip and makes a face - clearly not what they expected.`;
    }
    if (keywords.includes("phone") || keywords.includes("message") || keywords.includes("text")) {
      return `${char1}'s phone buzzes with an unexpected message.`;
    }
    if (keywords.includes("document") || keywords.includes("paper") || keywords.includes("letter")) {
      return `${char1} notices an important document they hadn't seen before.`;
    }
    if (keywords.includes("key") || keywords.includes("lock") || keywords.includes("door")) {
      return `${char1} tries the door handle, but it's locked.`;
    }
    if (keywords.includes("memory") || keywords.includes("remember") || keywords.includes("flashback")) {
      return `A distant memory suddenly comes flooding back to ${char1}.`;
    }
    if (keywords.includes("noise") || keywords.includes("sound") || keywords.includes("hear")) {
      return `Both ${char1} and ${char2} freeze as they hear an unexpected sound.`;
    }
    if (keywords.includes("mirror") || keywords.includes("reflection") || keywords.includes("appearance")) {
      return `${char1} catches their reflection and doesn't like what they see.`;
    }
    if (keywords.includes("plan") || keywords.includes("strategy") || keywords.includes("scheme")) {
      return `${char1} realizes their original plan isn't going to work.`;
    }
    
    return `The situation becomes more complicated as ${char1} realizes there's more to this than meets the eye.`;
  }

  private generateClimaxAction(input: ScriptInput, characters: Character[]): string {
    const keywords = input.keywords.toLowerCase();
    const char1 = characters[0]?.name || "PERSON";
    const char2 = characters[1]?.name || "PERSON";
    
    // Keyword-driven climax
    if (keywords.includes("reveal") || keywords.includes("truth") || keywords.includes("secret")) {
      return `${char2} reveals the truth that changes everything.`;
    }
    if (keywords.includes("chase") || keywords.includes("run") || keywords.includes("escape")) {
      return `The chase reaches its peak as ${char1} makes a desperate final move.`;
    }
    if (keywords.includes("decision") || keywords.includes("choice") || keywords.includes("choose")) {
      return `${char1} must make the most important decision of their life.`;
    }
    if (keywords.includes("confession") || keywords.includes("admit") || keywords.includes("love")) {
      return `${char1} finally gathers the courage to confess their true feelings.`;
    }
    if (keywords.includes("fight") || keywords.includes("battle") || keywords.includes("confrontation")) {
      return `${char1} and ${char2} face off in their final confrontation.`;
    }
    if (keywords.includes("save") || keywords.includes("rescue") || keywords.includes("help")) {
      return `${char1} rushes to save ${char2} just in time.`;
    }
    if (keywords.includes("deadline") || keywords.includes("time") || keywords.includes("urgent")) {
      return `With only seconds left, ${char1} makes their final attempt.`;
    }
    
    // Genre-specific climax
    if (input.genre === "horror") {
      return `The horrifying truth is finally revealed as ${char1} faces their worst fear.`;
    }
    if (input.genre === "comedy") {
      return `Everything that could go wrong does, creating the perfect comedic chaos.`;
    }
    if (input.genre === "romance") {
      return `${char1} and ${char2} finally overcome all obstacles to be together.`;
    }
    
    return `The tension reaches its breaking point as both characters face the crucial moment.`;
  }

  private generateResolutionAction(input: ScriptInput, characters: Character[]): string {
    const keywords = input.keywords.toLowerCase();
    const char1 = characters[0]?.name || "PERSON";
    const char2 = characters[1]?.name || "PERSON";
    
    if (input.extra && input.extra.includes("glitch")) {
      return "Suddenly, everything freezes for a moment before returning to normal.";
    }
    
    // Keyword-driven resolutions
    if (keywords.includes("happy") || keywords.includes("success") || keywords.includes("victory")) {
      return `${char1} and ${char2} smile, knowing everything worked out perfectly.`;
    }
    if (keywords.includes("sad") || keywords.includes("loss") || keywords.includes("goodbye")) {
      return `${char1} watches sadly as ${char2} walks away, perhaps forever.`;
    }
    if (keywords.includes("surprise") || keywords.includes("twist") || keywords.includes("unexpected")) {
      return `Just when they think it's over, ${char1} gets an unexpected surprise.`;
    }
    if (keywords.includes("learn") || keywords.includes("lesson") || keywords.includes("growth")) {
      return `${char1} realizes they've learned something valuable from this experience.`;
    }
    if (keywords.includes("friendship") || keywords.includes("bond") || keywords.includes("together")) {
      return `${char1} and ${char2} walk away as newfound friends.`;
    }
    if (keywords.includes("mystery") || keywords.includes("question") || keywords.includes("unknown")) {
      return `The mystery remains unsolved, leaving ${char1} with more questions than answers.`;
    }
    
    // Genre-specific resolutions
    if (input.genre === "horror") {
      return `${char1} escapes, but the haunting experience will stay with them forever.`;
    }
    if (input.genre === "comedy") {
      return `Despite all the chaos, ${char1} and ${char2} can't help but laugh at the absurdity.`;
    }
    if (input.genre === "romance") {
      return `${char1} and ${char2} share a tender moment, their future bright with possibility.`;
    }
    if (input.genre === "drama") {
      return `${char1} takes a deep breath, changed by everything that's happened.`;
    }
    
    return `${char1} and ${char2} share a meaningful look.`;
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
      development: {
        casual: ["Wait, there's more.", "This is getting interesting.", "Hold on a second."],
        professional: ["There's an additional factor to consider.", "This requires further examination.", "Allow me to elaborate."],
        humorous: ["Plot thickens!", "Oh, it gets better.", "But wait, there's more!"],
        dramatic: ["You don't know the whole story.", "There's something else.", "This changes everything."]
      },
      climax: {
        casual: ["This is it!", "Now or never.", "Here we go."],
        professional: ["The decisive moment has arrived.", "This is the crucial juncture.", "We must act now."],
        humorous: ["And here's the big finale!", "Time for the grand reveal!", "Ta-da!"],
        dramatic: ["Everything depends on this!", "This is the moment of truth!", "Now you'll see!"]
      },
      resolution: {
        casual: ["Actually, that worked out.", "Not bad.", "See you around."],
        professional: ["Thank you for your understanding.", "I believe we've reached an agreement.", "Good day."],
        humorous: ["And that's how you break the ice.", "Mission accomplished?", "Well, that happened."],
        dramatic: ["Maybe there's hope after all.", "I understand now.", "Thank you."]
      }
    };
    
    // Safer lookup with explicit fallback
    const beatDialogues = dialogues[beatType as keyof typeof dialogues];
    if (!beatDialogues) {
      console.warn(`⚠️ Unknown beat type: ${beatType}, using opening`);
      const fallbackOptions = dialogues.opening.casual;
      return fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)];
    }
    
    const toneOptions = beatDialogues[tone as keyof typeof beatDialogues];
    if (!toneOptions || !Array.isArray(toneOptions) || toneOptions.length === 0) {
      console.warn(`⚠️ No dialogues for tone '${tone}' in beat '${beatType}', using casual fallback`);
      const fallbackOptions = beatDialogues.casual || dialogues.opening.casual;
      return fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)];
    }
    
    return toneOptions[Math.floor(Math.random() * toneOptions.length)];
  }

  private beatToScriptLines(beat: StoryBeat, characters: Character[], tone: string): ScriptLine[] {
    const lines: ScriptLine[] = [];
    
    // Action line with tone-influenced modifications
    if (beat.action) {
      let actionContent = beat.action;
      
      // Modify action description based on tone
      if (tone === "dramatic") {
        actionContent = actionContent.replace(/\./g, ', their expression grave.');
        if (!actionContent.includes('slowly') && !actionContent.includes('carefully')) {
          actionContent = actionContent.replace(/approaches|enters|walks/, 'slowly $&');
        }
      } else if (tone === "humorous") {
        if (!actionContent.includes('trips') && !actionContent.includes('stumbles')) {
          actionContent = actionContent.replace(/approaches|enters/, '$& somewhat awkwardly,');
        }
      } else if (tone === "professional") {
        actionContent = actionContent.replace(/with nervous energy|nervously/, 'with measured confidence');
      }
      
      lines.push({ type: "action", content: actionContent });
      lines.push({ type: "action", content: "" }); // Empty line
    }
    
    // Dialogue
    if (beat.dialogue && characters.length > 0) {
      const character = characters[0];
      lines.push({ type: "character", content: character.name, character: character.name });
      
      // Add tone-specific parentheticals
      const parentheticals = {
        humorous: ["(grinning)", "(with a smirk)", "(chuckling)", "(playfully)", "(sarcastically)"],
        dramatic: ["(intensely)", "(with urgency)", "(emotionally)", "(desperately)", "(solemnly)"],
        professional: ["(calmly)", "(matter-of-factly)", "(formally)", "(diplomatically)", "(professionally)"],
        casual: ["(casually)", "(relaxed)", "(with a shrug)", "(nonchalantly)", "(easily)"]
      };
      
      if (Math.random() > 0.4) { // 60% chance to add parenthetical
        const toneParentheticals = parentheticals[tone as keyof typeof parentheticals] || parentheticals.casual;
        const randomParenthetical = toneParentheticals[Math.floor(Math.random() * toneParentheticals.length)];
        lines.push({ type: "parenthetical", content: randomParenthetical });
      }
      
      lines.push({ type: "dialogue", content: beat.dialogue, character: character.name });
      lines.push({ type: "action", content: "" }); // Empty line
    }
    
    return lines;
  }

  private formatScript(lines: ScriptLine[], mode: string, platform: string = "general"): string {
    let formattedScript = "";
    
    switch (mode) {
      case "dialog-only":
        formattedScript = this.formatDialogOnly(lines);
        break;
      case "voiceover":
        formattedScript = this.formatVoiceover(lines);
        break;
      case "shooting-script":
      default:
        formattedScript = this.formatShootingScript(lines);
        break;
    }
    
    // Add platform-specific formatting hints
    return this.addPlatformHints(formattedScript, platform);
  }

  private addPlatformHints(script: string, platform: string): string {
    const platformHints = {
      tiktok: "\n\n// TikTok Tips:\n// • Keep first 3 seconds engaging\n// • Use trending sounds/music\n// • Add captions for accessibility\n// • Vertical 9:16 aspect ratio",
      reels: "\n\n// Instagram Reels Tips:\n// • Hook viewers in first 3 seconds\n// • Use popular hashtags\n// • Add text overlays for key points\n// • Vertical format works best",
      youtube: "\n\n// YouTube Shorts Tips:\n// • Strong opening hook\n// • Include call-to-action\n// • Use engaging thumbnails\n// • Vertical or square format",
      general: ""
    };
    
    return script + (platformHints[platform as keyof typeof platformHints] || "");
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