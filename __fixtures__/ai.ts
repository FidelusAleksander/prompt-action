import { jest } from '@jest/globals'

export const generateAIResponse =
  jest.fn<typeof import('../src/ai.js').generateAIResponse>()
