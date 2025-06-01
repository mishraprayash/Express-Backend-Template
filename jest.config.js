module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/tests/**/*.test.ts'
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/tests/',
  ],
  coverageReporters: ['text', 'lcov', 'clover'],
  verbose: true,
  testTimeout: 60000, // Increased timeout for integration and e2e tests
  maxWorkers: 1, // Run tests serially to avoid connection conflicts
  forceExit: true, // Force exit after tests complete
  detectOpenHandles: true, // Detect open handles
  clearMocks: true, // Clear mock calls between tests
  resetMocks: true, // Reset mock state between tests
  restoreMocks: true, // Restore mock state between tests
  bail: 1, // Exit on first failure
  testSequencer: '<rootDir>/tests/sequencer.js', // Custom test sequencer
}; 