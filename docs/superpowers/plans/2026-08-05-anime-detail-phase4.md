# Anime Detail Page — Phase 4 (Live AniList Data) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `detailFixture.js` with a live AniList GraphQL query so the Detail page renders real anime data, with loading/error/not-found states, a stale-response guard for rapid navigation, and a session-scoped cache — then delete the fixture once every acceptance check passes.

**Architecture:** One new exported function, `fetchAnimeDetail(id)`, in `src/api/anilist.js`, following the file's existing thin-unwrapper-over-`fetchWithRetry` convention exactly, with its own module-level `Map` cache (same pattern as `genreListCache`). `Detail.jsx` drives a single `status` string state machine (`loading | ready | notfound | error`) from a `useEffect` keyed on `[id]`, guarded against stale responses via a `cancelled` flag, with a `useRef`-stored retry function so the Retry button can re-run the exact same fetch without adding a second effect dependency. Three new presentational components in `DetailStates.jsx` render the three non-"ready" states; the loading skeleton reuses the existing `.detail-grid`/`.detail-main` layout classes so its footprint matches the real page exactly, avoiding CSS duplication.

**Tech Stack:** React 19 (Vite), react-router-dom v7 (`useParams`, `Link`), Node's native `node:test` + `assert/strict` (no Jest/Vitest), plain CSS via `tokens.css` custom properties. No new dependencies.

## Global Constraints

