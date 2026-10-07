import {defineConfig} from 'vite';
import {readFileSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
const page=p=>fileURLToPath(new URL(p,import.meta.url));
const load=p=>import(pathToFileURL(page(p)).href);
// The home's two pages. The classic one is served already written: the first visit (no save) rendered from the same
// modules the browser uses, so a person, a reader or a search engine gets the whole Instituto without running a
// script. Both point to the game and to each other through src/escuela/links.js, which the Pages build changes (the
// campus is the site's root there and the game is ohmdal.html). Loaded only for these pages and never fatal: this
// config also serves and builds the Ohmdal game, which must not depend on it. If the render fails, the classic page
// goes out with its slots empty and clasica.js fills them in the browser.
const escuela=()=>({name:'escuela-home',transformIndexHtml:{order:'pre',async handler(html,ctx){
  if(!/[\\/]escuela(-clasica)?\.html$/.test(ctx.filename))return html;
  if(ctx.filename.endsWith('escuela-clasica.html'))try{
    const {renderStatic}=await load('./src/escuela/clasica-render.js');
    const news=JSON.parse(readFileSync(page('./public/escuela/novedades.json'),'utf8'));
    html=renderStatic(html,{news:news.items,dev:Boolean(ctx.server)});
  }catch(err){console.warn(`[escuela-clasica] se sirve sin escribir (${err.message}); el navegador la completa.`);}
  const {PLAY,CAMPUS}=await load('./src/escuela/links.js');
  return html.replaceAll('"./index.html',`"${PLAY}`).replaceAll('"./escuela.html',`"${CAMPUS}`);
}}});
// HOME_ONLY=1 builds just the home (for publishing it next to an already published game).
const input=process.env.HOME_ONLY?{escuela:page('./escuela.html'),clasica:page('./escuela-clasica.html')}
  :{main:page('./index.html'),escuela:page('./escuela.html'),clasica:page('./escuela-clasica.html')};
export default defineConfig({publicDir:fileURLToPath(new URL('./public',import.meta.url)),plugins:[escuela()],server:{host:'127.0.0.1',port:4190,strictPort:true,hmr:false},build:{outDir:'dist',rollupOptions:{input}}});
