// Domain-flexible engineering BUILD planning prototype. Not a manufacturing or engineering sign-off engine.
export const lifecycle = [
  ['01', 'Define the need'], ['02', 'Specify requirements'], ['03', 'Engineer & model'],
  ['04', 'Validate alternatives'], ['05', 'Plan parts & build'], ['06', 'Coordinate execution'],
  ['07', 'Test & inspect'], ['08', 'Deliver & learn']
];
const clean=(s,max=200)=>String(s??'').trim().slice(0,max);
const finite=(v)=>{const n=Number(v);return Number.isFinite(n)?n:NaN};
export function buildDossier({title,sector='General engineering',objective,requirements,constraints,parts,reviewer='',reviewApproved=false}){
  const name=clean(title,120), aim=clean(objective,1200), domain=clean(sector,120);
  if(name.length<3)throw Error('Enter a project title with at least 3 characters.');
  if(aim.length<12)throw Error('Enter a meaningful project goal (12+ characters).');
  if(!Array.isArray(requirements)||requirements.length>25)throw Error('Provide up to 25 requirements.');
  const req=requirements.map(x=>clean(x,250)).filter(Boolean);
  if(!req.length)throw Error('Add at least one project requirement.');
  if(!Array.isArray(parts)||parts.length>40)throw Error('Up to 40 component rows supported.');
  const bom=parts.filter(x=>clean(x.item)).map((x,i)=>{
    const qty=finite(x.qty), unitCost=finite(x.unitCost);
    if(!(qty>0&&qty<=100000&&unitCost>=0&&unitCost<=100000000))throw Error(`Invalid quantity or unit cost for component ${i+1}.`);
    return {item:clean(x.item,120),quantity:qty,unitCost,cost:Math.round(qty*unitCost*100)/100,costSource:'USER_SUPPLIED_UNVERIFIED'};
  });
  const total= Math.round(bom.reduce((n,row)=>n+row.cost,0)*100)/100;
  if(!Number.isFinite(total)||total>1e11)throw Error('Component totals exceed supported bounds.');
  const missing=[...(!clean(constraints,1000)?['Constraints and interfaces not documented']:[]),...(req.length<2?['Add an independent second requirement']:[]),...(bom.length===0?['No component schedule provided']:[])];
  const stages=lifecycle.map(([no,label],index)=>({no,label,status:index===0?'DRAFT_CAPTURED':index===1?'REQUIREMENTS_CAPTURED':'PLANNED_NOT_EXECUTED',owner:'UNASSIGNED',evidence:[]}));
  return {
    schema:'wexspace.engineering.build-dossier.v2',type:'PRELIMINARY_BUILD_WORKFLOW_ONLY',
    project:{name,sector:domain||'General engineering',objective:aim,requirements:req,constraints:clean(constraints,1200)},
    lifecycle:stages,
    billOfMaterials:{rows:bom,totalUserEnteredAmount:total,currency:'UNSPECIFIED',costsVerified:false},
    review:{reviewer:clean(reviewer,90)||'UNASSIGNED',reviewApproved:Boolean(reviewApproved),physicalBuildAuthorization:false,engineeringCertification:false},
    readiness:{state:missing.length?'INPUTS_INCOMPLETE':'PRELIMINARY_WORKFLOW_RECORDED',issues:missing,physicalBuildReady:false},
    provenance:['User-entered preliminary planning data only','No automatic CAD/CAE/fabrication/procurement/physical test was executed','Independent qualified review needed for safety and build readiness']
  };
}
export const example={
 title:'Industrial Inspection Fixture',sector:'Industrial equipment',
 objective:'Develop a modular inspection fixture concept with documented assembly stages and verification checkpoints.',
 requirements:['Adjustable workpiece locating points','Repeatable quality inspection workflow'],
 constraints:'Budget and assembly constraints are placeholders; verify with a qualified engineer.',
 parts:[{item:'Fixture base plate',qty:1,unitCost:85},{item:'Adjustable locating pin',qty:4,unitCost:12.5}],
 reviewer:'Engineering lead (pending approval)',reviewApproved:false
};
