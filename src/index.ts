import * as core from "@actions/core";
import { generateAIResponse } from "./ai";

async function run() {
  try {
    const prompt = core.getInput("prompt", { required: true });
    const token = core.getInput("token", { required: true });
    const model = core.getInput("model", { required: true });

    // Generate AI response
    console.log(`Prompting ${model} AI model`);
    const response = await generateAIResponse(prompt, model, token);

    // Set output and log response
    core.setOutput("text", response);
    core.startGroup("AI Response");
    console.log(response);
    core.endGroup();
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

run();
