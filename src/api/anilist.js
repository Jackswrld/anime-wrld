const GRAPHQL_ENDPOINT = "https://graphql.anilist.co";
const MEDIA_FIELDS = `
  id
  title { romaji english }
  coverImage { large extraLarge }
  genres
  startDate { year month day }
  averageScore
  episodes
`;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let genreListCache = null;

export const fetchWithRetry = async (query, variables = {}, retries = 3) => {
  const payload = {
    query,
    variables,
  };

  let attempt = 0;

  while (attempt <= retries) {
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
        if (attempt < retries) {
          const backoffMs = 500 * 2 ** attempt;
          await delay(backoffMs);
          attempt += 1;
          continue;
        }

        throw new Error("AniList API is currently unavailable, please try again later");
      }

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const json = await response.json();

      if (json.errors?.length) {
        throw new Error(json.errors[0].message || "AniList GraphQL request failed");
      }

      return json;
    } catch (error) {
      if (error?.name === "AbortError") {
        throw error;
      }

      if (attempt >= retries) {
        throw error;
      }

      const backoffMs = 500 * 2 ** attempt;
      await delay(backoffMs);
      attempt += 1;
    }
  }

  throw new Error("AniList request failed");
};

export const fetchTrendingAnime = async (page = 1, perPage = 20) => {
  const query = `
    query ($page: Int!, $perPage: Int!) {
      Page(page: $page, perPage: $perPage) {
        media(sort: TRENDING_DESC, type: ANIME) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;

  const result = await fetchWithRetry(query, { page, perPage });
  return result?.data?.Page?.media ?? [];
};

export const fetchAnimeByGenres = async (genres = [], page = 1, perPage = 20) => {
  const query = `
    query ($genres: [String!], $page: Int!, $perPage: Int!) {
      Page(page: $page, perPage: $perPage) {
        media(genre_in: $genres, type: ANIME, sort: START_DATE_DESC) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;

  const result = await fetchWithRetry(query, { genres, page, perPage });
  return result?.data?.Page?.media ?? [];
};

export const fetchGenreList = async () => {
  if (genreListCache !== null) {
    return genreListCache;
  }

  const query = `
    query {
      GenreCollection
    }
  `;

  const result = await fetchWithRetry(query, {});
  genreListCache = result?.data?.GenreCollection ?? [];
  return genreListCache;
};

export const fetchCharactersPage = async (page = 1, perPage = 20) => {
  const query = `
    query ($page: Int!, $perPage: Int!) {
      Page(page: $page, perPage: $perPage) {
        characters(sort: FAVOURITES_DESC) {
          id
          name {
            full
          }
          image {
            large
          }
          favourites
        }
      }
    }
  `;

  const result = await fetchWithRetry(query, { page, perPage });
  return result?.data?.Page?.characters ?? [];
};

export const fetchCharacterDetail = async (id) => {
  const query = `
    query ($id: Int) {
      Character(id: $id) {
        id
        name { full }
        image { large }
        description
        media {
          edges {
            voiceActors {
              name { full }
              image { large }
            }
            node {
              title { romaji }
              format
            }
          }
        }
      }
    }
  `;

  const result = await fetchWithRetry(query, { id });
  return result?.data?.Character ?? null;
};
