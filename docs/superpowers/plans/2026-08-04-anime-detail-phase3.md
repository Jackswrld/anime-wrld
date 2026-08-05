# Anime Detail Page — Phase 3 (Recommendations, Watch Officially, Trailer) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the final three mock-data sections — Recommendations, Watch Officially, Trailer — to the Anime Detail page's main content column, below the existing Staff section, with zero network requests.

**Architecture:** Three new leaf components (`DetailRecommendations`, `DetailStreaming`, `DetailTrailer`) each own their own null/empty-checks and reuse the existing `DetailSection` wrapper from Phase 2 for their heading. The fixture gains three new top-level keys. `Detail.jsx` renders the three new components after `DetailStaff`, passing the corresponding fixture slices directly. `DetailTrailer` lazily mounts a YouTube iframe only after a click, to avoid loading third-party embed scripts on every page view.

**Tech Stack:** React 19 (Vite), react-router-dom v7 (`Link`), lucide-react (`Play` icon — already a project dependency, already used in `src/components/Catalogue/Catalogue.jsx:2`), plain CSS with existing custom properties. No new dependencies.

## Global Constraints

- No new npm dependencies (`package.json` is off-limits).
- No edits to `tokens.css`'s custom properties (the `:root` block in `src/index.css`).
- No edits to `src/api/anilist.js` or any query/fetch file. Zero network requests in this phase.
- Do not touch `DetailBanner.jsx`, `DetailSidebar.jsx`, `DetailTags.jsx`, `DetailHeader.jsx`, `DetailSection.jsx`, `DetailRelations.jsx`, `DetailCharacters.jsx`, `DetailStaff.jsx` — leave all of them exactly as Phase 1/2 left them.
- `src/components/styles/Detail.css`: append only. Never edit or reorder the existing 474 lines from Phases 1–2.
- No new routes. The router (`src/main.jsx`) is not touched in this phase.
- Every new CSS class carries one of exactly these prefixes: `detail-rec-`, `detail-stream-`, `detail-trailer-`. No generic names.
- No hardcoded hex colors in CSS — only `var(--...)` tokens, except: (a) the streaming dot's background color, which is a dynamic inline style sourced from fixture/API data (`link.color`), and (b) the one `rgba()` literal for the trailer play button's circular backdrop, matching the existing ambient-overlay convention already used in `AnimeCard.css` (`background: rgba(10, 14, 42, 0.62)` for its badge).
- No transforms, scaling, or shadow animations anywhere in this phase's CSS. A hover-only, non-animated `filter: brightness(...)` on recommendation cards and a static (non-animated) circular backdrop on the trailer button are both compliant — neither is a transform, a scale, or an animated shadow.
- `DetailSection` (Phase 2, `src/Detailpg/components/DetailSection.jsx`) must be reused for all three sections' headings — no new heading markup, no duplicate heading component.
- Security: every anchor rendered by `DetailStreaming` MUST carry both `target="_blank"` and `rel="noopener noreferrer"` — these are third-party, community-submitted URLs; without `noopener` the destination page can reach back into this tab via `window.opener`.
- Project has no component test framework — this phase explicitly excludes tests. Verification is `npm run lint`, `npm run build`, and a manual acceptance pass (Task 6) using the Playwright MCP browser tools against the Vite dev server.

## Design Decisions (for the self-review / for whoever reads this later)

- **Recommendation card width:** the spec asks for "a 6-across row on desktop" that also must horizontally scroll below 900px without cards shrinking. A single mechanism satisfies both: `display: flex` with `flex-shrink: 0` fixed-width cards and `overflow-x: auto` on the row, no media query needed. At the page's max content width (`--space-8` gap, `.detail-grid`'s `min(1120px, 100%)` container minus the 220px sidebar and grid gap/padding — see `Detail.css:197-204` — the main column is roughly 820px wide), a 120px card width with `var(--space-4)` (16px) gaps fits six cards (`6×120 + 5×16 = 800px`) comfortably within that column, and the same flex row scrolls horizontally on any narrower viewport because the cards never shrink.
- **Recommendation image placeholder — no separate CSS-only placeholder class:** Phase 2's final review flagged an unused `.detail-rel-thumb-placeholder`/`.detail-char-side-left`-style dead CSS hook (a class added to an element for a "placeholder" variant that had no CSS rule of its own, because the actual placeholder color always comes from an inline style). This phase avoids repeating that: the placeholder `<div>` reuses the exact same sizing class as the real `<img>` (`.detail-rec-cover`) with no extra modifier class, since the only thing that differs is the inline `background-color`, which is inherently dynamic and can't live in a static CSS rule anyway.
- **Trailer play button backdrop uses `rgba()`, not a token:** there is no existing token for a semi-transparent dark circle. `AnimeCard.css`'s badge (`background: rgba(10, 14, 42, 0.62)`) is the established project precedent for exactly this kind of overlay-on-image treatment, so this phase follows it rather than inventing a new pattern.
- **`DetailStreaming` has no hover state:** the spec's Global Constraint 6.4 forbids shadow animations and transforms/scaling; a hover state isn't required by Requirement 3, so this phase adds none, keeping the component minimal (YAGNI).