- API module lives at `src/api/anilist.js` (confirmed by reading the repo — `src/lib/anilist.js` does not exist). Tests live at `src/api/anilist.test.js`. Do not create a second API module.
- `fetchWithRetry(query, variables, retries)` stays the single shared wrapper. Every exported page function is a thin unwrapper: call `fetchWithRetry`, return `result?.data?.X ?? <default>`. Errors are THROWN, never returned as objects. Do not invent a new error convention.
- Do not touch `fetchTrendingAnime`, `fetchLatestReleases`, `fetchHeroAnime`, `fetchAnimeByGenres`, `fetchGenreList`, `fetchCharactersPage`, `fetchCharacterDetail`, `selectHeroSlides`. Do not refactor, reorder, or "improve" them.
- Do not extend or reuse `MEDIA_FIELDS` for the detail query — it needs a far larger field set of its own.
- Do not touch `DetailBanner`, `DetailSidebar`, `DetailTags`, `DetailHeader`, `DetailSection`, `DetailRelations`, `DetailCharacters`, `DetailStaff`, `DetailRecommendations`, `DetailStreaming`, `DetailTrailer`. Their props do not change — confirmed by reading every one of them against the required query shape in this plan's research pass; the query field selection is written to match their exact reads.
- `src/components/styles/Detail.css`: append only. Never edit or reorder the existing 597 lines (verified current length). New class prefixes: `detail-load-`, `detail-err-`, `detail-404-`. No generic names. Tokens only, no hardcoded hex — the loading skeleton uses `var(--color-surface)`.
- Respect `@media (prefers-reduced-motion: reduce)` on the skeleton pulse animation.
- No `AbortController`/`AbortSignal` anywhere. The `cancelled`-flag closure pattern is the correct scope for this task, per the spec.
- The router (`src/main.jsx`), `tokens.css` (`src/index.css`'s `:root` block), and `package.json` are off-limits.
- Do not add navigation links from other pages to the detail route. Do not modify any card component in Trending, Latest Releases, Worlds, or A–Z.
- `detailFixture.js` is deleted only in the final task, and only if every acceptance check up to that point passed.

## Research Notes (so later tasks don't re-derive this)

- The route is `/anime/:id` (`src/main.jsx:20`), rendering `Detail` with `useParams().id` as a **string**.
- Every Detail child component's field reads were checked against the required query shape:
  - `DetailSidebar` reads `coverImage.{extraLarge,large,color}`, `format`, `episodes`, `duration`, `status`, `season`, `seasonYear`, `averageScore`, `popularity`, `studios.edges[].{isMain,node.name}`, `source`, `rankings[].{id,rank,type,allTime,context}`, `tags`.
  - `DetailHeader` reads `title.{english,romaji,native}`, `genres`, `description`.
  - `DetailBanner` reads `bannerImage`, `coverImage.color` (passed as separate props from `Detail.jsx`, not `media` itself).
  - `DetailTags` reads `tag.{id,name,rank,isMediaSpoiler,isGeneralSpoiler,isAdult}`.
  - `DetailRelations` reads `relations.edges[].{id,relationType,node.{id,type,format,status,title,coverImage.{large,color},isAdult}}`.
  - `DetailCharacters` reads `characters.edges[].{id,role,node.{id,name.full,image.large},voiceActors[].{name.full,languageV2,image.large}}`.
  - `DetailStaff` reads `staff.edges[].{id,role,node.{id,name.full,image.large}}`.
  - `DetailRecommendations` reads `recommendations.nodes[].{id,rating,mediaRecommendation.{id,title,coverImage.{large,color},format,isAdult}}`.
  - `DetailStreaming` reads `externalLinks[].{id,url,site,type,color}`.
  - `DetailTrailer` reads `trailer.{id,site,thumbnail}`.
  - All of the above match the field selection given in Requirement 2.4 verbatim — no query changes needed if a child's props ever look wrong; the fields are already covered.
- `src/api/anilist.test.js`'s existing pattern: `globalThis.fetch` is swapped for a local async function inside a `try`, restored in `finally`; requests are inspected via `JSON.parse(options.body)`; assertions use `assert/strict`'s `equal`/`deepEqual`/`ok`/`match`/`rejects`.
- `fetchWithRetry`'s retry loop (unchanged by this plan) retries on **every** thrown error, not just 429/5xx — a 404 from the `!response.ok` branch still consumes all 3 default retries (500ms + 1000ms + 2000ms ≈ 3.5s) before finally rethrowing. This is existing, intentional-per-spec behavior (Global Constraint: don't touch the catch block), so `fetchAnimeDetail`'s 404 and non-404-error tests take ~3.5s of real wall-clock time each. The Task 1 status-code test avoids this by passing `retries: 0` explicitly (an already-existing parameter of `fetchWithRetry`) to stay fast.
- Verified real AniList ids for the manual acceptance pass, queried live against `https://graphql.anilist.co` during planning (the spec's own example, `/anime/12345`, 404s on the real API — AniList id 12345 does not exist; corrected below):
  - **20596** — Ao Haru Ride ("Blue Spring Ride"), has recommendations (21647 "orange", 6045 "Kimi ni Todoke", 124080 "Horimiya") for click-through testing.
  - **21** — ONE PIECE, `status: RELEASING`, `episodes: null` (currently-airing case).
  - **21519** — Kimi no Na wa. ("Your Name"), `format: MOVIE`, `episodes: 1`, has a trailer (movie case).
  - **10342** — Tetsuwan Atom: Uchuu no Yuusha (1964), `bannerImage: null`, exactly 1 tag (old/sparse-data case).
  - **16159** — Mirai Kara Kita Shounen Super Jetter, `trailer: null`, `externalLinks: []` (no-trailer/no-streaming case).
  - **999999999** — confirmed 404 (not-found case).

---

## Task 1: Attach HTTP status to thrown errors in `fetchWithRetry`

**Files:**
- Modify: `src/api/anilist.js:45-47`
- Test: `src/api/anilist.test.js`

**Interfaces:**
- Produces: any error thrown from the `!response.ok` branch of `fetchWithRetry` now carries an `.status` number property equal to `response.status`. `.message` is unchanged in format. Consumed by Task 2's `fetchAnimeDetail` to detect 404s.

- [ ] **Step 1: Write the failing test**

Add to `src/api/anilist.test.js` (after the existing `fetchWithRetry retries after a transient failure` test):

```js
test("fetchWithRetry attaches the HTTP status to the thrown error for non-ok responses", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () => ({
    ok: false,
    status: 404,
    json: async () => ({})
  });

  try {
    await assert.rejects(
      () => fetchWithRetry("query { GenreCollection }", {}, 0),
      (error) => {
        assert.equal(error.status, 404);
        assert.match(error.message, /404/);
        return true;
      }
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
```

Note: the third argument (`0`) is `fetchWithRetry`'s existing `retries` parameter — passing it keeps this test fast (one fetch call, no backoff), and is not a change to `fetchWithRetry`'s signature.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test src/api/anilist.test.js`
Expected: FAIL — `error.status` is `undefined`, not `404`.

- [ ] **Step 3: Implement the minimal change**

In `src/api/anilist.js`, the `if (!response.ok)` branch currently reads:

```js
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
```

Change it to:

```js
      if (!response.ok) {
        const error = new Error(`Request failed with status ${response.status}`);
        error.status = response.status;
        throw error;
      }
```

Change nothing else in the function — not the 429/5xx branch above it, not the `catch` block below it.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test src/api/anilist.test.js`
Expected: PASS, and the two pre-existing tests in the file still PASS.

- [ ] **Step 5: Commit**

```bash
git add src/api/anilist.js src/api/anilist.test.js
git commit -m "feat: attach HTTP status to fetchWithRetry's thrown errors"
```

---

## Task 2: `fetchAnimeDetail` with session cache

**Files:**
- Modify: `src/api/anilist.js` (add `detailCache`/`cacheDetail` near `genreListCache`; add `fetchAnimeDetail` after `fetchCharacterDetail`)
- Test: `src/api/anilist.test.js`

**Interfaces:**
- Consumes: `fetchWithRetry` (Task 1's version, with `.status` on thrown errors).
- Produces: `export const fetchAnimeDetail = async (id) => {...}` returning a `Media`-shaped object, or `null` for an invalid id / a 404. Throws (rethrows) for any other error. Consumed by Task 4's `Detail.jsx` as `await fetchAnimeDetail(id)`.

- [ ] **Step 1: Write the failing tests**

Add to `src/api/anilist.test.js`, importing `fetchAnimeDetail` alongside the existing imports (change the top import line):

```js
import { fetchAnimeDetail, fetchCharacterDetail, fetchWithRetry } from "./anilist.js";
```

Then append these five tests:

```js
test("fetchAnimeDetail returns null for invalid ids without a network call", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;

  globalThis.fetch = async () => {
    calls += 1;
    throw new Error("network should not be called for an invalid id");
  };

  try {
    const invalidIds = [null, undefined, "abc", 0, -1];

    for (const invalidId of invalidIds) {
      const result = await fetchAnimeDetail(invalidId);
      assert.equal(result, null);
    }

    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("fetchAnimeDetail returns the Media object on success", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;

  globalThis.fetch = async () => {
    calls += 1;
    return {
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          Media: { id: 501, title: { romaji: "Test Anime" } }
        }
      })
    };
  };

  try {
    const result = await fetchAnimeDetail(501);
    assert.equal(calls, 1);
    assert.deepEqual(result, { id: 501, title: { romaji: "Test Anime" } });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("fetchAnimeDetail caches a successful response and skips the network on a repeat call", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;

  globalThis.fetch = async () => {
    calls += 1;
    return {
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          Media: { id: 502, title: { romaji: "Cached Anime" } }
        }
      })
    };
  };

  try {
    const first = await fetchAnimeDetail(502);
    const second = await fetchAnimeDetail(502);

    assert.equal(calls, 1);
    assert.deepEqual(first, second);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("fetchAnimeDetail returns null when the request fails with 404", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () => ({
    ok: false,
    status: 404,
    json: async () => ({})
  });

  try {
    const result = await fetchAnimeDetail(503);
    assert.equal(result, null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("fetchAnimeDetail rethrows a non-404 error instead of swallowing it", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () => ({
    ok: false,
    status: 403,
    json: async () => ({})
  });

  try {
    await assert.rejects(
      () => fetchAnimeDetail(504),
      (error) => {
        assert.equal(error.status, 403);
        return true;
      }
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
```

Each test uses a distinct numeric id (501-504) so the module-level cache from one test can't leak into another — `node:test` runs every test in this file in the same process, so the cache persists across tests.

The 404 and non-404 tests take roughly 3.5 seconds of real time each — see the Research Notes above for why (`fetchWithRetry`'s unmodified retry loop retries on every thrown error, including 404s, since `fetchAnimeDetail` calls it with the default `retries: 3`).

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test src/api/anilist.test.js`
Expected: FAIL — `fetchAnimeDetail is not defined` / import error, since it doesn't exist yet.

- [ ] **Step 3: Implement `fetchAnimeDetail`**

In `src/api/anilist.js`, change the cache declaration line:

```js
let genreListCache = null;
```

to:

```js
let genreListCache = null;
const detailCache = new Map();

const cacheDetail = (id, value) => {
  if (detailCache.size >= 30 && !detailCache.has(id)) {
    detailCache.delete(detailCache.keys().next().value);
  }
  detailCache.set(id, value);
};
```

Then, after `fetchCharacterDetail`'s closing `};` (the last function in the file), add:

```js

export const fetchAnimeDetail = async (id) => {
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    return null;
  }

  if (detailCache.has(numericId)) {
    return detailCache.get(numericId);
  }

  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        title { romaji english native }
        description(asHtml: false)
        bannerImage
        coverImage { extraLarge large color }
        format
        episodes
        duration
        status
        season
        seasonYear
        averageScore
        popularity
        source
        genres
        isAdult
        studios {
          edges {
            isMain
            node { id name }
          }
        }
        rankings { id rank type format year season allTime context }
        tags { id name rank isMediaSpoiler isGeneralSpoiler isAdult }
        relations {
          edges {
            id
            relationType
            node {
              id
              type
              format
              status
              title { romaji english native }
              coverImage { large color }
              isAdult
            }
          }
        }
        characters(sort: [ROLE, RELEVANCE], perPage: 8) {
          edges {
            id
            role
            node { id name { full native } image { large } }
            voiceActors { id name { full } languageV2 image { large } }
          }
        }
        staff(perPage: 6) {
          edges {
            id
            role
            node { id name { full } image { large } }
          }
        }
        recommendations(sort: RATING_DESC, perPage: 12) {
          nodes {
            id
            rating
            mediaRecommendation {
              id
              title { romaji english native }
              coverImage { large color }
              format
              isAdult
            }
          }
        }
        externalLinks { id url site type color icon }
        trailer { id site thumbnail }
      }
    }
  `;

  try {
    const result = await fetchWithRetry(query, { id: numericId });
    const media = result?.data?.Media ?? null;
    cacheDetail(numericId, media);
    return media;
  } catch (error) {
    if (error?.status === 404) {
      cacheDetail(numericId, null);
      return null;
    }
    throw error;
  }
};
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test src/api/anilist.test.js`
Expected: all tests PASS (the full file will take roughly 10-11 seconds total because of the two ~3.5s retry-delay tests plus the one pre-existing ~500ms retry test).

