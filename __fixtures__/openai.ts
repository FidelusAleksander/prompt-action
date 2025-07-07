/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { jest } from '@jest/globals'

export const mockCreate = jest.fn<any>()

export class OpenAI {
  chat = {
    completions: {
      create: mockCreate
    }
  }

  constructor(config: any) {
    // Mock constructor - we can add assertions here if needed
  }
}
