import { jest } from '@jest/globals'

export const existsSync = jest.fn<typeof import('fs').existsSync>()
export const readFileSync = jest.fn<typeof import('fs').readFileSync>()
