/**
 * Unit tests for the main index functionality, src/index.ts
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects. For example, the core module is mocked in this test,
 * so that the actual '@actions/core' module is not imported.
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'
import * as fs from '../__fixtures__/fs.js'
import * as ai from '../__fixtures__/ai.js'

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('fs', () => fs)
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
        mockToken
      )
      expect(core.setOutput).toHaveBeenCalledWith('text', mockResponse)
    })

    it('should work with prompt file input', async () => {
      const promptFilePath = 'test-prompt.txt'
      const fileContent = 'prompt from file'

      fs.existsSync.mockReturnValue(true)
      fs.readFileSync.mockReturnValue(fileContent)
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

      expect(fs.existsSync).toHaveBeenCalledWith(promptFilePath)
      expect(fs.readFileSync).toHaveBeenCalledWith(promptFilePath, 'utf8')
      expect(ai.generateAIResponse).toHaveBeenCalledWith(
        fileContent,
        mockSystemPrompt,
        mockModel,
        mockToken
      )
      expect(core.setOutput).toHaveBeenCalledWith('text', mockResponse)
    })

    it('should throw error when prompt file does not exist', async () => {
      const promptFilePath = 'non-existent.txt'

      fs.existsSync.mockReturnValue(false)
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
        mockToken
      )
      expect(core.setOutput).toHaveBeenCalledWith('text', mockResponse)
    })

    it('should work with system prompt file input', async () => {
      const systemPromptFilePath = 'system-prompt.txt'
      const systemPromptContent = 'You are a specialized assistant'

      fs.existsSync.mockReturnValue(true)
      fs.readFileSync.mockReturnValue(systemPromptContent)

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

      expect(fs.existsSync).toHaveBeenCalledWith(systemPromptFilePath)
      expect(fs.readFileSync).toHaveBeenCalledWith(systemPromptFilePath, 'utf8')
      expect(ai.generateAIResponse).toHaveBeenCalledWith(
        mockPrompt,
        systemPromptContent,
        mockModel,
        mockToken
      )
      expect(core.setOutput).toHaveBeenCalledWith('text', mockResponse)
    })

    it('should work with both prompt file and system prompt file', async () => {
      const promptFilePath = 'test-prompt.txt'
      const systemPromptFilePath = 'system-prompt.txt'
      const promptContent = 'prompt from file'
      const systemPromptContent = 'You are a specialized assistant'

      // Mock file system calls - return true for both files exist
      fs.existsSync.mockReturnValue(true)
      // Mock file reading - we'll set up separate test calls
      fs.readFileSync
        .mockReturnValueOnce(promptContent)
        .mockReturnValueOnce(systemPromptContent)

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

      expect(fs.existsSync).toHaveBeenCalledWith(promptFilePath)
      expect(fs.existsSync).toHaveBeenCalledWith(systemPromptFilePath)
      expect(fs.readFileSync).toHaveBeenCalledWith(promptFilePath, 'utf8')
      expect(fs.readFileSync).toHaveBeenCalledWith(systemPromptFilePath, 'utf8')
      expect(ai.generateAIResponse).toHaveBeenCalledWith(
        promptContent,
        systemPromptContent,
        mockModel,
        mockToken
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
        mockToken
      )
      expect(core.setOutput).toHaveBeenCalledWith('text', mockResponse)
    })

    it('should throw error when system prompt file does not exist', async () => {
      const systemPromptFilePath = 'non-existent-system.txt'

      fs.existsSync.mockReturnValue(false)
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
})
