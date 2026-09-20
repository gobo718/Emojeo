# Emojeo Pass 17 — Design Decision Workspace

Pass 17 turns what-if analysis into a durable human decision workflow.

- Draft a proposed design change and capture its current Pass 16 impact preview.
- Add review notes and refresh the preview as the surrounding design changes.
- Move deliberately from draft to review.
- Approval or rejection requires an explicit identified human actor; machine/system actors cannot approve.
- Rejected decisions remain in history.
- An approved decision can generate an implementation plan, but approval itself does not mutate the graph or canon ledger.
- Implementation is separately confirmed by a human and retained in decision history.
- Snapshot policy makes the no-silent-mutation boundary explicit.

This is the bridge between Emojeo saying “here is the blast radius” and Billy recording “yes, this is the design decision we actually chose.”
