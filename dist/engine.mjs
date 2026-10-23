// Shared by the visible workspace, WebMCP tools and the self-hosted MCP adapter.
export class InputError extends Error { constructor(message,code='INVALID_INPUT'){super(message);this.code=code;} }
const keys=['length','width','height','openings','coats','coverage','waste','includeCeiling','paintPack','tileSide','tilesPerBox'];
export const defaults={length:6,width:4,height:3,openings:4.68,coats:2,coverage:10,waste:10,includeCeiling:false,paintPack:5,tileSide:0.6,tilesPerBox:4};
const round=n=>Math.round((n+Number.EPSILON)*10000)/10000;
function number(v,name,min,max,integer=false){if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max||(integer&&!Number.isInteger(v)))throw new InputError(`${name} must be ${integer?'a whole number':'a number'} between ${min} and ${max}.`);return v;}
export function validateRoom(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new InputError('A measured room object is required.');
 if(Object.keys(input).some(k=>!keys.includes(k)))throw new InputError('Unknown room field.');
 const r={...input};
 for(const k of ['length','width'])number(r[k],k,0.5,100);
 number(r.height,'height',1,12);number(r.openings,'openings',0,500);number(r.coats,'coats',1,5,true);
 number(r.coverage,'coverage',1,50);number(r.waste,'waste',0,30);number(r.paintPack,'paintPack',0.1,50);
 number(r.tileSide,'tileSide',0.05,2);number(r.tilesPerBox,'tilesPerBox',1,100,true);
 if(typeof r.includeCeiling!=='boolean')throw new InputError('includeCeiling must be true or false.');
 const walls=2*(r.length+r.width)*r.height;
 if(r.openings>=walls)throw new InputError('Openings must be smaller than the gross wall area.');
 return r;
}
export function evaluate(room){
 const r=validateRoom(room),floor=r.length*r.width,grossWalls=2*(r.length+r.width)*r.height,netWalls=grossWalls-r.openings;
 const ceiling=r.includeCeiling?floor:0,paintArea=netWalls+ceiling;
 const litres=paintArea*r.coats*(1+r.waste/100)/r.coverage,paintPacks=Math.ceil(litres/r.paintPack-1e-10);
 const tiles=Math.ceil(floor*(1+r.waste/100)/(r.tileSide*r.tileSide)-1e-10),tileBoxes=Math.ceil(tiles/r.tilesPerBox);
 return {floor_m2:round(floor),gross_walls_m2:round(grossWalls),openings_m2:r.openings,net_walls_m2:round(netWalls),ceiling_m2:round(ceiling),paint_area_m2:round(paintArea),paint_litres:round(litres),paint_packs:paintPacks,paint_pack_litres:r.paintPack,paint_purchase_litres:round(paintPacks*r.paintPack),tile_count:tiles,tile_boxes:tileBoxes,tiles_per_box:r.tilesPerBox,
  explanation:[`Floor = ${r.length} × ${r.width} = ${round(floor)} m².`,`Net walls = 2 × (${r.length} + ${r.width}) × ${r.height} − ${r.openings} = ${round(netWalls)} m².`,`Paint = (${round(netWalls)} + ${round(ceiling)}) × ${r.coats} coats × ${round(1+r.waste/100)} ÷ ${r.coverage} m²/L = ${round(litres)} L.`,`Round UP to ${paintPacks} packs × ${r.paintPack} L.`,`Tiles = ceil(${round(floor)} × ${round(1+r.waste/100)} ÷ ${r.tileSide}²) = ${tiles}; ${tileBoxes} boxes of ${r.tilesPerBox}.`],
  assumptions:['User-entered rectangular room dimensions in metres.','Openings are deducted from walls; no deduction from floor.','Coverage, coats, waste and pack sizes are user assumptions, not manufacturer certification.','No structural, electrical, procurement or physical-work authorization.'],status:'CALCULATED_FROM_ENTERED_ASSUMPTIONS',purchased:false};
}
export function initialState(){return {schema:'wexspace.engineering-workshop.v1',title:'Study room refurbishment',revision:0,room:{...defaults},requirements:['Use metres and explain every quantity.','Exclude the ceiling. Do not buy or order anything.'],operations:{},audit:[]};}
export function inspect(s){return {schema:s.schema,title:s.title,revision:s.revision,room:s.room,requirements:s.requirements,quantities:evaluate(s.room),audit:s.audit.slice(-12),mode:'PRELIMINARY_QUANTITIES_NOT_ENGINEERING_SIGN_OFF'};}
function stable(x){return JSON.stringify(x,Object.keys(x).sort());}
// SHA-256 fallback for an HTTP-only local preview. HTTPS uses Web Crypto.
// This does not relax any browser transport or authentication protection.
export function sha256(bytes){
 const primes=[];for(let n=2;primes.length<64;n++){if(!primes.some(p=>p*p<=n&&n%p===0))primes.push(n);}
 const H=primes.slice(0,8).map(p=>Math.floor((Math.sqrt(p)%1)*4294967296)>>>0),K=primes.map(p=>Math.floor((Math.cbrt(p)%1)*4294967296)>>>0);
 const size=Math.ceil((bytes.length+9)/64)*64,b=new Uint8Array(size);b.set(bytes);b[bytes.length]=128;const d=new DataView(b.buffer);d.setUint32(size-8,Math.floor(bytes.length/536870912));d.setUint32(size-4,(bytes.length*8)>>>0);
 const r=(x,n)=>(x>>>n)|(x<<(32-n)),w=new Uint32Array(64);
 for(let offset=0;offset<size;offset+=64){for(let i=0;i<16;i++)w[i]=d.getUint32(offset+i*4);for(let i=16;i<64;i++){const a=w[i-15],z=w[i-2];w[i]=(w[i-16]+(r(a,7)^r(a,18)^(a>>>3))+w[i-7]+(r(z,17)^r(z,19)^(z>>>10)))>>>0;}
  let [a,c,e,f,g,h,j,k]=H;for(let i=0;i<64;i++){const t=(k+(r(g,6)^r(g,11)^r(g,25))+((g&h)^(~g&j))+K[i]+w[i])>>>0,u=((r(a,2)^r(a,13)^r(a,22))+((a&c)^(a&e)^(c&e)))>>>0;k=j;j=h;h=g;g=(f+t)>>>0;f=e;e=c;c=a;a=(t+u)>>>0;}
  [a,c,e,f,g,h,j,k].forEach((v,i)=>H[i]=(H[i]+v)>>>0);
 }return H.map(v=>v.toString(16).padStart(8,'0')).join('');
}
export async function digest(x){const a=new TextEncoder().encode(JSON.stringify(x));if(!globalThis.crypto?.subtle)return sha256(a);const b=await crypto.subtle.digest('SHA-256',a);return [...new Uint8Array(b)].map(n=>n.toString(16).padStart(2,'0')).join('');}
export async function update(s,{patch,expected_revision,operation_id,actor='human'}){
 if(!patch||typeof patch!=='object'||Array.isArray(patch)||!Object.keys(patch).length)throw new InputError('A nonempty patch is required.');
 if(Object.keys(patch).some(k=>!keys.includes(k)))throw new InputError('Only room measurements and assumptions can be changed.');
 if(typeof operation_id!=='string'||!/^[a-zA-Z0-9._-]{8,96}$/.test(operation_id))throw new InputError('Use an operation ID of 8–96 safe characters.');
 if(!['human','webmcp','simulator','mcp'].includes(actor))throw new InputError('Unsupported actor.');
 const signature=stable(patch)+'|'+expected_revision;
 if(s.operations[operation_id]){if(s.operations[operation_id].signature!==signature)throw new InputError('Operation ID already belongs to a different request.','OPERATION_CONFLICT');return {state:s,result:{...s.operations[operation_id].result,cached:true}};}
 if(!Number.isInteger(expected_revision)||expected_revision!==s.revision)throw new InputError(`Revision changed. Inspect revision ${s.revision} before editing.`,'REVISION_CONFLICT');
 if(s.audit.length>=200)throw new InputError('This demonstration workspace reached 200 revisions. Export it before starting another.','WORKSPACE_LIMIT');
 const room=validateRoom({...s.room,...patch});
 if(s.requirements.includes('Exclude the ceiling. Do not buy or order anything.')&&room.includeCeiling)throw new InputError('The project requirement excludes the ceiling. Change the requirement deliberately before including it.','REQUIREMENT_CONFLICT');
 const before=await digest({revision:s.revision,room:s.room,requirements:s.requirements}),next={...s,room,revision:s.revision+1,operations:{...s.operations},audit:[...s.audit]};
 const after=await digest({revision:next.revision,room,requirements:s.requirements});
 const receipt={operation_id,actor,from_revision:s.revision,to_revision:next.revision,patch,before_sha256:before,after_sha256:after,at:new Date().toISOString(),purchased:false};
 next.audit.push(receipt);const result={revision:next.revision,room,quantities:evaluate(room),receipt,cached:false};
 next.operations[operation_id]={signature,result};return {state:next,result};
}
export function csv(s){const q=evaluate(s.room);return 'Item,Quantity,Unit,Assumption\n'+[['Floor',q.floor_m2,'m2','Rectangular room'],['Net walls',q.net_walls_m2,'m2','Openings deducted'],['Paint',q.paint_litres,'L','Coverage supplied by user'],['Paint packs',q.paint_packs,'pack',`${q.paint_pack_litres} L per pack`],['Tiles',q.tile_count,'tile',`${s.room.tileSide} m square`],['Tile boxes',q.tile_boxes,'box',`${q.tiles_per_box} tiles per box`]].map(r=>r.map(x=>'"'+String(x).replaceAll('"','""')+'"').join(',')).join('\n')+'\n';}
export function parseGuidedCommand(text){
 if(typeof text!=='string'||text.length>500)throw new InputError('Use a short measurement request.');
 const t=text.trim().toLowerCase();
 if(/\b(buy|purchase|order|pay|approve|certify|delete|credential|password)\b/.test(t)&&!/(do not|don't|never) (buy|purchase|order|pay)/.test(t))throw new InputError('This workspace does not purchase, authorize work, or handle credentials.','ACTION_NOT_SUPPORTED');
 const patch={};
 for(const k of ['length','width','height','openings','coats','coverage','waste']){
  const m=t.match(new RegExp('\\b'+k+'\\s*(?:to|=|is|:)??\\s*(\\d+(?:\\.\\d+)?)\\b'));if(m)patch[k]=Number(m[1]);
 }
 if(/(?:exclude|no|without|keep off|keep the ceiling off).*ceiling|ceiling\s+(?:off|excluded)/.test(t))patch.includeCeiling=false;
 if(/(?:include|add)\s+(?:the\s+)?ceiling/.test(t))patch.includeCeiling=true;
 if(!Object.keys(patch).length)throw new InputError('Try “Change width to 4.5 m and keep the ceiling off.” This simulator uses a disclosed bounded command parser; a connected MCP agent can use the typed tools.','COMMAND_NOT_RECOGNIZED');
 return patch;
}
