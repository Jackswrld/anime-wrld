const CHARACTER_API_URL = "https://api.jikan.moe/v4/characters";

export const fetchCharactersPage = async (page, signal) => {
  const response = await fetch(
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
  const response = await fetch(`${CHARACTER_API_URL}/${mal_id}/full`);

  if (!response.ok) {
    throw new Error("Failed to fetch character detail");
  }

  const json = await response.json();
  return json.data || null;
};
