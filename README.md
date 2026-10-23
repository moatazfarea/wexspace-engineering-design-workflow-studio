# WEXSPACE Engineering Design, Workflow & Studio

**A student measures a room. A person or an agent changes the brief. The drawing, quantities and revision evidence change together.**

This is one bounded exercise inside WEXSPACE's wider concept-to-build workflow, not a replacement definition of the entire WEXSPACE product.

## Run the visible application

Requires Node.js 22 or newer. No npm packages, API key, model inference or paid subscription are required.

```sh
node server.mjs
# Open http://127.0.0.1:4188/
node --test tests/*.test.mjs
```

The visible page is also a fully static application in `dist/`. Its workspace is saved **in that browser**, not in a claimed cloud account. Export JSON and CSV to preserve or independently review it. When a WebMCP-capable browser is available, three real tools operate that same visible browser state.

## A 60-second judge path

1. Inspect the baseline: 6 × 4 × 3 m, openings 4.68 m², ceiling excluded, two coats, 10 m²/L coverage, 10% waste.
2. Confirm floor **24 m²**, net walls **55.32 m²**, paint **12.1704 L**, three 5 L packs, and 74 tiles / 19 boxes of four.
3. Ask the guided simulator: `Change width to 4.5 m and keep the ceiling off.` The room becomes 27 m² and paint 12.8304 L. The view and audit history update.
4. Make a direct human edit, then let the connected browser agent inspect the new revision before editing again.
5. Request `Include the ceiling.` The explicit project requirement rejects it. No partial edit, purchase or physical authorization occurs.
6. Export the actual quantity schedule and dossier. The arithmetic and assumptions are included.

The in-page guided input is a disclosed bounded command parser, **not a claim of live Alexa access or an LLM**. It is an allowed simulated Alexa-style experience under the hackathon rules. A real connected ChatGPT/browser agent can independently use the typed WebMCP actions.

## Self-hosted Streamable HTTP MCP

The additional Python transport imports and actually runs the official MCP SDK. It forwards bounded tools to the same JavaScript calculation/revision engine over a loopback-only API. The server workspace is separate from the static page's browser-local workspace; it is not falsely presented as synchronized cloud persistence.

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
# Terminal 1
PORT=4188 node server.mjs
# Terminal 2
WEXSPACE_ENGINE_PORT=4188 MCP_PORT=4189 .venv/bin/python mcp_server.py
# MCP URL: http://127.0.0.1:4189/mcp
```

The pinned official SDK is `mcp==2.3.0`, using its `MCPServer` API. Current protocol support is verified by the integration receipt, not inferred merely from the import. Before connecting a remote customer, supply authenticated HTTPS, per-user isolation and an appropriately admitted deployment. This local demonstration endpoint is not exposed publicly and carries no production credentials.

Tools: `inspect_project`, `update_room`, `export_dossier`. No shell, SAP, purchase, repository deletion or physical-control tool exists.

## Useful controls enforced in code

- Positive bounded dimensions, finite numbers and explicit units.
- Openings cannot exceed gross wall area.
- Coverage, coats, waste and pack sizes remain visible assumptions.
- Exact predecessor revision prevents a stale agent overwriting a human edit.
- Operation IDs bind their arguments; retrying a successful request does not create another revision.
- The explicit no-ceiling requirement cannot be overruled by a prompt.
- No purchase tool; preliminary calculations never become engineering sign-off.
- Private server demo state is excluded from Git; the browser page stores no credentials.

## AWS and prior WEXSPACE work

The existing owner-authorized AWS EC2 environment is reused for actual bounded runtime and transport qualification. No extra VM or model call is needed. Receipts distinguish actual SDK/HTTP runtime tests from isolated unit tests. Mere source preparation is never called an AWS model-inference pass.

The previous WEXSPACE engineering starter's generic dossier engine (`core.mjs`) and its tests remain intact. The measured-room engine, shared visual workspace, WebMCP actions, finite guided interaction, Streamable HTTP transport, predecessor/replay checks and demo material were added on October 23, 2026. Source is independent of competitors' implementations. Public winner repositories were reviewed for product and evidence lessons; their code was not copied.

## Scope

This is preliminary learning and quantity planning. It does not certify building-code compliance, structural safety, quotations, actual construction, procurement, SAP activity or industrial maintenance. The diagram is conceptual. Manufacturer coverage and on-site dimensions require independent checking.

MIT license applies to the public implementation. No employer data, private WEXSPACE database, provider credentials or original account sessions are included.

## Private hosted MCP calculation tools

The Sites-hosted Worker also exposes authenticated, stateless `calculate_room_quantities`, `compare_room_revision` and `export_room_schedule` tools. These compute from supplied measurements and return actual formulas plus a link to open the measured-room view. A proposed revision is explicitly distinguished from a browser-state write. The hosted tools do not have employer-system access or purchase authority. Site-managed access is separate from the loopback AWS test server.

## Observed runtime evidence

`evidence/runtime-receipt-public.json` records real official-SDK Streamable HTTP initialization (negotiated `2025-11-25`), three tools, an actual persisted room edit, independent HTTP readback, replay protection, negative constraints and fresh-process recovery on the existing EC2 host. An initial harness defect incorrectly treated an intentionally retired test process as a failed live dependency; its exact predecessor receipt is retained. The repair resumed from the already verified revision instead of duplicating the edit. The HTTP-only preview's missing secure-context UUID API was also corrected without disabling browser protections, and the SHA256 fallback was checked against independent Node vectors.
