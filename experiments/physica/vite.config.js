import {defineConfig} from 'vite';
export default defineConfig({base:'./',server:{host:'127.0.0.1',port:4210,strictPort:true,hmr:false},build:{outDir:'dist',chunkSizeWarningLimit:2000}});
