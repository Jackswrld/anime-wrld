import { useEffect, useRef, useState } from "react";
import "./styles/FAC.css";
import { fetchCharacterDetail, fetchCharactersPage } from "../api/jikan";

const CHARACTER_PAGE_LIMIT = 20;

const splitSentences = (text) =>
  String(text)
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

const findSentences = (text, keywords) => {
  const normalized = String(text).trim();
  return splitSentences(normalized).filter((sentence) =>
    keywords.some((keyword) => sentence.toLowerCase().includes(keyword))
  );
};

const buildCharacterItem = (item) => ({
  mal_id: item.mal_id,
  name: item.name,
  image: item.images?.jpg?.image_url ?? "",
  favorites: item.favorites ?? 0,
  about: item.about ?? "",
});

const FAC = () => {
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detailError, setDetailError] = useState(null);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    let timeoutId;

    const loadCharacters = async () => {
      try {
        setLoading(true);
        setError(null);

        await new Promise((resolve) => {
          timeoutId = window.setTimeout(resolve, 300);
        });

        const data = await fetchCharactersPage(page, controller.signal);
        const nextCharacters = data.map(buildCharacterItem);

        setCharacters((prev) => [...prev, ...nextCharacters]);

        if (nextCharacters.length < CHARACTER_PAGE_LIMIT) {
          setHasMore(false);
        }
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setError("Failed to load characters.");
          setHasMore(false);
        }
      } finally {
        if (timeoutId) {
          window.clearTimeout(timeoutId);
        }
        setLoading(false);
      }
    };

    loadCharacters();

    return () => {
      controller.abort();
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [page]);

  useEffect(() => {
    if (!sentinelRef.current) {
      return;
    }

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (!hasMore) {
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && hasMore && !loading) {
          setPage((currentPage) => currentPage + 1);
        }
      },
      { root: null, rootMargin: "200px", threshold: 0.1 }
    );

    observerRef.current.observe(sentinelRef.current);

    return () => observerRef.current?.disconnect();
  }, [hasMore, loading]);

  const loadCharacterDetail = async (character) => {
    if (detailLoading || selectedCharacter?.mal_id === character.mal_id) {
      return;
    }

    setDetailLoading(true);
    setDetailError(null);
    setAboutExpanded(false);

    try {
      const detail = await fetchCharacterDetail(character.mal_id);
      setSelectedCharacter({
        ...character,
        ...detail,
      });
    } catch {
      setSelectedCharacter(null);
      setDetailError("Could not load character details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const renderDetailContent = () => {
    if (detailLoading) {
      return (
        <div className="fac-detail-skeleton">
          <div className="fac-detail-skeleton-image" />
          <div className="fac-detail-body">
            <div className="fac-detail-skeleton-line title" />
            <div className="fac-detail-skeleton-line meta" />
            <div className="fac-detail-skeleton-line meta" />
            <div className="fac-detail-skeleton-line block" />
            <div className="fac-detail-skeleton-line block" />
            <div className="fac-detail-skeleton-line button" />
          </div>
        </div>
      );
    }

    if (detailError) {
      return <div className="fac-error-message">{detailError}</div>;
    }

    if (!selectedCharacter) {
      return (
        <div className="fac-placeholder-message">
          Select a character to learn more
        </div>
      );
    }

    const aboutText = selectedCharacter.about || "Information not available.";
    const displayedAbout =
      aboutExpanded || aboutText.length <= 400
        ? aboutText
        : `${aboutText.slice(0, 400).trimEnd()}...`;

    const animeAppearance = selectedCharacter.anime?.[0];
    const englishVoice = selectedCharacter.voices?.find(
      (voice) => voice.language === "English"
    );

    const abilities = findSentences(aboutText, [
      "ability",
      "power",
      "technique",
      "jutsu",
      "skill",
    ]);
    const flaws = findSentences(aboutText, [
      "weakness",
      "flaw",
      "limitation",
      "struggle",
    ]);

    return (
      <>
        <img
          className="fac-detail-image"
          src={selectedCharacter.image}
          alt={selectedCharacter.name}
        />

        <div className="fac-detail-body">
          <h3 className="fac-character-name">{selectedCharacter.name}</h3>

          {selectedCharacter.name_kanji ? (
            <p className="fac-kanji-name">{selectedCharacter.name_kanji}</p>
          ) : null}

          <div className="fac-meta-block">
            <span className="fac-meta-label">First Appearance</span>
            <p>
              {animeAppearance
                ? `${animeAppearance.anime?.title || "Unknown"} — ${animeAppearance.role || "Unknown"}`
                : "Unknown"}
            </p>
          </div>

          <div className="fac-meta-block">
            <span className="fac-meta-label">Voice Actor</span>
            <p>{englishVoice?.person?.name || "Unknown"}</p>
          </div>

          <div className="fac-list-block">
            <h4>About</h4>
            <p className="fac-about-text">{displayedAbout}</p>
            {aboutText.length > 400 ? (
              <button
                type="button"
                className="fac-read-more"
                onClick={() => setAboutExpanded((value) => !value)}
              >
                {aboutExpanded ? "Show less" : "Read more"}
              </button>
            ) : null}
          </div>

          <div className="fac-list-block">
            <h4>Abilities</h4>
            <ul className="fac-info-list">
              {abilities.length > 0 ? (
                abilities.map((ability) => <li key={ability}>{ability}</li>)
              ) : (
                <li>Information not available</li>
              )}
            </ul>
          </div>

          <div className="fac-list-block">
            <h4>Flaws</h4>
            <ul className="fac-info-list">
              {flaws.length > 0 ? (
                flaws.map((flaw) => <li key={flaw}>{flaw}</li>)
              ) : (
                <li>Information not available</li>
              )}
            </ul>
          </div>

          <div className="fac-meta-block">
            <span className="fac-meta-label">Favorites</span>
            <p>♥ {selectedCharacter.favorites} MAL favorites</p>
          </div>
        </div>
      </>
    );
  };

  return (
    <section className="fac-section" aria-labelledby="fac-title">
      <div className="fac-inner">
        <div className="fac-header">
          <p className="fac-label">Favorite Anime Characters</p>
          <h2 className="fac-title" id="fac-title">
            F.A.C
          </h2>
        </div>

        <div className="fac-layout">
          <aside className="fac-portrait-panel" aria-label="Favorite character list">
            {characters.map((character) => (
              <button
                className={`fac-portrait-card${
                  selectedCharacter?.mal_id === character.mal_id
                    ? " fac-portrait-card-active"
                    : ""
                }`}
                type="button"
                key={character.mal_id}
                onClick={() => loadCharacterDetail(character)}
                aria-pressed={selectedCharacter?.mal_id === character.mal_id}
              >
                <img
                  className="fac-portrait-image"
                  src={character.image}
                  alt={character.name}
                />
                <span className="fac-portrait-name">{character.name}</span>
                <span className="fac-portrait-anime">♥ {character.favorites}</span>
              </button>
            ))}

            {loading && characters.length > 0 && hasMore ? (
              <div className="fac-list-loading" role="status">
                Loading more characters...
              </div>
            ) : null}

            <div ref={sentinelRef} className="fac-sentinel" />
          </aside>

          {error ? (
            <article className="fac-detail-card">
              <div className="fac-error-message">{error}</div>
            </article>
          ) : (
            <article className={`fac-detail-card${detailLoading ? " fac-detail-card-fading" : ""}`}>
              {renderDetailContent()}
            </article>
          )}
        </div>
      </div>
    </section>
  );
};

export default FAC;
