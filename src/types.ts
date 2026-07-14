export type AspectRatio = "16:9" | "9:16" | "1:1" | "4:5";
export type PerformanceMode = "compatible" | "balanced" | "professional";

export interface FaceLandmarks {
  leftEye: { x: number; y: number };
  rightEye: { x: number; y: number };
  mouthLeft: { x: number; y: number };
  mouthRight: { x: number; y: number };
  mouthCenter: { x: number; y: number };
  nose: { x: number; y: number };
  faceOutline: { x: number; y: number; width: number; height: number };
}

export type VoiceGender = "male" | "female" | "child" | "narrator" | "robotic";
export type VoiceEmotion =
  | "happy"
  | "sad"
  | "angry"
  | "excited"
  | "whispering"
  | "shouting"
  | "mysterious"
  | "calm";

export interface CharacterVoiceSettings {
  speed: number;      // 0.5 to 2.0
  pitch: number;      // 0.5 to 2.0
  energy: number;     // 0.5 to 2.0
  emotion: VoiceEmotion;
  accent: string;     // "US", "UK", "AU", "IN", "Custom"
  gender: VoiceGender;
}

export interface Character {
  id: string;
  name: string;
  gender: VoiceGender;
  voiceId: string;
  voiceSettings: CharacterVoiceSettings;
  imageUrl: string;      // base64 or stock illustration path
  faceLandmarks: FaceLandmarks;
  subtitleColor: string; // Hex color
}

export type BackgroundStyle =
  | "cozy_home"
  | "modern_lab"
  | "star_station"
  | "dense_forest"
  | "retro_city"
  | "dry_desert"
  | "fantasy_castle"
  | "abstract_educational";

export type TimeOfDay = "day" | "sunset" | "night";
export type WeatherEffect = "none" | "fog" | "rain" | "snow" | "stars" | "particles";

export type CameraShotType =
  | "establishing"
  | "wide"
  | "medium"
  | "two-shot"
  | "group"
  | "close-up"
  | "reaction"
  | "pan-left"
  | "pan-right"
  | "zoom-in"
  | "zoom-out";

export type SceneTransition = "fade" | "dissolve" | "cut";

export interface DialogueCue {
  id: string;
  characterId: string; // Empty string if narrator
  text: string;
  emotion: VoiceEmotion;
  action: "speaking" | "listening" | "reacting" | "pointing" | "walking_in" | "walking_out" | "sitting" | "celebrating";
  startTime: number; // in seconds relative to scene
  duration: number;  // in seconds
}

export interface SFXCue {
  id: string;
  soundName: "magical_chime" | "explosion" | "footsteps" | "laser" | "wind" | "applause";
  startTime: number; // in seconds
  volume: number;    // 0.0 to 1.0
}

export interface MusicCue {
  theme: "calm" | "adventure" | "fantasy" | "technology" | "mystery" | "comedy" | "children" | "cinematic";
  volume: number; // 0.0 to 1.0
}

export interface SceneCharacterPosition {
  characterId: string;
  positionX: number; // 0 to 100 (percentage of width)
  positionY: number; // 0 to 100 (offset from baseline)
  scale: number;     // e.g. 1.0
  depth: number;     // z-index or rendering order
  facing: "left" | "right";
}

export interface Scene {
  id: string;
  sceneIndex: number;
  title: string;
  duration: number; // Calculated total duration (seconds)
  bgStyle: BackgroundStyle;
  bgTimeOfDay: TimeOfDay;
  bgWeatherEffect: WeatherEffect;
  cameraShot: CameraShotType;
  dialogues: DialogueCue[];
  charactersPresent: SceneCharacterPosition[];
  sfxCues: SFXCue[];
  musicCue: MusicCue;
  transition: SceneTransition;
  isLocked: boolean;
}

export interface ProjectAudioMix {
  musicVolume: number;
  sfxVolume: number;
  dialogueVolume: number;
  duckingAmount: number; // e.g. 0.7 means music volume drops to 30% when speaking
}

export interface Project {
  id: string;
  name: string;
  rawScript: string;
  aspectRatio: AspectRatio;
  fps: 24 | 25 | 30;
  performanceMode: PerformanceMode;
  characters: Character[];
  scenes: Scene[];
  audioMix: ProjectAudioMix;
  createdAt: number;
  updatedAt: number;
}

export interface RenderLog {
  timestamp: string;
  level: "info" | "warning" | "error";
  message: string;
}

export interface RenderProgress {
  isRendering: boolean;
  isPaused: boolean;
  currentSceneIndex: number;
  totalScenes: number;
  currentChunkPercent: number; // 0 to 100
  overallPercent: number;      // 0 to 100
  elapsedSeconds: number;
  estimatedRemainingSeconds: number;
  diskSpaceRequiredMB: number;
  completedChunks: string[]; // List of completed scene IDs
  logs: RenderLog[];
  completedVideoUrl?: string;
}
