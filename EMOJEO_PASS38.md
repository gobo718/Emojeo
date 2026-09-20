# Emojeo Pass 38 — Semantic Pilot Diagnostics

Restores truthful Genreactrix-style visibility around the existing Emojeo semantic pilot before another paid call.

- Shows current glyph/name and subject position.
- Shows only client-observable stages: Preparing, Awaiting Worker response, Validating/parsing response, Retaining result, Completed/Failed.
- Updates elapsed time while the Worker request is pending.
- Shows completed/failed/remaining counts and a determinate progress bar.
- Shows provider/model/routing only when actually returned.
- Preserves the latest completed result while later subjects run.
- Preserves the one-subject gate before the full 68-subject pilot.
- Threads the existing AbortController signal through the semantic API so STOP can abort the pending fetch.
- Expands failure output with subject, stage, elapsed time, HTTP/provider/response details when available.
- Does not change Unicode parsing/catalog data, semantic methodology, Worker deployment, or provider routing.
- Visible site identity advances from Pass 36 to Pass 38. Pass 37 remains the abandoned cache-busting proposal and is intentionally skipped.
