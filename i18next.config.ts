import { defineConfig } from "i18next-cli"

export default defineConfig({
  locales: ["en", "zh-cn"],
  extract: {
    input: ["src/**/*.{ts,tsx}"],
    ignore: ["src/locales/**", "src/@types/**"],
    output: "src/locales/{{language}}/{{namespace}}.json",
    defaultNS: "common",
    fallbackNS: "common",
    nsSeparator: ":",
    keySeparator: ".",
    functions: ["t", "*.t", "i18n.t"],
    useTranslationNames: ["useTranslation"],
    transComponents: ["Trans", "Translation"],
    primaryLanguage: "en",
    preservePatterns: [
      "document:sourceType.*",
      "home:sourceType.*",
      "knowledge:sourceType.*",
      "request:status.*",
    ],
    indentation: 2,
  },
  lint: {
    ignore: ["src/locales/**", "src/@types/**"],
  },
  types: {
    input: ["src/locales/en/*.json"],
    output: "src/@types/i18next.d.ts",
    resourcesFile: "src/@types/i18next-resources.d.ts",
  },
})
