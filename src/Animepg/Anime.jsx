import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "../components/styles/Anime.css";
import { AZ_MAX_PAGE, AZ_PER_PAGE, fetchAzPage } from "../api/anilist";
import { AZ_LETTER_START_HINTS, findLetterStartPage, getTitleLetter } from "./animeAzUtils";
import Footer from "../components/Footer";

const alphabet = ["#", ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))];
const AUTO_FETCH_DELAY_MS = 300;
// Load a little more automatically when the first page holds only a few matches.
const MIN_INITIAL_MATCHES = 20;
const MAX_INITIAL_PAGES = 3;

// Session caches shared across letter switches and revisits, so each page is
// only ever requested once and each letter's start is only looked up once.
const pageCache = new Map();
const letterStartPageCache = new Map();

const delay = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

const getPage = async (page) => {
  if (!pageCache.has(page)) {
    pageCache.set(page, await fetchAzPage(page));
  }
  return pageCache.get(page);
};

const getStartPage = async (letter) => {
  if (!letterStartPageCache.has(letter)) {
    const startPage = await findLetterStartPage(letter, getPage, {
      hint: AZ_LETTER_START_HINTS[letter],
      maxPage: AZ_MAX_PAGE,
    });
    letterStartPageCache.set(letter, startPage);
  }
  return letterStartPageCache.get(letter);
};

const formatAnimeItem = (item) => ({
  id: item.id,
  title: item.title?.romaji ?? item.title?.english ?? "Untitled",
});

// Matches for `letter` across the loaded pages, plus whether there could be more.
const summarizePages = (pageNumbers, letter) => {
  const seen = new Set();
  const list = [];
  let passedLetter = false;
  let reachedEnd = false;

  pageNumbers.forEach((pageNumber) => {
    const media = pageCache.get(pageNumber) ?? [];
    if (media.length < AZ_PER_PAGE || pageNumber >= AZ_MAX_PAGE) {
      reachedEnd = true;
    }
    media.forEach((item) => {
      const titleLetter = getTitleLetter(item.title?.romaji);
      if (titleLetter === letter && !seen.has(item.id)) {
        seen.add(item.id);
        list.push(formatAnimeItem(item));
      }
      // Symbols/digits sort first, so the first Latin title ends the "#" block;
      // for a letter, any later letter means we've read all of it.
      if (titleLetter && titleLetter !== "#" && (letter === "#" || titleLetter > letter)) {
        passedLetter = true;
      }
    });
  });

  return { list, hasMore: !passedLetter && !reachedEnd };
};

function Animes() {
  // The letter lives in the URL (?letter=K) so Back from a Detail page returns to the same letter.
  const [searchParams, setSearchParams] = useSearchParams();
  const letterParam = searchParams.get("letter");
  const selectedLetter = alphabet.includes(letterParam) ? letterParam : "A";
  const setSelectedLetter = (letter) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set("letter", letter);
        return next;
      },
      { replace: true }
    );
  };
  const [animeList, setAnimeList] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  // Pages loaded for the current letter, and a token so a slow response for a
  // previous letter can't overwrite the current one.
  const loadedPagesRef = useRef([]);
  const requestTokenRef = useRef(0);

  const loadLetter = useCallback(async (letter) => {
    const token = ++requestTokenRef.current;
    setIsLoading(true);
    setError("");

    try {
      const startPage = await getStartPage(letter);
      const pages = [startPage];
      await getPage(startPage);
      let summary = summarizePages(pages, letter);

      while (summary.hasMore && summary.list.length < MIN_INITIAL_MATCHES && pages.length < MAX_INITIAL_PAGES) {
        const nextPage = pages[pages.length - 1] + 1;
        if (!pageCache.has(nextPage)) {
          await delay(AUTO_FETCH_DELAY_MS);
        }
        await getPage(nextPage);
        pages.push(nextPage);
        summary = summarizePages(pages, letter);
      }

      if (token !== requestTokenRef.current) {
        return;
      }
      loadedPagesRef.current = pages;
      setAnimeList(summary.list);
      setHasMore(summary.hasMore);
    } catch {
      if (token === requestTokenRef.current) {
        setAnimeList([]);
        setHasMore(false);
        setError("Couldn't load anime right now, please try again");
      }
    } finally {
      if (token === requestTokenRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const loadMore = async () => {
    const token = requestTokenRef.current;
    const letter = selectedLetter;
    const pages = loadedPagesRef.current;
    const nextPage = pages[pages.length - 1] + 1;

    setIsLoadingMore(true);
    setError("");

    try {
      await getPage(nextPage);
      if (token !== requestTokenRef.current) {
        return;
      }
      loadedPagesRef.current = [...pages, nextPage];
      const summary = summarizePages(loadedPagesRef.current, letter);
      setAnimeList(summary.list);
      setHasMore(summary.hasMore);
    } catch {
      if (token === requestTokenRef.current) {
        setError("Couldn't load more anime right now, please try again");
      }
    } finally {
      if (token === requestTokenRef.current) {
        setIsLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadLetter(selectedLetter);
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [loadLetter, selectedLetter]);

  const handleLetterChange = (letter) => {
    if (letter === selectedLetter) {
      return;
    }
    setSelectedLetter(letter);
  };

  const handleRetry = () => {
    if (animeList.length === 0) {
      void loadLetter(selectedLetter);
      return;
    }
    void loadMore();
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
              <Link key={anime.id} to={`/anime/${anime.id}`} className="animes-title">
                {anime.title}
              </Link>
            ))}
          </div>

          {hasMore && (
            <button
              type="button"
              className="animes-load-more"
              onClick={() => void loadMore()}
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
