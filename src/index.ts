import * as core from "@actions/core";
import * as github from "@actions/github";
import { generateAIResponse } from "./ai";
import * as dotenv from "dotenv";

// Load environment variables from .env file when running locally
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

async function run() {
  try {
    // Get inputs either from GitHub Actions or environment variables
    const prompt = process.env.GITHUB_ACTIONS
      ? core.getInput("prompt", { required: true })
      : process.env.PROMPT;

    if (!prompt) {
      throw new Error("Prompt is required");
    }

    // Generate AI response
    const response = await generateAIResponse(prompt);

    // Set output or log locally
    if (process.env.GITHUB_ACTIONS) {
      core.setOutput("text", response);
    } else {
      console.log("Response:", response);
    }
  } catch (error) {
    if (error instanceof Error) {
      if (process.env.GITHUB_ACTIONS) {
        core.setFailed(error.message);
      } else {
        console.error("Error:", error.message);
      }
    }
  }
}

run();