- [ ] **Step 5: Commit**

```bash
git add src/api/anilist.js src/api/anilist.test.js
git commit -m "feat: add fetchAnimeDetail with session cache and 404 handling"
```

---

## Task 3: `DetailStates.jsx` (loading / error / not-found) + CSS

**Files:**
- Create: `src/Detailpg/components/DetailStates.jsx`
- Modify: `src/components/styles/Detail.css` (append)

**Interfaces:**
- Consumes: `Link` from `react-router-dom`.
- Produces: three named exports — `DetailLoading` (no props), `DetailError` (`{ message, onRetry }`), `DetailNotFound` (no props). Consumed by Task 4's `Detail.jsx`.

- [ ] **Step 1: Write the component file**

```jsx
import { Link } from "react-router-dom";

export const DetailLoading = () => (
  <div className="detail-page">
    <div className="detail-load-banner detail-load-pulse" />
    <div className="detail-grid">
      <div className="detail-load-side detail-load-pulse" />
      <div className="detail-main">
        <div className="detail-load-bar detail-load-bar-title detail-load-pulse" />
        <div className="detail-load-bar detail-load-pulse" />
        <div className="detail-load-bar detail-load-pulse" />
        <div className="detail-load-bar detail-load-pulse" />
      </div>
    </div>
  </div>
);

export const DetailError = ({ message, onRetry }) => (
  <div className="detail-err-wrap">
    <h1 className="detail-err-heading">Something went wrong</h1>
    <p className="detail-err-message">{message}</p>
    <button type="button" className="detail-err-retry" onClick={onRetry}>
      Retry
    </button>
  </div>
);

export const DetailNotFound = () => (
  <div className="detail-404-wrap">
    <h1 className="detail-404-heading">Anime not found</h1>
    <p className="detail-404-message">We couldn&apos;t find the anime you&apos;re looking for.</p>
    <Link to="/" className="detail-404-link">
      Back to home
    </Link>
  </div>
);
```

