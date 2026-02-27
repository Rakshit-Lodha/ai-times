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
    text: "AI moves fast. New models, new tools, new funding rounds, every single day. Keeping up shouldn't be a full-time job.",
  },
  {
    id: "scene2",
    text: "Meet Krux. We pick the 15 stories that matter most, every day. Each one in 100 words. Read any story in 60 seconds.",
  },
  {
    id: "scene3",
    text: "We don't just rewrite one article. Krux reads dozens of sources and gives you one clear summary.",
  },
  {
    id: "scene4",
    text: "Swipe right if you like the story. Left if you don't. That's it.",
  },
  {
    id: "scene5",
    text: "Filter by what matters to you. Tools you can use at work. Who's raising money and why. The reports shaping the industry.",
  },
  {
    id: "scene6",
    text: "Share any story in one tap. Want to dig deeper? Research it with ChatGPT, Claude, Perplexity, or Gemini.",
  },
  {
    id: "scene7",
    text: "Join the Krux WhatsApp community. Get the top 3 stories delivered daily. No spam. Ever.",
  },
  {
    id: "scene8",
    text: "Everything about AI. 100 words. Start swiping at krux dot news.",
  },
];

async function generateVO() {
  const outDir = path.join(__dirname, "..", "public", "audio", "vo");
  fs.mkdirSync(outDir, { recursive: true });

  for (const scene of scenes) {
    console.log(`Generating VO for ${scene.id}...`);
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
  }

  console.log("\nDone! All VO files saved to public/audio/vo/");
}

generateVO().catch(console.error);
