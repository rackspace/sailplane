/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  extensionsToTreatAsEsm: [".ts"],
  verbose: true,
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true }],
  },

  // Coverage
  collectCoverage: true,
  coverageThreshold: {
    "./lib": {
      branches: 90,
      functions: 100,
      statements: 100,
    },
  },
};
