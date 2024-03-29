module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    root: true,
    ignorePatterns: [
        "dist/*",
        "webpack.config.js"
    ],
    rules: {
        "@typescript-eslint/no-inferrable-types": "off"
    }
};