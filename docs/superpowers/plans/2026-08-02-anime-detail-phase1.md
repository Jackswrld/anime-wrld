# Anime Detail Page — Phase 1 (Layout Shell) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the static layout shell for the Anime Detail page (`/anime/:id`) — banner, sidebar, header, and tags panel — rendering entirely from a local mock fixture, with zero network requests.

**Architecture:** A page component (`Detail.jsx`) reads `id` from the route, ignores it functionally, and renders a fixed mock `Media` object through four presentational children (`DetailBanner`, `DetailSidebar`, `DetailTags`, `DetailHeader`). `DetailTags` is mounted inside `DetailSidebar` (see note below). One shared stylesheet (`Detail.css`) holds all styling behind section-prefixed class names, using only existing tokens from `src/index.css`.

**Tech Stack:** React 19 (Vite), react-router-dom v7, plain CSS with existing custom properties. No new dependencies.

## Note on file vs. render-tree mismatch in the spec

The spec's Requirement 2.3 says the main content column renders **only** `DetailHeader`. Requirement 4 (sidebar) lists cover/rankings/stats but never mentions tags. Requirement 5 defines a full `DetailTags` component. Acceptance check D ("Spoiler-flagged and adult tags do not appear in the tags panel") requires the tags panel to be visible on screen, which is only satisfiable if it's mounted somewhere.

Resolution used in this plan: Requirement 2.3's restriction is scoped explicitly to "the main content column" — the sidebar isn't restricted the same way. `DetailTags` is mounted inside `DetailSidebar`, below the stats panel, matching AniList's real layout (cover → rankings → stats → tags, all in the left column). This satisfies every acceptance check without adding anything to the main column beyond `DetailHeader`.

## Global Constraints

