import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
export default defineConfig({publicDir:fileURLToPath(new URL('./public',import.meta.url)),server:{host:'127.0.0.1',port:4190,strictPort:true,hmr:false},build:{outDir:'dist'}});
