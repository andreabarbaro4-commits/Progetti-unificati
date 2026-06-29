import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
<<<<<<< HEAD
=======
import prettier from 'eslint-config-prettier'
>>>>>>> 5ea9b1e782c7236c1ad35783b7053dc05cee4797
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
<<<<<<< HEAD
=======
      // Disables ESLint rules that conflict with Prettier; must be last.
      prettier,
>>>>>>> 5ea9b1e782c7236c1ad35783b7053dc05cee4797
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
])
