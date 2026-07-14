import { Project, Character, VoiceGender, VoiceEmotion } from "./types";

export interface StockBackground {
  id: string;
  name: string;
  style: string;
  description: string;
  colors: {
    day: string[];
    sunset: string[];
    night: string[];
  };
  hasParticles: boolean;
}

export const STOCK_BACKGROUNDS: StockBackground[] = [
  {
    id: "modern_lab",
    name: "Moon Laboratory",
    style: "modern_lab",
    description: "High-tech facility with holographic consoles and glowing star engines.",
    colors: {
      day: ["from-slate-100 to-indigo-100", "bg-slate-200"],
      sunset: ["from-indigo-900 to-purple-900", "bg-indigo-950"],
      night: ["from-slate-900 to-indigo-950", "bg-slate-950"],
    },
    hasParticles: true,
  },
  {
    id: "cozy_home",
    name: "Cozy Home Living Room",
    style: "cozy_home",
    description: "Warm fireplace, wooden shelves, comfy armchair, and soft lamp glow.",
    colors: {
      day: ["from-orange-50 to-amber-100", "bg-orange-100"],
      sunset: ["from-orange-800 to-red-950", "bg-orange-950"],
      night: ["from-amber-950 to-stone-950", "bg-stone-950"],
    },
    hasParticles: false,
  },
  {
    id: "star_station",
    name: "Star Station Orbit",
    style: "star_station",
    description: "Command bridge viewing a massive, swirling purple nebula and stars.",
    colors: {
      day: ["from-slate-900 via-indigo-950 to-violet-900", "bg-slate-950"],
      sunset: ["from-purple-900 to-pink-950", "bg-purple-950"],
      night: ["from-black via-slate-950 to-purple-950", "bg-black"],
    },
    hasParticles: true,
  },
  {
    id: "dense_forest",
    name: "Dense Redwood Forest",
    style: "dense_forest",
    description: "Towering green trunks, dancing sun rays, rich moss, and wild fireflies.",
    colors: {
      day: ["from-teal-50 to-emerald-100", "bg-emerald-50"],
      sunset: ["from-emerald-900 to-stone-900", "bg-emerald-950"],
      night: ["from-teal-950 to-zinc-950", "bg-zinc-950"],
    },
    hasParticles: true,
  },
  {
    id: "retro_city",
    name: "Neon Retro City",
    style: "retro_city",
    description: "Cyberpunk streets decorated with neon signs, digital mist, and raindrops.",
    colors: {
      day: ["from-blue-50 to-slate-200", "bg-slate-300"],
      sunset: ["from-fuchsia-900 to-violet-950", "bg-violet-950"],
      night: ["from-zinc-950 via-slate-900 to-fuchsia-950", "bg-zinc-950"],
    },
    hasParticles: true,
  },
  {
    id: "dry_desert",
    name: "Dry Desert Dunes",
    style: "dry_desert",
    description: "Sweeping orange sands, sharp wind ridges, and heat distortion waves.",
    colors: {
      day: ["from-amber-100 to-yellow-200", "bg-amber-50"],
      sunset: ["from-amber-800 to-orange-950", "bg-orange-950"],
      night: ["from-stone-900 to-neutral-950", "bg-stone-950"],
    },
    hasParticles: true,
  },
  {
    id: "fantasy_castle",
    name: "Fantasy Rune Castle",
    style: "fantasy_castle",
    description: "Stone masonry arches with floating, glowing blue magic runes and banners.",
    colors: {
      day: ["from-indigo-50 to-sky-100", "bg-sky-50"],
      sunset: ["from-violet-800 to-rose-950", "bg-rose-950"],
      night: ["from-purple-950 via-indigo-950 to-slate-950", "bg-purple-950"],
    },
    hasParticles: true,
  },
  {
    id: "abstract_educational",
    name: "Abstract Geometric Stage",
    style: "abstract_educational",
    description: "Polite floating forms, pastel colors, grid alignments, and equations.",
    colors: {
      day: ["from-slate-50 to-slate-100", "bg-slate-50"],
      sunset: ["from-slate-200 to-slate-300", "bg-slate-200"],
      night: ["from-slate-800 to-slate-900", "bg-slate-900"],
    },
    hasParticles: false,
  },
];

