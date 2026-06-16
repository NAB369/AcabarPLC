import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  // Ignore build output and stray migration scripts
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // One-time migration/fix scripts - not part of the app
    "*.js",
    "fix-active.js",
    "add_employment_fields.js",
    "fix_edit_page.js",
    "fix_labels.js",
    "generate_data.js",
    "update_layouts.js",
  ]),
  // Base Next.js configs
  ...nextVitals,
  ...nextTs,
  // Rule overrides - downgrade strict rules to warn/off for incremental adoption
  {
    rules: {
      // TypeScript strict rules → off
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-require-imports": "off",
      // React rules
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "warn",
      // React Compiler / experimental hooks rules → off
      "react-compiler/react-compiler": "off",
      "react-hooks/immutability": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
    },
  },
]);

export default eslintConfig;
