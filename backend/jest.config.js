/**
 * Jest Configuration
 * ------------------
 * Configures Jest test runner for the backend service.
 * Uses Node test environment (not jsdom) since this is a server-side project.
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/src/__tests__/**/*.test.js'],
  verbose: true,
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,
  // Collect coverage from source files, excluding config and tests
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/__tests__/**',
    '!src/server.js'
  ]
};
