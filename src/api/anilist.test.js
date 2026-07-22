import test from "node:test";
import assert from "node:assert/strict";

import { fetchCharacterDetail, fetchWithRetry } from "./anilist.js";

test("fetchWithRetry retries after a transient failure", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;

  globalThis.fetch = async () => {
    calls += 1;

    if (calls === 1) {
      return {
        ok: false,
        status: 500,
        json: async () => ({})
      };
    }

    return {
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          GenreCollection: ["Action"]
        }
      })
    };
  };

  try {
    const result = await fetchWithRetry("query { GenreCollection }", {});
    assert.equal(calls, 2);
    assert.deepEqual(result.data.GenreCollection, ["Action"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("fetchCharacterDetail requests media edges with voice actors and format", async () => {
  const originalFetch = globalThis.fetch;
  let capturedPayload = null;

  globalThis.fetch = async (_url, options) => {
    capturedPayload = JSON.parse(options.body);

    return {
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          Character: {
            id: 1,
            name: { full: "Test" },
            image: { large: "" },
            description: "",
            media: { edges: [] }
          }
        }
      })
    };
  };

  try {
    await fetchCharacterDetail(1);
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.ok(capturedPayload?.query?.includes("media {"));
  assert.ok(capturedPayload?.query?.includes("edges {"));
  assert.ok(capturedPayload?.query?.includes("voiceActors {"));
  assert.ok(!capturedPayload?.query?.includes("voiceActorsJapanese"));
  assert.ok(!capturedPayload?.query?.includes("voiceActorsEnglish"));
  assert.ok(!capturedPayload?.query?.includes("language:"));
  assert.ok(capturedPayload?.query?.includes("format"));
  assert.ok(capturedPayload?.query?.includes("node {"));
});
