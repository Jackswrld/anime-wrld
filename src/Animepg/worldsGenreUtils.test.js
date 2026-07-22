import test from "node:test";
import assert from "node:assert/strict";

import { filterAnimeByAllGenres, filterVisibleGenres } from "./worldsGenreUtils.js";

test("filterVisibleGenres removes hentai while keeping other genres", () => {
  const genres = ["Action", "Hentai", "Romance", "hentai", "Fantasy"];

  assert.deepEqual(filterVisibleGenres(genres), ["Action", "Romance", "Fantasy"]);
});

test("filterVisibleGenres handles empty and non-string values", () => {
  assert.deepEqual(filterVisibleGenres(["Action", null, "", "  "]), ["Action"]);
});

test("filterAnimeByAllGenres keeps anime that include every selected genre", () => {
  const results = [
    { id: 1, genres: ["Action", "Adventure", "Fantasy"] },
    { id: 2, genres: ["Action", "Comedy"] },
    { id: 3, genres: ["Action", "Adventure"] },
    { id: 4, genres: ["Adventure", "Fantasy"] },
  ];

  assert.deepEqual(filterAnimeByAllGenres(results, ["Action", "Adventure"]), [
    { id: 1, genres: ["Action", "Adventure", "Fantasy"] },
    { id: 3, genres: ["Action", "Adventure"] },
  ]);
});
