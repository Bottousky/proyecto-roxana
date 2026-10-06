import {defineConfig} from 'vite';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {renderStatic} from './src/escuela/clasica-render.js';
const page=p=>fileURLToPath(new URL(p,import.meta.url));
// The classic home is served already written: the first visit (no save) rendered from the same modules the browser
// uses, so a person, a reader or a search engine gets the whole Instituto without running a script.
const clasica=()=>({name:'escuela-clasica',transformIndexHtml:{order:'pre',handler(html,ctx){
  if(!ctx.filename.endsWith('escuela-clasica.html'))return html;
  const news=JSON.parse(readFileSync(page('./public/escuela/novedades.json'),'utf8'));
  return renderStatic(html,{news:news.items,dev:Boolean(ctx.server)});
}}});
export default defineConfig({publicDir:fileURLToPath(new URL('./public',import.meta.url)),plugins:[clasica()],server:{host:'127.0.0.1',port:4190,strictPort:true,hmr:false},build:{outDir:'dist',rollupOptions:{input:{main:page('./index.html'),escuela:page('./escuela.html'),clasica:page('./escuela-clasica.html')}}}});
