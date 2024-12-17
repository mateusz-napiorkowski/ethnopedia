/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  testMatch: ['**/__tests__/*.test.ts?(x)'],
  setupFilesAfterEnv: [
    "@testing-library/jest-dom"
  ],
  roots: ["./src"],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(svg)$': '<rootDir>/__mocks__/svgMock.js',
  },
};