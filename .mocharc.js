
module.exports = {
  // Set the file extension for TypeScript
  extension: ['ts'],
  require: ['ts-node/register'], // Require additional modules before running tests
  spec: ['tests/*/*.ts'], // Specify the test file pattern
  timeout: 10000, // Set the timeout for each test
  reporter: 'spec',
  // Enable or disable colors in the output
  color: true,
  exit: true,
  env: {
    NODE_ENV: 'test',
  }
};