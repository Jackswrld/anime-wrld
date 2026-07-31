# Anime Wrld — Project Context

## What this is

Anime Wrld is a React anime **discovery and showcase** platform. It surfaces
metadata, characters, trending titles, and a genre browser.

**It is not a streaming site.** Never add video players, episode streams,
"watch now" links, or anything implying playback.

Built with a production mindset — stability and maintainability matter now,
not later.

---

## Stack

- React (Vite)
- Plain CSS — **no component libraries**, no Tailwind, no styled-components
- AniList GraphQL API (migrated from Jikan/MyAnimeList)
- Deployed on Vercel
- Tests: Node's native `node:test` + `assert/strict`. No Jest, no Vitest.

---

## Design system

All colors and spacing go through custom properties in `tokens.css`.
**A hardcoded hex value in a component stylesheet is a bug** — use the token.

| Token | Value | Use |
|---|---|---|
| Midnight Navy | `#0A0E2A` | background |
| Cyan | `#00F0FF` | primary accent |
| Hot Pink | `#FF2D78` | secondary accent |
| Soft White | `#F0F8FF` | text |
| Cool Grey | `#8892B0` | muted text |

Fonts: **Cinzel 700** for headings, **DM Sans** for body.

**Exception:** ambient glow `rgba()` values inside gradients are intentionally
left as literals. They're atmospheric texture, not brand color. Do not
"consolidate" them into tokens.

### CSS conventions

Every class is prefixed by its component — `navbar-`, `trending-`, `fac-`, etc.
New components follow the same pattern. No generic class names like `.card`,
`.container`, `.wrapper`.

---

## AniList API — known gotchas

These have each caused a real bug. Read before touching data-fetching code.

1. **Genre filtering is OR server-side.** Passing multiple genres returns
   anime matching *any* of them. Multi-genre AND logic requires the
   client-side filter step — `filterAnimeByAllGenres` in `worldsGenreUtils.js`.

2. **`voiceActors(language: X)` does not reliably filter.** Known AniList bug.
   The Sub/Dub split was abandoned because of it — we display a single primary
   voice actor. Don't reintroduce language filtering.

3. **AniList IDs are not MAL IDs.** Any dedup or caching logic keyed on
   `mal_id` is broken. Use AniList's own `id`.

4. **`GenreCollection` returns plain strings**, not objects. Anything expecting
   `{ id, name }` will break.

5. **Hentai is excluded** — case-insensitive filter in `filterVisibleGenres`.
   This deliberately reverses the old Jikan behavior. Do not remove it.

6. **`pageInfo.hasNextPage`** from the query must drive pagination state.
   Never hardcode it.

---

## Testing

`anilist.test.js` guards retry and fetch logic against regressions.

**After any edit to `anilist.js`, run the test suite.** No exceptions —
this file has broken silently before.

```bash
node --test
```

---

## Deployment

SPA routing on Vercel requires a rewrite rule in `vercel.json` sending all
paths to `index.html`. Without it, hard-refreshing any sub-route 404s.
Don't remove or "clean up" that rule.

---

## Page-specific rules

### Anime A–Z (`src/Animepg/Anime.jsx`, `src/components/styles/Anime.css`)

Keep it **plain and minimal**. Dense two-column text list of titles only.

Do not add: cards, glassmorphism, thumbnails, hover effects, extra padding,
or any visual flourish — unless explicitly asked for in that session.

Sort is `TITLE_ROMAJI` ascending. Date-based sorts break letter filtering,
because the query fetches a page *then* filters client-side by letter — a
date sort returns 25 arbitrary titles and most letters come back empty.

> ⚠️ File paths are `src/Animepg/`, **not** `src/pages/Animes/`.

---

## How to work on this project

**Plan before editing.** For anything beyond a one-line change, describe what
you'd change and in which files, and wait for confirmation before writing.

**Stay in scope.** Touch only the files relevant to the task. Don't refactor
adjacent code, rename things, reformat, or "improve" what you weren't asked
about. If you spot something worth fixing, mention it — don't fix it.

**Small tasks over large drops.** UI first with mock data, then wire the real
API. Verify one section works before starting the next.

**Flag tradeoffs proactively.** Surface edge cases, security concerns, and
scalability risks before implementing, not after. Say why you'd recommend
something, not just what.

**Disagree once.** If the approach seems wrong, say so briefly, then build it
as asked. Don't relitigate.
