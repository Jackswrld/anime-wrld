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
const detailCache = new Map();

const cacheDetail = (id, value) => {
  if (detailCache.size >= 30 && !detailCache.has(id)) {
    detailCache.delete(detailCache.keys().next().value);
  }
  detailCache.set(id, value);
};

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
        const error = new Error(`Request failed with status ${response.status}`);
        error.status = response.status;
        throw error;
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

export const fetchLatestReleases = async () => {
  const query = `
    query {
      Page(page: 1, perPage: 24) {
        media(
          type: ANIME
          sort: TRENDING_DESC
          status: RELEASING
          format_in: [TV, TV_SHORT, ONA]
          isAdult: false
        ) {
          id
          title { romaji english }
          coverImage { extraLarge large }
          episodes
          nextAiringEpisode { episode airingAt }
        }
      }
    }
  `;

  const result = await fetchWithRetry(query, {});
  return result?.data?.Page?.media ?? [];
};

export const fetchHeroAnime = async () => {
  const query = `
    query {
      Page(page: 1, perPage: 20) {
        media(
          type: ANIME
          sort: TRENDING_DESC
          status: RELEASING
          format_in: [TV, TV_SHORT, ONA]
          isAdult: false
        ) {
          id
          title { romaji english }
          bannerImage
          coverImage { extraLarge }
          averageScore
          seasonYear
          format
          duration
          genres
          description(asHtml: false)
          studios(isMain: true) { nodes { name } }
        }
      }
    }
  `;

  const result = await fetchWithRetry(query, {});
  return result?.data?.Page?.media ?? [];
};

export const selectHeroSlides = (mediaArray, limit = 5) => {
  if (!Array.isArray(mediaArray)) {
    return [];
  }

  return mediaArray
    .filter((media) => typeof media?.bannerImage === "string" && media.bannerImage.length > 0)
    .slice(0, limit);
};

export const fetchAnimeByGenres = async (genres = [], page = 1, perPage = 20) => {
  const query = `
    query ($genres: [String!], $page: Int!, $perPage: Int!) {
      Page(page: $page, perPage: $perPage) {
        media(genre_in: $genres, type: ANIME, sort: POPULARITY_DESC) {
          ${MEDIA_FIELDS}
        }
        pageInfo {
          hasNextPage
          total
          currentPage
        }
      }
    }
  `;

  const result = await fetchWithRetry(query, { genres, page, perPage });
  return {
    media: result?.data?.Page?.media ?? [],
    pageInfo: result?.data?.Page?.pageInfo ?? { hasNextPage: false },
  };
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
