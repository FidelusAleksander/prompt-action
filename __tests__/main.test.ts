/**
 * Unit tests for the main index functionality, src/index.ts
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects. For example, the core module is mocked in this test,
 * so that the actual '@actions/core' module is not imported.
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'
import * as ai from '../__fixtures__/ai.js'
import * as fs from 'fs'

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('../src/ai.js', () => ai)

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { run } = await import('../src/main.js')

describe('GitHub Action', () => {
  const mockToken = 'test-token'
  const mockModel = 'test-model'
  const mockPrompt = 'test prompt'
  const mockResponse = 'test response'
  const mockSystemPrompt = 'test system prompt'

  beforeEach(() => {
    jest.resetAllMocks()
    // Set up the AI mock to return our test response
    ai.generateAIResponse.mockResolvedValue(mockResponse)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Prompt Input', () => {
    it('should work with prompt text input', async () => {
      core.getInput.mockImplementation((name: string) => {
        switch (name) {
          case 'prompt':
            return mockPrompt
          case 'system-prompt':
            return mockSystemPrompt
          case 'token':
            return mockToken
          case 'model':
            return mockModel
          default:
            return ''
        }
      })

      // Call the run function with our mocks
      await run()

      expect(ai.generateAIResponse).toHaveBeenCalledWith(
        mockPrompt,
        mockSystemPrompt,
        mockModel,
        mockToken,
        undefined
      )
      expect(core.setOutput).toHaveBeenCalledWith('text', mockResponse)
    })

    it('should work with prompt file input', async () => {
      // Use a real file for this test
      const promptFilePath = '__tests__/prompts/test-prompt.txt'

      // We don't mock fs.existsSync and fs.readFileSync for this test
      // The file system operations will use the real implementation

      core.getInput.mockImplementation((name: string) => {
        switch (name) {
          case 'prompt-file':
            return promptFilePath
          case 'system-prompt':
            return mockSystemPrompt
          case 'token':
            return mockToken
          case 'model':
            return mockModel
          default:
            return ''
        }
      })

      // Call the run function with our mocks
      await run()

      // Read the real file content to verify
      const realContent = fs.readFileSync(promptFilePath, 'utf8')

      // Skip checking fs calls since we're using real filesystem
      expect(ai.generateAIResponse).toHaveBeenCalledWith(
        realContent,
        mockSystemPrompt,
        mockModel,
        mockToken,
        undefined
      )
      expect(core.setOutput).toHaveBeenCalledWith('text', mockResponse)
    })

    it('should throw error when prompt file does not exist', async () => {
      const promptFilePath =
        '/tmp/non-existent-file-for-test-' + Date.now() + '.txt'

      core.getInput.mockImplementation((name: string) => {
        switch (name) {
          case 'prompt-file':
            return promptFilePath
          case 'system-prompt':
            return mockSystemPrompt
          case 'token':
            return mockToken
          case 'model':
            return mockModel
          default:
            return ''
        }
      })

      // Call the run function with our mocks
      await run()

      expect(core.setFailed).toHaveBeenCalledWith(
        `Prompt file not found: ${promptFilePath}`
      )
    })

    it('should throw error when neither prompt nor prompt file is provided', async () => {
      core.getInput.mockImplementation((name: string) => {
        switch (name) {
          case 'token':
            return mockToken
          case 'model':
            return mockModel
          default:
            return ''
        }
      })

      // Call the run function with our mocks
      await run()

      expect(core.setFailed).toHaveBeenCalledWith(
        "Either 'prompt' or 'prompt-file' input must be provided"
      )
    })
  })

  describe('System Prompt Input', () => {
    it('should work with system prompt text input', async () => {
      core.getInput.mockImplementation((name: string) => {
        switch (name) {
          case 'prompt':
            return mockPrompt
          case 'system-prompt':
            return mockSystemPrompt
          case 'token':
            return mockToken
          case 'model':
            return mockModel
          default:
            return ''
        }
      })

      await run()

      expect(ai.generateAIResponse).toHaveBeenCalledWith(
        mockPrompt,
        mockSystemPrompt,
        mockModel,
        mockToken,
        undefined
      )
      expect(core.setOutput).toHaveBeenCalledWith('text', mockResponse)
    })

    it('should work with system prompt file input', async () => {
      // Use existing system prompt file
      const systemPromptFilePath = '__tests__/prompts/test-system-prompt.txt'

      core.getInput.mockImplementation((name: string) => {
        switch (name) {
          case 'prompt':
            return mockPrompt
          case 'system-prompt-file':
            return systemPromptFilePath
          case 'token':
            return mockToken
          case 'model':
            return mockModel
          default:
            return ''
        }
      })

      await run()

      // Read the actual file content to verify
      const expectedSystemPromptContent = fs.readFileSync(systemPromptFilePath, 'utf8')

      expect(ai.generateAIResponse).toHaveBeenCalledWith(
        mockPrompt,
        expectedSystemPromptContent,
        mockModel,
        mockToken,
        undefined
      )
      expect(core.setOutput).toHaveBeenCalledWith('text', mockResponse)
    })

    it('should work with both prompt file and system prompt file', async () => {
      // Use existing files for testing
      const promptFilePath = '__tests__/prompts/test-prompt.txt'
      const systemPromptFilePath = '__tests__/prompts/test-system-prompt.txt'

      core.getInput.mockImplementation((name: string) => {
        switch (name) {
          case 'prompt-file':
            return promptFilePath
          case 'system-prompt-file':
            return systemPromptFilePath
          case 'token':
            return mockToken
          case 'model':
            return mockModel
          default:
            return ''
        }
      })

      await run()

      // Read the actual file contents to verify
      const expectedPromptContent = fs.readFileSync(promptFilePath, 'utf8')
      const expectedSystemPromptContent = fs.readFileSync(systemPromptFilePath, 'utf8')

      expect(ai.generateAIResponse).toHaveBeenCalledWith(
        expectedPromptContent,
        expectedSystemPromptContent,
        mockModel,
        mockToken,
        undefined
      )
      expect(core.setOutput).toHaveBeenCalledWith('text', mockResponse)
    })

    it('should use default system prompt when none provided', async () => {
      const defaultSystemPrompt = 'You are a helpful assistant.'

      core.getInput.mockImplementation((name: string) => {
        switch (name) {
          case 'prompt':
            return mockPrompt
          case 'token':
            return mockToken
          case 'model':
            return mockModel
          default:
            return ''
        }
      })

      await run()

      expect(ai.generateAIResponse).toHaveBeenCalledWith(
        mockPrompt,
        defaultSystemPrompt,
        mockModel,
        mockToken,
        undefined
      )
      expect(core.setOutput).toHaveBeenCalledWith('text', mockResponse)
    })

    it('should throw error when system prompt file does not exist', async () => {
      const systemPromptFilePath =
        '/tmp/non-existent-system-prompt-' + Date.now() + '.txt'

      core.getInput.mockImplementation((name: string) => {
        switch (name) {
          case 'prompt':
            return mockPrompt
          case 'system-prompt-file':
            return systemPromptFilePath
          case 'token':
            return mockToken
          case 'model':
            return mockModel
          default:
            return ''
        }
      })

      await run()

      expect(core.setFailed).toHaveBeenCalledWith(
        `System prompt file not found: ${systemPromptFilePath}`
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle AI generation errors', async () => {
      const errorMessage = 'API Error'
      ai.generateAIResponse.mockRejectedValue(new Error(errorMessage))

      core.getInput.mockImplementation((name: string) => {
        switch (name) {
          case 'prompt':
            return mockPrompt
          case 'system-prompt':
            return mockSystemPrompt
          case 'token':
            return mockToken
          case 'model':
            return mockModel
          default:
            return ''
        }
      })

      await run()

      expect(core.setFailed).toHaveBeenCalledWith(errorMessage)
    })
  })

  describe('Response Schema', () => {
    it('should work with response schema file', async () => {
      // Use existing schema file for testing
      const schemaFilePath = '__tests__/schemas/test-schema.json'
      const schema = {
        type: 'object',
        properties: {
          message: { type: 'string' }
        },
        required: ['message'],
        additionalProperties: false
      }

      core.getInput.mockImplementation((name: string) => {
        switch (name) {
          case 'prompt':
            return mockPrompt
          case 'system-prompt':
            return mockSystemPrompt
          case 'token':
            return mockToken
          case 'model':
            return mockModel
          case 'response-schema-file':
            return schemaFilePath
          default:
            return ''
        }
      })

      await run()

      expect(ai.generateAIResponse).toHaveBeenCalledWith(
        mockPrompt,
        mockSystemPrompt,
        mockModel,
        mockToken,
        schema
      )
      expect(core.setOutput).toHaveBeenCalledWith('text', mockResponse)
    })

    it('should throw error when response schema file does not exist', async () => {
      const schemaFilePath = '/tmp/non-existent-schema-' + Date.now() + '.json'

      core.getInput.mockImplementation((name: string) => {
        switch (name) {
          case 'prompt':
            return mockPrompt
          case 'system-prompt':
            return mockSystemPrompt
          case 'token':
            return mockToken
          case 'model':
            return mockModel
          case 'response-schema-file':
            return schemaFilePath
          default:
            return ''
        }
      })

      await run()

      expect(core.setFailed).toHaveBeenCalledWith(
        `Response schema file not found: ${schemaFilePath}`
      )
    })

    it('should throw error when response schema file contains invalid JSON', async () => {
      const schemaFilePath = '__tests__/schemas/invalid-schema.json'

      core.getInput.mockImplementation((name: string) => {
        switch (name) {
          case 'prompt':
            return mockPrompt
          case 'system-prompt':
            return mockSystemPrompt
          case 'token':
            return mockToken
          case 'model':
            return mockModel
          case 'response-schema-file':
            return schemaFilePath
          default:
            return ''
        }
      })

      await run()

      expect(core.setFailed).toHaveBeenCalledWith(
        expect.stringContaining(
          `Invalid JSON in response schema file: ${schemaFilePath}`
        )
      )
    })

    it('should work without response schema (backward compatibility)', async () => {
      core.getInput.mockImplementation((name: string) => {
        switch (name) {
          case 'prompt':
            return mockPrompt
          case 'system-prompt':
            return mockSystemPrompt
          case 'token':
            return mockToken
          case 'model':
            return mockModel
          default:
            return ''
        }
      })

      await run()

      expect(ai.generateAIResponse).toHaveBeenCalledWith(
        mockPrompt,
        mockSystemPrompt,
        mockModel,
        mockToken,
        undefined
      )
      expect(core.setOutput).toHaveBeenCalledWith('text', mockResponse)
    })

    it('should work with real schema file from disk', async () => {
      const schemaFilePath = '__tests__/schemas/simple-response.json'
      // Read the actual schema from the file to use in our expectation
      const realSchemaContent = fs.readFileSync(schemaFilePath, 'utf8')
      const realSchema = JSON.parse(realSchemaContent)

      core.getInput.mockImplementation((name: string) => {
        switch (name) {
          case 'prompt':
            return mockPrompt
          case 'system-prompt':
            return mockSystemPrompt
          case 'token':
            return mockToken
          case 'model':
            return mockModel
          case 'response-schema-file':
            return schemaFilePath
          default:
            return ''
        }
      })

      await run()

      expect(ai.generateAIResponse).toHaveBeenCalledWith(
        mockPrompt,
        mockSystemPrompt,
        mockModel,
        mockToken,
        realSchema
      )
      expect(core.setOutput).toHaveBeenCalledWith('text', mockResponse)
    })
  })

  describe('Template Processing', () => {
    it('should process prompt template with vars', async () => {
      const templatePrompt = 'Hello {{ name }}, you are {{ age }} years old'
      const vars = `
        name: Alice
        age: 30
      `
      const expectedPrompt = 'Hello Alice, you are 30 years old'

      core.getInput.mockImplementation((name: string) => {
        switch (name) {
          case 'prompt':
            return templatePrompt
          case 'system-prompt':
            return mockSystemPrompt
          case 'token':
            return mockToken
          case 'model':
            return mockModel
          case 'vars':
            return vars
          default:
            return ''
        }
      })

      await run()

      expect(ai.generateAIResponse).toHaveBeenCalledWith(
        expectedPrompt,
        mockSystemPrompt,
        mockModel,
        mockToken,
        undefined
      )
      expect(core.setOutput).toHaveBeenCalledWith('text', mockResponse)
    })

    it('should process system prompt template with vars', async () => {
      const templateSystemPrompt = 'You are a {{ role }} expert'
      const vars = 'role: TypeScript'
      const expectedSystemPrompt = 'You are a TypeScript expert'

      core.getInput.mockImplementation((name: string) => {
        switch (name) {
          case 'prompt':
            return mockPrompt
          case 'system-prompt':
            return templateSystemPrompt
          case 'token':
            return mockToken
          case 'model':
            return mockModel
          case 'vars':
            return vars
          default:
            return ''
        }
      })

      await run()

      expect(ai.generateAIResponse).toHaveBeenCalledWith(
        mockPrompt,
        expectedSystemPrompt,
        mockModel,
        mockToken,
        undefined
      )
      expect(core.setOutput).toHaveBeenCalledWith('text', mockResponse)
    })

    it('should process templates in both prompt and system prompt', async () => {
      const templatePrompt = 'Translate {{ text }} to {{ language }}'
      const templateSystemPrompt = 'You are a {{ language }} expert'
      const vars = `
        text: "Hello world"
        language: Spanish
      `
      const expectedPrompt = 'Translate Hello world to Spanish'
      const expectedSystemPrompt = 'You are a Spanish expert'

      core.getInput.mockImplementation((name: string) => {
        switch (name) {
          case 'prompt':
            return templatePrompt
          case 'system-prompt':
            return templateSystemPrompt
          case 'token':
            return mockToken
          case 'model':
            return mockModel
          case 'vars':
            return vars
          default:
            return ''
        }
      })

      await run()

      expect(ai.generateAIResponse).toHaveBeenCalledWith(
        expectedPrompt,
        expectedSystemPrompt,
        mockModel,
        mockToken,
        undefined
      )
      expect(core.setOutput).toHaveBeenCalledWith('text', mockResponse)
    })

    it('should process template with prompt file', async () => {
      const promptFilePath = '__tests__/prompts/template-prompt.txt'
      const vars = `
        language: TypeScript
        focus: security
      `
      // The expected result after template processing (will include newline from file)
      const expectedPrompt = 'Review TypeScript code for security\n'

      core.getInput.mockImplementation((name: string) => {
        switch (name) {
          case 'prompt-file':
            return promptFilePath
          case 'system-prompt':
            return mockSystemPrompt
          case 'token':
            return mockToken
          case 'model':
            return mockModel
          case 'vars':
            return vars
          default:
            return ''
        }
      })

      await run()

      expect(ai.generateAIResponse).toHaveBeenCalledWith(
        expectedPrompt,
        mockSystemPrompt,
        mockModel,
        mockToken,
        undefined
      )
      expect(core.setOutput).toHaveBeenCalledWith('text', mockResponse)
    })

    it('should work without vars (backward compatibility)', async () => {
      core.getInput.mockImplementation((name: string) => {
        switch (name) {
          case 'prompt':
            return mockPrompt
          case 'system-prompt':
            return mockSystemPrompt
          case 'token':
            return mockToken
          case 'model':
            return mockModel
          case 'vars':
            return '' // No vars provided
          default:
            return ''
        }
      })

      await run()

      expect(ai.generateAIResponse).toHaveBeenCalledWith(
        mockPrompt,
        mockSystemPrompt,
        mockModel,
        mockToken,
        undefined
      )
      expect(core.setOutput).toHaveBeenCalledWith('text', mockResponse)
    })

    it('should handle template processing errors', async () => {
      const templatePrompt = 'Hello {{ undefinedVar }}'
      const vars = 'name: world'

      core.getInput.mockImplementation((name: string) => {
        switch (name) {
          case 'prompt':
            return templatePrompt
          case 'system-prompt':
            return mockSystemPrompt
          case 'token':
            return mockToken
          case 'model':
            return mockModel
          case 'vars':
            return vars
          default:
            return ''
        }
      })

      await run()

      expect(core.setFailed).toHaveBeenCalledWith(
        expect.stringContaining('Template rendering error')
      )
    })

    it('should handle invalid YAML in vars', async () => {
      const invalidYaml = `
        name: "unclosed string
        age: 30
      `

      core.getInput.mockImplementation((name: string) => {
        switch (name) {
          case 'prompt':
            return mockPrompt
          case 'system-prompt':
            return mockSystemPrompt
          case 'token':
            return mockToken
          case 'model':
            return mockModel
          case 'vars':
            return invalidYaml
          default:
            return ''
        }
      })

      await run()

      expect(core.setFailed).toHaveBeenCalledWith(
        expect.stringContaining('Invalid YAML in vars parameter')
      )
    })
  })
})