---

## File Structure

- `src/Detailpg/detailFixture.js` — **modify**: append `recommendations`, `externalLinks`, `trailer` keys to the existing default-exported object. Nothing else in the file changes.
- `src/Detailpg/components/DetailRecommendations.jsx` — **create**: props `{ recommendations }`, filters/sorts/slices, renders a horizontally-scrolling row of linked recommendation cards inside `DetailSection`.
- `src/Detailpg/components/DetailStreaming.jsx` — **create**: props `{ externalLinks }`, filters to `STREAMING`-typed entries, renders pill-shaped external links inside `DetailSection`.
- `src/Detailpg/components/DetailTrailer.jsx` — **create**: props `{ trailer }`, lazily-mounted YouTube embed behind a click-to-play thumbnail, inside `DetailSection`.
- `src/Detailpg/Detail.jsx` — **modify**: import and render the three new components after `DetailStaff`, inside the existing `.detail-main` div.
- `src/components/styles/Detail.css` — **modify**: append three new sections (`detail-rec-`, `detail-stream-`, `detail-trailer-`) after the existing 474 lines.

---

## Task 1: Extend the fixture

**Files:**
- Modify: `src/Detailpg/detailFixture.js`

**Interfaces:**
- Produces: `detailFixture.recommendations` (`{ nodes: [...] }`), `detailFixture.externalLinks` (`[...]`, a plain array — NOT wrapped in an `edges`/`nodes` object, matching AniList's actual `Media.externalLinks` field shape), `detailFixture.trailer` (`{ id, site, thumbnail }` or could be `null` in real data, but the fixture itself is populated per requirement 1.3). Every later task's component reads these fields directly; the field names and nesting are load-bearing.

- [ ] **Step 1: Read the current file to get the exact insertion point**

The file currently ends with:

```js
  staff: {
    edges: [
      ...
    ],
  },
};

export default detailFixture;
```

Insert the three new keys **after** the `staff: { edges: [...] }` block's closing `},` and **before** the final `};`, so the object still has a single closing brace and `export default detailFixture;` stays last.

- [ ] **Step 2: Add the three keys**

```js
  recommendations: {
    nodes: [
      {
        id: 1,
        rating: 30,
        mediaRecommendation: {
          id: 70001,
          title: {
            romaji: "Kimi ni Todoke",
            english: "From Me to You",
            native: "君に届け",
          },
          coverImage: { large: "https://placehold.co/230x325", color: "#c98a5a" },
          format: "TV",
          isAdult: false,
        },
      },
      {
        id: 2,
        rating: 88,
        mediaRecommendation: {
          id: 70002,
          title: {
            romaji: "Suki tte Ii na yo.",
            english: "Say I Love You",
            native: "好きっていいなよ。",
          },
          coverImage: { large: "https://placehold.co/230x325", color: "#5ac9a1" },
          format: "TV",
          isAdult: false,
        },
      },
      {
        id: 3,
        rating: 12,
        mediaRecommendation: null,
      },
      {
        id: 4,
        rating: 95,
        mediaRecommendation: {
          id: 70004,
          title: {
            romaji: "Restricted Romance",
            english: "Restricted Romance EN",
            native: null,
          },
          coverImage: { large: "https://placehold.co/230x325", color: "#333333" },
          format: "TV",
          isAdult: true,
        },
      },
      {
        id: 5,
        rating: 67,
        mediaRecommendation: {
          id: 70005,
          title: {
            romaji: "Lovely Complex",
            english: null,
            native: "ラブ★コン",
          },
          coverImage: { large: "https://placehold.co/230x325", color: "#d16fa0" },
          format: "TV",
          isAdult: false,
        },
      },
      {
        id: 6,
        rating: 54,
        mediaRecommendation: {
          id: 70006,
          title: {
            romaji: "Orange",
            english: "Orange",
            native: "オレンジ",
          },
          coverImage: { large: null, color: "#e08a4a" },
          format: "TV",
          isAdult: false,
        },
      },
      {
        id: 7,
        rating: 73,
        mediaRecommendation: {
          id: 70007,
          title: {
            romaji: "Fruits Basket",
            english: "Fruits Basket",
            native: "フルーツバスケット",
          },
          coverImage: { large: "https://placehold.co/230x325", color: "#8a6fc9" },
          format: "TV",
          isAdult: false,
        },
      },
      {
        id: 8,
        rating: 41,
        mediaRecommendation: {
          id: 70008,
          title: {
            romaji: "Horimiya",
            english: "Horimiya",
            native: "ホリミヤ",
          },
          coverImage: { large: "https://placehold.co/230x325", color: "#4a9fc9" },
          format: "TV",
          isAdult: false,
        },
      },
      {
        id: 9,
        rating: 60,
        mediaRecommendation: {
          id: 70009,
          title: {
            romaji: "Toradora!",
            english: "Toradora!",
            native: "とらドラ!",
          },
          coverImage: { large: "https://placehold.co/230x325", color: "#c94a4a" },
          format: "TV",
          isAdult: false,
        },
      },
    ],
  },
  externalLinks: [
    { id: 1, url: "https://crunchyroll.com/ao-haru-ride", site: "Crunchyroll", type: "STREAMING", color: "#f47521", icon: null },
    { id: 2, url: "https://netflix.com/title/12345", site: "Netflix", type: "STREAMING", color: null, icon: null },
    { id: 3, url: "https://hulu.com/series/ao-haru-ride", site: "Hulu", type: "STREAMING", color: "#1ce783", icon: null },
    { id: 4, url: "https://anilist.co/anime/20613", site: "AniList", type: "INFO", color: "#02a9ff", icon: null },
    { id: 5, url: "https://myanimelist.net/anime/20613", site: "MyAnimeList", type: "INFO", color: "#2e51a2", icon: null },
    { id: 6, url: "https://twitter.com/aoharuride", site: "Twitter", type: "SOCIAL", color: "#1da1f2", icon: null },
  ],
  trailer: {
    id: "xY7z9Ab3Qw0",
    site: "youtube",
    thumbnail: "https://placehold.co/640x360",
  },
```

This fixture data gives:
- **Recommendations:** 9 nodes (≥8 ✓), deliberately unsorted by rating (30, 88, 12, 95, 67, 54, 73, 41, 60 — not ascending or descending). One with `mediaRecommendation: null` (id 3, ✓ crash-test case). One with `isAdult: true` (id 4, ✓). One with `title.english: null` (id 5, "Lovely Complex", ✓). One with `coverImage.large: null` (id 6, "Orange", ✓). After dropping id 3 (null) and id 4 (adult), 7 valid nodes remain; sorted descending by rating and sliced to 6, the visible set is `[88, 73, 67, 60, 54, 41]` = `["Say I Love You", "Fruits Basket", "Lovely Complex", "Toradora!", "Orange", "Horimiya"]` — both edge-case nodes (id 5's null english, id 6's null cover) land inside the visible 6, so both are actually testable on screen. Id 1 (rating 30) is correctly excluded by the cap.
- **External links:** 6 entries (≥6 ✓). 3 `STREAMING` (Crunchyroll, Netflix, Hulu — ≥2 ✓), 3 `INFO`/`SOCIAL` (AniList, MyAnimeList, Twitter — ≥2 ✓, and these must never render). Netflix (`STREAMING`) has `color: null` (✓ triggers the accent-token fallback).
- **Trailer:** populated, `site: "youtube"`, a real-shaped 11-character video id, and a thumbnail URL (✓).

- [ ] **Step 3: Verify it's valid JS**

Run: `node -e "const f = await import('./src/Detailpg/detailFixture.js'); console.log(f.default.recommendations.nodes.length, f.default.externalLinks.length, f.default.trailer.site)"` from the project root.
Expected: prints `9 6 youtube` with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/Detailpg/detailFixture.js
git commit -m "feat: extend Detail fixture with recommendations, external links, and trailer"
```

---

## Task 2: DetailRecommendations

**Files:**
- Create: `src/Detailpg/components/DetailRecommendations.jsx`
- Modify: `src/components/styles/Detail.css` (append recommendations section)

**Interfaces:**
- Consumes: `DetailSection` default export (`./DetailSection`, already exists from Phase 2), props `{ title, children }`. `Link` from `react-router-dom`.
- Produces: default export `DetailRecommendations`, props `{ recommendations }` where `recommendations` matches `detailFixture.recommendations`'s shape from Task 1 (`{ nodes: [{ id, rating, mediaRecommendation }] }`) or is `null`/`undefined`. Consumed by `Detail.jsx` in Task 5 as `<DetailRecommendations recommendations={media.recommendations} />`.

- [ ] **Step 1: Write the component**

```jsx
import { Link } from "react-router-dom";
import DetailSection from "./DetailSection";

const MAX_RECOMMENDATIONS = 6;

const getRecommendationTitle = (title) => title?.english || title?.romaji || title?.native || "";

const RecommendationCard = ({ node }) => {
  const media = node.mediaRecommendation;
  const coverSrc = media.coverImage?.large || "";
  const title = getRecommendationTitle(media.title);

  return (
    <Link to={`/anime/${media.id}`} className="detail-rec-card">
      {coverSrc ? (
        <img className="detail-rec-cover" src={coverSrc} alt="" />
      ) : (
        <div
          className="detail-rec-cover"
          style={{ backgroundColor: media.coverImage?.color || "var(--color-surface)" }}
          aria-hidden="true"
        />
      )}
      <span className="detail-rec-title">{title}</span>
    </Link>
  );
};

const DetailRecommendations = ({ recommendations }) => {
  const nodes = recommendations?.nodes ?? [];

  const visibleNodes = nodes
    .filter((node) => node.mediaRecommendation != null)
    .filter((node) => !node.mediaRecommendation.isAdult)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, MAX_RECOMMENDATIONS);

  if (visibleNodes.length === 0) {
    return null;
  }

  return (
    <DetailSection title="Recommendations">
      <div className="detail-rec-row">
        {visibleNodes.map((node) => (
          <RecommendationCard key={node.id} node={node} />
        ))}
      </div>
    </DetailSection>
  );
};

