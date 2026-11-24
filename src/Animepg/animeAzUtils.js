// Helpers for the Anime A–Z page.
//
// AniList won't page deeper than 5,000 entries, has no "title starts with"
// filter, and rate-limits hard (each lookup counts, even inside one request).
// So we jump to the page where a letter starts using a stored hint, and only
// search (with ordinary, cacheable 50-title pages) if that hint has drifted.

const isStandardLetter = (character) => /^[A-Z]$/.test(character);

// "A"–"Z" for Latin titles, "#" for digits/symbols/non-Latin, null for junk titles.
export const getTitleLetter = (title) => {
  if (typeof title !== "string") {
    return null;
  }

  const trimmed = title.trim();
  if (trimmed === "" || /^\.+$/.test(trimmed.replace(/\s/g, ""))) {
    return null;
  }

  const first = trimmed.charAt(0).toUpperCase();
  return isStandardLetter(first) ? first : "#";
};

const standardLetters = (media) =>
  media.map((item) => getTitleLetter(item?.title?.romaji)).filter((letter) => isStandardLetter(letter ?? ""));

// Returns the first page that contains titles starting with `letter`.
// `getPage(page)` resolves to that page's media (an empty array past the end).
// With a correct `hint` this costs exactly one page request.
export const findLetterStartPage = async (letter, getPage, { hint, maxPage = 100 } = {}) => {
  if (!isStandardLetter(letter)) {
    return 1;
  }

  const info = new Map();
  const inspect = async (page) => {
    if (!info.has(page)) {
      const media = await getPage(page);
      const letters = standardLetters(media);
      info.set(page, {
        // "Reached" = this page already gets to `letter` (or is past the end of the list).
        reached: letters.length === 0 ? media.length === 0 : letters[letters.length - 1] >= letter,
        startsBefore: letters.length > 0 && letters[0] < letter,
      });
    }
    return info.get(page);
  };

  let lo = 0; // last page known not to reach the letter
  let hi = maxPage + 1; // first page known to reach it

  if (!Number.isInteger(hint)) {
    return binarySearch(lo, hi, inspect, maxPage);
  }

  const start = Math.min(Math.max(hint, 1), maxPage);
  const first = await inspect(start);

  // Common case: the hint page reaches the letter and begins before it, so the letter starts here.
  if (first.reached && (first.startsBefore || start === 1)) {
    return start;
  }

  // Gallop away from the hint to bracket the boundary.
  if (first.reached) {
    hi = start;
    for (let step = 1; hi - step >= 1; step *= 2) {
      const page = hi - step;
      if ((await inspect(page)).reached) {
        hi = page;
      } else {
        lo = page;
        break;
      }
    }
  } else {
    lo = start;
    for (let step = 1; lo + step <= maxPage; step *= 2) {
      const page = lo + step;
      if ((await inspect(page)).reached) {
        hi = page;
        break;
      }
      lo = page;
    }
  }

  return binarySearch(lo, hi, inspect, maxPage);
};

// First page in (lo, hi] that reaches the letter; lo doesn't, hi does (or is past the end).
async function binarySearch(lo, hi, inspect, maxPage) {
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if ((await inspect(mid)).reached) {
      hi = mid;
    } else {
      lo = mid;
    }
  }

  return Math.min(hi, maxPage);
}

// First page (50 titles each) where each letter begins in the filtered A–Z list.
// Measured from AniList on 2026-11-24 (4,791 titles over 96 pages). These are
// only starting points: if AniList's data shifts, findLetterStartPage walks to
// the right page from here, so a stale table costs a few extra requests, not
// wrong results.
export const AZ_LETTER_START_HINTS = {
  A: 1, B: 6, C: 12, D: 15, E: 20, F: 21, G: 24, H: 29, I: 35, J: 37, K: 39, L: 49, M: 51,
  N: 58, O: 62, P: 66, Q: 69, R: 69, S: 71, T: 82, U: 89, V: 90, W: 91, X: 92, Y: 92, Z: 96,
};
