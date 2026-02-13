
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is not set.");
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    console.log("Listing available models...");
    // The SDK might not have a direct listModels, but we can try to fetch them via the standard fetch if needed
    // However, let's try a different approach: check if we can get model info for a known stable model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("test");
    console.log("✅ Success with gemini-1.5-flash");
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.message.includes("API_KEY_INVALID")) {
      console.error("CRITICAL: The API Key provided is INVALID.");
    } else if (error.message.includes("403")) {
      console.error("CRITICAL: Permission denied. The key might not have access to the Generative Language API or is restricted by region.");
    }
  }
}

listModels();
