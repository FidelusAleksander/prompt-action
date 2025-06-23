"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const fs = __importStar(require("fs"));
const ai_1 = require("./ai");
async function run() {
    try {
        const promptFile = core.getInput("prompt-file");
        const promptText = core.getInput("prompt");
        const token = core.getInput("token", { required: true });
        const model = core.getInput("model", { required: true });
        let prompt;
        if (promptFile) {
            if (!fs.existsSync(promptFile)) {
                throw new Error(`Prompt file not found: ${promptFile}`);
            }
            prompt = fs.readFileSync(promptFile, "utf8");
        }
        else if (promptText) {
            prompt = promptText;
        }
        else {
            throw new Error("Either 'prompt' or 'prompt-file' input must be provided");
        }
        // Generate AI response
        console.log(`Prompting ${model} AI model`);
        const aiResponse = await (0, ai_1.generateAIResponse)(prompt, model, token);
        // Set output and log response
        core.setOutput("text", aiResponse.text);
        core.startGroup("AI Response");
        console.log(aiResponse.text);
        core.endGroup();
        // Log token usage information
        if (aiResponse.usage) {
            core.startGroup("Token Usage");
            console.log(`Prompt tokens: ${aiResponse.usage.prompt_tokens}`);
            console.log(`Completion tokens: ${aiResponse.usage.completion_tokens}`);
            console.log(`Total tokens: ${aiResponse.usage.total_tokens}`);
            core.endGroup();
        }
    }
    catch (error) {
        core.setFailed(error instanceof Error ? error.message : String(error));
    }
}
run();
