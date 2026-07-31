import { useCallback, useEffect, useRef, useState } from "react";
import "../components/styles/Anime.css";
import { fetchWithRetry } from "../api/anilist";
import Footer from "../components/Footer";

const alphabet = ["#", ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))];
const MAX_AUTO_FETCHES = 15;
const AUTO_FETCH_DELAY_MS = 300;
const PER_PAGE = 50;

const getRomajiTitle = (item) => item?.title?.romaji ?? "";

const delay = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

const isJunkRomajiTitle = (title) => {
  if (title.trim() === "") {
    return true;
  }

  return /^\.+$/.test(title.replace(/\s/g, ""));
};

const getFirstTitleCharacter = (title) => title.trim().charAt(0).toUpperCase();

const isStandardLetter = (character) => /^[A-Z]$/.test(character);

const formatAnimeItem = (item) => ({
  id: item.id,
  title: item.title?.romaji ?? item.title?.english ?? "Untitled",
  url: item.siteUrl ?? "",
});

const matchesSelectedLetter = (item, requestedLetter) => {
  const title = getRomajiTitle(item);

  if (isJunkRomajiTitle(title)) {
    return false;
  }

  if (requestedLetter === "#") {
    const firstCharacter = getFirstTitleCharacter(title);
    return firstCharacter !== "" && !isStandardLetter(firstCharacter);
  }

  return title.trim().toUpperCase().startsWith(requestedLetter);
};

const getMatchingAnimeFromPages = (pages, requestedLetter) =>
  pages.flatMap((pageMedia) =>
    pageMedia.filter((item) => matchesSelectedLetter(item, requestedLetter)).map(formatAnimeItem)
  );

const hasScannedPastLetter = (pages, requestedLetter) =>
  pages.some((pageMedia) =>
    pageMedia.some((item) => {
      const firstCharacter = getFirstTitleCharacter(getRomajiTitle(item));
      return isStandardLetter(firstCharacter) && firstCharacter > requestedLetter;
    })
  );

function Animes() {
  const [selectedLetter, setSelectedLetter] = useState("A");
  const [animeList, setAnimeList] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const selectedLetterRef = useRef(selectedLetter);
  const animeListRef = useRef(animeList);
  const rawPagesRef = useRef([]);
  const reachedEndRef = useRef(false);
  const autoFetchCountRef = useRef(0);

  useEffect(() => {
    selectedLetterRef.current = selectedLetter;
  }, [selectedLetter]);

  const fetchPage = useCallback(async (nextPage, { append = false } = {}) => {
    const requestedLetter = selectedLetterRef.current;
    const requestedLetterIsStandard = isStandardLetter(requestedLetter);

    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setHasMore(false);
      setPage(1);
    }

    setError("");

    try {
      const query = `
        query ($page: Int!, $perPage: Int = 50) {
          Page(page: $page, perPage: $perPage) {
            media(type: ANIME, sort: TITLE_ROMAJI) {
              id
              title { romaji english }
              siteUrl
            }
          }
        }
      `;
      let currentPage = nextPage;
      let shouldAppend = append;
      let shouldAutoContinue = false;
      let accumulatedAnime = append ? animeListRef.current : [];

      if (!append) {
        accumulatedAnime = getMatchingAnimeFromPages(rawPagesRef.current, requestedLetter);
        animeListRef.current = accumulatedAnime;
        setAnimeList(accumulatedAnime);
        setPage(rawPagesRef.current.length || 1);
      }

      if (requestedLetterIsStandard && !append) {
        // Because AniList is sorted by romaji title, seeing a later letter proves
        // all entries for the requested letter have already been scanned.
        const scannedPastLetter = hasScannedPastLetter(rawPagesRef.current, requestedLetter);
        setHasMore(!scannedPastLetter && !reachedEndRef.current);

        if (scannedPastLetter || reachedEndRef.current) {
          return;
        }

        currentPage = rawPagesRef.current.length + 1;
        shouldAppend = true;
      } else if (!append) {
        setHasMore(!reachedEndRef.current);

        if (reachedEndRef.current) {
          return;
        }

        currentPage = rawPagesRef.current.length + 1;
        shouldAppend = true;
      }

      do {
        let pageMedia = rawPagesRef.current[currentPage - 1];

        if (!pageMedia) {
          const response = await fetchWithRetry(query, { page: currentPage, perPage: PER_PAGE });
          pageMedia = response?.data?.Page?.media ?? [];
          rawPagesRef.current[currentPage - 1] = pageMedia;
        }

        const loadedAnime = pageMedia
          .filter((item) => matchesSelectedLetter(item, requestedLetter))
          .map(formatAnimeItem);
        const pageHasMore = pageMedia.length >= PER_PAGE;

        if (requestedLetter !== selectedLetterRef.current) {
          return;
        }

        if (!pageHasMore) {
          reachedEndRef.current = true;
        }

        if (requestedLetterIsStandard) {
          accumulatedAnime = getMatchingAnimeFromPages(rawPagesRef.current, requestedLetter);
        } else {
          accumulatedAnime = shouldAppend ? [...accumulatedAnime, ...loadedAnime] : loadedAnime;
        }

        animeListRef.current = accumulatedAnime;
        setAnimeList(accumulatedAnime);
        setPage(currentPage);
        const scannedPastLetter =
          requestedLetterIsStandard && hasScannedPastLetter(rawPagesRef.current, requestedLetter);
        setHasMore(requestedLetterIsStandard ? !scannedPastLetter && !reachedEndRef.current : pageHasMore);

        shouldAutoContinue = requestedLetterIsStandard
          ? !scannedPastLetter && !reachedEndRef.current
          : pageHasMore && autoFetchCountRef.current < MAX_AUTO_FETCHES;

        if (shouldAutoContinue) {
          if (!requestedLetterIsStandard) {
            autoFetchCountRef.current += 1;
          }
          currentPage += 1;
          shouldAppend = true;
          await delay(AUTO_FETCH_DELAY_MS);
        }
      } while (shouldAutoContinue);
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
    autoFetchCountRef.current = 0;
    setSelectedLetter(letter);
  };

  const handleRetry = () => {
    if (animeList.length === 0) {
      fetchPage(1, { bypassCache: true });
      return;
    }

    fetchPage(page, { append: false, bypassCache: true });
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
                key={anime.id}
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

      <Footer />
    </div>
  );
}

export default Animes;
