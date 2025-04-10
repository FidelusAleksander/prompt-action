import * as core from "@actions/core";
import { generateAIResponse } from "./ai";

async function run() {
  try {
    const prompt = core.getInput("prompt", { required: true });
    const model = core.getInput("model");

    // Generate AI response
    const response = await generateAIResponse(prompt, model);

    // Set output and log response
    core.setOutput("text", response);
    console.log("Response:", response);
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

run();
