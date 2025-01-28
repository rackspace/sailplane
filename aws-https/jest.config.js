/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+.ts$": ["ts-jest", {}],
  },

  // Coverage
  collectCoverage: true,
  coverageThreshold: {
    "./lib": {
      branches: 90,
      functions: 100,
      statements: 95,
    },
  },
};
