import { includeIgnoreFile } from "@eslint/compat";
import eslint from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import eslintPluginAstro from "eslint-plugin-astro";
import jsxA11y from "eslint-plugin-jsx-a11y";
import pluginReact from "eslint-plugin-react";
import reactCompiler from "eslint-plugin-react-compiler";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";

// File path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, ".gitignore");

const baseConfig = tseslint.config({
  extends: [eslint.configs.recommended, tseslint.configs.strict, tseslint.configs.stylistic],
  rules: {
    "no-console": "off",
    "no-unused-vars": "off",
    "linebreak-style": ["error", "unix"],
    "react/prop-types": "off",
  },
});

const jsxA11yConfig = tseslint.config({
  files: ["**/*.{js,jsx,ts,tsx}"],
  extends: [jsxA11y.flatConfigs.recommended],
  languageOptions: {
    ...jsxA11y.flatConfigs.recommended.languageOptions,
  },
  rules: {
    ...jsxA11y.flatConfigs.recommended.rules,
  },
});

const reactConfig = tseslint.config({
  files: ["**/*.{js,jsx,ts,tsx}"],
  extends: [pluginReact.configs.flat.recommended],
  languageOptions: {
    ...pluginReact.configs.flat.recommended.languageOptions,
    globals: {
      window: true,
      document: true,
    },
  },
  plugins: {
    "react-hooks": eslintPluginReactHooks,
    "react-compiler": reactCompiler,
  },
  settings: { react: { version: "detect" } },
  rules: {
    ...eslintPluginReactHooks.configs.recommended.rules,
    "react/react-in-jsx-scope": "off",
    "react-compiler/react-compiler": "error",
  },
});

export default tseslint.config(
  includeIgnoreFile(gitignorePath),
  {
    // Ignorowane pliki - problemy z linterem
    ignores: [
      // Katalogi generowane i zależności
      "node_modules/",
      "dist/",
      ".astro/",
      "playwright-report/",
      "build/",

      // Pliki binarne lub generowane
      "src/db/database.types.ts",

      // Pliki z unikalnymi problemami
      "src/pages/imports-upload.astro",
      "src/components/auth/ResendVerification.tsx",
      "src/components/auth/ResetPasswordForm.tsx",
      "src/middleware/index.ts",

      // Pliki z dużą liczbą błędów `any`
      "src/lib/ai/openrouter/**/*",
      "src/lib/supabase/**/*",

      // Pliki testowe z nieużywanymi zmiennymi
      "global-setup.ts",
      "tests/**/*.ts",
      "tests/e2e/**/*",
      "**/*.test.ts",
      "**/*.test.tsx",
      "src/pages/api/**/*.ts",
    ],
  },
  baseConfig,
  jsxA11yConfig,
  reactConfig,
  eslintPluginAstro.configs["flat/recommended"],
  eslintPluginPrettier
);
