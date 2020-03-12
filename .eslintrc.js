module.exports = {
	root: true,
	extends: [
		"plugin:prettier/recommended",
		"plugin:import/errors",
		"plugin:import/warnings",
		"prettier/babel",
		"prettier",
		"plugin:@typescript-eslint/recommended",
		"plugin:import/typescript",
		"prettier/@typescript-eslint"
	],
    plugins: ["babel", "import", "prettier"],
    env: {
        browser: true,
        commonjs: true,
        es6: true,
        jest: true,
        node: true,
    },
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module",
        ecmaFeatures: {
            jsx: true,
        },
    },
	overrides: [
		{
			files: ["**/*.ts", "**/*.tsx"],
			parser: "@typescript-eslint/parser",
			plugins: ["@typescript-eslint"],
			rules: {
				"@typescript-eslint/interface-name-prefix": ["error", "never"],
				"@typescript-eslint/explicit-member-accessibility": 0,
				"@typescript-eslint/no-namespace": 0,
				"@typescript-eslint/no-unused-vars": 0,
				"@typescript-eslint/no-empty-function": 0,
				"@typescript-eslint/class-name-casing": 0,
				"@typescript-eslint/no-empty-interface": [
					"error",
					{
						allowSingleExtends: true,
					},
				],
				"@typescript-eslint/no-explicit-any": 0,
				"@typescript-eslint/no-use-before-define": 0,
				"@typescript-eslint/semi": 0,
				"@typescript-eslint/explicit-function-return-type": 0,
				"@typescript-eslint/no-parameter-properties": [
					"error",
					{ allows: ["private readonly", "readonly"] },
				],
				"@typescript-eslint/indent": 0,
			},
		}
	],
    rules: {
		"no-confusing-arrow": ["error", { allowParens: true }],
		"no-mixed-operators": 0,
		curly: ["error", "all"],
		// note you must disable the base rule as it can report incorrect errors
		"no-unused-vars": 0,
		"eslint/no-unused-vars": 0,
		"spaced-comment": [
			"error",
			"always",
			{
				line: {
					markers: ["/"],
					exceptions: ["-", "+"],
				},
				block: {
					markers: ["!"],
					exceptions: ["*"],
					balanced: true,
				},
			},
		],
		"lines-around-comment": 0,
		"max-len": [
			"error",
			{
				code: 140,
				comments: 200,
				tabWidth: 4,
				ignoreRegExpLiterals: true,
				ignoreTemplateLiterals: true,
				ignoreStrings: true,
				ignoreUrls: true,
				ignorePattern: "^\\s*import\\s*"
			},
		],
		"no-console": 0,
		"no-string-literal": 0,
		"import/default": 0,
		"import/namespace": 0,
		"import/named": 0,
		"import/no-unresolved": 0,
		"import/order": [
			2,
			{
				"newlines-between": "always",
				groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
			},
		],
		"object-literal-sort-keys": 0,
		"prefer-const": 2,
		"prefer-object-spread": 1,
		"no-duplicate-imports": 2,
		"no-return-await": 2,
		"no-invalid-this": 1,
		"no-invalid-template-strings": 0,
		"no-arg": 0,
		"no-confusing-arrow": 0,
		"no-duplicate-variable": 0,
		"no-var-requires": 0,
		"max-classes-per-file": 0,
		indent: "off",
		// Prettier manages semicolons
		semi: "off",
		"@typescript-eslint/no-unused-vars": 0,
		"@typescript-eslint/no-empty-function": 0,
    },
    settings: {
        react: {
            version: "detect",
        },
    },
};