export default DetailRecommendations;
```

Mutation safety: `nodes.filter(...)` always returns a brand-new array — it can never alias or mutate `nodes` (which is itself `recommendations?.nodes`, the caller's original array). `.sort()` is then called on that already-new filtered array, so the original `recommendations.nodes` array from the fixture is never touched, satisfying "sort the remainder... on a COPY of the array. Do not mutate the incoming data" without needing an explicit extra `[...nodes]` spread.

- [ ] **Step 2: Append the recommendations CSS section to Detail.css**

```css

.detail-rec-row {
  display: flex;
  gap: var(--space-4);
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-bottom: var(--space-1);
}

.detail-rec-row::-webkit-scrollbar {
  display: none;
}

.detail-rec-card {
  flex: 0 0 120px;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  text-decoration: none;
  color: inherit;
}

.detail-rec-cover {
  width: 120px;
  aspect-ratio: 460 / 650;
  object-fit: cover;
  border-radius: var(--radius-md);
  display: block;
}

.detail-rec-card:hover .detail-rec-cover {
  filter: brightness(1.15);
}

.detail-rec-title {
  font-family: var(--font-body);
  font-size: var(--fs-small);
  color: var(--color-text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

- [ ] **Step 3: Verify with lint**

Run: `npm run lint`
Expected: no errors in `DetailRecommendations.jsx`. (It isn't imported anywhere yet — that's expected until Task 5.)

- [ ] **Step 4: Commit**

```bash
git add src/Detailpg/components/DetailRecommendations.jsx src/components/styles/Detail.css
git commit -m "feat: add Detail page recommendations section"
```

---

## Task 3: DetailStreaming (Watch Officially)

**Files:**
- Create: `src/Detailpg/components/DetailStreaming.jsx`
- Modify: `src/components/styles/Detail.css` (append streaming section)

**Interfaces:**
- Consumes: `DetailSection` default export from Phase 2 (`./DetailSection`).
- Produces: default export `DetailStreaming`, props `{ externalLinks }` where `externalLinks` matches `detailFixture.externalLinks`'s shape from Task 1 (`[{ id, url, site, type, color, icon }]`) or is `null`/`undefined`. Consumed by `Detail.jsx` in Task 5 as `<DetailStreaming externalLinks={media.externalLinks} />`.

- [ ] **Step 1: Write the component**

```jsx
import DetailSection from "./DetailSection";

const HEX_COLOR_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const isValidHexColor = (value) => typeof value === "string" && HEX_COLOR_PATTERN.test(value);

const DetailStreaming = ({ externalLinks }) => {
  const streamingLinks = (externalLinks ?? []).filter((link) => link.type === "STREAMING");

  if (streamingLinks.length === 0) {
    return null;
  }

  return (
    <DetailSection title="Watch Officially">
      <div className="detail-stream-row">
        {streamingLinks.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="detail-stream-pill"
          >
            <span
              className="detail-stream-dot"
              style={{ backgroundColor: isValidHexColor(link.color) ? link.color : "var(--color-accent-cyan)" }}
              aria-hidden="true"
            />
            {link.site}
          </a>
        ))}
      </div>
    </DetailSection>
  );
};

export default DetailStreaming;
```

`isValidHexColor` rejects `null`, empty string, non-string values, and malformed strings (e.g. `"orange"`, `"#ggg"`), falling back to `var(--color-accent-cyan)` (the primary accent token) in every one of those cases — satisfying "If color is null, empty, or not a valid hex string, fall back to the primary accent token. Never render a transparent or invisible dot."

- [ ] **Step 2: Append the streaming CSS section to Detail.css**

```css

.detail-stream-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.detail-stream-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: var(--fs-small);
  text-decoration: none;
}

.detail-stream-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  display: inline-block;
}
```

- [ ] **Step 3: Verify with lint**

Run: `npm run lint`
Expected: no errors in `DetailStreaming.jsx`.

- [ ] **Step 4: Commit**

```bash
git add src/Detailpg/components/DetailStreaming.jsx src/components/styles/Detail.css
git commit -m "feat: add Detail page watch-officially section"
```

---

## Task 4: DetailTrailer

**Files:**
- Create: `src/Detailpg/components/DetailTrailer.jsx`
- Modify: `src/components/styles/Detail.css` (append trailer section)

**Interfaces:**
- Consumes: `DetailSection` default export from Phase 2 (`./DetailSection`). `Play` icon from `lucide-react` (already a project dependency — see `src/components/Catalogue/Catalogue.jsx:2` for the same import).
- Produces: default export `DetailTrailer`, props `{ trailer }` where `trailer` matches `detailFixture.trailer`'s shape from Task 1 (`{ id, site, thumbnail }`) or is `null`/`undefined`. Consumed by `Detail.jsx` in Task 5 as `<DetailTrailer trailer={media.trailer} />`.

- [ ] **Step 1: Write the component**

```jsx
import { useState } from "react";
import { Play } from "lucide-react";
import DetailSection from "./DetailSection";

const DetailTrailer = ({ trailer }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!trailer || !trailer.id || trailer.site?.toLowerCase() !== "youtube") {
    return null;
  }

  return (
    <DetailSection title="Trailer">
      <div className="detail-trailer-frame">
        {isPlaying ? (
          <iframe
            className="detail-trailer-iframe"
            src={`https://www.youtube.com/embed/${trailer.id}?autoplay=1`}
            title="Trailer"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            frameBorder="0"
          />
        ) : (
          <button
            type="button"
            className="detail-trailer-play"
            style={trailer.thumbnail ? { backgroundImage: `url(${trailer.thumbnail})` } : undefined}
            onClick={() => setIsPlaying(true)}
            aria-label="Play trailer"
          >
            <span className="detail-trailer-play-icon-wrap">
              <Play className="detail-trailer-play-icon" aria-hidden="true" />
            </span>
          </button>
        )}
      </div>
    </DetailSection>
  );
};

