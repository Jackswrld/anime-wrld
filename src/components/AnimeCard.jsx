import "./styles/AnimeCard.css";

const getBadgeText = (anime, badgeMode) => {
  if (badgeMode === "current") {
    if (!anime.nextAiringEpisode) {
      return null;
    }

    const lastAiredEpisode = anime.nextAiringEpisode.episode - 1;
    return lastAiredEpisode >= 1 ? `EP ${lastAiredEpisode}` : null;
  }

  if (badgeMode === "total") {
    return anime.episodes != null ? `${anime.episodes} EP` : null;
  }

  return null;
};

const AnimeCard = ({ anime, badgeMode }) => {
  const title = anime.title?.english ?? anime.title?.romaji ?? "Untitled";
  const image = anime.coverImage?.extraLarge ?? anime.coverImage?.large ?? "";
  const badgeText = getBadgeText(anime, badgeMode);

  return (
    <button type="button" className="anime-card">
      {image ? (
        <img className="anime-card-image" src={image} alt="" />
      ) : (
        <div className="anime-card-image-placeholder" aria-hidden="true" />
      )}
      {badgeText && <span className="anime-card-badge">{badgeText}</span>}
      <div className="anime-card-overlay">
        <h3 className="anime-card-title">{title}</h3>
      </div>
    </button>
  );
};

export default AnimeCard;
