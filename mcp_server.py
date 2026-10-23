"""Official Python MCP SDK transport for the same bounded engineering engine.

Loopback only. This demo has no SAP credentials, procurement tool or physical controls.
"""
import json, os, urllib.request
from mcp.server import MCPServer
from mcp.types import ToolAnnotations
from mcp.server.mcpserver.exceptions import ToolError

server = MCPServer('WEXSPACE Engineering Workshop', version='0.3.0',
    instructions='Inspect the room before editing. Respect its explicit constraints. Quantities are preliminary, not engineering sign-off. Never claim an order was placed.')
BACKEND = 'http://127.0.0.1:' + str(int(os.environ.get('WEXSPACE_ENGINE_PORT','4188'))) + '/api/action'

def call_engine(action, parameters=None):
    body=json.dumps({'action':action,'parameters':parameters or {}}).encode()
    request=urllib.request.Request(BACKEND,data=body,headers={'Content-Type':'application/json'},method='POST')
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            result=json.loads(response.read(65536))
    except urllib.error.HTTPError as error:
        result=json.loads(error.read(65536))
        raise ToolError(result.get('error','ENGINE_REJECTED')+': '+result.get('message','Request rejected')) from None
    if not result.get('ok'): raise ToolError(result.get('message','Engine rejected request'))
    return result['result']

@server.tool(annotations=ToolAnnotations(readOnlyHint=True,destructiveHint=False))
def inspect_project() -> dict:
    """Inspect the actual persisted room, revision, constraints and computed quantities."""
    return call_engine('inspect')

@server.tool(annotations=ToolAnnotations(readOnlyHint=False,destructiveHint=False,idempotentHint=True))
def update_room(patch: dict, expected_revision: int, operation_id: str) -> dict:
    """Apply a bounded measurement edit using the exact inspected revision and unique operation ID."""
    return call_engine('update',{'patch':patch,'expected_revision':expected_revision,'operation_id':operation_id})

@server.tool(annotations=ToolAnnotations(readOnlyHint=True,destructiveHint=False))
def export_dossier() -> dict:
    """Return formulas, assumptions, quantities, revision evidence and a CSV. Does not order anything."""
    return call_engine('export')

if __name__ == '__main__':
    server.run(transport='streamable-http',host='127.0.0.1',port=int(os.environ.get('MCP_PORT','4189')),
        stateless_http=True,json_response=True)