export default DetailTrailer;
```

Null/skip logic trace: `trailer.site?.toLowerCase() !== "youtube"` — if `trailer.site` is `"dailymotion"`, `.toLowerCase()` yields `"dailymotion"`, which `!== "youtube"` is `true`, so the component returns `null` (the whole section, including its `DetailSection` heading, never renders). If `trailer.site` is `undefined`/`null`, optional chaining short-circuits to `undefined`, and `undefined !== "youtube"` is also `true`, so it's treated identically to "not youtube" — correct per "trailer.site is anything other than youtube." No YouTube URL is ever constructed from a non-YouTube id, because the `<iframe src>` template string only exists inside the `isPlaying` branch, which is only reachable after this early-return guard already passed.

- [ ] **Step 2: Append the trailer CSS section to Detail.css**

```css

.detail-trailer-frame {
  position: relative;
  width: 100%;
  max-width: 860px;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-surface);
}

.detail-trailer-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.detail-trailer-play {
  width: 100%;
  height: 100%;
  border: none;
  padding: 0;
  background-color: var(--color-surface);
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.detail-trailer-play-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: var(--radius-pill);
  background: rgba(10, 14, 42, 0.6);
  border: 2px solid var(--color-text);
}

.detail-trailer-play-icon {
  width: 32px;
  height: 32px;
  color: var(--color-text);
}
```

(`background: rgba(10, 14, 42, 0.6)` on `.detail-trailer-play-icon-wrap` is the one sanctioned ambient-overlay literal for this task — same pattern as `AnimeCard.css`'s existing `rgba(10, 14, 42, 0.62)` badge background.)

- [ ] **Step 3: Verify with lint**

Run: `npm run lint`
Expected: no errors in `DetailTrailer.jsx`.

- [ ] **Step 4: Commit**

```bash
git add src/Detailpg/components/DetailTrailer.jsx src/components/styles/Detail.css
git commit -m "feat: add Detail page trailer section with lazy embed"
```

---

## Task 5: Wire the three sections into Detail.jsx

**Files:**
- Modify: `src/Detailpg/Detail.jsx`

**Interfaces:**
- Consumes: `DetailRecommendations` (Task 2), `DetailStreaming` (Task 3), `DetailTrailer` (Task 4) default exports.

- [ ] **Step 1: Add the three imports and render calls**

Current file (`src/Detailpg/Detail.jsx`):

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
import DetailRecommendations from "./components/DetailRecommendations";
import DetailStreaming from "./components/DetailStreaming";
import DetailTrailer from "./components/DetailTrailer";

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
          <DetailRecommendations recommendations={media.recommendations} />
          <DetailStreaming externalLinks={media.externalLinks} />
          <DetailTrailer trailer={media.trailer} />
        </div>
      </div>
    </div>
  );
};

export default Detail;
```

