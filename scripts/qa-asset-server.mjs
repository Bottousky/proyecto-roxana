// Temporary local proxy for exercising artwork retry through the real UI.
// Start the production server on 4180, then run this script and open 4181.
import http from 'node:http';
import {Readable} from 'node:stream';
const failOnce=new Set(['/assets/actors/player.webp','/assets/portraits.webp']);
http.createServer(async(req,res)=>{
  const requestURL=new URL(req.url,'http://qa.local');
  const target=new URL('http://127.0.0.1:4180');target.pathname=requestURL.pathname;target.search=requestURL.search;
  if(failOnce.delete(target.pathname)){res.writeHead(503,{'Cache-Control':'no-store'});res.end('Simulated artwork outage');return;}
  try{
    const upstream=await fetch(target,{method:req.method});
    const headers={...Object.fromEntries(upstream.headers),'Cache-Control':'no-store'};
    delete headers['content-encoding'];delete headers['transfer-encoding'];
    res.writeHead(upstream.status,headers);
    if(upstream.body)Readable.fromWeb(upstream.body).pipe(res);else res.end();
  }catch{res.writeHead(502);res.end('Start the production server on port 4180 first.');}
}).listen(4181,'127.0.0.1',()=>console.log('Artwork retry QA: http://127.0.0.1:4181'));
