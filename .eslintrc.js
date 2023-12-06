module.exports = {
	extends: ['erb'],
	plugins: ['@typescript-eslint'],
	rules: {
		'consistent-return': 'off',
		'no-useless-return': 'warn',
		'react/react-in-jsx-scope': 'off',
		'react/jsx-filename-extension': 'off',
		'react/require-default-props': 'off',
		'react/jsx-props-no-spreading': 'off',
		'react/jsx-no-useless-fragment': 'off',
		// A temporary hack related to IDE not resolving correct package.json
		'import/no-extraneous-dependencies': 'off',
		'import/prefer-default-export': 'off',
		'import/extensions': 'off',
		'import/no-unresolved': 'off',
		'import/no-import-module-exports': 'off',
		'no-shadow': 'off',
		'@typescript-eslint/no-shadow': 'error',
		'no-unused-vars': 'off',
		'@typescript-eslint/no-unused-vars': [
			'warn',
			{
				// Ignore unused variables that start with an underscore
				vars: 'all',
				varsIgnorePattern: '^_',
				args: 'after-used',
				argsIgnorePattern: '^_',
			},
		],
	},
	parserOptions: {
		ecmaVersion: 2022,
		sourceType: 'module',
	},
	settings: {
		'import/resolver': {
			// See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
			node: {},
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