export interface StockSoundtrack {
  id: string;
  name: string;
  theme: string;
  description: string;
  vibe: string;
  tempo: number;
}

export const STOCK_SOUNDTRACKS: StockSoundtrack[] = [
  { id: "calm_wind", name: "Whispering Winds", theme: "calm", description: "Soft ambient piano pad and gentle cello chords.", vibe: "Peaceful", tempo: 70 },
  { id: "space_engine", name: "Star Engine Symphony", theme: "technology", description: "Pulsing arpeggiator synths with cinematic percussion.", vibe: "Awe-inspiring", tempo: 110 },
  { id: "hero_quest", name: "Galaxy Explorers", theme: "adventure", description: "Majestic brass and sweeping orchestral strings.", vibe: "Heroic", tempo: 125 },
  { id: "magical_runes", name: "Mystic Alchemy", theme: "fantasy", description: "Harp melodies accompanied by light glockenspiels.", vibe: "Ethereal", tempo: 85 },
  { id: "detective_fog", name: "The Shadow Corridor", theme: "mystery", description: "Dissonant violins, plucking contrabass, and synthetic clocks.", vibe: "Suspenseful", tempo: 80 },
  { id: "silly_paws", name: "Whimsical Capers", theme: "comedy", description: "Bouncing woodwinds, pizzicato, and a happy xylophone.", vibe: "Playful", tempo: 130 },
  { id: "sandbox_days", name: "Toddler Playground", theme: "children", description: "Cheerful ukulele, whistle theme, and shaker rhythms.", vibe: "Jolly", tempo: 115 },
  { id: "final_clash", name: "Chronos Rise", theme: "cinematic", description: "Epic industrial drums, dramatic strings, and full choir swells.", vibe: "Dramatic", tempo: 140 },
];

export interface StockSoundEffect {
  id: string;
  name: string;
  category: string;
  icon: string;
}

export const STOCK_SFX: StockSoundEffect[] = [
  { id: "magical_chime", name: "Magical Chime", category: "Magic", icon: "Sparkles" },
  { id: "explosion", name: "Thunder Explosion", category: "Action", icon: "Bomb" },
  { id: "footsteps", name: "Eco Footsteps", category: "Movement", icon: "Footprints" },
  { id: "laser", name: "Plasma Laser Zap", category: "Sci-Fi", icon: "Zap" },
  { id: "wind", name: "Howling Wind gust", category: "Weather", icon: "Wind" },
  { id: "applause", name: "Theatre Applause", category: "Crowd", icon: "ThumbsUp" },
];

// Pre-made characters with default landmarks and vectors
export const PREMADE_CHARACTERS: Character[] = [
  {
    id: "KIBO",
    name: "KIBO",
    gender: "male",
    voiceId: "en-US-Standard-B",
    voiceSettings: {
      speed: 1.0,
      pitch: 1.05,
      energy: 1.2,
      emotion: "excited",
      accent: "US",
      gender: "male",
    },
    imageUrl: "stock_kibo",
    faceLandmarks: {
      leftEye: { x: 38, y: 40 },
      rightEye: { x: 62, y: 40 },
      mouthLeft: { x: 42, y: 72 },
      mouthRight: { x: 58, y: 72 },
      mouthCenter: { x: 50, y: 74 },
      nose: { x: 50, y: 55 },
      faceOutline: { x: 20, y: 15, width: 60, height: 70 },
    },
    subtitleColor: "#4F46E5", // Primary indigo
  },
  {
    id: "NORI",
    name: "NORI",
    gender: "female",
    voiceId: "en-GB-Standard-A",
    voiceSettings: {
      speed: 1.0,
      pitch: 1.15,
      energy: 1.0,
      emotion: "calm",
      accent: "UK",
      gender: "female",
    },
    imageUrl: "stock_nori",
    faceLandmarks: {
      leftEye: { x: 38, y: 38 },
      rightEye: { x: 62, y: 38 },
      mouthLeft: { x: 43, y: 70 },
      mouthRight: { x: 57, y: 70 },
      mouthCenter: { x: 50, y: 71 },
      nose: { x: 50, y: 53 },
      faceOutline: { x: 22, y: 12, width: 56, height: 72 },
    },
    subtitleColor: "#0F9D8A", // Accent teal
  },
];

