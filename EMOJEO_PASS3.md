# Emojeo Pass 3 — Official Unicode Emoji Universe

Pass 3 connects Emojeo's Emoji Record model to the production Unicode Emoji 18.0 universe.

## Source of truth

- Unicode Emoji version: **18.0**
- Standard: **UTS #51 Unicode Emoji**
- Machine-readable source: `https://www.unicode.org/Public/emoji/latest/emoji-test.txt`
- Source file date declared by Unicode: **2026-04-30**
- Unicode's published Emoji 18.0 total: **3,972 RGI emoji/components**.

`emojeo-unicode-catalog.js` fetches and parses the official `emoji-test.txt` file rather than maintaining a hand-entered or inferred emoji list.

## Record policy

One Emojeo record is created for every member of the RGI set represented by `fully-qualified` or `component` rows. Minimally-qualified and unqualified spellings are retained as presentation variants of the corresponding canonical record rather than becoming duplicate subjects.

Each imported record receives:

- glyph and exact code-point sequence;
- CLDR short name supplied in the Unicode test data;
- Emoji version;
- official illustrative group and subgroup;
- Unicode/CLDR ordering position;
- qualification/sequence status;
- alternate qualification/presentation forms;
- source/version/date metadata;
- import provenance pointing to Unicode and UTS #51.

## Boundary retained

Pass 3 does **not** perform Emojeo's open-ended descriptive analysis, create a discovered vocabulary, assign weird/visual/semantic traits, create Mosaics, or infer relationships. This is the authoritative subject population only.

The catalog loader accepts an injected fetch implementation so the parser/importer is fully testable without network access. Production loading uses the official Unicode URL.
