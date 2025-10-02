// eslint.config.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  {
    ignores: [
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/coverage/**",
      "**/node_modules/**"
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{tsx,jsx}"],
    plugins: { react, "react-hooks": reactHooks },
    rules: {
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    },
    settings: { react: { version: "detect" } }
  },
  prettier,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-console": "warn"
    }
  },

  {  files: ["packages/cli/src/cmds/**/*.ts"],
  rules: {
    "no-console": "off"
    }
  },
  {  files: ["packages/core-modules/src/logger/**/*.ts"],
  rules: {
    "no-console": "off"
    }
  },
  {
    files: ["packages/security/src/audit/logger.ts"],
    rules: {
      "no-console": "off"
    }
  }
];
