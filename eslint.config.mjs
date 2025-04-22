// eslint.config.mjs
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    ignores: [
      "node_modules",
      "uploads",
      "frontend/assets",
      "public",
      "dist",
      ".env"
    ],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.browser
      }
    },
    linterOptions: {
      reportUnusedDisableDirectives: true
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-useless-escape": "warn",
      "no-prototype-builtins": "error"
    }
  }
]);