- No new npm dependencies (`package.json` is off-limits).
- No edits to `src/index.css` (project's token file) — use only existing custom properties (`--color-*`, `--font-*`, `--fs-*`, `--space-*`, `--radius-*`, `--shadow-*`).
- No edits to `src/api/anilist.js` or any query/fetch code. Zero network requests in this phase.
- No `dangerouslySetInnerHTML` anywhere.
- Every CSS class carries its section prefix: `detail-`, `detail-banner-`, `detail-side-`, `detail-tag-`, `detail-head-`. No generic names (`.card`, `.row`, `.container`, `.title`).
- No hardcoded hex colors in CSS — only token `var(--...)` references, except literal `rgba()` used purely for gradient/glow overlays (matches existing project convention, e.g. `AnimeCard.css`).
- No hover animations/transitions beyond a simple color change on the two text buttons ("Show more"/"Show less", "Read more"/"Read less").
- No loading state, no error state, no skeletons.
- Do not touch the navbar or add navigation links to the new route.
- Project has no component test framework (`node:test` is used only for `anilist.test.js`) — this phase explicitly excludes tests. Verification is via `npm run lint`, `npm run build`, and manual check in the dev server against the acceptance checks (A–H) copied into Task 8.

---

## File Structure

- `src/Detailpg/detailFixture.js` — one exported mock `Media` object shaped exactly like an AniList GraphQL response.
- `src/Detailpg/components/DetailBanner.jsx` — full-bleed banner, image or color fallback, bottom fade.
- `src/Detailpg/components/DetailSidebar.jsx` — cover image, all-time ranking badges, stats panel, and mounts `DetailTags`.
- `src/Detailpg/components/DetailTags.jsx` — filtered/sorted tag list with show more/less toggle.
- `src/Detailpg/components/DetailHeader.jsx` — title, subtitle, genre pills, sanitized clamped description.
- `src/Detailpg/Detail.jsx` — page shell: reads `id`, lays out banner + two-column grid (sidebar, main column with `DetailHeader`).
- `src/components/styles/Detail.css` — single stylesheet for all of the above, imported once by `Detail.jsx`.
- `src/main.jsx` — add one route, `/anime/:id` → `Detail`.

---

## Task 1: Fixture data

**Files:**
- Create: `src/Detailpg/detailFixture.js`

**Interfaces:**
- Produces: default export `detailFixture`, a plain object matching AniList's `Media` shape. Every later task's component reads fields directly off this shape (`media.title.english`, `media.coverImage.extraLarge`, `media.rankings`, `media.tags`, etc.) — field names below are load-bearing for every other task.

- [ ] **Step 1: Write the fixture**

```js
const detailFixture = {
  id: 20613,
  title: {
    romaji: "Ao Haru Ride",
    english: "Blue Spring Ride",
    native: "アオハライド",
  },
  description:
    "Futaba Yoshioka wants to make a fresh start in high school.<br><br>But when she runs into <i>Kou Mabuchi</i>, a boy she once loved in middle school, old feelings resurface.<br><br>Together they navigate friendship, heartbreak, and growing up.",
  bannerImage: "https://placehold.co/1200x400",
  coverImage: {
    extraLarge: "https://placehold.co/460x650",
    large: "https://placehold.co/460x650",
    color: "#e4a15b",
  },
  format: "TV",
  episodes: 12,
  duration: 24,
  status: "FINISHED",
  season: "SUMMER",
  seasonYear: 2014,
  averageScore: 75,
  popularity: 231842,
  source: "MANGA",
  genres: ["Comedy", "Drama", "Romance", "Shoujo"],
  studios: {
    edges: [
      { isMain: true, node: { id: 11, name: "Production I.G" } },
      { isMain: false, node: { id: 22, name: "Other Studio" } },
    ],
  },
  rankings: [
    {
      id: 1,
      rank: 82,
      type: "RATED",
      format: "TV",
      year: 2014,
      season: "SUMMER",
      allTime: false,
      context: "highest rated summer 2014 anime",
    },
    {
      id: 2,
      rank: 45,
      type: "POPULAR",
      format: "TV",
      year: null,
      season: null,
      allTime: true,
      context: "most popular all time",
    },
    {
      id: 3,
      rank: 120,
      type: "RATED",
      format: "TV",
      year: null,
      season: null,
      allTime: true,
      context: "highest rated all time",
    },
  ],
  tags: [
    { id: 1, name: "Tragedy", rank: 70, isMediaSpoiler: false, isGeneralSpoiler: false, isAdult: false },
    { id: 2, name: "School", rank: 85, isMediaSpoiler: false, isGeneralSpoiler: false, isAdult: false },
    { id: 3, name: "Coming of Age", rank: 80, isMediaSpoiler: false, isGeneralSpoiler: false, isAdult: false },
    { id: 4, name: "Female Protagonist", rank: 90, isMediaSpoiler: false, isGeneralSpoiler: false, isAdult: false },
    { id: 5, name: "Primarily Female Cast", rank: 60, isMediaSpoiler: false, isGeneralSpoiler: false, isAdult: false },
    { id: 6, name: "Love Triangle", rank: 75, isMediaSpoiler: false, isGeneralSpoiler: false, isAdult: false },
    { id: 7, name: "Time Skip", rank: 55, isMediaSpoiler: true, isGeneralSpoiler: false, isAdult: false },
    { id: 8, name: "Character Death", rank: 50, isMediaSpoiler: true, isGeneralSpoiler: true, isAdult: false },
    { id: 9, name: "Tsundere", rank: 65, isMediaSpoiler: false, isGeneralSpoiler: false, isAdult: false },
    { id: 10, name: "Ensemble Cast", rank: 45, isMediaSpoiler: false, isGeneralSpoiler: false, isAdult: false },
    { id: 11, name: "Nudity", rank: 40, isMediaSpoiler: false, isGeneralSpoiler: false, isAdult: true },
    { id: 12, name: "Friendship", rank: 72, isMediaSpoiler: false, isGeneralSpoiler: false, isAdult: false },
  ],
};

export default detailFixture;
```

This gives: 12 tags total, 9 survive tag filtering (>8, so "Show more" is testable), 2 with `isMediaSpoiler: true`, 1 with `isAdult: true`; 3 rankings with 2 `allTime: true` (one `RATED`, one `POPULAR` — exercises both badge glyphs) and 1 `allTime: false` (exercises the filter); `studios.edges` has a non-main entry first-position-safe case for the fallback rule.

- [ ] **Step 2: Verify it's valid JS**

Run: `node -e "const f = await import('./src/Detailpg/detailFixture.js'); console.log(Object.keys(f.default).length)"` from the project root.
Expected: prints `18` (the number of top-level keys) with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/Detailpg/detailFixture.js
git commit -m "feat: add Anime Detail page mock fixture"
```

---

## Task 2: DetailBanner

**Files:**
- Create: `src/Detailpg/components/DetailBanner.jsx`
- Create: `src/components/styles/Detail.css` (start the file; later tasks append sections)

**Interfaces:**
- Consumes: none (no prior component dependencies).
- Produces: default export `DetailBanner`, props `{ bannerImage, color }`. Consumed by `Detail.jsx` in Task 6 as `<DetailBanner bannerImage={media.bannerImage} color={media.coverImage?.color} />`.

- [ ] **Step 1: Write the component**

```jsx
const DetailBanner = ({ bannerImage, color }) => {
  const style = bannerImage
    ? { backgroundImage: `url(${bannerImage})` }
    : { backgroundColor: color || "var(--color-bg)" };

  return (
    <div className="detail-banner" style={style}>
      <div className="detail-banner-fade" />
    </div>
  );
};

export default DetailBanner;
```

- [ ] **Step 2: Start Detail.css with the banner section**

Create `src/components/styles/Detail.css` with:

```css
.detail-banner {
  position: relative;
  width: 100%;
  height: 400px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: var(--color-bg);
}

.detail-banner-fade {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(10, 14, 42, 0) 0%, var(--color-bg) 100%);
}

