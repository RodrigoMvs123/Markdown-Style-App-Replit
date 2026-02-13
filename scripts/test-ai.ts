
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is not set in environment.");
    process.exit(1);
  }

  console.log("Using API Key (first 5 chars):", apiKey.substring(0, 5) + "...");
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Test multiple models to see what works
  const models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro", "gemini-pro"];
  
  for (const modelName of models) {
    console.log(`\nTesting model: ${modelName}...`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const prompt = "Explain markdown in one sentence.";
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log(`✅ Success with ${modelName}:`, text);
      return modelName; // Stop at first success
    } catch (error) {
      console.error(`❌ Failed with ${modelName}:`, error.message);
    }
  }
  
  console.error("\n❌ All models failed. Please check your API key permissions or region support.");
  process.exit(1);
}

testGemini();
