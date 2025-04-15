import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
  testMatch: ['**/*.test.ts?(x)'],
};

export default config;