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
      branches: 95,
      functions: 90,
      statements: 95,
    },
  },
};