@media (max-width: 900px) {
  .detail-banner {
    height: 200px;
  }
}
```

(`background-color: var(--color-bg)` on the base rule is a safety net so the block is never transparent even before the inline fallback style resolves; the inline `style` prop above overrides it whenever `bannerImage` is absent or `color` is present.)

- [ ] **Step 3: Verify with lint**

Run: `npm run lint`
Expected: no errors for the two new files (unused-import warnings for anything not yet wired up are expected until Task 6 — ignore those for this step, just confirm no syntax errors in `DetailBanner.jsx` or `Detail.css` isn't linted by ESLint at all since it's CSS).

- [ ] **Step 4: Commit**

```bash
git add src/Detailpg/components/DetailBanner.jsx src/components/styles/Detail.css
git commit -m "feat: add Detail page banner component"
```

---

## Task 3: DetailTags

**Files:**
- Create: `src/Detailpg/components/DetailTags.jsx`
- Modify: `src/components/styles/Detail.css` (append tags section)

**Interfaces:**
- Consumes: none.
- Produces: default export `DetailTags`, props `{ tags }` where `tags` is `detailFixture.tags`-shaped (`{ id, name, rank, isMediaSpoiler, isGeneralSpoiler, isAdult }[]`). Consumed by `DetailSidebar` in Task 4 as `<DetailTags tags={media.tags} />`.

- [ ] **Step 1: Write the component**

```jsx
import { useState } from "react";

const VISIBLE_COUNT = 8;

const isFilteredOut = (tag) =>
  tag.isMediaSpoiler || tag.isGeneralSpoiler || tag.isAdult || /hentai/i.test(tag.name);

