module.exports = {
	"hooks": {
		"pre-push": "env FORCE_COLOR=1 npm test",
		// "prepare-commit-msg": "npx git-cz",
		"commit": "npx git-cz",
		// "commit-msg": "env FORCE_COLOR=1 commitlint -E HUSKY_GIT_PARAMS"
	}
}