`DetailLoading` deliberately reuses the existing `.detail-page`/`.detail-grid`/`.detail-main` classes (not new — these are structural layout classes already defined earlier in `Detail.css`) so the skeleton occupies exactly the same footprint as the real page without duplicating grid/sizing CSS.

- [ ] **Step 2: Append the state CSS to `Detail.css`**

Append after the final `.detail-main { min-width: 0; }` block (current end of file, line 597):

```css

.detail-load-banner {
  width: 100%;
  height: 400px;
  border-radius: 0;
  background: var(--color-surface);
}

@media (max-width: 900px) {
  .detail-load-banner {
    height: 200px;
  }
}

.detail-load-side {
  width: 100%;
  min-height: 420px;
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.detail-load-bar {
  width: 100%;
  height: 24px;
  border-radius: var(--radius-sm);
  background: var(--color-surface);
}

.detail-load-bar-title {
  height: 40px;
  max-width: 60%;
}

.detail-load-bar:nth-child(2) {
  max-width: 90%;
}

.detail-load-bar:nth-child(3) {
  max-width: 75%;
}

.detail-load-bar:nth-child(4) {
  max-width: 50%;
}

.detail-load-pulse {
  animation: detail-load-pulse-anim 1.8s ease-in-out infinite;
}

@keyframes detail-load-pulse-anim {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@media (prefers-reduced-motion: reduce) {
  .detail-load-pulse {
    animation: none;
  }
}

.detail-err-wrap,
.detail-404-wrap {
  max-width: 480px;
  margin: 0 auto;
  padding: var(--space-24) var(--space-6);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

.detail-err-heading,
.detail-404-heading {
  margin: 0;
  font-family: var(--font-heading);
  font-size: var(--fs-h2);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text);
}

.detail-err-message,
.detail-404-message {
  margin: 0;
  font-family: var(--font-body);
  font-size: var(--fs-body);
  color: var(--color-text-muted);
}

.detail-err-retry {
  font-family: var(--font-body);
  font-size: var(--fs-body);
  color: var(--color-bg);
  background: var(--color-accent-cyan);
  border: none;
  border-radius: var(--radius-pill);
  padding: var(--space-3) var(--space-8);
  cursor: pointer;
}

.detail-404-link {
  font-family: var(--font-body);
  font-size: var(--fs-body);
  color: var(--color-accent-cyan);
  text-decoration: underline;
}
```

