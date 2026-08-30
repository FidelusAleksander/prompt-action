import * as core from '@actions/core'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { generateAIResponse } from './ai.js'
import { processTemplate } from './template.js'

export async function run() {
  try {
    const promptFile = core.getInput('prompt-file')
    const promptText = core.getInput('prompt')
    const token = core.getInput('token', { required: true })
    const model = core.getInput('model', { required: true })
    const systemPromptFile = core.getInput('system-prompt-file')
    const systemPromptText = core.getInput('system-prompt')
    const responseSchemaFile = core.getInput('response-schema-file')
    const vars = core.getInput('vars')

    let prompt: string
    if (promptFile) {
      if (!fs.existsSync(promptFile)) {
        throw new Error(`Prompt file not found: ${promptFile}`)
      }
      prompt = fs.readFileSync(promptFile, 'utf8')
    } else if (promptText) {
      prompt = promptText
    } else {
      throw new Error("Either 'prompt' or 'prompt-file' input must be provided")
    }

    // Process prompt template with variables
    prompt = processTemplate(prompt, vars)

    let systemPrompt: string
    if (systemPromptFile) {
      if (!fs.existsSync(systemPromptFile)) {
        throw new Error(`System prompt file not found: ${systemPromptFile}`)
      }
      systemPrompt = fs.readFileSync(systemPromptFile, 'utf8')
    } else if (systemPromptText) {
      systemPrompt = systemPromptText
    } else {
      systemPrompt = 'You are a helpful assistant.'
    }

    // Process system prompt template with variables
    systemPrompt = processTemplate(systemPrompt, vars)

    // Read and parse response schema if provided
    let responseSchema: { [key: string]: unknown } | undefined
    if (responseSchemaFile) {
      if (!fs.existsSync(responseSchemaFile)) {
        throw new Error(`Response schema file not found: ${responseSchemaFile}`)
      }

      try {
        const schemaContent = fs.readFileSync(responseSchemaFile, 'utf8')
        responseSchema = JSON.parse(schemaContent)
      } catch (parseError) {
        throw new Error(
          `Invalid JSON in response schema file: ${responseSchemaFile}. ${parseError instanceof Error ? parseError.message : String(parseError)}`,
          { cause: parseError }
        )
      }
    }

    // Generate AI response
    console.log(`Prompting ${model} AI model`)
    const response = await generateAIResponse(
      prompt,
      systemPrompt,
      model,
      token,
      responseSchema
    )

    // Save response to a file to handle large responses
    const tempDir = process.env.RUNNER_TEMP || os.tmpdir()
    const responseFilePath = path.join(
      tempDir,
      `ai-response-${Date.now()}.txt`
    )
    try {
      fs.writeFileSync(responseFilePath, response, 'utf8')
    } catch (error) {
      throw new Error(
        `Failed to write response file: ${
          error instanceof Error ? error.message : String(error)
        }`,
        { cause: error }
      )
    }

    // Set outputs and log response
    core.setOutput('text', response)
    core.setOutput('response-file', responseFilePath)
    core.startGroup('AI Response')
    console.log(response)
    core.endGroup()
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error))
  }
}
