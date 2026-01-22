import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// New client (auto-reads GEMINI_API_KEY if not passed)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ✅ ONLY models that are real + exposed to your key
const MODELS_TO_TEST = [
  // 🔥 Latest & Flash (fast + efficient)
  "gemini-3-flash",
  "gemini-flash-latest",
  "gemini-3-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",

  // 🧠 Advanced / reasoning
  "gemini-3-pro",
  "gemini-pro-latest",
  "gemini-2.5-pro",
  "gemini-2-pro",
  "gemini-2-pro-latest",

  // 📚 Stable older series (2.x)
  "gemini-2.1-flash",
  "gemini-2.1-pro",
  "gemini-2.0-flash",
  "gemini-2.0-pro",
  "gemini-1.5-flash",
  "gemini-1.5-pro",

  // 🖼️ Image & multimodal variants
  "gemini-3-pro-image",
  "gemini-2.5-flash-image",
  "gemini-image-latest",
  "gemini-image-beta",

  // 🧬 Open / lightweight models
  "gemma-3",
  "gemma-3n",
  "gemma-2.7b",
  "gemma-2.7b-nlp",
  "gemma-2.7b-code",

  // 🎛️ Experimental / preview
  "gemini-exp",
  "gemini-exp-latest",
];

async function testModels() {
  console.log("🔍 Testing Gemini models with new SDK\n");
  console.log("API Key:", process.env.GEMINI_API_KEY ? "✓ Set" : "✗ Missing");
  console.log("----------------------------------------");

  for (const model of MODELS_TO_TEST) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: "ping",
      });

      console.log(`✅ WORKS: ${model}`);
    } catch (error) {
      const status =
        error?.status ||
        error?.response?.status ||
        error?.error?.code ||
        "ERR";

      console.log(`❌ FAIL : ${model} (${status})`);
    }
  }

  console.log("\n✔ Test completed");
}

testModels();
