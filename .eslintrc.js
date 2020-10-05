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
        "prettier/@typescript-eslint",
        "plugin:react/recommended",
        "prettier/react",
    ],
    plugins: ["babel", "import", "prettier", "react", "unused-imports"],
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
                // "@typescript-eslint/interface-name-prefix": ["error", "never"],
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
                "@typescript-eslint/no-parameter-properties": 0,
                "@typescript-eslint/indent": 0,
                "@typescript-eslint/explicit-module-boundary-types": 0,
                "@typescript-eslint/ban-types": [
                    "error",
                    {
                        types: {
                            // add a custom message to help explain why not to use it
                            Foo: "Don't use Far because it is unsafe",

                            // add a custom message, AND tell the plugin how to fix it
                            String: {
                                message: "Use string instead",
                                fixWith: "string",
                            },

                            "{}": false,
                            object: false,
                            Function: false,
                        },
                    },
                ],
            },
        },
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
                ignorePattern: "^\\s*import\\s*",
            },
        ],
        "no-console": 0,
        "no-string-literal": 0,
        "import/default": 0,
        "import/namespace": 0,
        "import/named": 0,
        "import/no-unresolved": 0,
        "no-unused-vars": "off",
        "unused-imports/no-unused-imports": "error",
        "unused-imports/no-unused-vars": 0,
        "import/order": [
            2,
            {
                "newlines-between": "always",
                groups: ["external", "internal", ["parent", "sibling"], "index"],
                alphabetize: {
                    order: "asc",
                    caseInsensitive: true,
                },
                pathGroups: [
                    {
                        pattern: "~~/lib/**",
                        group: "internal",
                        position: "before",
                    },
                ],
            },
        ],
        "sort-imports": [
            "error",
            {
                ignoreCase: false,
                ignoreDeclarationSort: true,
                ignoreMemberSort: false,
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
        "react/no-children-prop": 0,
        "react/prop-types": 0,
        "react/display-name": 0,
        "react/forbid-foreign-prop-types": ["warn", { allowInPropTypes: true }],
        "react/jsx-no-comment-textnodes": "warn",
        "react/jsx-no-duplicate-props": "warn",
        "react/jsx-no-target-blank": "warn",
        "react/jsx-no-undef": "error",
        "react/jsx-pascal-case": [
            "warn",
            {
                allowAllCaps: true,
                ignore: [],
            },
        ],
        "react/jsx-uses-react": "warn",
        "react/jsx-uses-vars": "warn",
        "react/no-danger-with-children": "warn",
        // Disabled because of undesirable warnings
        // See https://github.com/facebook/create-react-app/issues/5204 for
        // blockers until its re-enabled
        // 'react/no-deprecated': 'warn',
        "react/no-direct-mutation-state": "warn",
        "react/no-is-mounted": "warn",
        "react/no-typos": "error",
        "react/react-in-jsx-scope": "error",
        "react/require-render-return": "error",
        "react/style-prop-object": "warn",
        "react-hooks/rules-of-hooks": 0,
        "@typescript-eslint/no-var-requires": 0,
        "@typescript-eslint/ban-ts-ignore": 0,
        "@typescript-eslint/camelcase": 0,
        "@typescript-eslint/no-non-null-assertion": 0,
    },
    settings: {
        react: { version: "detect" },
        "import/internal-regex": "^((.*)/)?lib",
    },
};
