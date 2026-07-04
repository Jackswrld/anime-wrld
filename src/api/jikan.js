const CHARACTER_API_URL = "https://api.jikan.moe/v4/characters";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchWithRetry = async (url, options = {}, retries = 3) => {
  try {
    const response = await fetch(url, options);

    if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
      if (retries > 0) {
        const backoffMs = [1000, 2000, 4000][3 - retries] ?? 4000;
        await delay(backoffMs);
        return fetchWithRetry(url, options, retries - 1);
      }

      throw new Error("Jikan API is currently unavailable, please try again later");
    }

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw error;
    }

    throw error;
  }
};

export const fetchCharactersPage = async (page, signal) => {
  const response = await fetchWithRetry(
    `${CHARACTER_API_URL}?page=${page}&limit=20&order_by=favorites&sort=desc`,
    { signal }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch characters");
  }

  const json = await response.json();
  return json.data || [];
};

export const fetchCharacterDetail = async (mal_id) => {
  const response = await fetchWithRetry(`${CHARACTER_API_URL}/${mal_id}/full`);

  if (!response.ok) {
    throw new Error("Failed to fetch character detail");
  }

  const json = await response.json();
  return json.data || null;
};

export const fetchTrendingAnime = async (signal) => {
  const response = await fetchWithRetry(
    "https://api.jikan.moe/v4/top/anime?limit=3",
    { signal }
  );

  const json = await response.json();

  return (json.data || []).map((item, index) => ({
    mal_id: item.mal_id,
    title: item.title,
    image: item.images?.jpg?.large_image_url ?? "",
    genres: item.genres?.slice(0, 2).map((genre) => genre.name) ?? ["Unknown"],
    score: item.score ?? "N/A",
    synopsis: item.synopsis ?? "",
    rank: index + 1,
  }));
};
