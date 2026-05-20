module.exports = {
	extends: 'erb',
	plugins: ['@typescript-eslint'],
	// Ignore shadcn/ui components, shadcn hooks, and 3rd-party vendored helpers (color-picker, etc.)
	ignorePatterns: ['**/components/ui/**', '**/renderer/lib/**', 'src/hooks/**'],
	globals: {
		// Electron's global types are exposed as `Electron.*`
		Electron: 'readonly',
		NodeJS: 'readonly',
		globalThis: 'readonly',
	},
	rules: {
		// Electron + webpack toolchain ship as devDependencies but are referenced
		// throughout main/preload and build configs. The rule is too noisy here
		// without buying us much (npm ci would catch any actually-missing dep).
		'import/no-extraneous-dependencies': 'off',
		'react/react-in-jsx-scope': 'off',
		'react/jsx-filename-extension': 'off',
		'import/extensions': 'off',
		'import/no-unresolved': 'off',
		'import/no-import-module-exports': 'off',
		'no-shadow': 'off',
		'@typescript-eslint/no-shadow': 'error',
		'no-unused-vars': 'off',

		// Added in Electron-Hotplate
		'@typescript-eslint/no-unused-vars': [
			'warn',
			{
				vars: 'all',
				varsIgnorePattern: '^_',
				args: 'after-used',
				argsIgnorePattern: '^_',
			},
		],
		'consistent-return': 'off',
		'import/prefer-default-export': 'off',
		'promise/always-return': 'off',
		'react/jsx-props-no-spreading': 'off',
		'react/jsx-no-useless-fragment': 'off',
		'react/prop-types': 'off',
		'react/require-default-props': 'off',
		// Airbnb defaults that don't fit Electron + arrow-fn React style here.
		'no-plusplus': 'off',
		'no-continue': 'off',
		'react/function-component-definition': 'off',
		'react/no-unescaped-entities': 'off',
		// Allow `for..of` (the airbnb preset bans it as part of no-restricted-syntax).
		'no-restricted-syntax': [
			'error',
			'ForInStatement',
			'LabeledStatement',
			'WithStatement',
		],
	},
	parserOptions: {
		ecmaVersion: 2022,
		sourceType: 'module',
	},
	settings: {
		'import/resolver': {
			// See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
			node: {
				extensions: ['.js', '.jsx', '.ts', '.tsx'],
				moduleDirectory: ['node_modules', 'src/'],
			},
			webpack: {
				config: require.resolve('./.erb/configs/webpack.config.eslint.ts'),
			},
			typescript: {},
		},
		'import/parsers': {
			'@typescript-eslint/parser': ['.ts', '.tsx'],
		},
	},
};
