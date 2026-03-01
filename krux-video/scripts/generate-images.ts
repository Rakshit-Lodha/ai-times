import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { sampleHeadlines } from "../src/lib/data";

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const openai = new OpenAI();

async function generateImages() {
  const outDir = path.join(__dirname, "..", "public", "images", "articles");
  fs.mkdirSync(outDir, { recursive: true });

  for (const article of sampleHeadlines) {
    const filePath = path.join(outDir, `${article.id}.png`);
    if (fs.existsSync(filePath)) {
      console.log(`Image for ${article.id} already exists. Skipping.`);
      continue;
    }

    const prompt = `A high-end, abstract 3D render representing: ${article.headline}. Dark mode aesthetic with deep blacks, sleek metallic textures, and subtle glowing neon accents. Smooth glassmorphism lighting. Clean, minimalist, and cinematic. Strictly no text, no letters, no words.`;

    console.log(`Generating image for ${article.id}: ${article.headline}`);
    try {
      const imageResult = await openai.images.generate({
        model: "gpt-image-1-mini",
        prompt: prompt,
        // Removed response_format to prevent the 400 error.
        // We will fall back to downloading the URL if b64_json is not provided.
      });

      const data = imageResult.data[0];

      if (data.b64_json) {
        const imageBuffer = Buffer.from(data.b64_json, "base64");
        fs.writeFileSync(filePath, imageBuffer);
        console.log(`  -> Saved ${article.id}.png from base64`);
      } else if (data.url) {
        const response = await fetch(data.url);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync(filePath, buffer);
        console.log(`  -> Saved ${article.id}.png from URL`);
      }
    } catch (e) {
      console.error(`Failed to generate image for ${article.id}:`, e);
    }
  }

  console.log("\nDone generating images!");
}

generateImages().catch(console.error);
