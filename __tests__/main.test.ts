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
import * as openai from '../__fixtures__/openai.js'

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('fs', () => fs)
jest.unstable_mockModule('openai', () => openai)

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
    // Set up the OpenAI mock to return our test response
    openai.mockCreate.mockResolvedValue({
      model: mockModel,
      choices: [
        {
          message: {
            content: mockResponse,
            refusal: null,
            role: 'assistant'
          },
          finish_reason: 'stop',
          index: 0
        }
      ]
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should work with prompt input', async () => {
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

    expect(openai.mockCreate).toHaveBeenCalledWith({
      model: mockModel,
      messages: [
        { role: 'system', content: mockSystemPrompt },
        { role: 'user', content: mockPrompt }
      ]
    })
    expect(core.setOutput).toHaveBeenCalledWith('text', mockResponse)
  })

  it('should work with prompt-file input', async () => {
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
    expect(openai.mockCreate).toHaveBeenCalledWith({
      model: mockModel,
      messages: [
        { role: 'system', content: mockSystemPrompt },
        { role: 'user', content: fileContent }
      ]
    })
    expect(core.setOutput).toHaveBeenCalledWith('text', mockResponse)
  })

  it("should throw error when prompt file doesn't exist", async () => {
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

  it('should throw error when neither prompt nor prompt-file is provided', async () => {
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
