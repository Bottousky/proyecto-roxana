import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
const page=p=>fileURLToPath(new URL(p,import.meta.url));
export default defineConfig({publicDir:fileURLToPath(new URL('./public',import.meta.url)),server:{host:'127.0.0.1',port:4190,strictPort:true,hmr:false},build:{outDir:'dist',rollupOptions:{input:{main:page('./index.html'),escuela:page('./escuela.html')}}}});