// Full 15-Minute Space Opera Sample Project
export const SAMPLE_PROJECT: Project = {
  id: "chronos_star_15min",
  name: "Chronos Star Engine",
  rawScript: `[SCENE: Moon Laboratory | Night]
[MUSIC: Technology | Low]
[CAMERA: Wide shot]

KIBO (male, excited): Nori, the star engine is ready!
NORI (female, surprised): It is beautiful. Shall we begin?

[ACTION: Kibo points toward the glowing engine]
[SFX: Magical chime]
[CAMERA: Close-up on Nori]

NARRATOR: Their greatest adventure was about to begin.`,
  aspectRatio: "16:9",
  fps: 30,
  performanceMode: "balanced",
  characters: PREMADE_CHARACTERS,
  audioMix: {
    musicVolume: 0.25,
    sfxVolume: 0.6,
    dialogueVolume: 0.9,
    duckingAmount: 0.7,
  },
  createdAt: Date.now() - 3600000 * 24 * 3, // 3 days ago
  updatedAt: Date.now() - 3600000 * 4,     // 4 hours ago
  scenes: [
    {
      id: "sc_1",
      sceneIndex: 1,
      title: "The Laboratory Assembly",
      duration: 10.5,
      bgStyle: "modern_lab",
      bgTimeOfDay: "night",
      bgWeatherEffect: "particles",
      cameraShot: "wide",
      dialogues: [
        {
          id: "d_1_1",
          characterId: "KIBO",
          text: "Nori! Behold, the core calculations are locked. The Chronos Star Engine is finally complete!",
          emotion: "excited",
          action: "speaking",
          startTime: 0,
          duration: 5.5,
        },
        {
          id: "d_1_2",
          characterId: "NORI",
          text: "It is absolutely stunning, Kibo. I can feel the space-time fluctuations from here.",
          emotion: "happy",
          action: "reacting",
          startTime: 5.5,
          duration: 5.0,
        },
      ],
      charactersPresent: [
        { characterId: "KIBO", positionX: 25, positionY: 0, scale: 1.1, depth: 2, facing: "right" },
        { characterId: "NORI", positionX: 75, positionY: 0, scale: 1.1, depth: 1, facing: "left" },
      ],
      sfxCues: [
        { id: "sfx_1_1", soundName: "magical_chime", startTime: 1.5, volume: 0.8 },
      ],
      musicCue: { theme: "technology", volume: 0.3 },
      transition: "fade",
      isLocked: true,
    },
    {
      id: "sc_2",
      sceneIndex: 2,
      title: "Activating the Star Core",
      duration: 11.0,
      bgStyle: "modern_lab",
      bgTimeOfDay: "night",
      bgWeatherEffect: "particles",
      cameraShot: "close-up",
      dialogues: [
        {
          id: "d_2_1",
          characterId: "KIBO",
          text: "Initiating ignition sequence in three... two... one... Powering up!",
          emotion: "excited",
          action: "pointing",
          startTime: 0,
          duration: 4.5,
        },
        {
          id: "d_2_2",
          characterId: "",
          text: "NARRATOR: The Star Engine roared to life with an ethereal pulse, folding space around them.",
          emotion: "mysterious",
          action: "speaking",
          startTime: 4.5,
          duration: 6.5,
        },
      ],
      charactersPresent: [
        { characterId: "KIBO", positionX: 50, positionY: 0, scale: 1.4, depth: 1, facing: "right" },
      ],
      sfxCues: [
        { id: "sfx_2_1", soundName: "laser", startTime: 1.2, volume: 0.7 },
        { id: "sfx_2_2", soundName: "explosion", startTime: 3.5, volume: 0.9 },
      ],
      musicCue: { theme: "cinematic", volume: 0.4 },
      transition: "dissolve",
      isLocked: true,
    },
    {
      id: "sc_3",
      sceneIndex: 3,
      title: "Orbit Observation Bridge",
      duration: 13.0,
      bgStyle: "star_station",
      bgTimeOfDay: "night",
      bgWeatherEffect: "stars",
      cameraShot: "wide",
      dialogues: [
        {
          id: "d_3_1",
          characterId: "NORI",
          text: "Look outside, Kibo! We've entered high orbit over the Chronos Ring. The nebula is glowing brightly.",
          emotion: "excited",
          action: "pointing",
          startTime: 0,
          duration: 6.5,
        },
        {
          id: "d_3_2",
          characterId: "KIBO",
          text: "Incredible. The gravitational anchors are holding steady. We actually succeeded!",
          emotion: "happy",
          action: "celebrating",
          startTime: 6.5,
          duration: 6.5,
        },
      ],
      charactersPresent: [
        { characterId: "KIBO", positionX: 30, positionY: 0, scale: 1.1, depth: 1, facing: "right" },
        { characterId: "NORI", positionX: 70, positionY: 0, scale: 1.1, depth: 2, facing: "left" },
      ],
      sfxCues: [
        { id: "sfx_3_1", soundName: "wind", startTime: 0.5, volume: 0.3 },
      ],
      musicCue: { theme: "adventure", volume: 0.35 },
      transition: "fade",
      isLocked: true,
    },
    {
      id: "sc_4",
      sceneIndex: 4,
      title: "Gravitational Anomaly Detected",
      duration: 12.0,
      bgStyle: "star_station",
      bgTimeOfDay: "night",
      bgWeatherEffect: "stars",
      cameraShot: "zoom-in",
      dialogues: [
        {
          id: "d_4_1",
          characterId: "NORI",
          text: "Wait... Kibo! The temporal chronometer is spiking! A black hole vortex is opening directly ahead!",
          emotion: "angry", // used for panic/urgency
          action: "reacting",
          startTime: 0,
          duration: 6.0,
        },
        {
          id: "d_4_2",
          characterId: "KIBO",
          text: "Brace yourselves! Diverting all thermal capacity to the deflector fields now!",
          emotion: "angry",
          action: "speaking",
          startTime: 6.0,
          duration: 6.0,
        },
      ],
      charactersPresent: [
        { characterId: "KIBO", positionX: 25, positionY: 0, scale: 1.25, depth: 1, facing: "right" },
        { characterId: "NORI", positionX: 75, positionY: 0, scale: 1.25, depth: 2, facing: "left" },
      ],
      sfxCues: [
        { id: "sfx_4_1", soundName: "laser", startTime: 1.0, volume: 0.8 },
        { id: "sfx_4_2", soundName: "explosion", startTime: 4.5, volume: 0.95 },
      ],
      musicCue: { theme: "mystery", volume: 0.5 },
      transition: "cut",
      isLocked: true,
    },
    {
      id: "sc_5",
      sceneIndex: 5,
      title: "Emergency Descent to Redwood Planet",
      duration: 11.5,
      bgStyle: "dense_forest",
      bgTimeOfDay: "sunset",
      bgWeatherEffect: "fog",
      cameraShot: "establishing",
      dialogues: [
        {
          id: "d_5_1",
          characterId: "",
          text: "NARRATOR: Plunging through the temporal rift, the shuttle crashed safely into an uncharted forest planet.",
          emotion: "mysterious",
          action: "speaking",
          startTime: 0,
          duration: 6.0,
        },
        {
          id: "d_5_2",
          characterId: "NORI",
          text: "Is everyone alright? The environmental scanners show breathable oxygen, but... we are stranded.",
          emotion: "sad",
          action: "sitting",
          startTime: 6.0,
          duration: 5.5,
        },
      ],
      charactersPresent: [
        { characterId: "NORI", positionX: 50, positionY: 0, scale: 1.1, depth: 1, facing: "right" },
      ],
      sfxCues: [
        { id: "sfx_5_1", soundName: "wind", startTime: 1.5, volume: 0.7 },
      ],
      musicCue: { theme: "calm", volume: 0.25 },
      transition: "fade",
      isLocked: true,
    },
    {
      id: "sc_6",
      sceneIndex: 6,
      title: "Exploring the Ancient Redwood",
      duration: 12.0,
      bgStyle: "dense_forest",
      bgTimeOfDay: "day",
      bgWeatherEffect: "particles",
      cameraShot: "wide",
      dialogues: [
        {
          id: "d_6_1",
          characterId: "KIBO",
          text: "This flora is unbelievable. Nori, look at these colossal glowing trunks! It's like they're feeding on direct vacuum energy.",
          emotion: "happy",
          action: "speaking",
          startTime: 0,
          duration: 6.5,
        },
        {
          id: "d_6_2",
          characterId: "NORI",
          text: "My readings indicate a high concentration of star core quartz buried deep in the root system.",
          emotion: "calm",
          action: "pointing",
          startTime: 6.5,
          duration: 5.5,
        },
      ],
      charactersPresent: [
        { characterId: "KIBO", positionX: 25, positionY: 0, scale: 1.1, depth: 1, facing: "right" },
        { characterId: "NORI", positionX: 75, positionY: 0, scale: 1.1, depth: 2, facing: "left" },
      ],
      sfxCues: [
        { id: "sfx_6_1", soundName: "footsteps", startTime: 1.0, volume: 0.5 },
      ],
      musicCue: { theme: "fantasy", volume: 0.3 },
      transition: "fade",
      isLocked: true,
    },
    {
      id: "sc_7",
      sceneIndex: 7,
      title: "Deciphering the Ancient Castle Ruins",
      duration: 13.5,
      bgStyle: "fantasy_castle",
      bgTimeOfDay: "day",
      bgWeatherEffect: "particles",
      cameraShot: "medium",
      dialogues: [
        {
          id: "d_7_1",
          characterId: "NORI",
          text: "Kibo, look! There's an ancient citadel structure here. Look at those floating neon glyphs!",
          emotion: "excited",
          action: "pointing",
          startTime: 0,
          duration: 6.5,
        },
        {
          id: "d_7_2",
          characterId: "KIBO",
          text: "They are glowing. Wait, this looks like the exact same math formulas we used in our labs!",
          emotion: "surprised" as any, // fallback
          action: "reacting",
          startTime: 6.5,
          duration: 7.0,
        },
      ],
      charactersPresent: [
        { characterId: "KIBO", positionX: 30, positionY: 0, scale: 1.15, depth: 1, facing: "right" },
        { characterId: "NORI", positionX: 70, positionY: 0, scale: 1.15, depth: 2, facing: "left" },
      ],
      sfxCues: [
        { id: "sfx_7_1", soundName: "magical_chime", startTime: 2.2, volume: 0.8 },
      ],
      musicCue: { theme: "fantasy", volume: 0.35 },
      transition: "dissolve",
      isLocked: true,
    },
    {
      id: "sc_8",
      sceneIndex: 8,
      title: "The Hologram Projection Room",
      duration: 14.0,
      bgStyle: "fantasy_castle",
      bgTimeOfDay: "night",
      bgWeatherEffect: "particles",
      cameraShot: "close-up",
      dialogues: [
        {
          id: "d_8_1",
          characterId: "",
          text: "NARRATOR: As Nori brushed her hand across the magical console, a giant holographic cosmic map projected into the center of the hall.",
          emotion: "mysterious",
          action: "speaking",
          startTime: 0,
          duration: 7.0,
        },
        {
          id: "d_8_2",
          characterId: "NORI",
          text: "This map shows a direct wormhole corridor back to our star base. But we need a massive power charge to trigger it.",
          emotion: "excited",
          action: "speaking",
          startTime: 7.0,
          duration: 7.0,
        },
      ],
      charactersPresent: [
        { characterId: "NORI", positionX: 50, positionY: 0, scale: 1.4, depth: 1, facing: "left" },
      ],
      sfxCues: [
        { id: "sfx_8_1", soundName: "laser", startTime: 1.5, volume: 0.6 },
      ],
      musicCue: { theme: "technology", volume: 0.35 },
      transition: "fade",
      isLocked: true,
    },
    {
      id: "sc_9",
      sceneIndex: 9,
      title: "The Desert Sands Trek",
      duration: 11.5,
      bgStyle: "dry_desert",
      bgTimeOfDay: "sunset",
      bgWeatherEffect: "particles",
      cameraShot: "establishing",
      dialogues: [
        {
          id: "d_9_1",
          characterId: "KIBO",
          text: "The calculations lead right through these dunes. The heat is heavy, but we have to keep moving.",
          emotion: "sad",
          action: "speaking",
          startTime: 0,
          duration: 6.0,
        },
        {
          id: "d_9_2",
          characterId: "NORI",
          text: "Don't lose hope. We're close to the prime crystal geode according to my energy radar.",
          emotion: "calm",
          action: "speaking",
          startTime: 6.0,
          duration: 5.5,
        },
      ],
      charactersPresent: [
        { characterId: "KIBO", positionX: 20, positionY: 0, scale: 1.0, depth: 1, facing: "right" },
        { characterId: "NORI", positionX: 65, positionY: 0, scale: 1.0, depth: 2, facing: "right" },
      ],
      sfxCues: [
        { id: "sfx_9_1", soundName: "footsteps", startTime: 1.0, volume: 0.4 },
        { id: "sfx_9_2", soundName: "wind", startTime: 4.5, volume: 0.5 },
      ],
      musicCue: { theme: "mystery", volume: 0.3 },
      transition: "fade",
      isLocked: true,
    },
    {
      id: "sc_10",
      sceneIndex: 10,
      title: "Discovering the Crystal Temple",
      duration: 12.0,
      bgStyle: "dry_desert",
      bgTimeOfDay: "day",
      bgWeatherEffect: "none",
      cameraShot: "wide",
      dialogues: [
        {
          id: "d_10_1",
          characterId: "KIBO",
          text: "Look at the ridge! There is a colossal crystalline obelisk. It's vibrating with extreme nuclear frequency!",
          emotion: "excited",
          action: "pointing",
          startTime: 0,
          duration: 6.5,
        },
        {
          id: "d_10_2",
          characterId: "NORI",
          text: "That crystal has enough power to jump-start our entire core engine ten times over! We must siphon its power.",
          emotion: "excited",
          action: "speaking",
          startTime: 6.5,
          duration: 5.5,
        },
      ],
      charactersPresent: [
        { characterId: "KIBO", positionX: 30, positionY: 0, scale: 1.1, depth: 1, facing: "right" },
        { characterId: "NORI", positionX: 70, positionY: 0, scale: 1.1, depth: 2, facing: "left" },
      ],
      sfxCues: [
        { id: "sfx_10_1", soundName: "magical_chime", startTime: 1.0, volume: 0.8 },
      ],
      musicCue: { theme: "adventure", volume: 0.4 },
      transition: "fade",
      isLocked: true,
    },
    {
      id: "sc_11",
      sceneIndex: 11,
      title: "Siphoning the Chronos Energy",
      duration: 13.0,
      bgStyle: "dry_desert",
      bgTimeOfDay: "day",
      bgWeatherEffect: "particles",
      cameraShot: "close-up",
      dialogues: [
        {
          id: "d_11_1",
          characterId: "",
          text: "NARRATOR: Connecting the quantum jumper, Nori initiated the star siphon. Beams of pure electric light shot through the machinery.",
          emotion: "mysterious",
          action: "speaking",
          startTime: 0,
          duration: 7.0,
        },
        {
          id: "d_11_2",
          characterId: "KIBO",
          text: "The energy reserves are charging at 400 percent! This is absolutely massive!",
          emotion: "excited",
          action: "celebrating",
          startTime: 7.0,
          duration: 6.0,
        },
      ],
      charactersPresent: [
        { characterId: "KIBO", positionX: 50, positionY: 0, scale: 1.4, depth: 1, facing: "right" },
      ],
      sfxCues: [
        { id: "sfx_11_1", soundName: "laser", startTime: 1.5, volume: 0.85 },
        { id: "sfx_11_2", soundName: "explosion", startTime: 4.0, volume: 0.75 },
      ],
      musicCue: { theme: "cinematic", volume: 0.45 },
      transition: "fade",
      isLocked: true,
    },
    {
      id: "sc_12",
      sceneIndex: 12,
      title: "Neon City Market",
      duration: 12.5,
      bgStyle: "retro_city",
      bgTimeOfDay: "night",
      bgWeatherEffect: "rain",
      cameraShot: "wide",
      dialogues: [
        {
          id: "d_12_1",
          characterId: "NORI",
          text: "To adapt the power coupling, we need a chronal regulator valve. This local neon trade district should have one.",
          emotion: "calm",
          action: "speaking",
          startTime: 0,
          duration: 6.5,
        },
        {
          id: "d_12_2",
          characterId: "KIBO",
          text: "Look at this rain, but the neon lights are incredible. Let's find a local technician.",
          emotion: "happy",
          action: "speaking",
          startTime: 6.5,
          duration: 6.0,
        },
      ],
      charactersPresent: [
        { characterId: "KIBO", positionX: 25, positionY: 0, scale: 1.1, depth: 1, facing: "right" },
        { characterId: "NORI", positionX: 75, positionY: 0, scale: 1.1, depth: 2, facing: "left" },
      ],
      sfxCues: [
        { id: "sfx_12_1", soundName: "wind", startTime: 0.5, volume: 0.5 },
      ],
      musicCue: { theme: "comedy", volume: 0.25 },
      transition: "fade",
      isLocked: true,
    },
    {
      id: "sc_13",
      sceneIndex: 13,
      title: "The Techno Barter Shop",
      duration: 11.0,
      bgStyle: "retro_city",
      bgTimeOfDay: "night",
      bgWeatherEffect: "rain",
      cameraShot: "medium",
      dialogues: [
        {
          id: "d_13_1",
          characterId: "KIBO",
          text: "We finally found the core regulator valve! The trader traded it for our spare quantum battery.",
          emotion: "happy",
          action: "celebrating",
          startTime: 0,
          duration: 6.0,
        },
        {
          id: "d_13_2",
          characterId: "NORI",
          text: "Perfect! Now we have everything we need. Let's head back to the shuttle and fire up the main engines.",
          emotion: "excited",
          action: "speaking",
          startTime: 6.0,
          duration: 5.0,
        },
      ],
      charactersPresent: [
        { characterId: "KIBO", positionX: 30, positionY: 0, scale: 1.15, depth: 1, facing: "right" },
        { characterId: "NORI", positionX: 70, positionY: 0, scale: 1.15, depth: 2, facing: "left" },
      ],
      sfxCues: [
        { id: "sfx_13_1", soundName: "magical_chime", startTime: 1.2, volume: 0.7 },
      ],
      musicCue: { theme: "technology", volume: 0.3 },
      transition: "fade",
      isLocked: true,
    },
    {
      id: "sc_14",
      sceneIndex: 14,
      title: "Rebuilding the Space Warp",
      duration: 13.0,
      bgStyle: "abstract_educational",
      bgTimeOfDay: "day",
      bgWeatherEffect: "none",
      cameraShot: "wide",
      dialogues: [
        {
          id: "d_14_1",
          characterId: "",
          text: "NARRATOR: Back inside the wreckage, they mapped out the math. Placing the regulator in line, the equations balanced perfectly.",
          emotion: "calm",
          action: "speaking",
          startTime: 0,
          duration: 7.0,
        },
        {
          id: "d_14_2",
          characterId: "NORI",
          text: "The energy flux is fully stabilized now. We are ready to launch our portal jump!",
          emotion: "excited",
          action: "speaking",
          startTime: 7.0,
          duration: 6.0,
        },
      ],
      charactersPresent: [
        { characterId: "NORI", positionX: 50, positionY: 0, scale: 1.1, depth: 1, facing: "right" },
      ],
      sfxCues: [
        { id: "sfx_14_1", soundName: "laser", startTime: 1.0, volume: 0.5 },
      ],
      musicCue: { theme: "children", volume: 0.25 },
      transition: "fade",
      isLocked: true,
    },
    {
      id: "sc_15",
      sceneIndex: 15,
      title: "Igniting the Warp Engine",
      duration: 12.0,
      bgStyle: "modern_lab",
      bgTimeOfDay: "sunset",
      bgWeatherEffect: "particles",
      cameraShot: "close-up",
      dialogues: [
        {
          id: "d_15_1",
          characterId: "KIBO",
          text: "All temporal injectors active! Warp envelope is expanding! Hang on to your seats!",
          emotion: "excited",
          action: "pointing",
          startTime: 0,
          duration: 6.0,
        },
        {
          id: "d_15_2",
          characterId: "NORI",
          text: "The portal is fully open! We are jumping through space-time!",
          emotion: "excited",
          action: "celebrating",
          startTime: 6.0,
          duration: 6.0,
        },
      ],
      charactersPresent: [
        { characterId: "KIBO", positionX: 25, positionY: 0, scale: 1.25, depth: 1, facing: "right" },
        { characterId: "NORI", positionX: 75, positionY: 0, scale: 1.25, depth: 2, facing: "left" },
      ],
      sfxCues: [
        { id: "sfx_15_1", soundName: "laser", startTime: 1.2, volume: 0.9 },
        { id: "sfx_15_2", soundName: "explosion", startTime: 4.2, volume: 0.95 },
      ],
      musicCue: { theme: "cinematic", volume: 0.45 },
      transition: "cut",
      isLocked: true,
    },
    {
      id: "sc_16",
      sceneIndex: 16,
      title: "Emerging over Earth Orbit",
      duration: 12.0,
      bgStyle: "star_station",
      bgTimeOfDay: "sunset",
      bgWeatherEffect: "stars",
      cameraShot: "wide",
      dialogues: [
        {
          id: "d_16_1",
          characterId: "",
          text: "NARRATOR: Re-entering the solar system, the shuttle emerged over a beautiful blue home. The Chronos Star Engine had returned them.",
          emotion: "mysterious",
          action: "speaking",
          startTime: 0,
          duration: 7.0,
        },
        {
          id: "d_16_2",
          characterId: "KIBO",
          text: "Look at that, Nori. We're home. We actually made it back safely.",
          emotion: "happy",
          action: "speaking",
          startTime: 7.0,
          duration: 5.0,
        },
      ],
      charactersPresent: [
        { characterId: "KIBO", positionX: 30, positionY: 0, scale: 1.1, depth: 1, facing: "right" },
        { characterId: "NORI", positionX: 70, positionY: 0, scale: 1.1, depth: 2, facing: "left" },
      ],
      sfxCues: [
        { id: "sfx_16_1", soundName: "wind", startTime: 0.5, volume: 0.4 },
      ],
      musicCue: { theme: "calm", volume: 0.3 },
      transition: "fade",
      isLocked: true,
    },
    {
      id: "sc_17",
      sceneIndex: 17,
      title: "Heroic Mission Accomplished",
      duration: 11.0,
      bgStyle: "star_station",
      bgTimeOfDay: "day",
      bgWeatherEffect: "stars",
      cameraShot: "establishing",
      dialogues: [
        {
          id: "d_17_1",
          characterId: "NORI",
          text: "The flight data is complete, Kibo. We've unlocked the secrets of deep star core calculations!",
          emotion: "happy",
          action: "celebrating",
          startTime: 0,
          duration: 6.0,
        },
        {
          id: "d_17_2",
          characterId: "KIBO",
          text: "This is just the first of many star systems. Ready for our next launch, Nori?",
          emotion: "excited",
          action: "speaking",
          startTime: 6.0,
          duration: 5.0,
        },
      ],
      charactersPresent: [
        { characterId: "KIBO", positionX: 25, positionY: 0, scale: 1.1, depth: 1, facing: "right" },
        { characterId: "NORI", positionX: 75, positionY: 0, scale: 1.1, depth: 2, facing: "left" },
      ],
      sfxCues: [
        { id: "sfx_17_1", soundName: "applause", startTime: 1.0, volume: 0.8 },
      ],
      musicCue: { theme: "adventure", volume: 0.4 },
      transition: "fade",
      isLocked: true,
    },
    {
      id: "sc_18",
      sceneIndex: 18,
      title: "The Journey Continues",
      duration: 11.0,
      bgStyle: "modern_lab",
      bgTimeOfDay: "day",
      bgWeatherEffect: "particles",
      cameraShot: "wide",
      dialogues: [
        {
          id: "d_18_1",
          characterId: "NORI",
          text: "Absolutely. Fuel the engines and chart a path to the outer rim galaxies!",
          emotion: "excited",
          action: "celebrating",
          startTime: 0,
          duration: 5.5,
        },
        {
          id: "d_18_2",
          characterId: "",
          text: "NARRATOR: And so, armed with the power of the star core, their greatest voyage into the infinite began.",
          emotion: "mysterious",
          action: "speaking",
          startTime: 5.5,
          duration: 5.5,
        },
      ],
      charactersPresent: [
        { characterId: "KIBO", positionX: 25, positionY: 0, scale: 1.1, depth: 1, facing: "right" },
        { characterId: "NORI", positionX: 75, positionY: 0, scale: 1.1, depth: 2, facing: "left" },
      ],
      sfxCues: [
        { id: "sfx_18_1", soundName: "magical_chime", startTime: 5.5, volume: 0.9 },
      ],
      musicCue: { theme: "cinematic", volume: 0.5 },
      transition: "fade",
      isLocked: true,
    },
  ],
};
