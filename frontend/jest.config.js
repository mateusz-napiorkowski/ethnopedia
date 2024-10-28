/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "jsdom",
  // transform: {
  //   "^.+.tsx?$": ["ts-jest",{}],
  // },
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  setupFilesAfterEnv: [
    "@testing-library/jest-dom"
  ],
  roots: ["./src"],
};