module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
    },
    ignorePatterns: ["node_modules/", "coverage/", "dist/"],
    overrides: [
        {
            files: ["src/modules/**/application/**/*.ts"],
            rules: {
                "no-restricted-imports": [
                    "error",
                    {
                        patterns: ["@/modules/*/infrastructure/*"],
                    },
                ],
            },
        },
        {
            files: ["src/modules/**/domain/**/*.ts"],
            rules: {
                "no-restricted-imports": [
                    "error",
                    {
                        patterns: [
                            "@/modules/*/application/*",
                            "@/modules/*/infrastructure/*",
                        ],
                    },
                ],
            },
        },
    ],
};
