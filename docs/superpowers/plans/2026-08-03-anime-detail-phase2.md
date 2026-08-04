# Anime Detail Page — Phase 2 (Relations, Characters, Staff) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three mock-data sections — Relations, Characters, Staff — to the Anime Detail page's main content column, below the existing header, with zero network requests.

**Architecture:** A shared `DetailSection` wrapper renders a consistent heading and hides itself when given no content. Three new leaf components (`DetailRelations`, `DetailCharacters`, `DetailStaff`) each own their own null/empty-checks, sorting/slicing, and card rendering, then wrap their grid in `DetailSection`. The existing fixture gains three new top-level keys shaped exactly like AniList's edge-list responses. `Detail.jsx` renders the three new components after `DetailHeader`, passing the corresponding fixture slices directly.

**Tech Stack:** React 19 (Vite), react-router-dom v7 (`Link`, already used elsewhere — see `src/components/Trending.jsx:1,229-238`), plain CSS with existing custom properties. No new dependencies.

## Global Constraints

- No new npm dependencies (`package.json` is off-limits).
- No edits to `tokens.css`'s custom properties (i.e. the `:root` block in `src/index.css`) — use only existing tokens: `--color-bg`, `--color-surface`, `--color-accent-cyan`, `--color-accent-pink`, `--color-text`, `--color-text-muted`, `--color-text-subtle`, `--font-heading`, `--font-body`, `--fs-*`, `--space-*`, `--radius-*`, `--shadow-*`.
- No edits to `src/api/anilist.js` or any query/fetch file. Zero network requests in this phase.
- Do not touch `DetailBanner.jsx`, `DetailSidebar.jsx`, `DetailTags.jsx`, `DetailHeader.jsx` — leave them byte-for-byte as Phase 1 left them.
- `src/components/styles/Detail.css`: append only. Never edit or reorder the 217 existing lines from Phase 1.
- No new routes. The router (`src/main.jsx`) is not touched in this phase.
- Every new CSS class carries one of exactly these prefixes: `detail-sec-`, `detail-rel-`, `detail-char-`, `detail-staff-`. No generic names (`.card`, `.row`, `.grid`, `.title`). The only Phase 1 class new components may reference is the page-level `.detail-grid`/`.detail-page`/`.detail-main` container set — none of the new components actually need to, since `Detail.jsx` already wraps them in `.detail-main`.
- No hardcoded hex colors in CSS — only `var(--...)` tokens, except literal `rgba()` for ambient glow/gradient overlays (matches existing project convention, e.g. `AnimeCard.css`, `Detail.css`'s banner fade). This phase's cards use flat token colors, not gradients, so no new rgba literals are expected.
- Card surfaces use `var(--color-surface)` (visibly lighter than `var(--color-bg)` page background) per spec 7.4.
- Only clickable relation cards get a hover state — a border or background-color shift only, no transform/scale/shadow.
- Project has no component test framework — this phase explicitly excludes tests. Verification is `npm run lint`, `npm run build`, and a manual acceptance pass (Task 7) using the Playwright MCP browser tools now available in this session (`mcp__plugin_playwright_playwright__browser_navigate`, `_snapshot`, `_click`, `_resize`, `_console_messages`, `_take_screenshot`, etc.) against the Vite dev server.

## Design Decisions (for the self-review / for whoever reads this later)

- **`DetailSection`'s heading font size:** spec 2.2 says "small" but "larger than the sidebar stat labels" (`--fs-small`, 0.875rem). The only tokens between `--fs-small` and the much-larger `--fs-h2` (clamp 1.5–2.1rem, used for full section headings elsewhere in the app) are `--fs-body` (1rem) and `--fs-body-lg` (clamp 1–1.35rem). `--fs-body-lg` is used: bigger than the stat label, still modest, doesn't compete with `DetailHeader`'s `--fs-h1` title above it.
- **`DetailSection`'s heading color:** stat labels are muted grey (`--color-text-muted`), but a section heading is a bigger structural landmark, not a label — using full `--color-text` reads as an actual heading rather than metadata. Letter-spacing and uppercase are kept to echo the stat-label *style*, per spec.
- **Title-case helper reused three times (`DetailRelations`, `DetailCharacters`):** each component defines its own local `toTitleCase`/`formatTitleCase` — matching Phase 1's convention where `DetailSidebar` and `DetailHeader` each had their own small local helpers rather than a shared utils file. Small, deliberate duplication over a premature shared module (YAGNI, matches established codebase pattern).
- **Placeholder color for missing character/staff/relation images:** spec explicitly says "a surface token" for the fallback (3.7, 4.8, 5.5), and cards themselves use `var(--color-surface)` as their background (7.4). Both point at the same single surface token in `tokens.css` — there's only one. The placeholder will therefore visually blend with its card background; that's a literal, spec-compliant reading, not a bug. (Relations' placeholder prefers `node.coverImage.color` first, per 3.7, so it only blends in the pure-fallback case.)

---

## File Structure

- `src/Detailpg/detailFixture.js` — **modify**: append `relations`, `characters`, `staff` keys to the existing default-exported object. Nothing else in the file changes.
- `src/Detailpg/components/DetailSection.jsx` — **create**: shared heading+visibility wrapper, props `{ title, children }`.
- `src/Detailpg/components/DetailRelations.jsx` — **create**: props `{ relations }`, filters/renders relation cards inside `DetailSection`.
- `src/Detailpg/components/DetailCharacters.jsx` — **create**: props `{ characters }`, sorts/slices/renders character cards inside `DetailSection`.
- `src/Detailpg/components/DetailStaff.jsx` — **create**: props `{ staff }`, slices/renders staff cards inside `DetailSection`.
- `src/Detailpg/Detail.jsx` — **modify**: import and render the three new components after `DetailHeader`, inside the existing `.detail-main` div.
- `src/components/styles/Detail.css` — **modify**: append four new sections (`detail-sec-`, `detail-rel-`, `detail-char-`, `detail-staff-`) after the existing 217 lines.

---

## Task 1: Extend the fixture

**Files:**
- Modify: `src/Detailpg/detailFixture.js`

**Interfaces:**
- Produces: `detailFixture.relations` (`{ edges: [...] }`), `detailFixture.characters` (`{ edges: [...] }`), `detailFixture.staff` (`{ edges: [...] }`) — exact shapes below. Every later task's component reads these fields directly; the field names and nesting are load-bearing.

- [ ] **Step 1: Read the current file to get the exact insertion point**

The file currently ends with:

```js
  tags: [
    ...
  ],
};

export default detailFixture;
```

Insert the three new keys **after** the `tags: [...]` array's closing `],` and **before** the final `};`, so the object still has a single closing brace and `export default detailFixture;` stays last.

- [ ] **Step 2: Add the three keys**

```js
  relations: {
    edges: [
      {
        id: 1,
        relationType: "SEQUEL",
        node: {
          id: 30001,
          type: "ANIME",
          format: "TV",
          status: "RELEASING",
          title: {
            romaji: "Ao Haru Ride 2",
            english: "Blue Spring Ride 2",
            native: "アオハライド2",
          },
          coverImage: { large: "https://placehold.co/100x140", color: "#4a6fa5" },
          isAdult: false,
        },
      },
      {
        id: 2,
        relationType: "PREQUEL",
        node: {
          id: 30002,
          type: "ANIME",
          format: "ONA",
          status: "FINISHED",
          title: {
            romaji: "Ao Haru Ride: Prologue",
            english: null,
            native: "アオハライド:プロローグ",
          },
          coverImage: { large: "https://placehold.co/100x140", color: "#5a7fb5" },
          isAdult: false,
        },
      },
      {
        id: 3,
        relationType: "ADAPTATION",
        node: {
          id: 30003,
          type: "MANGA",
          format: "MANGA",
          status: "FINISHED",
          title: {
            romaji: "Ao Haru Ride",
            english: "Blue Spring Ride",
            native: "アオハライド",
          },
          coverImage: { large: "https://placehold.co/100x140", color: "#6a8fc5" },
          isAdult: false,
        },
      },
      {
        id: 4,
        relationType: "SIDE_STORY",
        node: {
          id: 30004,
          type: "MANGA",
          format: "ONE_SHOT",
          status: "FINISHED",
          title: {
            romaji: "Ao Haru Ride: Side Story",
            english: "Blue Spring Ride: Side Story",
            native: null,
          },
          coverImage: { large: null, color: "#7a9fd5" },
          isAdult: false,
        },
      },
      {
        id: 5,
        relationType: "ALTERNATIVE",
        node: {
          id: 30005,
          type: "ANIME",
          format: "MOVIE",
          status: "NOT_YET_RELEASED",
          title: {
            romaji: "Ao Haru Ride Movie",
            english: "Blue Spring Ride the Movie",
            native: "アオハライド 劇場版",
          },
          coverImage: { large: "https://placehold.co/100x140", color: "#8aafe5" },
          isAdult: false,
        },
      },
      {
        id: 6,
        relationType: "OTHER",
        node: {
          id: 30006,
          type: "ANIME",
          format: "OVA",
          status: "FINISHED",
          title: {
            romaji: "Restricted Title",
            english: "Restricted Title EN",
            native: null,
          },
          coverImage: { large: "https://placehold.co/100x140", color: "#333333" },
          isAdult: true,
        },
      },
    ],
  },
  characters: {
    edges: [
      {
        id: 1,
        role: "SUPPORTING",
        node: {
          id: 40001,
          name: { full: "Shuko Murao", native: "村緒 修子" },
          image: { large: "https://placehold.co/100x140" },
        },
        voiceActors: [
          {
            id: 50001,
            name: { full: "Ayane Sakura" },
            languageV2: "Japanese",
            image: { large: "https://placehold.co/100x100" },
          },
        ],
      },
      {
        id: 2,
        role: "MAIN",
        node: {
          id: 40002,
          name: { full: "Futaba Yoshioka", native: "吉岡 双葉" },
          image: { large: "https://placehold.co/100x140" },
        },
        voiceActors: [
          {
            id: 50002,
            name: { full: "Marina Inoue" },
            languageV2: "Japanese",
            image: { large: "https://placehold.co/100x100" },
          },
        ],
      },
      {
        id: 3,
        role: "MAIN",
        node: {
          id: 40003,
          name: { full: "Kou Mabuchi", native: "馬渕 洸" },
          image: { large: null },
        },
        voiceActors: [
          {
            id: 50003,
            name: { full: "Yoshimasa Hosoya" },
            languageV2: "Japanese",
            image: { large: "https://placehold.co/100x100" },
          },
        ],
      },
      {
        id: 4,
        role: "SUPPORTING",
        node: {
          id: 40004,
          name: { full: "Toma Kominato", native: "小湊 冬麻" },
          image: { large: "https://placehold.co/100x140" },
        },
        voiceActors: [
          {
            id: 50004,
            name: { full: "Yuki Kaji" },
            languageV2: "Japanese",
            image: { large: "https://placehold.co/100x100" },
          },
        ],
      },
      {
        id: 5,
        role: "SUPPORTING",
        node: {
          id: 40005,
          name: { full: "Yamato Kominato", native: "小湊 大和" },
          image: { large: "https://placehold.co/100x140" },
        },
        voiceActors: [],
      },
      {
        id: 6,
        role: "BACKGROUND",
        node: {
          id: 40006,
          name: { full: "Homeroom Teacher", native: null },
          image: { large: "https://placehold.co/100x140" },
        },
        voiceActors: [
          {
            id: 50005,
            name: { full: "Unshou Ishizuka" },
            languageV2: "Japanese",
            image: { large: "https://placehold.co/100x100" },
          },
        ],
      },
      {
        id: 7,
        role: "MAIN",
        node: {
          id: 40007,
          name: { full: "Narumi Kominato", native: "小湊 楠海" },
          image: { large: "https://placehold.co/100x140" },
        },
        voiceActors: [
          {
            id: 50006,
            name: { full: "Erica Mendez" },
            languageV2: "English",
            image: { large: "https://placehold.co/100x100" },
          },
        ],
      },
      {
        id: 8,
        role: "BACKGROUND",
        node: {
          id: 40008,
          name: { full: "Classmate A", native: null },
          image: { large: "https://placehold.co/100x140" },
        },
        voiceActors: [
          {
            id: 50007,
            name: { full: "Unnamed VA" },
            languageV2: "Japanese",
            image: { large: null },
          },
        ],
      },
    ],
  },
  staff: {
    edges: [
      {
        id: 1,
        role: "Original Creator",
        node: { id: 60001, name: { full: "Io Sakisaka" }, image: { large: "https://placehold.co/100x140" } },
      },
      {
        id: 2,
        role: "Director",
        node: { id: 60002, name: { full: "Yasuhiro Kimura" }, image: { large: null } },
      },
      {
        id: 3,
        role: "Character Design",
        node: { id: 60002, name: { full: "Yasuhiro Kimura" }, image: { large: null } },
      },
      {
        id: 4,
        role: "Series Composition",
        node: { id: 60003, name: { full: "Aya Takaha" }, image: { large: "https://placehold.co/100x140" } },
      },
      {
        id: 5,
        role: "Music",
        node: { id: 60004, name: { full: "Masaru Yokoyama" }, image: { large: "https://placehold.co/100x140" } },
      },
      {
        id: 6,
        role: "Sound Director",
        node: { id: 60005, name: { full: "Yota Tsuruoka" }, image: { large: "https://placehold.co/100x140" } },
      },
    ],
  },
```

This fixture data gives:
- **Relations:** 6 edges (≥5 ✓). One with `node.type: "MANGA"` — actually two, ids 3 and 4 (✓). One with `title.english: null` — id 2 (✓). One with `isAdult: true` — id 6, which must be filtered out (✓). One with `coverImage.large: null` — id 4, exercises the placeholder (bonus).
- **Characters:** 8 edges (≥7 ✓). First array entry (id 1) is `SUPPORTING`, not pre-sorted (✓). Role mix: MAIN × 3 (ids 2,3,7), SUPPORTING × 3 (ids 1,4,5), BACKGROUND × 2 (ids 6,8). One with `voiceActors: []` — id 5 (✓). One with `node.image.large: null` — id 3 (✓). One VA with `languageV2: "English"` — id 7's VA (✓). After stable-sort-by-role and slicing to 6, the visible set is ids `[2,3,7,1,4,5]` in that order — the originally-first `SUPPORTING` entry (id 1) lands at position 4, after all three `MAIN` entries, and both id 5 (empty VA) and id 3 (null character image) remain visible in the sliced 6, so every fixture edge case built in is actually on screen for the acceptance pass.
- **Staff:** 6 edges (≥5 ✓). Ids 2 and 3 share `node.id: 60002` ("Yasuhiro Kimura") with different `role` values ("Director" vs "Character Design") and different edge `id`s (✓) — both are within the first-4 slice, so the duplicate-node-id case is actually visible and testable, not just present in unused data. Both also have `node.image.large: null` (✓, satisfies "at least one").

- [ ] **Step 3: Verify it's valid JS**

Run: `node -e "const f = await import('./src/Detailpg/detailFixture.js'); console.log(f.default.relations.edges.length, f.default.characters.edges.length, f.default.staff.edges.length)"` from the project root.
Expected: prints `6 8 6` with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/Detailpg/detailFixture.js
git commit -m "feat: extend Detail fixture with relations, characters, and staff"
```

---

## Task 2: DetailSection (shared wrapper)

**Files:**
- Create: `src/Detailpg/components/DetailSection.jsx`
- Create the new CSS section in `src/components/styles/Detail.css` (append after the existing 217 lines; later tasks append further sections after this one)

**Interfaces:**
- Consumes: none.
- Produces: default export `DetailSection`, props `{ title, children }`. Consumed by `DetailRelations`, `DetailCharacters`, `DetailStaff` (Tasks 3–5) as `<DetailSection title="...">{...grid...}</DetailSection>`.

- [ ] **Step 1: Write the component**

```jsx
const isEmptyChildren = (children) => {
  if (children === null || children === undefined || children === false) {
    return true;
  }

  if (Array.isArray(children)) {
    return children.length === 0;
  }

  return false;
};

const DetailSection = ({ title, children }) => {
  if (isEmptyChildren(children)) {
    return null;
  }

  return (
    <section className="detail-sec">
      <h2 className="detail-sec-heading">{title}</h2>
      {children}
    </section>
  );
};

export default DetailSection;
```

- [ ] **Step 2: Append the section-wrapper CSS to Detail.css**

Append after the file's existing last line (currently line 217, the closing `}` of the `@media (max-width: 900px) { .detail-grid { ... } }` block):

```css

.detail-sec {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.detail-sec-heading {
  margin: 0;
  font-family: var(--font-heading);
  font-size: var(--fs-body-lg);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text);
}
```

- [ ] **Step 3: Verify with lint**

Run: `npm run lint`
Expected: no errors in `DetailSection.jsx`. (It isn't imported anywhere yet — that's expected until Task 3.)

- [ ] **Step 4: Commit**

```bash
git add src/Detailpg/components/DetailSection.jsx src/components/styles/Detail.css
git commit -m "feat: add shared DetailSection wrapper for Detail page sections"
```

---

## Task 3: DetailRelations

**Files:**
- Create: `src/Detailpg/components/DetailRelations.jsx`
- Modify: `src/components/styles/Detail.css` (append relations section)

**Interfaces:**
- Consumes: `DetailSection` default export from Task 2 (`./DetailSection`), props `{ title, children }`. `Link` from `react-router-dom` (already a project dependency — see `src/components/Trending.jsx:1`).
- Produces: default export `DetailRelations`, props `{ relations }` where `relations` matches `detailFixture.relations`'s shape from Task 1 (`{ edges: [{ id, relationType, node: { id, type, format, status, title, coverImage, isAdult } }] }`) or is `null`/`undefined`. Consumed by `Detail.jsx` in Task 6 as `<DetailRelations relations={media.relations} />`.

- [ ] **Step 1: Write the component**

```jsx
import { Link } from "react-router-dom";
import DetailSection from "./DetailSection";

const formatTitleCase = (value) =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const getRelationTitle = (node) => node.title?.english || node.title?.romaji || node.title?.native || "";

const getMetaLine = (node) => {
  const parts = [
    node.format ? formatTitleCase(node.format) : null,
    node.status ? formatTitleCase(node.status) : null,
  ].filter(Boolean);

  return parts.join(" · ");
};

const RelationCardContent = ({ edge, metaLine }) => {
  const { node } = edge;
  const coverSrc = node.coverImage?.large || "";

  return (
    <>
      {coverSrc ? (
        <img className="detail-rel-thumb" src={coverSrc} alt="" />
      ) : (
        <div
          className="detail-rel-thumb detail-rel-thumb-placeholder"
          style={{ backgroundColor: node.coverImage?.color || "var(--color-surface)" }}
          aria-hidden="true"
        />
      )}
      <div className="detail-rel-info">
        <span className="detail-rel-type">{formatTitleCase(edge.relationType)}</span>
        <span className="detail-rel-title">{getRelationTitle(node)}</span>
        {metaLine && <span className="detail-rel-meta">{metaLine}</span>}
      </div>
    </>
  );
};

const RelationCard = ({ edge }) => {
  const { node } = edge;
  const metaLine = getMetaLine(node);

  if (node.type === "ANIME") {
    return (
      <Link to={`/anime/${node.id}`} className="detail-rel-card detail-rel-card-link">
        <RelationCardContent edge={edge} metaLine={metaLine} />
      </Link>
    );
  }

  return (
    <div className="detail-rel-card">
      <RelationCardContent edge={edge} metaLine={metaLine} />
    </div>
  );
};

const DetailRelations = ({ relations }) => {
  const edges = (relations?.edges ?? []).filter((edge) => !edge.node.isAdult);

  if (edges.length === 0) {
    return null;
  }

  return (
    <DetailSection title="Relations">
      <div className="detail-rel-grid">
        {edges.map((edge) => (
          <RelationCard key={edge.id} edge={edge} />
        ))}
      </div>
    </DetailSection>
  );
};

export default DetailRelations;
```

- [ ] **Step 2: Append the relations CSS section to Detail.css**

```css

.detail-rel-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.detail-rel-card {
  display: flex;
  align-items: stretch;
  height: 96px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid transparent;
  color: inherit;
  text-decoration: none;
}

.detail-rel-card-link {
  cursor: pointer;
  transition: border-color 160ms ease;
}

.detail-rel-card-link:hover {
  border-color: var(--color-accent-cyan);
}

.detail-rel-thumb {
  width: 64px;
  height: 100%;
  object-fit: cover;
  flex-shrink: 0;
  display: block;
}

.detail-rel-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  min-width: 0;
  overflow: hidden;
}

