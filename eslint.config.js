import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';
export default tseslint.config({ignores:['dist/**','node_modules/**','playwright-report/**','test-results/**']}, js.configs.recommended, ...tseslint.configs.recommended, {files:['**/*.{ts,tsx}'], plugins:{'react-hooks':hooks}, rules:hooks.configs.recommended.rules}, {files:['**/*.{js,ts,tsx}'], languageOptions:{globals:{window:'readonly',document:'readonly',navigator:'readonly',console:'readonly',process:'readonly',setTimeout:'readonly',clearTimeout:'readonly',URL:'readonly',Blob:'readonly',crypto:'readonly',structuredClone:'readonly'}}});
