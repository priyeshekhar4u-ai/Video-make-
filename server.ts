import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy-initialize Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// ----------------- LOCAL FALLBACK SCRIPT PARSER -----------------
interface HeuristicChar {
  name: string;
  gender: "male" | "female" | "child" | "narrator" | "robotic";
}

interface HeuristicDialogue {
  characterName: string;
  text: string;
  emotion: string;
  action: string;
}

interface HeuristicScene {
  title: string;
  timeOfDay: "day" | "sunset" | "night";
  cameraShot: string;
  musicTheme: string;
  dialogues: HeuristicDialogue[];
  sfx: string[];
  weather: "none" | "fog" | "rain" | "snow" | "stars" | "particles";
}

function parseScriptHeuristically(scriptText: string) {
  const lines = scriptText.split("\n").map((line) => line.trim());
  const scenes: HeuristicScene[] = [];
  const charactersMap = new Map<string, HeuristicChar>();

  let currentScene: HeuristicScene = {
    title: "Intro Scene",
    timeOfDay: "day",
    cameraShot: "medium",
    musicTheme: "calm",
    dialogues: [],
    sfx: [],
    weather: "none",
  };

  let sceneCounter = 1;

  for (let line of lines) {
    if (!line) continue;

    // Check for scene directive e.g. [SCENE: Moon Laboratory | Night]
    const sceneMatch = line.match(/^\[SCENE:\s*([^|\]]+)(?:\|\s*([^\]]+))?\]/i);
    if (sceneMatch) {
      if (scenes.length > 0 || currentScene.dialogues.length > 0 || currentScene.sfx.length > 0) {
        scenes.push(currentScene);
      }
      const title = sceneMatch[1].trim();
      let tod: "day" | "sunset" | "night" = "day";
      const todStr = (sceneMatch[2] || "").trim().toLowerCase();
      if (todStr.includes("night") || todStr.includes("dark")) {
        tod = "night";
      } else if (todStr.includes("sunset") || todStr.includes("evening")) {
        tod = "sunset";
      }

      // Infer background style based on title keywords
      let weather: "none" | "fog" | "rain" | "snow" | "stars" | "particles" = "none";
      if (title.toLowerCase().includes("forest") || title.toLowerCase().includes("woods")) {
        weather = "fog";
      } else if (title.toLowerCase().includes("space") || title.toLowerCase().includes("star")) {
        weather = "stars";
      }

      currentScene = {
        title: title || `Scene ${sceneCounter++}`,
        timeOfDay: tod,
        cameraShot: "wide",
        musicTheme: "calm",
        dialogues: [],
        sfx: [],
        weather,
      };
      continue;
    }

    // Check for music directive e.g. [MUSIC: Technology | Low]
    const musicMatch = line.match(/^\[MUSIC:\s*([^|\]]+)(?:\|\s*([^\]]+))?\]/i);
    if (musicMatch) {
      currentScene.musicTheme = musicMatch[1].trim().toLowerCase();
      continue;
    }

    // Check for camera directive e.g. [CAMERA: Wide shot]
    const cameraMatch = line.match(/^\[CAMERA:\s*([^\]]+)\]/i);
    if (cameraMatch) {
      currentScene.cameraShot = cameraMatch[1].trim().toLowerCase();
      continue;
    }

    // Check for SFX e.g. [SFX: Magical chime]
    const sfxMatch = line.match(/^\[SFX:\s*([^\]]+)\]/i);
    if (sfxMatch) {
      currentScene.sfx.push(sfxMatch[1].trim());
      continue;
    }

    // Check for action e.g. [ACTION: Kibo points toward the glowing engine]
    const actionMatch = line.match(/^\[ACTION:\s*([^\]]+)\]/i);
    if (actionMatch) {
      // Create a simulated reaction or narrative line
      currentScene.dialogues.push({
        characterName: "NARRATOR",
        text: `*${actionMatch[1].trim()}*`,
        emotion: "calm",
        action: "reacting",
      });
      continue;
    }

    // Check for Dialogue lines e.g. KIBO (male, excited): Nori, the star engine is ready!
    const dialogMatch = line.match(/^([A-Za-z0-9\s]+)(?:\(([^)]+)\))?\s*:\s*(.+)$/);
    if (dialogMatch) {
      const charName = dialogMatch[1].trim().toUpperCase();
      const meta = (dialogMatch[2] || "").trim().toLowerCase();
      const text = dialogMatch[3].trim();

      let gender: "male" | "female" | "child" | "narrator" | "robotic" = "male";
      let emotion = "calm";
      let action: "speaking" | "listening" | "reacting" | "pointing" | "walking_in" | "walking_out" | "sitting" | "celebrating" = "speaking";

      // Simple heuristics on metadata inside parentheses
      if (meta) {
        if (meta.includes("female") || meta.includes("woman")) {
          gender = "female";
        } else if (meta.includes("child") || meta.includes("boy") || meta.includes("girl")) {
          gender = "child";
        } else if (meta.includes("robot")) {
          gender = "robotic";
        } else if (meta.includes("narrat")) {
          gender = "narrator";
        }

        // Emotions
        if (meta.includes("excit")) emotion = "excited";
        else if (meta.includes("surpris") || meta.includes("shock")) emotion = "excited";
        else if (meta.includes("sad") || meta.includes("cry")) emotion = "sad";
        else if (meta.includes("angr") || meta.includes("mad")) emotion = "angry";
        else if (meta.includes("whisper") || meta.includes("quiet")) emotion = "whispering";
        else if (meta.includes("shout") || meta.includes("loud")) emotion = "shouting";
        else if (meta.includes("myster") || meta.includes("spooky")) emotion = "mysterious";
        else if (meta.includes("happy") || meta.includes("laugh")) emotion = "happy";

        // Actions
        if (meta.includes("point")) action = "pointing";
        else if (meta.includes("sit")) action = "sitting";
        else if (meta.includes("celebrat") || meta.includes("cheer")) action = "celebrating";
        else if (meta.includes("walk in") || meta.includes("enter")) action = "walking_in";
        else if (meta.includes("walk out") || meta.includes("exit")) action = "walking_out";
      }

      if (charName === "NARRATOR") {
        gender = "narrator";
      }

      if (!charactersMap.has(charName)) {
        charactersMap.set(charName, { name: charName, gender });
      }

      currentScene.dialogues.push({
        characterName: charName,
        text,
        emotion,
        action,
      });
      continue;
    }

    // Default: treat as dialogue/narrator block
    if (line.length > 5) {
      currentScene.dialogues.push({
        characterName: "NARRATOR",
        text: line,
        emotion: "calm",
        action: "speaking",
      });
    }
  }

  // Push last scene
  if (scenes.length === 0 || currentScene.dialogues.length > 0 || currentScene.sfx.length > 0) {
    scenes.push(currentScene);
  }

  // Ensure narrator character is correctly registered in map
  if (!charactersMap.has("NARRATOR")) {
    charactersMap.set("NARRATOR", { name: "NARRATOR", gender: "narrator" });
  }

  return {
    characters: Array.from(charactersMap.values()),
    scenes: scenes.map((sc, i) => {
      // Match background style based on keywords
      let bgStyle = "modern_lab";
      const scTitle = sc.title.toLowerCase();
      if (scTitle.includes("forest") || scTitle.includes("woods") || scTitle.includes("tree")) bgStyle = "dense_forest";
      else if (scTitle.includes("home") || scTitle.includes("room") || scTitle.includes("house") || scTitle.includes("kitchen")) bgStyle = "cozy_home";
      else if (scTitle.includes("city") || scTitle.includes("street") || scTitle.includes("town") || scTitle.includes("village")) bgStyle = "retro_city";
      else if (scTitle.includes("space") || scTitle.includes("star") || scTitle.includes("moon") || scTitle.includes("orbit")) bgStyle = "star_station";
      else if (scTitle.includes("desert") || scTitle.includes("sand") || scTitle.includes("dune")) bgStyle = "dry_desert";
      else if (scTitle.includes("castle") || scTitle.includes("fantasy") || scTitle.includes("palace")) bgStyle = "fantasy_castle";
      else if (scTitle.includes("school") || scTitle.includes("classroom") || scTitle.includes("office") || scTitle.includes("learn")) bgStyle = "abstract_educational";

      // Match camera shot
      let cameraShot = "wide";
      const cs = sc.cameraShot.toLowerCase();
      if (cs.includes("close")) cameraShot = "close-up";
      else if (cs.includes("medium")) cameraShot = "medium";
      else if (cs.includes("two")) cameraShot = "two-shot";
      else if (cs.includes("group")) cameraShot = "group";
      else if (cs.includes("reaction")) cameraShot = "reaction";
      else if (cs.includes("pan left")) cameraShot = "pan-left";
      else if (cs.includes("pan right")) cameraShot = "pan-right";
      else if (cs.includes("zoom in")) cameraShot = "zoom-in";
      else if (cs.includes("zoom out")) cameraShot = "zoom-out";
      else if (cs.includes("establish")) cameraShot = "establishing";

      // Match music theme
      let musicTheme = "calm";
      const mt = sc.musicTheme.toLowerCase();
      if (["calm", "adventure", "fantasy", "technology", "mystery", "comedy", "children", "cinematic"].includes(mt)) {
        musicTheme = mt;
      } else if (mt.includes("tech") || mt.includes("sci-fi")) {
        musicTheme = "technology";
      } else if (mt.includes("scary") || mt.includes("dark") || mt.includes("creep")) {
        musicTheme = "mystery";
      } else if (mt.includes("funny") || mt.includes("silly")) {
        musicTheme = "comedy";
      } else if (mt.includes("epic") || mt.includes("exciting") || mt.includes("hero")) {
        musicTheme = "adventure";
      }

      return {
        id: `sc_${i + 1}`,
        sceneIndex: i + 1,
        title: sc.title,
        bgStyle,
        bgTimeOfDay: sc.timeOfDay,
        bgWeatherEffect: sc.weather,
        cameraShot,
        dialogues: sc.dialogues.map((d, di) => {
          // Speak actions have custom timings
          const wordCount = d.text.split(" ").length;
          const duration = Math.max(1.5, wordCount * 0.4); // ~150 words per minute
          return {
            id: `cue_${i}_${di}`,
            characterId: d.characterName === "NARRATOR" ? "" : d.characterName,
            text: d.text,
            emotion: d.emotion,
            action: d.action,
            duration,
            startTime: 0, // Calculated sequentially later
          };
        }),
        sfxCues: sc.sfx.map((s, si) => {
          let soundName = "magical_chime";
          const sLower = s.toLowerCase();
          if (sLower.includes("boom") || sLower.includes("explod") || sLower.includes("bang")) soundName = "explosion";
          else if (sLower.includes("walk") || sLower.includes("step")) soundName = "footsteps";
          else if (sLower.includes("zap") || sLower.includes("laser") || sLower.includes("shoot")) soundName = "laser";
          else if (sLower.includes("wind") || sLower.includes("blow")) soundName = "wind";
          else if (sLower.includes("clap") || sLower.includes("cheer")) soundName = "applause";

          return {
            id: `sfx_${i}_${si}`,
            soundName,
            startTime: si * 2.0, // spread them
            volume: 0.8,
          };
        }),
        musicCue: {
          theme: musicTheme,
          volume: 0.3,
        },
        transition: "fade",
        isLocked: false,
      };
    }),
  };
}

