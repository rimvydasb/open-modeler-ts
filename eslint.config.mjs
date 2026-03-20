import js from '@eslint/js';
import nextPlugin from 'eslint-plugin-next';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-config-prettier';

export default tseslint.config(
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        plugins: {
            '@next/next': nextPlugin,
        },
        rules: {
            ...nextPlugin.configs.recommended.rules,
            ...nextPlugin.configs['core-web-vitals'].rules,
            'react/react-in-jsx-scope': 'off',
        },
    },
    prettierPlugin,
);
