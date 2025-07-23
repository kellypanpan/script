export const characterIdeas: string[] = [
  // Protagonists
  'Alex Chen - Tech entrepreneur',
  'Maya Rodriguez - Marine biologist', 
  'Sam Thompson - Street artist',
  'Riley Park - Investigative journalist',
  'Jordan Smith - Emergency room doctor',
  'Casey Williams - Professional chef',
  'Taylor Brown - Music teacher',
  'Morgan Davis - Environmental lawyer',
  'Quinn Johnson - Space engineer',
  'River Martinez - Wildlife photographer',
  
  // Supporting Characters
  'Detective Sarah Cole',
  'Professor Michael Greene',
  'Nurse Emma Watson',
  'Captain Lisa Torres',
  'Librarian Ben Foster',
  'Mechanic Tony Russo',
  'Barista Zoe Campbell',
  'Pilot Jack Harrison',
  'Designer Aria Kim',
  'Farmer Joe Patterson',
  
  // Antagonists
  'Victor Kane - Corporate CEO',
  'Dr. Helena Cross - Mad scientist',
  'Marcus Steel - Crime boss',
  'Agent Diana Black - Government spy',
  'Rex Thunder - Rival competitor',
  
  // Quirky Characters  
  'Grandma Rosie - Wisdom keeper',
  'Benny the Clown - Street performer',
  'Luna Star - Fortune teller',
  'Chuck Wheels - Taxi driver',
  'Pixel - Tech genius kid',
  'Sage the Owl - Wise mentor',
  'Flash Gordon - Speed enthusiast',
  'Melody Heart - Aspiring singer',
  'Phoenix Wright - Ambitious lawyer',
  'Storm Walker - Adventure seeker',
  
  // Unique Roles
  'Robot companion R2-Delta',
  'AI assistant ARIA',
  'Ghost of Christmas Past',
  'Time traveler from 2087',
  'Alien ambassador Zxor',
  'Talking cat Mr. Whiskers',
  'Superhero "The Guardian"',
  'Wizard Eldrin the Wise',
  'Vampire Count Vladislav',
  'Dragon keeper Thorin',
  
  // Everyday Heroes
  'Single mom Lisa',
  'Retired veteran Frank',
  'College student Jamie',
  'Small business owner Rosa',
  'Struggling actor David',
  'Elementary teacher Miss Amy',
  'Social worker Carlos',
  'Volunteer firefighter Mike',
  'Community organizer Kira',
  'Local shop owner Hassan'
];

// Character archetypes for inspiration
export const characterArchetypes: string[] = [
  'The Hero',
  'The Mentor', 
  'The Sidekick',
  'The Love Interest',
  'The Villain',
  'The Trickster',
  'The Innocent',
  'The Rebel',
  'The Caregiver',
  'The Explorer',
  'The Sage',
  'The Creator',
  'The Ruler',
  'The Magician',
  'The Everyman'
];

// Quick character generator function
export const getRandomCharacter = (): string => {
  return characterIdeas[Math.floor(Math.random() * characterIdeas.length)];
};

export const getRandomArchetype = (): string => {
  return characterArchetypes[Math.floor(Math.random() * characterArchetypes.length)];
};