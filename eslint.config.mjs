// eslint.config.mjs
import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
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
        ...globals.node, // ✅ para permitir process, __dirname, etc.
        ...globals.browser
      }
    },
    extends: ["eslint:recommended", "plugin:promise/recommended"],
    rules: {
      "no-prototype-builtins": "error",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-useless-escape": "warn"
    }
  }
]);