- [ ] **Step 3: Verify with lint**

Run: `npm run lint`
Expected: no errors. (`DetailStates.jsx` isn't imported anywhere yet — expected until Task 4.)

- [ ] **Step 4: Commit**

```bash
git add src/Detailpg/components/DetailStates.jsx src/components/styles/Detail.css
git commit -m "feat: add Detail page loading, error, and not-found states"
```

---

## Task 4: Wire `Detail.jsx` to the live fetch

**Files:**
- Modify: `src/Detailpg/Detail.jsx` (full rewrite of the component body)

**Interfaces:**
- Consumes: `fetchAnimeDetail` (Task 2), `DetailLoading`/`DetailError`/`DetailNotFound` (Task 3).
- Produces: `Detail` default export, unchanged signature (no props — reads `useParams()` itself). This is the last task that touches page wiring.

- [ ] **Step 1: Replace the file contents**

Current `src/Detailpg/Detail.jsx`:

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

Replace it entirely with:

```jsx
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import "../components/styles/Detail.css";
import { fetchAnimeDetail } from "../api/anilist";
import DetailBanner from "./components/DetailBanner";
import DetailSidebar from "./components/DetailSidebar";
import DetailHeader from "./components/DetailHeader";
import DetailRelations from "./components/DetailRelations";
import DetailCharacters from "./components/DetailCharacters";
import DetailStaff from "./components/DetailStaff";
import DetailRecommendations from "./components/DetailRecommendations";
import DetailStreaming from "./components/DetailStreaming";
import DetailTrailer from "./components/DetailTrailer";
import { DetailLoading, DetailError, DetailNotFound } from "./components/DetailStates";

const Detail = () => {
  const { id } = useParams();
  const [media, setMedia] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const loadRef = useRef(() => {});

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setStatus("loading");
      setMedia(null);
      window.scrollTo(0, 0);

      try {
        const result = await fetchAnimeDetail(id);

        if (cancelled) {
          return;
        }

        if (result === null || result.isAdult === true) {
          setStatus("notfound");
          return;
        }

        setMedia(result);
        setStatus("ready");
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error.message);
          setStatus("error");
        }
      }
    };

    loadRef.current = load;
    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status === "loading") {
    return <DetailLoading />;
  }

  if (status === "error") {
    return <DetailError message={errorMessage} onRetry={() => loadRef.current()} />;
  }

  if (status === "notfound") {
    return <DetailNotFound />;
  }

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

**Design note on the Retry button:** the effect's dependency array is exactly `[id]`, per spec. Retry doesn't add a second dependency (which would refetch on every retry-triggered state change and complicate the stale-guard reasoning) — instead the effect stores its own `load` closure into `loadRef.current` every time it runs, and the Retry button calls `loadRef.current()` directly. Since `cancelled` only flips to `true` on unmount or on `id` changing (the effect's cleanup), calling the retained `load()` again while still on the same `id` correctly reuses the same guard and updates state normally.

- [ ] **Step 2: Verify with lint and build**

Run: `npm run lint`
Expected: no errors — in particular, no `react-hooks/exhaustive-deps` warning (the effect only reads `id` from component scope; `fetchAnimeDetail` is a module-level import and `loadRef`/state setters are refs/stable setters, neither of which the rule requires in the dependency array).

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/Detailpg/Detail.jsx
git commit -m "feat: wire Detail page to live AniList data with loading, error, and not-found states"
```

---

## Task 5: Full verification pass

**Files:** none (verification only — fix-forward if any check fails, then re-verify).

- [ ] **Step 1: Run the full automated suite**

Run: `npm run lint` — expect no errors.
Run: `npm run build` — expect success.
Run: `node --test` — expect every test to pass, including the three pre-existing tests untouched by this plan (`fetchWithRetry retries after a transient failure`, `fetchCharacterDetail requests media edges with voice actors and format`) alongside all Task 1/2 additions. Total runtime will be roughly 10-11 seconds due to the retry-delay tests noted in the Research Notes.

- [ ] **Step 2: Start the dev server**

Run: `npm run dev` in the background. Note whatever port Vite actually reports (it falls back past 5173 if occupied).

- [ ] **Step 3: Walk every acceptance check using the Playwright MCP browser tools**

Use the ids verified live against AniList during planning (Research Notes above) — do not substitute the spec's own example id, `12345`, since it 404s on the real API.

- **A/B.** `npm run lint` and `npm run build` — already run in Step 1; confirm both were clean.
- **C.** Navigate to `/anime/20596` (Ao Haru Ride). Take a snapshot and read console messages at `warning` level — confirm 0 errors, 0 warnings, and specifically no duplicate-key warnings across any section.
- **D.** Use `browser_network_requests` (or the Network tab) — confirm exactly one request to `graphql.anilist.co` for this page load.
- **E.** Click a rendered `.detail-rec-card` (any of orange/Kimi ni Todoke/Horimiya). Confirm the URL changes to `/anime/<that id>` and the title, sidebar stats, and character grid all change to the new anime's data (not stale).
- **F.** Immediately after E, check `window.scrollY === 0`.
- **G.** Use `browser_navigate_back`. Confirm the page re-renders Ao Haru Ride's data correctly (not blank, not stale from the recommendation).
- **H.** From `/anime/20596`, rapid-fire click two different recommendation cards in quick succession (don't await between clicks). Confirm the final rendered title matches whatever id is in the address bar once things settle — never a mismatch. This exercises the `cancelled`-flag guard from Task 4.
- **I.** Revisit `/anime/20596` a second time (already viewed in this session). Confirm via `browser_network_requests` that no new `graphql.anilist.co` request fires, and the page renders without a loading-skeleton flash (cache hit).
- **J.** Navigate to `/anime/999999999`. Confirm `DetailNotFound` renders (not a crash, not a stuck skeleton) — check for the "Anime not found" heading and a link back to `/`.
- **K.** Navigate to `/anime/abc`. Confirm `DetailNotFound` renders, and confirm via `browser_network_requests` that no request to `graphql.anilist.co` was made (the `Number.isInteger` guard in `fetchAnimeDetail` should reject it before any fetch).
- **L.** Use `browser_evaluate` or DevTools protocol to simulate offline (or point at an unreachable host briefly) and reload `/anime/20596`. Confirm `DetailError` renders with a non-empty message. Restore connectivity, click the Retry button, and confirm the real page loads afterward — this proves `loadRef.current()` genuinely re-triggers the fetch rather than being decorative.
- **M.** Navigate to `/anime/21` (ONE PIECE, `episodes: null`, currently airing) — confirm no "null"/"undefined" text renders anywhere (the `DetailSidebar` stats list already filters out null/undefined/empty-string values, so a null `episodes` should simply not produce an "Episodes" row) and no collapsed layout. Navigate to `/anime/21519` (Kimi no Na wa., a movie) — same check. Navigate to `/anime/10342` (Tetsuwan Atom: Uchuu no Yuusha, 1964 — null `bannerImage`, 1 tag) — confirm the banner falls back to a flat color background (per `DetailBanner`'s existing `color` fallback) rather than breaking, and confirm the tags panel renders its single tag without an odd empty state.
- **N.** Navigate to `/anime/16159` (no trailer, no external links at all). Confirm neither a "Watch Officially" heading nor a "Trailer" heading renders anywhere on the page.
- **O.** Resize to 375px width on `/anime/20596`. Confirm `document.documentElement.scrollWidth === document.documentElement.clientWidth` (no page-level horizontal scroll) — this should already hold given the Phase 3 `.detail-main { min-width: 0; }` fix, but confirm it still holds with real (longer/shorter) live data.

- [ ] **Step 4: Fix anything that fails, re-run the affected checks**

No code is pre-written for this step — if a check fails, identify which task's file is responsible, fix it there, and re-verify that specific check plus Step 1's automated suite.

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix: address Detail page phase 4 acceptance check findings"
```

If Step 4 required no changes, skip this commit.

---

## Task 6: Delete the fixture

**Files:**
- Delete: `src/Detailpg/detailFixture.js`

**Preconditions:** every check in Task 5 (A through O) passed. If any did not, stop — do not delete the fixture.

- [ ] **Step 1: Confirm nothing still imports the fixture**

Run: `grep -rn "detailFixture" src/`
Expected: no matches (Task 4 already removed the only import).

- [ ] **Step 2: Delete the file**

```bash
git rm src/Detailpg/detailFixture.js
```

- [ ] **Step 3: Confirm the build still succeeds**

Run: `npm run build`
Expected: success — this proves nothing else in the codebase referenced the fixture.

- [ ] **Step 4: Commit**

```bash
git commit -m "chore: remove Detail page fixture now that live data is wired up"
```

---

## Self-Review Notes

- **Spec coverage:** Requirement 1 (status code) → Task 1. Requirement 2 (`fetchAnimeDetail`, guard, query, 404, cache) → Task 2. Requirement 3 (state components) → Task 3. Requirement 4 (wiring, stale guard, scroll reset, branching) → Task 4. Requirement 5 (CSS) → Task 3. Requirement 6 (tests) → Tasks 1 and 2. Acceptance checks A-O → Task 5, each mapped to a specific verified AniList id. Requirement "delete the fixture" → Task 6, gated on Task 5 passing.
- **Placeholder scan:** no TBD/TODO markers; every code step has literal, complete code; every verification step names the exact command or a concrete real AniList id (no invented/unverified ids — all were queried live against the real API during planning).
- **Type/name consistency:** `fetchAnimeDetail(id)` (Task 2) is called identically in Task 4 as `fetchAnimeDetail(id)`. `DetailLoading`/`DetailError`/`DetailError`'s `{ message, onRetry }`/`DetailNotFound` (Task 3) are imported and used with matching prop names in Task 4 (`message={errorMessage}`, `onRetry={() => loadRef.current()}`). The query field selection in Task 2 was cross-checked against every existing child component's actual property reads (see Research Notes) rather than copied blind from the spec, confirming no child component needs to change.
- **Corrected discrepancy:** the task prompt's acceptance check C example id (`/anime/12345`, described as "Ao Haru Ride") does not exist on the real AniList API (confirmed 404 via a live query during planning). The real Ao Haru Ride id is `20596`, used throughout Task 5 instead.
