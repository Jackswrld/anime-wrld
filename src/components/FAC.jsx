import { useEffect, useRef, useState } from "react";
import "./styles/FAC.css";
import { fetchCharacterDetail, fetchCharactersPage } from "../api/anilist";

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
  id: item.id,
  name: item.name?.full ?? "Unknown",
  image: item.image?.large ?? "",
  favorites: item.favourites ?? 0,
  about: item.description ?? "",
});

const getPrimaryVoiceActor = (edges = []) => {
  const tvEdge = edges.find(
    (edge) => edge.node?.format === "TV" && edge.voiceActors?.length > 0
  );
  const source = tvEdge ?? edges.find((edge) => edge.voiceActors?.length > 0);

  return source?.voiceActors?.[0] ?? null;
};

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

        const data = await fetchCharactersPage(page);
        const nextCharacters = (Array.isArray(data) ? data : []).map(buildCharacterItem);

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
    if (detailLoading || selectedCharacter?.id === character.id) {
      return;
    }

    setDetailLoading(true);
    setDetailError(null);
    setAboutExpanded(false);

    try {
      const detail = await fetchCharacterDetail(character.id);
      const mediaEdges = Array.isArray(detail.media?.edges) ? detail.media.edges : [];

      setSelectedCharacter({
        ...character,
        ...detail,
        id: detail.id ?? character.id,
        name: detail.name?.full ?? character.name ?? "Unknown",
        image: detail.image?.large ?? character.image ?? "",
        about: detail.description ?? character.about ?? "",
        anime:
          mediaEdges.map((edge) => ({
            anime: { title: edge.node?.title?.romaji ?? "Unknown" },
            role: "Appears in",
          })) ?? [],
        voiceActor: getPrimaryVoiceActor(mediaEdges),
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
    const voiceActor = selectedCharacter.voiceActor ?? null;

    const abilities = findSentences(aboutText, [
      "ability",
      "power",
      "technique",
      "jutsu",
      "skill",
      "talent",
      "expert",
      "master",
      "capable",
      "strength",
      "quirk",
      "gifted",
      "proficient",
      "trained",
      "combat",
      "magic",
      "wield",
      "control",
      "excel",
    ]);
    const flaws = findSentences(aboutText, [
      "weakness",
      "flaw",
      "limitation",
      "struggle",
      "trouble",
      "cannot",
      "unable",
      "fear",
      "isolate",
      "poor at",
      "reluctant",
      "lack",
      "fails",
      "difficult",
      "arrogant",
      "stubborn",
      "reckless",
      "impulsive",
      "naive",
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

          <div className="fac-voice-actor" aria-label="Voice actor">
            {voiceActor?.image?.large ? (
              <img
                className="fac-voice-image"
                src={voiceActor.image.large}
                alt={voiceActor.name?.full || "Voice actor"}
              />
            ) : (
              <div className="fac-va-image-placeholder" aria-hidden="true" />
            )}
            {voiceActor?.name?.full ? (
              <a
                className="fac-va-name fac-voice-link"
                href={`https://www.google.com/search?q=${encodeURIComponent(
                  voiceActor.name.full
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {voiceActor.name.full}
              </a>
            ) : (
              <span className="fac-va-name">Not listed</span>
            )}
          </div>

          <div className="fac-meta-block">
            <span className="fac-meta-label">First Appearance</span>
            <p>
              {animeAppearance
                ? `${animeAppearance.anime?.title || "Unknown"} — ${animeAppearance.role || "Unknown"}`
                : "Unknown"}
            </p>
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
    <section className="fac-section" aria-labelledby="fac-title" id="fac">
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
                  selectedCharacter?.id === character.id
                    ? " fac-portrait-card-active"
                    : ""
                }`}
                type="button"
                key={character.id}
                onClick={() => loadCharacterDetail(character)}
                aria-pressed={selectedCharacter?.id === character.id}
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
