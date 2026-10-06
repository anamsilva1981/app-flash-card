import tseslint from "typescript-eslint";
export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      ".test-build/**",
      "coverage/**",
      "src/app/app-config.generated.ts",
      "tests/integration/backend/**",
      "supabase/functions/**",
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["**/*.mjs", "**/*.cjs", "cypress/**/*.js"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];
