module.exports = {
    hooks: {
        "pre-commit": "lint-staged -c ./.lintstagedrc.js"
    },
};
