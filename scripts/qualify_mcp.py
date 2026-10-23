"""Bounded real HTTP integration on a new isolated demo workspace only."""
import hashlib,json,os,pathlib,socket,subprocess,sys,time,urllib.request,urllib.error
root=pathlib.Path(__file__).resolve().parent.parent
run=root/'.private-demo'/'qualification-20261023-r01'
resume='--resume-recovery' in sys.argv
if resume:
    previous=json.loads((run/'runtime-receipt-public.json').read_text())
    assert previous['status']=='FAILED' and len(previous['steps'])==7
    assert previous['error']['message']=='A new qualification process exited; see its private log.'
    assert json.loads((run/'backend/state.json').read_text())['revision']==1
    (run/'runtime-receipt-before-harness-repair.json').write_text(json.dumps(previous,indent=2))
else:run.mkdir(parents=True,exist_ok=False,mode=0o700)
for port in (4188,4189):
    with socket.socket() as s:s.bind(('127.0.0.1',port))
env=os.environ.copy();env.update(PORT='4188',WEXSPACE_DEMO_DATA=str(run/'backend'),MCP_PORT='4189',WEXSPACE_ENGINE_PORT='4188')
children=[];logs=[];receipt={'schema':'wexspace.engineering.real-http-qualification.v1','started_at':time.time(),'evidence_class':'REAL_HTTP_ON_EXISTING_AWS_EC2','host_boot':pathlib.Path('/proc/sys/kernel/random/boot_id').read_text().strip(),'new_cloud_resources':0,'model_calls':0,'steps':[]}
def start(command,name):
    log=(run/(name+'.log')).open('w');logs.append(log)
    p=subprocess.Popen(command,cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT);children.append(p);return p
def request(url,body=None,headers=None):
    h={'Content-Type':'application/json','Accept':'application/json, text/event-stream'};h.update(headers or {})
    r=urllib.request.Request(url,data=None if body is None else json.dumps(body).encode(),headers=h)
    with urllib.request.urlopen(r,timeout=15) as response:
        data=response.read(131072).decode()
        if data.startswith('event:') or data.startswith('data:'):
            data='\n'.join(x[6:] for x in data.splitlines() if x.startswith('data: '))
        return response.status,json.loads(data)
def rpc(method,params=None):
    return request('http://127.0.0.1:4189/mcp',{'jsonrpc':'2.0','id':len(receipt['steps'])+1,'method':method,'params':params or {}})[1]
def tool(name,args=None):
    value=rpc('tools/call',{'name':name,'arguments':args or {}})['result']
    if value.get('isError'):return value
    return value.get('structuredContent') or json.loads(next(x['text'] for x in value['content'] if x['type']=='text'))
def wait_for(url):
    for _ in range(80):
        try:return request(url)
        except Exception:
            if children[-1].poll() is not None:raise RuntimeError('A new qualification process exited; see its private log.')
            time.sleep(.1)
    raise RuntimeError('Bounded startup timeout')
