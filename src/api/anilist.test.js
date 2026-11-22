import test from "node:test";
import assert from "node:assert/strict";

import { fetchAnimeDetail, fetchCharacterDetail, fetchWithRetry } from "./anilist.js";

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
