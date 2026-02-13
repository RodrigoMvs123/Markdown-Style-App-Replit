
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function checkApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is not set.");
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    console.log("Attempting to list models via API directly...");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.error) {
      console.error("❌ API Error:", data.error.message);
      if (data.error.status === "INVALID_ARGUMENT" || data.error.message.includes("API key not valid")) {
        console.error("\nCRITICAL: The API key provided is INVALID. Please double-check it in the Google AI Studio.");
      }
      return;
    }

    console.log("✅ API Key is VALID.");
    console.log("Available Models:", data.models?.map((m: any) => m.name).join(", "));
    
    const hasFlash = data.models?.some((m: any) => m.name.includes("gemini-1.5-flash"));
    if (hasFlash) {
      console.log("✅ gemini-1.5-flash is available for this key.");
    } else {
      console.warn("⚠️ gemini-1.5-flash was NOT found in your available models list.");
    }
  } catch (error) {
    console.error("❌ Connection Error:", error.message);
  }
}

checkApiKey();
