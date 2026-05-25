import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";

export default [
  js.configs.recommended,
  prettierConfig,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        confirm: "readonly",
        alert: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        FileReader: "readonly",
        performance: "readonly",
        requestAnimationFrame: "readonly",
        bootstrap: "readonly",
        Chart: "readonly",
        console: "readonly",
        CustomEvent: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-empty": ["error", { "allowEmptyCatch": true }]
    }
  }
];
