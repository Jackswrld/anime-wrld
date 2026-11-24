import test from "node:test";
import assert from "node:assert/strict";

import { AZ_LETTER_START_HINTS, findLetterStartPage, getTitleLetter } from "./animeAzUtils.js";

const PER_PAGE = 50;

// A fake alphabetical catalogue: 60 symbol titles, then uneven blocks per letter.
const sizes = { A: 400, B: 250, C: 200, D: 180, E: 120, F: 150, G: 200, H: 260, I: 150, J: 120, K: 380, L: 120, M: 330, N: 250, O: 260, P: 80, Q: 10, R: 130, S: 600, T: 330, U: 90, V: 40, W: 90, X: 10, Y: 120, Z: 40 };
const catalogue = [
  ...Array.from({ length: 60 }, (_, i) => `${i} Digit Title`),
  ...Object.entries(sizes).flatMap(([letter, count]) =>
    Array.from({ length: count }, (_, i) => `${letter}${String(i).padStart(3, "0")} Fake`)
  ),
];

const makePages = (titles) => {
  const calls = [];
  const getPage = async (page) => {
    calls.push(page);
    return titles.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((romaji) => ({ title: { romaji } }));
  };
  return { getPage, calls };
};

const truePage = (letter) => Math.floor(catalogue.findIndex((title) => title.startsWith(letter)) / PER_PAGE) + 1;

test("getTitleLetter maps titles to A-Z, # for others, and null for junk", () => {
  assert.equal(getTitleLetter("Naruto"), "N");
  assert.equal(getTitleLetter("  one piece"), "O");
  assert.equal(getTitleLetter("86"), "#");
  assert.equal(getTitleLetter("Ōkami"), "#");
  assert.equal(getTitleLetter("..."), null);
  assert.equal(getTitleLetter(""), null);
  assert.equal(getTitleLetter(null), null);
});

test("findLetterStartPage costs a single page request when the hint is right", async () => {
  for (const letter of ["K", "S", "Z"]) {
    const { getPage, calls } = makePages(catalogue);
    const page = await findLetterStartPage(letter, getPage, { hint: truePage(letter) });

    assert.equal(page, truePage(letter), letter);
    // One request, plus one more only when the letter begins exactly at the top of
    // its page (S here), where the previous page has to be checked too.
    assert.equal(calls[0], truePage(letter));
    assert.ok(calls.length <= 2, `${letter}: ${calls.length} requests`);
    if (letter !== "S") {
      assert.equal(calls.length, 1, `${letter} should only fetch its own page`);
    }
  }
});

test("findLetterStartPage needs one extra page for A, whose previous page is all symbols", async () => {
  const { getPage, calls } = makePages(catalogue);
  assert.equal(await findLetterStartPage("A", getPage, { hint: truePage("A") }), truePage("A"));
  assert.ok(calls.length <= 2, `A: ${calls.length} requests`);
});

test("findLetterStartPage recovers cheaply when the hint has drifted", async () => {
  for (const [letter, drift] of [["K", 2], ["K", -2], ["M", 9], ["D", -7]]) {
    const { getPage, calls } = makePages(catalogue);
    const page = await findLetterStartPage(letter, getPage, { hint: truePage(letter) + drift });

    assert.equal(page, truePage(letter), `${letter} drift ${drift}`);
    assert.ok(calls.length <= 8, `${letter} drift ${drift}: ${calls.length} requests`);
  }
});

test("findLetterStartPage finds every letter with no hint at all", async () => {
  for (const letter of Object.keys(sizes)) {
    const { getPage, calls } = makePages(catalogue);
    assert.equal(await findLetterStartPage(letter, getPage, { maxPage: 100 }), truePage(letter), letter);
    assert.ok(calls.length <= 8, `${letter}: ${calls.length} requests`);
  }
});

test("findLetterStartPage handles a hint past the end of the list", async () => {
  const { getPage } = makePages(catalogue);
  assert.equal(await findLetterStartPage("Z", getPage, { hint: 100 }), truePage("Z"));
});

test("findLetterStartPage returns page 1 for # without fetching", async () => {
  const { getPage, calls } = makePages(catalogue);
  assert.equal(await findLetterStartPage("#", getPage, { hint: 40 }), 1);
  assert.equal(calls.length, 0);
});

test("findLetterStartPage ignores non-Latin titles mixed into the sort order", async () => {
  const withNoise = catalogue.map((title, i) => (i > 60 && i % 7 === 0 ? "Ōkami Noise" : title));
  const { getPage } = makePages(withNoise);
  const page = await findLetterStartPage("M", getPage, { hint: 20 });
  const expected = Math.floor(withNoise.findIndex((title) => title.startsWith("M")) / PER_PAGE) + 1;

  assert.equal(page, expected);
});

test("AZ_LETTER_START_HINTS covers A-Z with page numbers in alphabetical order", () => {
  const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  assert.deepEqual(Object.keys(AZ_LETTER_START_HINTS).sort(), letters);

  letters.forEach((letter, i) => {
    const page = AZ_LETTER_START_HINTS[letter];
    assert.ok(Number.isInteger(page) && page >= 1 && page <= 100, `${letter}: ${page}`);
    if (i > 0) {
      assert.ok(page >= AZ_LETTER_START_HINTS[letters[i - 1]], `${letter} comes before ${letters[i - 1]}`);
    }
  });
});