Do not touch the banner, sidebar, grid divs, or any Phase 1/2 render line — only the import list and the three new lines at the end of `.detail-main` change.

- [ ] **Step 2: Verify with lint and build**

Run: `npm run lint`
Expected: no errors anywhere in `src/Detailpg/`.

Run: `npm run build`
Expected: build succeeds — this is the first point all three new components get imported together with the extended fixture and the existing Phase 1/2 components.

- [ ] **Step 3: Commit**

```bash
git add src/Detailpg/Detail.jsx
git commit -m "feat: wire recommendations, streaming, and trailer sections into Detail page"
```

---

## Task 6: Manual acceptance pass

**Files:** none (verification only).

- [ ] **Step 1: Start the dev server**

Run: `npm run dev` (in the background). Note the port Vite prints — if 5173 is already occupied by another dev server, Vite will fall back to 5174 or another port; use whatever port the terminal output actually reports, not an assumed default.

- [ ] **Step 2: Walk through every acceptance check from the spec using the Playwright MCP browser tools**

Navigate to `http://localhost:<port>/anime/12345`, then for each check:

- **A.** Take a snapshot and read console messages — confirm no errors, and specifically no "duplicate key" / "each child in a list should have a unique key" warnings across all three new sections.
- **B.** CRITICAL: confirm the page did not crash and confirm no card exists for recommendation `id: 3` (the one with `mediaRecommendation: null`) — query `.detail-rec-card` elements and confirm none correspond to that entry (there should be exactly 6 cards total, none blank/empty).
- **C.** Confirm "Restricted Romance EN" (the `isAdult: true` recommendation) never appears in the rendered recommendations row.
- **D.** Confirm the rendered recommendation order is descending by rating: "Say I Love You" (88), "Fruits Basket" (73), "Lovely Complex" (67), "Toradora!" (60), "Orange" (54), "Horimiya" (41). Then re-read `detailFixture.js` from disk (or re-evaluate the imported module) and confirm `recommendations.nodes` is still in its original id order (1,2,3,4,5,6,7,8,9) with `rating` values unchanged — proving the sort never mutated the source array.
- **E.** Confirm only "Crunchyroll", "Netflix", "Hulu" pills render in the Watch Officially row — "AniList", "MyAnimeList", "Twitter" must not appear anywhere in that section.
- **F.** Use `browser_evaluate` to inspect a rendered `.detail-stream-pill` anchor's `target` and `rel` attributes directly (`el.getAttribute('target')`, `el.getAttribute('rel')`) — confirm `target="_blank"` and `rel="noopener noreferrer"` on every one of the three streaming anchors, not just the first.
- **G.** Find the Netflix pill's `.detail-stream-dot` and confirm via `getComputedStyle(...).backgroundColor` that it resolves to the accent-cyan token's actual color (not transparent, not `rgba(0, 0, 0, 0)`).
- **H.** Confirm no request to any `youtube.com`/`ytimg.com` host has been made yet (no iframe in the DOM, `document.querySelector('.detail-trailer-iframe')` is `null`). Click the `.detail-trailer-play` button, then confirm `.detail-trailer-iframe` now exists in the DOM with a `src` containing `youtube.com/embed/xY7z9Ab3Qw0`.
- **I.** Temporarily edit the fixture: change `trailer.site` from `"youtube"` to `"dailymotion"`. Reload, confirm `.detail-trailer-frame` and the "Trailer" heading are both absent — no broken player, no empty heading. Revert with `git checkout -- src/Detailpg/detailFixture.js`, reload, confirm the trailer section is back.
- **J.** Temporarily edit the fixture: set `recommendations: null`, `externalLinks: null`, `trailer: null`. Reload, confirm all three headings ("Recommendations", "Watch Officially", "Trailer") and their content are entirely absent from `.detail-main`, with no leftover empty-section gaps. Revert with `git checkout -- src/Detailpg/detailFixture.js`, reload, confirm all three sections are back exactly as before.
- **K.** Resize to 375px width. Confirm: (1) `.detail-rec-row` still holds 120px-wide non-shrunk cards and is horizontally scrollable (`scrollWidth > clientWidth` on the row itself, while `document.documentElement.scrollWidth === document.documentElement.clientWidth`, i.e. the PAGE doesn't scroll horizontally, only the recommendations row does); (2) `.detail-stream-row` pills wrap onto multiple lines (compare `getBoundingClientRect().top` across pills — more than one distinct top value); (3) `.detail-trailer-frame`'s width/height ratio is still ~16:9 and it doesn't cause page-level horizontal scroll.

- [ ] **Step 3: Fix anything that fails, re-run the affected checks from Step 2**

No code changes are pre-written for this step — if a check fails, identify which task's component is responsible, fix it there, and re-verify.

- [ ] **Step 4: Final commit (only if Step 3 required changes)**

```bash
git add -A
git commit -m "fix: address Detail page phase 3 acceptance check findings"
```

If Step 3 required no changes, skip this commit.

---

## Self-Review Notes

- **Spec coverage:** Requirement 1 (fixture) → Task 1. Requirement 2 (recommendations) → Task 2. Requirement 3 (watch officially) → Task 3. Requirement 4 (trailer) → Task 4. Requirement 5 (wiring) → Task 5. Requirement 6 (CSS conventions) → enforced throughout Tasks 2–4 and the Global Constraints. Acceptance checks A–K → Task 6, each mapped to a specific fixture entry built in Task 1.
- **Placeholder scan:** no TBD/TODO markers; every step has literal code or a literal shell command.
- **Type/name consistency:** `DetailSection` reused with the same `{ title, children }` contract as Phase 2, called identically three times (`title="Recommendations"`, `title="Watch Officially"`, `title="Trailer"`). `DetailRecommendations`/`DetailStreaming`/`DetailTrailer` each take one prop matching the exact fixture key names from Task 1, and `Detail.jsx` (Task 5) passes `media.recommendations`, `media.externalLinks`, `media.trailer` — matching. React keys: `node.id` for recommendations (2.8), `link.id` for streaming (3.7) — both distinct from any `mediaRecommendation.id`/`node.id` nesting, avoiding the kind of key collision Phase 2's staff section had to guard against.
