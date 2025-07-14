import { generateScript } from './scriptGenerator';

// Test cases for the script generator
console.log('=== ScriptProShot Backend Engine Tests ===\n');

// Test 1: Basic comedy script
console.log('Test 1: Basic Comedy Script');
console.log('=============================');
const comedyTest = {
  genre: "comedy",
  keywords: "awkward date, AI dating app, coffee spill",
  characters: ["Maya", "Ethan"],
  tone: "humorous",
  extra: "unexpected glitch at the end",
  maxLength: "default" as const,
  mode: "shooting-script" as const
};

const comedyScript = generateScript(comedyTest);
console.log(comedyScript);
console.log('\n---\n');

// Test 2: Dialog-only mode
console.log('Test 2: Dialog-Only Mode');
console.log('========================');
const dialogTest = {
  genre: "romance",
  keywords: "coffee shop, first meeting",
  characters: ["Alex", "Jordan"],
  tone: "casual",
  maxLength: "short" as const,
  mode: "dialog-only" as const
};

const dialogScript = generateScript(dialogTest);
console.log(dialogScript);
console.log('\n---\n');

// Test 3: Voiceover format
console.log('Test 3: Voiceover Format');
console.log('=======================');
const voiceoverTest = {
  genre: "thriller",
  keywords: "mystery, investigation, dark secrets",
  characters: ["Detective"],
  tone: "dramatic",
  maxLength: "short" as const,
  mode: "voiceover" as const
};

const voiceoverScript = generateScript(voiceoverTest);
console.log(voiceoverScript);
console.log('\n---\n');

// Test 4: Extended drama script
console.log('Test 4: Extended Drama Script');
console.log('=============================');
const dramaTest = {
  genre: "drama",
  keywords: "family reunion, old wounds, forgiveness",
  characters: ["Sarah", "Mom", "Dad"],
  tone: "dramatic",
  maxLength: "extended" as const,
  mode: "shooting-script" as const
};

const dramaScript = generateScript(dramaTest);
console.log(dramaScript);
console.log('\n---\n');

// Test 5: Action sequence
console.log('Test 5: Action Sequence');
console.log('======================');
const actionTest = {
  genre: "action",
  keywords: "chase scene, rooftop, escape",
  characters: ["Hero", "Villain"],
  tone: "professional",
  maxLength: "default" as const,
  mode: "shooting-script" as const
};

const actionScript = generateScript(actionTest);
console.log(actionScript);

console.log('\n=== All Tests Complete ===');

export { comedyTest, dialogTest, voiceoverTest, dramaTest, actionTest };