module.exports = {
  extends: ["@gazzati/eslint-config-node"],
  rules: {
    // Specific project rules
  },
  overrides: [
    {
      files: ["*.controller.ts"],
      rules: {
        "@typescript-eslint/require-await": 0
      }
    }
  ],
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2019,
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.eslint.json"]
  }
}
