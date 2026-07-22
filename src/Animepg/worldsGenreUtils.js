export const filterVisibleGenres = (genres = []) =>
  (Array.isArray(genres) ? genres : [])
    .filter((genre) => typeof genre === "string")
    .map((genre) => genre.trim())
    .filter(Boolean)
    .filter((genre) => genre.toLowerCase() !== "hentai");

export const filterAnimeByAllGenres = (animeList = [], selectedGenres = []) => {
  const normalizedSelectedGenres = (Array.isArray(selectedGenres) ? selectedGenres : [])
    .map((genre) => genre?.toString().trim())
    .filter(Boolean);

  if (normalizedSelectedGenres.length === 0) {
    return Array.isArray(animeList) ? animeList : [];
  }

  return (Array.isArray(animeList) ? animeList : []).filter((anime) => {
    const animeGenres = (Array.isArray(anime?.genres) ? anime.genres : [])
      .map((genre) => genre?.toString().trim())
      .filter(Boolean);

    return normalizedSelectedGenres.every((genre) => animeGenres.includes(genre));
  });
};
