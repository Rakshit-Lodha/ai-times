import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load .env from parent directory (ai-times)
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const openai = new OpenAI();

const scenes = [
  {
    id: "scene1",
    text: "AI moves fast. Keeping up shouldn't be a full-time job.",
  },
  {
    id: "scene2",
    text: "Meet Krux. 15 stories. 100 words. 60 seconds.",
  },
  {
    id: "scene3",
    text: "Swipe to curate your feed.",
  },
  {
    id: "scene4",
    text: "Everything about AI. krux dot news.",
  }
];

async function generateVO() {
  const outDir = path.join(__dirname, "..", "public", "audio", "vo");
  fs.mkdirSync(outDir, { recursive: true });

  for (const scene of scenes) {
    console.log(`Generating VO for ${scene.id}...`);
    try {
      const response = await openai.audio.speech.create({
        model: "tts-1-hd",
        voice: "onyx",
        input: scene.text,
        response_format: "mp3",
        speed: 1.0,
      });

      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(path.join(outDir, `${scene.id}.mp3`), buffer);
      console.log(`  -> Saved ${scene.id}.mp3`);
    } catch (e) {
      console.error(`Failed to generate VO for ${scene.id}:`, e);
    }
  }

  console.log("\nDone! All VO files saved to public/audio/vo/");
}

generateVO().catch(console.error);