const DetailTags = ({ tags }) => {
  const [showAll, setShowAll] = useState(false);

  const visibleTags = (tags ?? [])
    .filter((tag) => !isFilteredOut(tag))
    .sort((a, b) => b.rank - a.rank);

  if (visibleTags.length === 0) {
    return null;
  }

  const shownTags = showAll ? visibleTags : visibleTags.slice(0, VISIBLE_COUNT);
  const hasMore = visibleTags.length > VISIBLE_COUNT;

  return (
    <div className="detail-tag-panel">
      {shownTags.map((tag) => (
        <div key={tag.id} className="detail-tag-row">
          <span className="detail-tag-name">{tag.name}</span>
          <span className="detail-tag-rank">{tag.rank}%</span>
        </div>
      ))}

      {hasMore && (
        <button
          type="button"
          className="detail-tag-toggle"
          onClick={() => setShowAll((current) => !current)}
        >
          {showAll ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
};

export default DetailTags;
```

- [ ] **Step 2: Append the tags CSS section to Detail.css**

```css
.detail-tag-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.detail-tag-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--font-body);
  font-size: var(--fs-body);
  color: var(--color-text);
}

.detail-tag-rank {
  color: var(--color-text-muted);
}

.detail-tag-toggle {
  align-self: flex-start;
  margin-top: var(--space-2);
  padding: 0;
  border: none;
  background: none;
  color: var(--color-accent-cyan);
  font-family: var(--font-body);
  font-size: var(--fs-small);
  cursor: pointer;
  transition: color 160ms ease;
}

.detail-tag-toggle:hover {
  color: var(--color-accent-pink);
}
```

- [ ] **Step 3: Verify with lint**

Run: `npm run lint`
Expected: no errors in `DetailTags.jsx`.

- [ ] **Step 4: Commit**

```bash
git add src/Detailpg/components/DetailTags.jsx src/components/styles/Detail.css
git commit -m "feat: add Detail page tags panel with spoiler/adult filtering"
```

---

## Task 4: DetailSidebar (mounts DetailTags)

**Files:**
- Create: `src/Detailpg/components/DetailSidebar.jsx`
- Modify: `src/components/styles/Detail.css` (append sidebar section)

**Interfaces:**
- Consumes: `DetailTags` default export from Task 3 (`src/Detailpg/components/DetailTags.jsx`), props `{ tags }`.
- Produces: default export `DetailSidebar`, props `{ media }` (the whole fixture object). Consumed by `Detail.jsx` in Task 6 as `<DetailSidebar media={media} />`.

- [ ] **Step 1: Write the component**

```jsx
import DetailTags from "./DetailTags";

const toTitleCase = (value) =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const capitalizeFirst = (value) => value.charAt(0).toUpperCase() + value.slice(1);

const getMainStudioName = (studios) => {
  const edges = studios?.edges ?? [];
  if (edges.length === 0) {
    return null;
  }
  const mainEdge = edges.find((edge) => edge.isMain) ?? edges[0];
  return mainEdge.node?.name ?? null;
};

const getAllTimeRankings = (rankings) =>
  (rankings ?? []).filter((ranking) => ranking.allTime === true).slice(0, 2);

const DetailSidebar = ({ media }) => {
  const {
    coverImage,
    format,
    episodes,
    duration,
    status,
    season,
    seasonYear,
    averageScore,
    popularity,
    studios,
    source,
    rankings,
    tags,
  } = media;

  const coverSrc = coverImage?.extraLarge || coverImage?.large || "";
  const allTimeRankings = getAllTimeRankings(rankings);
  const studioName = getMainStudioName(studios);

  const seasonLine = [season ? capitalizeFirst(season.toLowerCase()) : null, seasonYear ?? null]
    .filter((part) => part !== null && part !== undefined)
    .join(" ");

  const stats = [
    { label: "Format", value: format },
    { label: "Episodes", value: episodes },
    { label: "Episode Duration", value: duration != null ? `${duration} mins` : null },
    { label: "Status", value: status ? toTitleCase(status) : null },
    { label: "Season", value: seasonLine || null },
    { label: "Average Score", value: averageScore != null ? `${averageScore}%` : null },
    { label: "Popularity", value: popularity != null ? popularity.toLocaleString() : null },
    { label: "Studio", value: studioName },
    { label: "Source", value: source ? toTitleCase(source) : null },
  ].filter((stat) => stat.value !== null && stat.value !== undefined && stat.value !== "");

  return (
    <aside className="detail-side">
      <img className="detail-side-cover" src={coverSrc} alt="" />

      {allTimeRankings.length > 0 && (
        <div className="detail-side-rankings">
          {allTimeRankings.map((ranking) => (
            <div key={ranking.id} className="detail-side-rank-badge">
              <span
                className={
                  ranking.type === "POPULAR"
                    ? "detail-side-rank-icon detail-side-rank-icon-popular"
                    : "detail-side-rank-icon detail-side-rank-icon-rated"
                }
                aria-hidden="true"
              >
                {ranking.type === "POPULAR" ? "♥" : "★"}
              </span>
              <span className="detail-side-rank-text">
                #{ranking.rank} {capitalizeFirst(ranking.context)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="detail-side-stats">
        {stats.map((stat) => (
          <div key={stat.label} className="detail-side-stat-row">
            <span className="detail-side-stat-label">{stat.label}</span>
            <span className="detail-side-stat-value">{stat.value}</span>
          </div>
        ))}
      </div>

      <DetailTags tags={tags} />
    </aside>
  );
};

export default DetailSidebar;
```

Null-handling coverage: `episodes`/`duration`/`averageScore`/`popularity` at `null` produce `null` values, filtered out by the trailing `.filter`; `Season` renders only the present half when one of `season`/`seasonYear` is missing (empty-string guard via `|| null`); `Studio` omits the row when `edges` is `[]` (`getMainStudioName` returns `null`) and falls back to `edges[0]` when no edge has `isMain: true`.

- [ ] **Step 2: Append the sidebar CSS section to Detail.css**

```css
.detail-side {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.detail-side-cover {
  width: 100%;
  aspect-ratio: 460 / 650;
  object-fit: cover;
  border-radius: var(--radius-md);
  display: block;
}

.detail-side-rankings {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.detail-side-rank-badge {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-body);
  font-size: var(--fs-small);
  color: var(--color-text);
}

.detail-side-rank-icon-rated {
  color: var(--color-accent-cyan);
}

.detail-side-rank-icon-popular {
  color: var(--color-accent-pink);
}

.detail-side-stats {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.detail-side-stat-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.detail-side-stat-label {
  font-family: var(--font-body);
  font-size: var(--fs-small);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.detail-side-stat-value {
  font-family: var(--font-body);
  font-size: var(--fs-body);
  color: var(--color-text);
}
```

- [ ] **Step 3: Verify with lint**

Run: `npm run lint`
Expected: no errors in `DetailSidebar.jsx`.

- [ ] **Step 4: Commit**

```bash
git add src/Detailpg/components/DetailSidebar.jsx src/components/styles/Detail.css
git commit -m "feat: add Detail page sidebar with rankings and stats"
```

---

## Task 5: DetailHeader

**Files:**
- Create: `src/Detailpg/components/DetailHeader.jsx`
- Modify: `src/components/styles/Detail.css` (append header section)

**Interfaces:**
- Consumes: none.
- Produces: default export `DetailHeader`, props `{ media }` (the whole fixture object). Consumed by `Detail.jsx` in Task 6 as `<DetailHeader media={media} />`.

- [ ] **Step 1: Write the component**

```jsx
import { useState } from "react";

const NAMED_ENTITIES = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

const decodeEntities = (value) =>
  value.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;/g, (match) => NAMED_ENTITIES[match]);

const normalizeDescription = (raw) => {
  if (!raw) {
    return [];
  }

  const withNewlines = raw.replace(/<br\s*\/?>/gi, "\n");
  const withoutTags = withNewlines.replace(/<[^>]*>/g, "");
  const decoded = decodeEntities(withoutTags);

  return decoded
    .split("\n")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
};

const DetailHeader = ({ media }) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const titleVariants = [
    { key: "english", value: media.title?.english },
    { key: "romaji", value: media.title?.romaji },
    { key: "native", value: media.title?.native },
  ];
  const primaryVariant = titleVariants.find((variant) => variant.value) ?? { key: null, value: "" };
  const subtitle = titleVariants
    .filter((variant) => variant.key !== primaryVariant.key && variant.value)
    .map((variant) => variant.value)
    .join(" · ");

  const genres = media.genres ?? [];
  const descriptionParagraphs = normalizeDescription(media.description);

  return (
    <div className="detail-head">
      <h1 className="detail-head-title">{primaryVariant.value}</h1>

      {subtitle && <p className="detail-head-subtitle">{subtitle}</p>}

      {genres.length > 0 && (
        <div className="detail-head-genres">
          {genres.map((genre) => (
            <span key={genre} className="detail-head-genre-pill">
              {genre}
            </span>
          ))}
        </div>
      )}

      {descriptionParagraphs.length > 0 && (
        <div className="detail-head-description">
          <div
            className={
              isDescriptionExpanded
                ? "detail-head-description-text"
                : "detail-head-description-text detail-head-description-clamped"
            }
          >
            {descriptionParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <button
            type="button"
            className="detail-head-description-toggle"
            onClick={() => setIsDescriptionExpanded((current) => !current)}
          >
            {isDescriptionExpanded ? "Read less" : "Read more"}
          </button>
        </div>
      )}
    </div>
  );
};

export default DetailHeader;
```

- [ ] **Step 2: Append the header CSS section to Detail.css**

```css
.detail-head {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.detail-head-title {
  margin: 0;
  font-family: var(--font-heading);
  font-size: var(--fs-h1);
  color: var(--color-text);
}

.detail-head-subtitle {
  margin: 0;
  font-family: var(--font-body);
  color: var(--color-text-muted);
  font-size: var(--fs-body);
}

.detail-head-genres {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.detail-head-genre-pill {
  padding: var(--space-1) var(--space-3);
  border: 1px solid var(--color-accent-cyan);
  border-radius: var(--radius-pill);
  color: var(--color-accent-cyan);
  font-family: var(--font-body);
  font-size: var(--fs-small);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.detail-head-description-text p {
  margin: 0 0 var(--space-2);
  font-family: var(--font-body);
  color: var(--color-text);
  line-height: 1.6;
}

.detail-head-description-clamped {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.detail-head-description-toggle {
  margin-top: var(--space-2);
  padding: 0;
  border: none;
  background: none;
  color: var(--color-accent-cyan);
  font-family: var(--font-body);
  font-size: var(--fs-small);
  cursor: pointer;
  transition: color 160ms ease;
}

.detail-head-description-toggle:hover {
  color: var(--color-accent-pink);
}
```

- [ ] **Step 3: Verify with lint**

Run: `npm run lint`
Expected: no errors in `DetailHeader.jsx`.

- [ ] **Step 4: Commit**

```bash
git add src/Detailpg/components/DetailHeader.jsx src/components/styles/Detail.css
git commit -m "feat: add Detail page header with sanitized description"
```

---

## Task 6: Detail page shell

**Files:**
- Create: `src/Detailpg/Detail.jsx`
- Modify: `src/components/styles/Detail.css` (append page/grid section)

**Interfaces:**
- Consumes:
  - `detailFixture` default export from Task 1 (`src/Detailpg/detailFixture.js`).
  - `DetailBanner` default export from Task 2, props `{ bannerImage, color }`.
  - `DetailSidebar` default export from Task 4, props `{ media }`.
  - `DetailHeader` default export from Task 5, props `{ media }`.
  - `useParams` from `react-router-dom` (already a project dependency).
- Produces: default export `Detail`. Consumed by `src/main.jsx` in Task 7 as the element for route `/anime/:id`.

- [ ] **Step 1: Write the component**

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

(`data-anime-id={id}` satisfies Requirement 2.1 — `id` is read and present on the page — without using it for data selection yet, which arrives in a later phase.)

- [ ] **Step 2: Append the page/grid CSS section to Detail.css**

```css
.detail-page {
  width: 100%;
}

.detail-grid {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: var(--space-8);
  padding: var(--space-8) var(--space-6);
}

.detail-main {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

@media (max-width: 900px) {
  .detail-grid {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }
}
```

(Single-column collapse relies on DOM order — `DetailSidebar` is already the first grid child, `.detail-main` the second — so no `order` overrides are needed to get "sidebar first, then main column" on narrow screens.)

- [ ] **Step 3: Verify with lint and build**

Run: `npm run lint`
Expected: no errors anywhere in `src/Detailpg/`.

Run: `npm run build`
Expected: build succeeds (this catches any import/export mismatches across the five new components).

- [ ] **Step 4: Commit**

```bash
git add src/Detailpg/Detail.jsx src/components/styles/Detail.css
git commit -m "feat: add Detail page shell wiring banner, sidebar, and header"
```

---

## Task 7: Route wiring

**Files:**
- Modify: `src/main.jsx`

**Interfaces:**
- Consumes: `Detail` default export from Task 6 (`src/Detailpg/Detail.jsx`).

- [ ] **Step 1: Add the import and route**

In `src/main.jsx`, add the import alongside the existing page imports:

```jsx
import Detail from './Detailpg/Detail.jsx'
```

Add the route inside `<Routes>`, after the existing `/anime` route:

```jsx
<Route path="/anime/:id" element={<Detail />} />
```

Resulting file:

```jsx

import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Worlds from './Animepg/Worlds.jsx'
import Catalogue from './components/Catalogue/Catalogue.jsx'
import Animes from '../src/Animepg/Anime.jsx'
import Detail from './Detailpg/Detail.jsx'
import Navbar from './components/Navbar.jsx'
import { Route, BrowserRouter, Routes } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Navbar />
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/catalogue" element={<Catalogue />} />
      <Route path="/worlds" element={<Worlds />} />
      <Route path="/anime" element={<Animes />} />
      <Route path="/anime/:id" element={<Detail />} />
    </Routes>
  </BrowserRouter>
)
```

- [ ] **Step 2: Verify with lint and build**

Run: `npm run lint`
Expected: no errors.

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/main.jsx
git commit -m "feat: wire /anime/:id route to Detail page"
```

---

## Task 8: Manual acceptance pass

**Files:** none (verification only).

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Expected: server starts with no console errors.

- [ ] **Step 2: Walk through every acceptance check from the spec**

Visit `http://localhost:5173/anime/12345` (or whatever port Vite prints) and confirm, opening the browser devtools console alongside:

- **A.** Banner, sidebar, and header render with no console errors and no key warnings.
- **B.** Temporarily set `bannerImage: null` in `detailFixture.js` — the banner block still renders at full size (400px desktop) with the `color` fallback, not collapsed or transparent. Revert after checking.
- **C.** Temporarily set `episodes: null`, `season: null`, `seasonYear: null`, `studios: { edges: [] }` in `detailFixture.js` — those stat rows disappear entirely (no stray labels, no "undefined"/"NaN" text anywhere). Revert after checking.
- **D.** Confirm none of "Time Skip", "Character Death", or "Nudity" (the spoiler/adult tags) appear in the tags panel inside the sidebar.
- **E.** Click "Show more" in the tags panel — it reveals the 9th tag and the label flips to "Show less"; click again to confirm it toggles back. Click "Read more" under the description — it expands and flips to "Read less"; click again to confirm it toggles back.
- **F.** Confirm the description does not show literal `<i>` or `<br>` text anywhere, and via devtools Elements panel confirm no raw HTML was injected (no `<i>` element wrapping "Kou Mabuchi" — it should read as plain text inside a `<p>`).
- **G.** Resize the browser (or devtools responsive mode) to 375px width — confirm no horizontal scrollbar, and the layout is a single column with the sidebar (cover/rankings/stats/tags) above the header.
- **H.** After reverting any fixture edits from steps B/C, confirm the page matches steps A/D/E/F/G again — i.e., reverting the fixture leaves the intended design intact.

- [ ] **Step 3: Fix anything that fails, re-run Step 2 for the affected checks**

No code changes are pre-written for this step — if a check fails, identify which task's component is responsible and fix it there, then re-verify.

- [ ] **Step 4: Final commit (only if Step 3 required changes)**

```bash
git add -A
git commit -m "fix: address Detail page acceptance check findings"
```

If Step 3 required no changes, skip this commit — Task 7's commit is the final state.

---

## Self-Review Notes

- **Spec coverage:** Requirement 1 (fixture) → Task 1. Requirement 2 (page shell) → Task 6. Requirement 3 (banner) → Task 2. Requirement 4 (sidebar) → Task 4. Requirement 5 (tags) → Task 3, mounted in Task 4. Requirement 6 (header) → Task 5. Requirement 7 (CSS conventions) → enforced throughout Tasks 2–6 and the Global Constraints. Requirement 8 (routing) → Task 7. Acceptance checks A–H → Task 8.
- **Placeholder scan:** no TBD/TODO markers; every step has literal code or a literal shell command.
- **Type/name consistency:** `DetailBanner` props (`bannerImage`, `color`) match the call site in Task 6. `DetailSidebar`/`DetailHeader` both take `{ media }` and are called that way in Task 6. `DetailTags` takes `{ tags }` and is called with `tags={tags}` (destructured from `media` in Task 4). Default export names match every import across tasks.
