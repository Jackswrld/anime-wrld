import { useCallback, useEffect, useRef, useState } from "react";
import "../components/styles/Anime.css";
import { fetchWithRetry } from "../api/jikan.js";

const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
const ANIME_API_URL = "https://api.jikan.moe/v4/anime";

function Animes() {
  const [selectedLetter, setSelectedLetter] = useState("A");
  const [animeList, setAnimeList] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const selectedLetterRef = useRef(selectedLetter);

  useEffect(() => {
    selectedLetterRef.current = selectedLetter;
  }, [selectedLetter]);

  const fetchPage = useCallback(async (nextPage, { append = false } = {}) => {
    const requestedLetter = selectedLetterRef.current;

    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setAnimeList([]);
      setHasMore(false);
      setPage(1);
    }

    setError("");

    try {
      const response = await fetchWithRetry(
        `${ANIME_API_URL}?page=${nextPage}&limit=25&order_by=title&sort=asc&letter=${encodeURIComponent(requestedLetter)}`
      );
      const json = await response.json();
      const loadedAnime = (json.data || []).map((item) => ({
        mal_id: item.mal_id,
        title: item.title,
        url: item.url,
      }));

      if (requestedLetter !== selectedLetterRef.current) {
        return;
      }

      setAnimeList((currentAnime) => (append ? [...currentAnime, ...loadedAnime] : loadedAnime));
      setPage(nextPage);
      setHasMore(Boolean(json.pagination?.has_next_page));
    } catch {
      if (requestedLetter !== selectedLetterRef.current) {
        return;
      }
      setError("Couldn't load anime right now, please try again");
    } finally {
      if (requestedLetter === selectedLetterRef.current) {
        if (append) {
          setIsLoadingMore(false);
        } else {
          setIsLoading(false);
        }
      }
    }
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void fetchPage(1);
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [fetchPage, selectedLetter]);

  const handleLetterChange = (letter) => {
    if (letter === selectedLetter) {
      return;
    }

    selectedLetterRef.current = letter;
    setSelectedLetter(letter);
  };

  const handleRetry = () => {
    if (animeList.length === 0) {
      fetchPage(1);
      return;
    }

    fetchPage(page, { append: false });
  };

  return (
    <div className="animes-page">
      <h1 className="animes-heading">Anime List</h1>

      <div className="animes-letterbar">
        {alphabet.map((letter) => {
          const isActive = letter === selectedLetter;
          return (
            <button
              key={letter}
              type="button"
              className={`animes-letter-btn${isActive ? " animes-letter-active" : ""}`}
              onClick={() => handleLetterChange(letter)}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="animes-status">Loading...</div>
      ) : error && animeList.length === 0 ? (
        <div className="animes-status">
          <div>{error}</div>
          <button type="button" className="animes-retry-btn" onClick={handleRetry}>
            Retry
          </button>
        </div>
      ) : animeList.length === 0 ? (
        <div className="animes-empty">No anime found starting with {selectedLetter}</div>
      ) : (
        <>
          <div className="animes-list">
            {animeList.map((anime) => (
              <a
                key={anime.mal_id}
                href={anime.url}
                target="_blank"
                rel="noreferrer"
                className="animes-title"
              >
                {anime.title}
              </a>
            ))}
          </div>

          {hasMore && (
            <button
              type="button"
              className="animes-load-more"
              onClick={() => fetchPage(page + 1, { append: true })}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? "Loading..." : "Load More"}
            </button>
          )}
        </>
      )}

      {error && animeList.length > 0 && (
        <div className="animes-status">
          <div>{error}</div>
          <button type="button" className="animes-retry-btn" onClick={handleRetry}>
            Retry
          </button>
        </div>
      )}
    </div>
  );
}

export default Animes;
