import * as core from "@actions/core";
import * as fs from "fs";
import { generateAIResponse } from "./ai";
import { 
  validateSchema, 
  validateDataAgainstSchema, 
  loadSchemaFromFile, 
  parseInlineSchema, 
  generateSchemaInstructions 
} from "./schema";

async function run() {
  try {
    const promptFile = core.getInput("prompt-file");
    const promptText = core.getInput("prompt");
    const token = core.getInput("token", { required: true });
    const model = core.getInput("model", { required: true });
    const systemPromptFile = core.getInput("system-prompt-file");
    const systemPromptText = core.getInput("system-prompt");
    const responseSchema = core.getInput("response-schema");
    const responseSchemaFile = core.getInput("response-schema-file");

    let prompt: string;
    if (promptFile) {
      if (!fs.existsSync(promptFile)) {
        throw new Error(`Prompt file not found: ${promptFile}`);
      }
      prompt = fs.readFileSync(promptFile, "utf8");
    } else if (promptText) {
      prompt = promptText;
    } else {
      throw new Error(
        "Either 'prompt' or 'prompt-file' input must be provided",
      );
    }

    let systemPrompt: string;
    if (systemPromptFile) {
      if (!fs.existsSync(systemPromptFile)) {
        throw new Error(`System prompt file not found: ${systemPromptFile}`);
      }
      systemPrompt = fs.readFileSync(systemPromptFile, "utf8");
    } else if (systemPromptText) {
      systemPrompt = systemPromptText;
    } else {
      systemPrompt = "You are a helpful assistant.";
    }

    // Handle response schema
    let schema: any = null;
    if (responseSchemaFile) {
      // File takes precedence over inline schema
      schema = loadSchemaFromFile(responseSchemaFile);
    } else if (responseSchema) {
      schema = parseInlineSchema(responseSchema);
    }

    // Validate the schema if provided
    if (schema) {
      const schemaValidation = validateSchema(schema);
      if (!schemaValidation.valid) {
        throw new Error(`Invalid JSON schema: ${schemaValidation.errors?.join(', ')}`);
      }
      
      // Modify prompt to include schema instructions
      const schemaInstructions = generateSchemaInstructions(schema);
      prompt = `${prompt}\n\n${schemaInstructions}`;
    }

    // Generate AI response
    console.log(`Prompting ${model} AI model`);
    const response = await generateAIResponse(prompt, systemPrompt, model, token);

    // Validate response against schema if provided
    if (schema) {
      try {
        const responseData = JSON.parse(response);
        const dataValidation = validateDataAgainstSchema(responseData, schema);
        if (!dataValidation.valid) {
          core.warning(`AI response does not match schema: ${dataValidation.errors?.join(', ')}`);
        }
      } catch (error) {
        core.warning(`AI response is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

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
