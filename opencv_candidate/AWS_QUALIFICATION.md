# OpenCV 5 + AWS qualification — 2026-10-26 R03

The existing AWS EC2 instance executed **OpenCV 5.0.0** in an isolated Python virtual environment. No new cloud resources, public ports, paid model calls, system package changes, or owner database migration were used.

## Observed results

- Actual OpenCV 5 runtime: `opencv-python-headless==5.0.0.93`, NumPy 2.2.6; official PyPI wheel hashes and installation report preserved.
- Four existing vision tests passed on this new runtime. Prior bridge tests were not repeated for continuity.
- Synthetic calibrated drawing: 6.04 × 4.04 m outer contour; 100 pixels/metre. The nominal 6 × 4 m centreline differs because of the drawn line thickness. This is a disclosed measurement limitation.
- Missing scale requests scale; skewed fixture requests rectification; unreadable input requests a valid image.
- **New real chain:** OpenCV → guarded agent bridge → official MCP 2.3.0 Streamable HTTP server → existing Node quantity engine → independent HTTP readback.
- Real MCP initialization negotiated protocol `2025-11-25`; discovered `inspect_project`, `update_room`, `export_dossier`.
- Actual state revision 0 → 1. Floor 24.4016 m², net walls 55.8 m², paint 12.276 L, 75 tiles / 19 boxes. Ceiling remained excluded; no order placed.
- Three negative perception/review paths made **zero tool calls**. Repeating the confirmed operation returned the cached revision; exactly one audit entry persisted.
- CSV SHA256: `07e8b351784991fd025c33b0ccca577fadf52ce505114684fdc5800e76983f40`.

## Evidence

1. [AWS vision evidence ZIP](../evidence/WEXSPACE_OPENCV5_AWS_PROOF_20261026_R02.zip)
   SHA256 `b0c4270b31b86c7f29ab0607eca2ed954d15826a3296dc499f9bddf34f385ed7`.
   Drive: https://drive.google.com/file/d/1uLjdfg8VvzJOOdDoz-iNPn65TOi2-4dI/view
2. [Real MCP chain evidence ZIP](../evidence/WEXSPACE_OPENCV5_REAL_MCP_CHAIN_20261026_R03.zip)
   SHA256 `de340c55f9f6fd00d769a1a88560ae03d9675640f7802e76dac901c20a1a961f`.
   Drive: https://drive.google.com/file/d/1l8cNi9oiF-LTvxiBAciz0dPyra71IpVh/view

Both Drive uploads were read back and compared byte for byte before Git mirroring. ZIPs contain the operative source, installation metadata, input fixtures, results and receipts; no credentials or browser profiles.

## Scope and next work

This is **real AWS/OpenCV/MCP execution using synthetic input**, not a physical-room accuracy certification or a native ChatGPT image-tool invocation. The local integration server was bound to loopback and only this qualification's child processes were stopped afterwards. Existing services and owner state were preserved.

Remaining: real-image calibration/annotation and human review, hosted image-analysis integration, agent-facing image invocation, dynamic video, contest submission, and commercial Stage 1 acceptance. Global qualification gates remain false. Existing AWS capacity was reused; no new account-wide financial guarantee is inferred.

Source executed: `3086377779b5b5405a50b27fb6364df9070b8e03`. Do not rerun accepted suites merely to resume.
