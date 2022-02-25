/* eslint-env node */
const path = require("path")
// const babel = require("rollup-plugin-babel")
const pkg = require("./package.json")
const replace = require("@rollup/plugin-replace")
const typescript = require("@rollup/plugin-typescript")

module.exports = {
	input: path.resolve(__dirname, "./src/index.ts"),
	output: {
		file: path.resolve(__dirname, pkg.main),
		format: "cjs",
		name: "kaze",
		banner: "/* eslint-disable */",
	},
	plugins: [
		// babel({
		// 	exclude: 'node_modules/**',
		// }),
		replace({
			NODE_ENV: JSON.stringify(process.env.NODE_ENV === "production" ? "production" : "develop"),
		}),
		typescript({
			cacheDir: "./.rts2_cache",
			compilerOptions: {"module": "ESNext"},
		}),
	],
}
