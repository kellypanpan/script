// Sample scripts for ScriptProShot showcase
export interface SampleScript {
  id: string;
  title: string;
  category: string;
  duration: string;
  genre: string;
  description: string;
  script: string;
}

export const sampleScripts: SampleScript[] = [
  {
    id: "tiktok-morning-routine",
    title: "Morning Coffee Disaster",
    category: "TikTok Script",
    duration: "15 seconds",
    genre: "Comedy",
    description: "A relatable morning mishap that goes viral",
    script: `INT. KITCHEN - MORNING

ALEX (20s, messy hair, pajamas) stumbles toward coffee machine.

ALEX
(groggily)
Coffee... need coffee...

Alex presses button. Nothing happens. Presses again. Still nothing.

ALEX (CONT'D)
(panicking)
No, no, NO!

Alex frantically shakes the machine. Coffee explodes everywhere.

ALEX (CONT'D)
(covered in coffee, deadpan to camera)
Good morning, Internet.

FREEZE FRAME on Alex's coffee-covered face.

FADE OUT.`
  },
  
  {
    id: "love-bookstore",
    title: "Between the Lines",
    category: "Romance Short",
    duration: "2-3 minutes", 
    genre: "Romance",
    description: "Two strangers connect over a shared love of books",
    script: `INT. VINTAGE BOOKSTORE - AFTERNOON

Sunlight streams through dusty windows. MAYA (25, architect, organized) searches the poetry section.

MAYA
(muttering)
Where is Neruda when you need him?

ETHAN (27, writer, disheveled) appears around the corner, arms full of books. They collide. Books scatter everywhere.

ETHAN
I'm so sorry! I didn't see—

MAYA
(kneeling to collect books)
No, it's fine. I was completely—

They reach for the same book: "Twenty Love Poems." Their hands touch. Eye contact.

ETHAN
(reading the cover)
Neruda. Good choice.

MAYA
(surprised)
You know Neruda?

ETHAN
"I love you without knowing how, or when, or from where..."

MAYA
(finishing the quote)
"I love you simply, without problems or pride."

They stand, still holding the book between them.

ETHAN
I'm Ethan. Writer. Clearly terrible at walking.

MAYA
Maya. Architect. Usually better at spatial awareness.

ETHAN
Coffee? There's a place next door that makes terrible coffee but has excellent poetry readings.

MAYA
(smiling)
Terrible coffee sounds perfect.

As they walk toward the door together, Ethan drops another book. They both laugh.

ETHAN
I swear I'm normally more coordinated.

MAYA
I hope not. This is much more interesting.

EXT. BOOKSTORE - CONTINUOUS

Through the window, we see them talking animatedly at a small café table, both gesturing with their coffee cups.

FADE OUT.`
  },
  
  {
    id: "sneaker-ad",
    title: "Every Step Counts",
    category: "Brand Advertisement", 
    duration: "30 seconds",
    genre: "Motivational",
    description: "Nike-style inspirational sneaker commercial",
    script: `EXT. CITY STREET - DAWN

Empty streets. A single sneaker steps into frame.

NARRATOR (V.O.)
(confident, inspiring)
Every journey starts with a single step.

MONTAGE - VARIOUS LOCATIONS:

- Young runner lacing up shoes in apartment
- Office worker choosing stairs over elevator  
- Dancer practicing in empty studio
- Elderly man walking in park with grandson

NARRATOR (V.O.)
Some steps are small. Some change everything.

CLOSE-UP: Different feet, different sneakers, all moving forward.

NARRATOR (V.O.)
What matters isn't where you start...

Quick cuts of people achieving goals: crossing finish line, getting promotion, nailing dance move, teaching grandson to walk.

NARRATOR (V.O.)
It's that you never stop moving forward.

FINAL SHOT: Multiple people from different backgrounds, all wearing the same sneaker brand, walking toward camera in slow motion.

SUPER: "STEPFORWARD" logo appears.

NARRATOR (V.O.)
StepForward. Every step counts.

FADE TO BLACK.`
  }
];

export const getScriptByCategory = (category: string): SampleScript | undefined => {
  return sampleScripts.find(script => script.category.toLowerCase().includes(category.toLowerCase()));
};

export const getRandomScript = (): SampleScript => {
  return sampleScripts[Math.floor(Math.random() * sampleScripts.length)];
};