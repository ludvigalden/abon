module.exports = {
    hooks: {
        "pre-commit": "lint-staged -c ./.lintstagedrc.js && npm run build && npm run test"
    },
};
