import {createServer} from 'node:http';
import {readFile,mkdir,writeFile,rename} from 'node:fs/promises';
import {resolve,dirname,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {initialState,inspect,update,csv} from './dist/engine.mjs';
const root=dirname(fileURLToPath(import.meta.url)),web=resolve(root,'dist');
const data=resolve(process.env.WEXSPACE_DEMO_DATA||resolve(root,'.private-demo'),'state.json');let state;
try{state=JSON.parse(await readFile(data,'utf8'));inspect(state);}catch(e){if(e.code!=='ENOENT')throw e;state=initialState();}
await mkdir(dirname(data),{recursive:true,mode:0o700});let queue=Promise.resolve();
const port=Number(process.env.PORT||4188),host='127.0.0.1';
async function action(x){if(!x||typeof x!=='object'||Array.isArray(x))throw Error('Action object required');if(x.action==='inspect')return inspect(state);if(x.action==='export')return {...inspect(state),csv:csv(state)};
 if(x.action==='update'){const out=await update(state,{...x.parameters,actor:'mcp'});const tmp=data+'.tmp';await writeFile(tmp,JSON.stringify(out.state),{mode:0o600});await rename(tmp,data);state=out.state;return out.result;}throw Error('Unsupported action');}
createServer(async(req,res)=>{const send=(status,o)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(o));};
 try{if(req.headers.origin&&!['http://127.0.0.1:'+port,'http://localhost:'+port].includes(req.headers.origin))return send(403,{error:'ORIGIN_NOT_ALLOWED'});
 const p=new URL(req.url,'http://127.0.0.1').pathname;if(p==='/health')return send(200,{ok:true,app:'WEXSPACE Engineering Workshop',scope:'LOCAL_SYNTHETIC_DEMO'});
 if(p==='/api/action'&&req.method==='POST'){let body='';for await(const b of req){body+=b;if(body.length>16000)return send(413,{error:'INPUT_TOO_LARGE'});}const x=JSON.parse(body);const job=queue.then(()=>action(x));queue=job.catch(()=>{});try{return send(200,{ok:true,result:await job});}catch(e){return send(400,{ok:false,error:e.code||'INVALID_INPUT',message:e.message});}}
 if(req.method!=='GET')return send(405,{error:'METHOD_NOT_ALLOWED'});
 const path=resolve(web,'.'+decodeURIComponent(p==='/'?'/index.html':p));if(!path.startsWith(web+'/'))return send(403,{error:'PATH_NOT_ALLOWED'});
 const bytes=await readFile(path);res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.svg':'image/svg+xml'})[extname(path)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});res.end(bytes);
 }catch(e){send(e.code==='ENOENT'?404:400,{error:'REQUEST_FAILED',message:e.code==='ENOENT'?'Not found':'Invalid request'});}
}).listen(port,host,()=>console.log(JSON.stringify({app:'WEXSPACE Engineering Workshop',url:`http://${host}:${port}`,data_persisted_privately:true})));
