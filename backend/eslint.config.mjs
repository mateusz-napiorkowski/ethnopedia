import globals from "globals";
import pluginJs from "@eslint/js";
import tslint from "typescript-eslint";


export default [
    {files: ["**/*.{js,mjs,cjs,ts}"]},
    {languageOptions: {globals: {...globals.node, ...globals.jest}}},
    pluginJs.configs.recommended,
    ...tslint.configs.recommended,
    {
        rules: {
            "no-unused-vars": "warn",
            "no-undef": "warn",
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-require-imports": "warn"
        },
    },
    {
        ignores: ["**/coverage/**/*"]
    }
];