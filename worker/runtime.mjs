import {evaluate,defaults,initialState,update,csv,validateRoom} from '../dist/engine.mjs';
const n={type:'number'},roomProperties={};for(const [k,v]of Object.entries(defaults))roomProperties[k]={type:typeof v==='boolean'?'boolean':'number'};
const roomSchema={type:'object',properties:roomProperties,additionalProperties:false};
const tools=[
 {name:'calculate_room_quantities',description:'Calculate a rectangular room quantity schedule with explicit metres, coats, coverage and waste. Returns formulas and a link opening the actual room drawing. No purchase or engineering sign-off.',inputSchema:{type:'object',properties:{room:roomSchema},required:['room'],additionalProperties:false},annotations:{readOnlyHint:true,destructiveHint:false,idempotentHint:true}},
 {name:'compare_room_revision',description:'Compare one explicit room edit against its supplied predecessor. Preserves the no-ceiling/no-order requirement. Returns a proposed revision and its evidence; does not silently modify a browser workspace.',inputSchema:{type:'object',properties:{room:roomSchema,patch:roomSchema},required:['room','patch'],additionalProperties:false},annotations:{readOnlyHint:true,destructiveHint:false,idempotentHint:true}},
 {name:'export_room_schedule',description:'Return a reviewable CSV and preliminary dossier computed from the supplied room. No file is uploaded and no order is placed.',inputSchema:{type:'object',properties:{room:roomSchema},required:['room'],additionalProperties:false},annotations:{readOnlyHint:true,destructiveHint:false,idempotentHint:true}}
];
const json=(o,status=200)=>new Response(JSON.stringify(o),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
function room(input){const r=validateRoom({...defaults,...input});if(r.includeCeiling)throw Error('The exercise explicitly excludes the ceiling.');return r;}
function view(origin,r){return origin+'/#room='+encodeURIComponent(JSON.stringify(r));}
async function invoke(name,args,origin){
 if(!args||typeof args!=='object'||Array.isArray(args))throw Error('An argument object is required.');
 const allowed=name==='compare_room_revision'?['room','patch']:['room'];if(Object.keys(args).some(k=>!allowed.includes(k)))throw Error('Unknown argument.');
 const r=room(args.room);if(name==='calculate_room_quantities')return {room:r,quantities:evaluate(r),open_project_url:view(origin,r),scope:'STATELESS_CALCULATION_NO_PURCHASE'};
 if(name==='compare_room_revision'){const s={...initialState(),room:r};const a=await update(s,{patch:args.patch,expected_revision:0,operation_id:'compare-'+(await digest(r)).slice(0,24),actor:'mcp'});return {before:evaluate(r),after:a.result.quantities,proposed_room:a.state.room,receipt:a.result.receipt,open_project_url:view(origin,a.state.room),scope:'PROPOSED_REVISION_NOT_A_BROWSER_STATE_WRITE'};}
 if(name==='export_room_schedule')return {room:r,quantities:evaluate(r),csv:csv({...initialState(),room:r}),physical_work_authorized:false,purchased:false};throw Error('Unknown tool.');
}
export default {async fetch(request,env,ctx){
 const url=new URL(request.url),p=url.pathname;
 if(p==='/health')return json({ok:true,app:'WEXSPACE Engineering Workshop',mcp:true,model_api_calls:0});
 if(p==='/mcp'){
  if(request.method!=='POST')return new Response(null,{status:405,headers:{allow:'POST'}});
  const origin=request.headers.get('origin');if(origin&&origin!==url.origin)return json({error:'ORIGIN_NOT_ALLOWED'},403);
  let rpc;try{const text=await request.text();if(text.length>32000)throw Error('Request too large');rpc=JSON.parse(text);if(!rpc||Array.isArray(rpc)||rpc.jsonrpc!=='2.0')throw Error('Invalid RPC');}catch{return json({jsonrpc:'2.0',id:null,error:{code:-32700,message:'Invalid request'}},400);}
  const id=rpc.id??null,result=o=>json({jsonrpc:'2.0',id,result:o});
  if(rpc.method==='server/discover')return result({supportedVersions:['2026-07-28'],capabilities:{tools:{}},serverInfo:{name:'WEXSPACE Engineering Workshop',version:'0.3.0'}});
  if(rpc.method==='initialize')return result({protocolVersion:'2026-07-28',capabilities:{tools:{}},serverInfo:{name:'WEXSPACE Engineering Workshop',version:'0.3.0'},instructions:'Read-only measured-room calculations. No purchasing, no certification, no access to an employer system.'});
  if(rpc.method==='notifications/initialized')return new Response(null,{status:202});
  if(rpc.method==='tools/list')return result({tools});
  if(rpc.method==='ping')return result({});
  if(rpc.method==='tools/call'){
   const tool=tools.find(t=>t.name===rpc.params?.name);if(!tool)return json({jsonrpc:'2.0',id,error:{code:-32602,message:'Unknown tool'}});
   // Sites authenticates and authorizes access before proxying this owner-private endpoint.
   try{const value=await invoke(tool.name,rpc.params.arguments||{},url.origin);return result({content:[{type:'text',text:JSON.stringify(value)}],structuredContent:value,isError:false});}
   catch(e){return result({isError:true,content:[{type:'text',text:JSON.stringify({error:e.code||'INVALID_INPUT',message:e.message})}]});}
  }
  return json({jsonrpc:'2.0',id,error:{code:-32601,message:'Method not found'}});
 }
 if(request.method!=='GET'&&request.method!=='HEAD')return new Response('Method not allowed',{status:405});
 const file=p==='/'?'index.html':p.slice(1),asset=ASSETS[file];if(!asset)return new Response('Not found',{status:404});
 return new Response(request.method==='HEAD'?null:asset.body,{headers:{'content-type':asset.type,'x-content-type-options':'nosniff','cache-control':'no-store','referrer-policy':'same-origin'}});
}};