.detail-rel-type {
  font-family: var(--font-body);
  font-size: var(--fs-small);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-accent-pink);
}

.detail-rel-title {
  font-family: var(--font-body);
  color: var(--color-text);
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.detail-rel-meta {
  font-family: var(--font-body);
  font-size: var(--fs-small);
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 900px) {
  .detail-rel-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Verify with lint**

Run: `npm run lint`
Expected: no errors in `DetailRelations.jsx`.

- [ ] **Step 4: Commit**

```bash
git add src/Detailpg/components/DetailRelations.jsx src/components/styles/Detail.css
git commit -m "feat: add Detail page relations section"
```

---

## Task 4: DetailCharacters

**Files:**
- Create: `src/Detailpg/components/DetailCharacters.jsx`
- Modify: `src/components/styles/Detail.css` (append characters section)

**Interfaces:**
- Consumes: `DetailSection` default export from Task 2.
- Produces: default export `DetailCharacters`, props `{ characters }` where `characters` matches `detailFixture.characters`'s shape from Task 1 (`{ edges: [{ id, role, node: { id, name, image }, voiceActors: [{ id, name, languageV2, image }] }] }`) or is `null`/`undefined`. Consumed by `Detail.jsx` in Task 6 as `<DetailCharacters characters={media.characters} />`.

- [ ] **Step 1: Write the component**

```jsx
import DetailSection from "./DetailSection";

const toTitleCase = (value) =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const ROLE_PRIORITY = { MAIN: 0, SUPPORTING: 1, BACKGROUND: 2 };
const MAX_CHARACTERS = 6;

const getRolePriority = (role) => (role in ROLE_PRIORITY ? ROLE_PRIORITY[role] : 3);

const CharacterCard = ({ edge }) => {
  const { node, voiceActors } = edge;
  const characterImage = node.image?.large || "";
  const va = voiceActors && voiceActors.length > 0 ? voiceActors[0] : null;
  const vaImage = va?.image?.large || "";

  return (
    <div className="detail-char-card">
      <div className="detail-char-side detail-char-side-left">
        {characterImage ? (
          <img className="detail-char-image" src={characterImage} alt="" />
        ) : (
          <div className="detail-char-image detail-char-image-placeholder" aria-hidden="true" />
        )}
        <div className="detail-char-info">
          <span className="detail-char-name">{node.name?.full}</span>
          <span className="detail-char-role">{toTitleCase(edge.role)}</span>
        </div>
      </div>

      <div className="detail-char-side detail-char-side-right">
        {va && (
          <>
            <div className="detail-char-va-info">
              <span className="detail-char-va-name">{va.name?.full}</span>
              <span className="detail-char-va-lang">{va.languageV2?.toUpperCase()}</span>
            </div>
            {vaImage ? (
              <img className="detail-char-image" src={vaImage} alt="" />
            ) : (
              <div className="detail-char-image detail-char-image-placeholder" aria-hidden="true" />
            )}
          </>
        )}
      </div>
    </div>
  );
};

const DetailCharacters = ({ characters }) => {
  const edges = characters?.edges ?? [];

  if (edges.length === 0) {
    return null;
  }

  const sortedEdges = [...edges]
    .sort((a, b) => getRolePriority(a.role) - getRolePriority(b.role))
    .slice(0, MAX_CHARACTERS);

  return (
    <DetailSection title="Characters">
      <div className="detail-char-grid">
        {sortedEdges.map((edge) => (
          <CharacterCard key={edge.id} edge={edge} />
        ))}
      </div>
    </DetailSection>
  );
};

export default DetailCharacters;
```

Note on the sort: `Array.prototype.sort` has been stability-guaranteed by the ECMAScript spec since ES2019, and both Node.js and V8 (this project's Vite/browser target) implement it as stable — sorting only by `getRolePriority` therefore preserves each group's original relative order, satisfying "preserve original relative order within each group (stable sort)" without needing a manual index-based tiebreak. `[...edges]` copies before sorting, so the caller's array is never mutated.

- [ ] **Step 2: Append the characters CSS section to Detail.css**

```css

.detail-char-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.detail-char-card {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  height: 88px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.detail-char-side {
  display: flex;
  align-items: stretch;
  min-width: 0;
  flex: 1;
}

.detail-char-side-right {
  justify-content: flex-end;
}

.detail-char-image {
  width: 56px;
  height: 100%;
  object-fit: cover;
  flex-shrink: 0;
  display: block;
}

.detail-char-image-placeholder {
  background: var(--color-surface);
}

.detail-char-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  min-width: 0;
  overflow: hidden;
}

.detail-char-name {
  font-family: var(--font-body);
  color: var(--color-text);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-char-role {
  font-family: var(--font-body);
  font-size: var(--fs-small);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.detail-char-va-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  text-align: right;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  min-width: 0;
  overflow: hidden;
}

.detail-char-va-name {
  font-family: var(--font-body);
  color: var(--color-text);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-char-va-lang {
  font-family: var(--font-body);
  font-size: var(--fs-small);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

@media (max-width: 900px) {
  .detail-char-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Verify with lint**

Run: `npm run lint`
Expected: no errors in `DetailCharacters.jsx`.

- [ ] **Step 4: Commit**

```bash
git add src/Detailpg/components/DetailCharacters.jsx src/components/styles/Detail.css
git commit -m "feat: add Detail page characters section"
```

---

## Task 5: DetailStaff

**Files:**
- Create: `src/Detailpg/components/DetailStaff.jsx`
- Modify: `src/components/styles/Detail.css` (append staff section)

**Interfaces:**
- Consumes: `DetailSection` default export from Task 2.
- Produces: default export `DetailStaff`, props `{ staff }` where `staff` matches `detailFixture.staff`'s shape from Task 1 (`{ edges: [{ id, role, node: { id, name, image } }] }`) or is `null`/`undefined`. Consumed by `Detail.jsx` in Task 6 as `<DetailStaff staff={media.staff} />`.

- [ ] **Step 1: Write the component**

```jsx
import DetailSection from "./DetailSection";

const MAX_STAFF = 4;

const StaffCard = ({ edge }) => {
  const { node, role } = edge;
  const image = node.image?.large || "";

  return (
    <div className="detail-staff-card">
      {image ? (
        <img className="detail-staff-image" src={image} alt="" />
      ) : (
        <div className="detail-staff-image detail-staff-image-placeholder" aria-hidden="true" />
      )}
      <div className="detail-staff-info">
        <span className="detail-staff-name">{node.name?.full}</span>
        <span className="detail-staff-role">{role}</span>
      </div>
    </div>
  );
};

const DetailStaff = ({ staff }) => {
  const edges = staff?.edges ?? [];

  if (edges.length === 0) {
    return null;
  }

  const visibleEdges = edges.slice(0, MAX_STAFF);

  return (
    <DetailSection title="Staff">
      <div className="detail-staff-grid">
        {visibleEdges.map((edge) => (
          <StaffCard key={edge.id} edge={edge} />
        ))}
      </div>
    </DetailSection>
  );
};

export default DetailStaff;
```

Role is rendered verbatim (`{role}`) — per spec 5.4 it's already human-readable free text from the API, unlike `relationType`/character `role`, which are SCREAMING_CASE enums needing conversion.

- [ ] **Step 2: Append the staff CSS section to Detail.css**

```css

.detail-staff-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.detail-staff-card {
  display: flex;
  align-items: stretch;
  height: 72px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.detail-staff-image {
  width: 56px;
  height: 100%;
  object-fit: cover;
  flex-shrink: 0;
  display: block;
}

.detail-staff-image-placeholder {
  background: var(--color-surface);
}

.detail-staff-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  min-width: 0;
  overflow: hidden;
}

.detail-staff-name {
  font-family: var(--font-body);
  color: var(--color-text);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-staff-role {
  font-family: var(--font-body);
  font-size: var(--fs-small);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 900px) {
  .detail-staff-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Verify with lint**

Run: `npm run lint`
Expected: no errors in `DetailStaff.jsx`.

- [ ] **Step 4: Commit**

```bash
git add src/Detailpg/components/DetailStaff.jsx src/components/styles/Detail.css
git commit -m "feat: add Detail page staff section"
```

---

## Task 6: Wire the three sections into Detail.jsx

**Files:**
- Modify: `src/Detailpg/Detail.jsx`

**Interfaces:**
- Consumes: `DetailRelations` (Task 3), `DetailCharacters` (Task 4), `DetailStaff` (Task 5) default exports.

- [ ] **Step 1: Add the three imports and render calls**

Current file (`src/Detailpg/Detail.jsx`):

```jsx
import { useParams } from "react-router-dom";
import "../components/styles/Detail.css";
import detailFixture from "./detailFixture";
import DetailBanner from "./components/DetailBanner";
import DetailSidebar from "./components/DetailSidebar";
import DetailHeader from "./components/DetailHeader";

const Detail = () => {
  const { id } = useParams();
  const media = detailFixture;

  return (
    <div className="detail-page" data-anime-id={id}>
      <DetailBanner bannerImage={media.bannerImage} color={media.coverImage?.color} />

      <div className="detail-grid">
        <DetailSidebar media={media} />

        <div className="detail-main">
          <DetailHeader media={media} />
        </div>
      </div>
    </div>
  );
};

export default Detail;
```

Change it to:

```jsx
import { useParams } from "react-router-dom";
import "../components/styles/Detail.css";
import detailFixture from "./detailFixture";
import DetailBanner from "./components/DetailBanner";
import DetailSidebar from "./components/DetailSidebar";
import DetailHeader from "./components/DetailHeader";
import DetailRelations from "./components/DetailRelations";
import DetailCharacters from "./components/DetailCharacters";
import DetailStaff from "./components/DetailStaff";

const Detail = () => {
  const { id } = useParams();
  const media = detailFixture;

  return (
    <div className="detail-page" data-anime-id={id}>
      <DetailBanner bannerImage={media.bannerImage} color={media.coverImage?.color} />

      <div className="detail-grid">
        <DetailSidebar media={media} />

        <div className="detail-main">
          <DetailHeader media={media} />
          <DetailRelations relations={media.relations} />
          <DetailCharacters characters={media.characters} />
          <DetailStaff staff={media.staff} />
        </div>
      </div>
    </div>
  );
};

export default Detail;
```

Do not touch `DetailBanner`, `DetailSidebar`, or the grid/page divs — only the import list and the three new lines inside `.detail-main` change.

- [ ] **Step 2: Verify with lint and build**

Run: `npm run lint`
Expected: no errors anywhere in `src/Detailpg/`.

Run: `npm run build`
Expected: build succeeds — this is the first point all three new components get imported together with the extended fixture.

- [ ] **Step 3: Commit**

```bash
git add src/Detailpg/Detail.jsx
git commit -m "feat: wire relations, characters, and staff sections into Detail page"
```

---

## Task 7: Manual acceptance pass

**Files:** none (verification only).

- [ ] **Step 1: Start the dev server**

Run: `npm run dev` (in the background)
Expected: server starts with no console errors. Note the port (default `http://localhost:5173`).

- [ ] **Step 2: Walk through every acceptance check from the spec using the Playwright MCP browser tools**

Navigate to `http://localhost:5173/anime/12345` with `mcp__plugin_playwright_playwright__browser_navigate`, then for each check:

- **A.** Take a snapshot (`browser_snapshot`) and read console messages (`browser_console_messages`) — confirm no errors and, specifically, no "duplicate key" / "each child in a list should have a unique key" warnings, even though staff edges 2 and 3 share `node.id: 60002`.
- **B.** Find the "Ao Haru Ride" MANGA relation card ("Blue Spring Ride" via `relationType: "ADAPTATION"`) in the snapshot — confirm it's rendered as a plain element (not a link/`<a>` in the accessibility tree), and via `browser_evaluate` confirm `getComputedStyle` on that card reports `cursor: default` (not `pointer`).
- **C.** Confirm "Restricted Title EN" (the `isAdult: true` relation) does not appear anywhere in the relations grid snapshot.
- **D.** Find the character card for "Yamato Kominato" (`voiceActors: []`) — via `browser_evaluate`, compare its bounding-box height against a neighboring card's height (should match), and confirm its right half has no VA name/language text.
- **E.** In the snapshot, confirm "Shuko Murao" (the deliberately-first `SUPPORTING` entry) appears after all three `MAIN` characters ("Futaba Yoshioka", "Kou Mabuchi", "Narumi Kominato") in document order.
- **F.** Find "Erica Mendez"'s card and confirm the language text reads "ENGLISH", not "JAPANESE".
- **G.** Take a screenshot (`browser_take_screenshot`) and visually confirm every null-image slot (Kou Mabuchi's character image, Yasuhiro Kimura's staff image ×2, the null-cover relation) shows a filled placeholder block at the correct size, not a broken-image icon or a collapsed card.
- **H.** This requires editing the fixture. Temporarily set `relations: null`, `characters: null`, `staff: null` in `detailFixture.js`, let Vite hot-reload, take a snapshot, and confirm no heading ("Relations"/"Characters"/"Staff") or leftover empty section gap remains. Then revert with `git checkout -- src/Detailpg/detailFixture.js`, reload, and confirm the three sections are back exactly as before.
- **I.** Resize the browser to 375px width (`browser_resize`), take a screenshot, and confirm: no horizontal scrollbar, all three sections are single-column, and no text visibly overflows a card edge.
- **J.** Click a relation card whose `node.type` is `"ANIME"` (e.g. "Blue Spring Ride 2") with `browser_click`, then confirm via `browser_evaluate` (`window.location.pathname`) that the URL changed to `/anime/30001`. The page content not changing to reflect anime 30001 is expected in this phase (the fixture is still hardcoded) — do not treat that as a failure.

- [ ] **Step 3: Fix anything that fails, re-run the affected checks from Step 2**

No code changes are pre-written for this step — if a check fails, identify which task's component is responsible, fix it there, and re-verify.

- [ ] **Step 4: Final commit (only if Step 3 required changes)**

```bash
git add -A
git commit -m "fix: address Detail page phase 2 acceptance check findings"
```

If Step 3 required no changes, skip this commit.

---

## Self-Review Notes

- **Spec coverage:** Requirement 1 (fixture) → Task 1. Requirement 2 (DetailSection) → Task 2. Requirement 3 (relations) → Task 3. Requirement 4 (characters) → Task 4. Requirement 5 (staff) → Task 5. Requirement 6 (wiring) → Task 6. Requirement 7 (CSS conventions) → enforced throughout Tasks 2–5 and the Global Constraints. Acceptance checks A–J → Task 7, each mapped to a specific fixture entry built in Task 1.
- **Placeholder scan:** no TBD/TODO markers; every step has literal code or a literal shell command.
- **Type/name consistency:** `DetailSection` takes `{ title, children }`, called identically in Tasks 3–5 (`<DetailSection title="Relations">`, `title="Characters"`, `title="Staff"`). `DetailRelations`/`DetailCharacters`/`DetailStaff` each take one prop (`relations`/`characters`/`staff`) matching the exact fixture key names from Task 1, and `Detail.jsx` (Task 6) passes `media.relations`, `media.characters`, `media.staff` — matching. React keys: `edge.id` everywhere (Relations 3.8, Characters 4.10, Staff 5.7) — confirmed `StaffCard`'s `key={edge.id}` in Task 5, not `node.id`, satisfying the duplicate-`node.id` requirement.