// ----------------- EXPRESS API ENDPOINTS -----------------

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mode: process.env.NODE_ENV || "development" });
});

// Automatic Script Analysis API
app.post("/api/analyze-script", async (req, res) => {
  const { script } = req.body;

  if (!script || typeof script !== "string" || script.trim() === "") {
    return res.status(400).json({ error: "Script text is required" });
  }

  const ai = getGeminiClient();

  if (!ai) {
    // If Gemini client is not initialized (no key), immediately run robust heuristics
    const parsed = parseScriptHeuristically(script);
    return res.json({
      success: true,
      engine: "offline_heuristics",
      data: parsed,
    });
  }

  try {
    const prompt = `Analyze the following movie script. Extract the main Cast characters (including their gender) and reconstruct the entire story breakdown into a structured storyboard scene-by-scene list.

For each scene, capture:
- The title (location or context)
- The background time of day ("day", "sunset", "night")
- The background aesthetic style (one of: "cozy_home", "modern_lab", "star_station", "dense_forest", "retro_city", "dry_desert", "fantasy_castle", "abstract_educational")
- The camera shot type (one of: "establishing", "wide", "medium", "two-shot", "group", "close-up", "reaction", "pan-left", "pan-right", "zoom-in", "zoom-out")
- The background music theme (one of: "calm", "adventure", "fantasy", "technology", "mystery", "comedy", "children", "cinematic")
- Dialogues or Narrations (including who speaks, text, their facial emotion, and physical action cue)
- Any special Sound Effects (SFX) cues (from: "magical_chime", "explosion", "footsteps", "laser", "wind", "applause")
- Any active environmental weather effect ("none", "fog", "rain", "snow", "stars", "particles")

SCRIPT TEXT:
${script}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are an expert Hollywood production assistant. Always format your output strictly to fit the requested response schema.",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            characters: {
              type: Type.ARRAY,
              description: "All characters found in the script (excluding the narrator)",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Name in uppercase e.g. KIBO" },
                  gender: {
                    type: Type.STRING,
                    description: "Gender voice category: 'male', 'female', 'child', or 'robotic'",
                  },
                },
                required: ["name", "gender"],
              },
            },
            scenes: {
              type: Type.ARRAY,
              description: "Structured sequential scenes breakdown",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "E.g. Moon Laboratory" },
                  bgTimeOfDay: { type: Type.STRING, description: "day, sunset, or night" },
                  bgStyle: { type: Type.STRING, description: "Cozy home, modern lab, star station, etc." },
                  cameraShot: { type: Type.STRING, description: "Camera setup shot type" },
                  musicTheme: { type: Type.STRING, description: "Music vibe theme" },
                  bgWeatherEffect: { type: Type.STRING, description: "none, fog, rain, snow, stars, particles" },
                  dialogues: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        characterName: { type: Type.STRING, description: "UPPERCASE name, or NARRATOR for narration" },
                        text: { type: Type.STRING, description: "Dialogue words spoken" },
                        emotion: { type: Type.STRING, description: "happy, sad, angry, excited, whispering, shouting, mysterious, calm" },
                        action: { type: Type.STRING, description: "speaking, listening, reacting, pointing, walking_in, walking_out, sitting, celebrating" },
                      },
                      required: ["characterName", "text", "emotion", "action"],
                    },
                  },
                  sfx: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Any sound effects listed: magical_chime, explosion, footsteps, laser, wind, applause",
                  },
                },
                required: ["title", "bgTimeOfDay", "bgStyle", "cameraShot", "musicTheme", "dialogues", "sfx"],
              },
            },
          },
          required: ["characters", "scenes"],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || "{}");

    // Standardize Gemini's response structure to match the frontend types
    const mappedCharacters = (parsedJson.characters || []).map((c: any) => ({
      name: String(c.name).toUpperCase(),
      gender: ["male", "female", "child", "robotic"].includes(String(c.gender).toLowerCase())
        ? String(c.gender).toLowerCase()
        : "male",
    }));

    const mappedScenes = (parsedJson.scenes || []).map((sc: any, i: number) => {
      // Validate background style
      const validBgs = [
        "cozy_home",
        "modern_lab",
        "star_station",
        "dense_forest",
        "retro_city",
        "dry_desert",
        "fantasy_castle",
        "abstract_educational",
      ];
      let bgStyle = String(sc.bgStyle).toLowerCase().replace(" ", "_");
      if (!validBgs.includes(bgStyle)) {
        // match fuzzy keywords
        bgStyle = "modern_lab";
        const titleL = String(sc.title).toLowerCase();
        if (titleL.includes("home") || titleL.includes("room")) bgStyle = "cozy_home";
        else if (titleL.includes("forest") || titleL.includes("wood")) bgStyle = "dense_forest";
        else if (titleL.includes("space") || titleL.includes("star")) bgStyle = "star_station";
        else if (titleL.includes("desert")) bgStyle = "dry_desert";
        else if (titleL.includes("castle")) bgStyle = "fantasy_castle";
        else if (titleL.includes("city")) bgStyle = "retro_city";
        else if (titleL.includes("classroom") || titleL.includes("school")) bgStyle = "abstract_educational";
      }

      // Validate camera shot
      const validCameras = [
        "establishing",
        "wide",
        "medium",
        "two-shot",
        "group",
        "close-up",
        "reaction",
        "pan-left",
        "pan-right",
        "zoom-in",
        "zoom-out",
      ];
      let cameraShot = String(sc.cameraShot).toLowerCase().replace(" ", "-");
      if (!validCameras.includes(cameraShot)) cameraShot = "wide";

      // Validate music theme
      const validMusic = ["calm", "adventure", "fantasy", "technology", "mystery", "comedy", "children", "cinematic"];
      let musicTheme = String(sc.musicTheme).toLowerCase();
      if (!validMusic.includes(musicTheme)) musicTheme = "calm";

      // Weather effect
      const validWeather = ["none", "fog", "rain", "snow", "stars", "particles"];
      let weather = String(sc.bgWeatherEffect || "none").toLowerCase();
      if (!validWeather.includes(weather)) weather = "none";

      const dialoguesMapped = (sc.dialogues || []).map((d: any, di: number) => {
        const wordCount = String(d.text).split(" ").length;
        const duration = Math.max(1.5, wordCount * 0.4);
        return {
          id: `cue_${i}_${di}`,
          characterId: String(d.characterName).toUpperCase() === "NARRATOR" ? "" : String(d.characterName).toUpperCase(),
          text: String(d.text),
          emotion: ["happy", "sad", "angry", "excited", "whispering", "shouting", "mysterious", "calm"].includes(String(d.emotion).toLowerCase())
            ? String(d.emotion).toLowerCase()
            : "calm",
          action: ["speaking", "listening", "reacting", "pointing", "walking_in", "walking_out", "sitting", "celebrating"].includes(String(d.action).toLowerCase())
            ? String(d.action).toLowerCase()
            : "speaking",
          duration,
          startTime: 0,
        };
      });

      const sfxMapped = (sc.sfx || []).map((s: string, si: number) => {
        let soundName: any = "magical_chime";
        const sl = String(s).toLowerCase();
        if (sl.includes("explosion") || sl.includes("boom") || sl.includes("bang")) soundName = "explosion";
        else if (sl.includes("footsteps") || sl.includes("walk") || sl.includes("step")) soundName = "footsteps";
        else if (sl.includes("laser") || sl.includes("zap")) soundName = "laser";
        else if (sl.includes("wind")) soundName = "wind";
        else if (sl.includes("applause") || sl.includes("clap") || sl.includes("cheer")) soundName = "applause";

        return {
          id: `sfx_${i}_${si}`,
          soundName,
          startTime: si * 2.0,
          volume: 0.8,
        };
      });

      return {
        id: `sc_${i + 1}`,
        sceneIndex: i + 1,
        title: String(sc.title),
        bgStyle,
        bgTimeOfDay: ["day", "sunset", "night"].includes(String(sc.bgTimeOfDay).toLowerCase())
          ? String(sc.bgTimeOfDay).toLowerCase()
          : "day",
        bgWeatherEffect: weather,
        cameraShot,
        dialogues: dialoguesMapped,
        sfxCues: sfxMapped,
        musicCue: {
          theme: musicTheme,
          volume: 0.3,
        },
        transition: "fade",
        isLocked: false,
      };
    });

    res.json({
      success: true,
      engine: "gemini_api",
      data: {
        characters: mappedCharacters,
        scenes: mappedScenes,
      },
    });
  } catch (error: any) {
    console.error("Gemini analysis error:", error);
    // Graceful fallback on error
    const parsed = parseScriptHeuristically(script);
    res.json({
      success: true,
      engine: "offline_heuristics_fallback",
      error: error.message,
      data: parsed,
    });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StoryMotion Pro Express Server running on http://localhost:${PORT}`);
  });
}

startServer();
