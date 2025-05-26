import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom', // Required for React components
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // Ensure this file exists
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};

export default config;
