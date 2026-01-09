import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "*.md", // Ignore markdown files from linting
    // Ignore generated Prisma client files
    "src/generated/**",
  ]),
  {
    rules: {
      // Allow inline styles for dynamic width/height calculations
      "@next/next/no-img-element": "warn",
      "@next/next/no-inline-styles": "off",
    },
  },
  // Suppress Tailwind canonical class warnings for custom utilities
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-inner-declarations": "off",
    },
    languageOptions: {
      parserOptions: {
        warnOnUnmatchedPattern: false,
      },
    },
  },
]);

export default eslintConfig;