try:
    node=start(['node','server.mjs'],'backend');wait_for('http://127.0.0.1:4188/health')
    mcp=start([sys.executable,'mcp_server.py'],'mcp')
    for _ in range(80):
        try:
            init=rpc('initialize',{'protocolVersion':'2026-07-28','capabilities':{},'clientInfo':{'name':'wexspace-real-http-qualification','version':'1'}});break
        except Exception:
            if mcp.poll() is not None:raise RuntimeError('MCP process exited; inspect the new isolated log.')
            time.sleep(.1)
    else:raise RuntimeError('MCP initialization did not become ready')
    assert init['result']['protocolVersion'] in ('2026-07-28','2025-11-25')
    receipt['steps'].append({'initialize':init['result']})
    discovered=rpc('tools/list')['result']['tools'];assert {x['name'] for x in discovered}=={'inspect_project','update_room','export_dossier'}
    receipt['steps'].append({'tools':[{'name':x['name'],'annotations':x.get('annotations')} for x in discovered]})
    if resume:
        receipt['predecessor_status']='FAILED_HARNESS_AFTER_SEVEN_SUCCESSFUL_RUNTIME_STEPS'
        receipt['predecessor_sha256']=hashlib.sha256((run/'runtime-receipt-before-harness-repair.json').read_bytes()).hexdigest()
        receipt['steps']=previous['steps']
        recovered=tool('inspect_project');assert recovered['revision']==1 and recovered['room']['width']==4.5
        args={'patch':{'width':4.5},'expected_revision':0,'operation_id':'aws-real-mcp-width-20261023'}
        replay=tool('update_room',args);assert replay['cached'] and replay['revision']==1
        denied=tool('update_room',{'patch':{'includeCeiling':True},'expected_revision':1,'operation_id':'aws-real-mcp-ceiling-20261023-r02'})
        assert denied.get('isError') is True and 'REQUIREMENT_CONFLICT' in json.dumps(denied)
        receipt['steps'].append({'fresh_process_recovery':{'revision':1,'width':4.5,'audit_entries':len(recovered['audit'])},'cached_replay_after_restart':True,'typed_constraint_error':denied})
        receipt['status']='PASS_SCOPED_REAL_HTTP_NOT_NATIVE_CHATGPT'
        raise SystemExit(0)
    before=tool('inspect_project');assert before['revision']==0 and before['quantities']['floor_m2']==24
    receipt['steps'].append({'initial_read':before})
    args={'patch':{'width':4.5},'expected_revision':0,'operation_id':'aws-real-mcp-width-20261023'}
    changed=tool('update_room',args);assert changed['revision']==1 and changed['quantities']['floor_m2']==27
    independent=request('http://127.0.0.1:4188/api/action',{'action':'inspect'})[1]['result'];assert independent['room']['width']==4.5 and independent['revision']==1
    receipt['steps'].append({'actual_mutation':changed,'independent_backend_readback':independent})
    repeated=tool('update_room',args);assert repeated['cached'] and repeated['revision']==1
    receipt['steps'].append({'same_operation_replay':{'cached':True,'revision':1}})
    denied=tool('update_room',{'patch':{'includeCeiling':True},'expected_revision':1,'operation_id':'aws-real-mcp-ceiling-20261023'});assert denied.get('isError') is True
    stale=tool('update_room',{'patch':{'width':8},'expected_revision':0,'operation_id':'aws-real-mcp-stale-20261023'});assert stale.get('isError') is True
    after=tool('inspect_project');assert after['revision']==1 and after['room']['width']==4.5 and not after['room']['includeCeiling']
    receipt['steps'].append({'constraint_rejected':True,'stale_revision_rejected':True,'after_negative_checks':after})
    exported=tool('export_dossier');assert '12.8304' in exported['csv']
    receipt['steps'].append({'export_sha256':hashlib.sha256(exported['csv'].encode()).hexdigest()})
    node.terminate();node.wait(timeout=10);node=start(['node','server.mjs'],'backend-recovered');wait_for('http://127.0.0.1:4188/health')
    recovered=tool('inspect_project');assert recovered['revision']==1 and recovered['room']['width']==4.5
    receipt['steps'].append({'new_process_recovery':{'revision':1,'width':4.5,'audit_entries':len(recovered['audit'])}})
    receipt['status']='PASS_SCOPED_REAL_HTTP_NOT_NATIVE_CHATGPT'
except Exception as e:
    receipt['status']='FAILED';receipt['error']={'type':type(e).__name__,'message':str(e)[:700]}
finally:
    receipt['finished_at']=time.time()
    for p in reversed(children):
        if p.poll() is None:p.terminate()
    for p in children:
        try:p.wait(timeout=10)
        except subprocess.TimeoutExpired:receipt.setdefault('cleanup_pending_pids',[]).append(p.pid)
    for l in logs:l.close()
    path=run/'runtime-receipt-public.json';path.write_text(json.dumps(receipt,indent=2));print(json.dumps({'receipt':str(path),'status':receipt['status'],'error':receipt.get('error'),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'steps':len(receipt['steps'])}))
    if receipt['status']=='FAILED':
        for name in ('backend.log','mcp.log'):print(name,(run/name).read_text()[-2500:])
sys.exit(0 if receipt['status'].startswith('PASS') else 1)
