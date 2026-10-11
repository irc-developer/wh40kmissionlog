import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
const base=process.env.PAGES_BASE || '/';
export default defineConfig({
 plugins:[react(),VitePWA({registerType:'prompt',injectRegister:false,includeAssets:['terminal.svg'],manifest:{name:'Terminal de misión',short_name:'Mission Log',lang:'es',start_url:base,scope:base,display:'standalone',background_color:'#111713',theme_color:'#111713',icons:[{src:'terminal.svg',sizes:'any',type:'image/svg+xml',purpose:'any'}]},workbox:{globPatterns:['**/*.{js,css,html,svg,webmanifest}'],navigateFallback:'index.html',cleanupOutdatedCaches:true}})],
 base,
 test:{environment:'jsdom', setupFiles:['./tests/setup.ts'], exclude:['tests/e2e/**','node_modules/**','dist/**']},
});
