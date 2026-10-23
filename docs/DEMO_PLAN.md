# Live demonstration plan — target 2:30, hard ceiling 3:00

Record actual application interactions, not a slideshow or fabricated tool-result animation. Show the real visible state and at least one connected-agent/WebMCP call. Cut waiting time; do not remove failures in a way that misrepresents functionality.

| Time | Visible action | Spoken meaning |
|---|---|---|
| 0:00–0:12 | Open the working room view and quantities | A student has a refurbishment assignment; a junior engineer needs a checkable quantity schedule. |
| 0:12–0:35 | Inspect actual initial inputs and explain the 55.32 m² wall formula | The quantities come from units and arithmetic, not invented model answers. |
| 0:35–1:00 | Ask a real connected browser agent to inspect, then update width to 4.5 m using the current revision | Show the tool invocation, changed drawing, 27 m² floor and 12.8304 L paint together. |
| 1:00–1:20 | A person edits height to 3.2 m; agent re-inspects | Human and agent share the same visible browser state. |
| 1:20–1:45 | Request ceiling inclusion; then try a stale revision in the real tool | Explicit instruction and predecessor checks reject both without changing the result. |
| 1:45–2:10 | Export actual CSV and JSON, inspect the formulas and operation receipt | The result can be handed to a tutor or project reviewer. Nothing has been ordered. |
| 2:10–2:30 | Briefly show the self-hosted MCP initialize/tools/call receipt on existing AWS | Distinguish the real SDK server test from the simulated Alexa-style page. State the deployment boundary. |

Suggested ordinary ChatGPT prompt when this page is open in its browser:

> Use the WEXSPACE Engineering tools on this page. Inspect the actual project first. Change width to 4.5 metres using its current revision and operation ID demo-width-20261023. Keep the ceiling excluded, do not order anything, and explain the resulting paint quantity. Then inspect again.

Suggested follow-up:

> I have changed the height myself. Re-inspect the live project before editing. Demonstrate that requesting ceiling inclusion is rejected by the tool and leaves the quantities unchanged.

Do not label native ChatGPT invocation or video publication PASS until it actually happened. Record the video URL only after public playback is verified. User participation or a genuinely supported recording path may still be necessary.
