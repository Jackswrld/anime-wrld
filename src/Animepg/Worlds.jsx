import { useCallback, useEffect, useRef, useState } from "react";
import { fetchGenreList, fetchAnimeByGenres } from "../api/anilist";
import { filterAnimeByAllGenres, filterVisibleGenres } from "./worldsGenreUtils";
import "../components/styles/Worlds.css";
import "../components/styles/Trending.css";

const HERO_LINES = [
  { heading: "Choose Your World", subheading: "Every genre opens the door to a different adventure. Which world will you explore today?" },
  { heading: "Find Your Genre", subheading: "Explore every corner of anime, from heartwarming romance to breathtaking adventures." },
  { heading: "What's Your Mood Today?", subheading: "Romance, action, fantasy, horror, slice of life—pick a mood and let the adventure begin." },
  { heading: "Discover Your Next Adventure", subheading: "Every great journey starts with a single choice. Find the story that's waiting for you." },
  { heading: "Explore Genres", subheading: "Browse a universe of anime genres and discover stories you'll never forget." },
  { heading: "Find Your Story", subheading: "Every anime has a story to tell. Find the one that speaks to you." },
  { heading: "Pick Your Vibe", subheading: "Whether you're in the mood to laugh, cry, or be amazed, there's an anime waiting for you." },
  { heading: "Your Next Obsession", subheading: "Your next favorite anime is just one genre away." },
  { heading: "Where Do You Want to Go?", subheading: "Every genre is a new destination. Choose your path and start your adventure." },
  { heading: "Start Exploring", subheading: "Thousands of unforgettable stories are waiting to be discovered." },
  { heading: "Your Taste", subheading: "Explore genres that match your unique anime preferences." },
  { heading: "Your Anime Taste", subheading: "Discover anime tailored to the stories you love most." },
  { heading: "Pick Your Flavor", subheading: "Sweet romance, thrilling action, chilling horror, or hilarious comedy—the choice is yours." },
  { heading: "Choose Your Mood", subheading: "Your mood shapes your adventure. Find the perfect anime for today." },
  { heading: "Find Your Favorite", subheading: "Browse through genres and uncover your next favorite series." },
  { heading: "Match Your Mood", subheading: "Let today's mood guide you to the perfect anime experience." },
  { heading: "Enter a New World", subheading: "Every genre is its own universe. Step inside and start your journey." },
  { heading: "Worlds Await", subheading: "Countless adventures, unforgettable characters, and incredible stories are waiting for you." },
  { heading: "Discover New Worlds", subheading: "Every click unlocks a new adventure filled with unforgettable moments." },
  { heading: "Your Journey Starts Here", subheading: "Choose a world, discover amazing stories, and create unforgettable memories." },
  { heading: "Open the Next World", subheading: "Step beyond the ordinary and into a world of endless anime adventures." },
  { heading: "Find the World That Fits You", subheading: "Every fan has a favorite world. Which one feels like home to you?" },
  { heading: "Browse", subheading: "Explore a growing collection of anime worlds and timeless stories." },
  { heading: "Collections", subheading: "Carefully organized genres to help you discover your next masterpiece." },
  { heading: "Discover", subheading: "Find hidden gems, timeless classics, and exciting new adventures." },
  { heading: "Explore All", subheading: "From legendary classics to the latest releases, every world is within reach." },
  { heading: "Trending Genres", subheading: "See what anime fans around the world are enjoying right now." },
  { heading: "Your Next Adventure", subheading: "Every adventure begins with curiosity. Where will yours take you?" },
  { heading: "Every Story Begins Here", subheading: "Explore worlds filled with unforgettable heroes, friendships, and adventures." },
  { heading: "Find Your Destiny", subheading: "Your next unforgettable anime experience is waiting to be discovered." },
  { heading: "The Story You're Looking For", subheading: "Dive into a genre that matches your imagination and passion." },
  { heading: "A World for Every Mood", subheading: "Whatever you're feeling today, there's an anime world ready for you." },
  { heading: "Welcome To Your World", subheading: "Your journey into the world of anime starts here." },
  { heading: "Endless Adventures", subheading: "Discover stories that inspire, entertain, and stay with you forever." },
  { heading: "Welcome to Your Next Adventure", subheading: "Choose a genre, begin your journey, and let every episode tell a new story." }
];

const isValidHeroIndex = (value) => Number.isInteger(value) && value >= 0 && value < HERO_LINES.length;

export default function Worlds() {
  const [hero] = useState(() => {
    const storedIndex = localStorage.getItem("worlds-hero-index");
    let selectedIndex = null;

    if (storedIndex !== null) {
      const parsedIndex = Number(storedIndex);
      if (isValidHeroIndex(parsedIndex)) {
        selectedIndex = parsedIndex;
      }
    }

    if (selectedIndex === null) {
      selectedIndex = Math.floor(Math.random() * HERO_LINES.length);
      localStorage.setItem("worlds-hero-index", String(selectedIndex));
    }

    return HERO_LINES[selectedIndex];
  });
  const [genreMap, setGenreMap] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const visibleGenres = filterVisibleGenres(genreMap);
  const [shakeId, setShakeId] = useState(null);
  const [results, setResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const resultsDebounceRef = useRef(null);
  const shakeTimerRef = useRef(null);
  const fetchControllerRef = useRef(null);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);
  const isFetchingRef = useRef(false);
  const pageRef = useRef(page);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    (async () => {
      try {
        const map = await fetchGenreList();
        setGenreMap(map);
        console.log(map);
      } catch (error) {
        console.error("[Worlds] Failed to fetch genre map:", error);
      }
    })();
  }, []);

  const dedupeById = (animeList) =>
    Array.from(new Map(animeList.map((anime) => [anime.id, anime])).values());

  const fetchResults = useCallback(async (genreIds, pageToLoad, append = false) => {
    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort();
    }

    const controller = new AbortController();
    fetchControllerRef.current = controller;

    if (append) {
      setIsLoadingMore(true);
    } else {
      setResultsLoading(true);
      setResultsError(null);
    }

    try {
      const response = await fetchAnimeByGenres(genreIds, pageToLoad);
      const loadedResults = (Array.isArray(response) ? response : []).map((anime) => ({
        id: anime.id,
        title: anime.title?.romaji ?? anime.title?.english ?? "Unknown",
        image: anime.coverImage?.extraLarge ?? anime.coverImage?.large ?? "",
        genres: anime.genres ?? [],
      }));

      const filteredResults = filterAnimeByAllGenres(loadedResults, genreIds);

      if (append) {
        setResults((current) => dedupeById([...current, ...filteredResults]));
      } else {
        setResults(dedupeById(filteredResults));
      }

      setPage(pageToLoad);
      setHasNextPage(false);
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }

      console.error("[Worlds] Failed to fetch anime by genres:", error);
      setResultsError("Unable to load anime results right now. Please try again.");
    } finally {
      if (append) {
        setIsLoadingMore(false);
      } else {
        setResultsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (resultsDebounceRef.current) {
      window.clearTimeout(resultsDebounceRef.current);
    }

    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort();
      fetchControllerRef.current = null;
    }

    if (selectedGenres.length === 0) {
      window.setTimeout(() => {
        setResults([]);
        setPage(1);
        setHasNextPage(false);
        setResultsError(null);
        setResultsLoading(false);
      }, 0);
      return undefined;
    }

    resultsDebounceRef.current = window.setTimeout(() => {
      void fetchResults(selectedGenres, 1, false);
    }, 350);

    return () => {
      if (resultsDebounceRef.current) {
        window.clearTimeout(resultsDebounceRef.current);
      }
    };
  }, [selectedGenres, fetchResults]);

  useEffect(() => {
    if (!sentinelRef.current) {
      return undefined;
    }

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (
          entry?.isIntersecting &&
          hasNextPage &&
          !resultsLoading &&
          !isLoadingMore &&
          selectedGenres.length > 0
        ) {
          if (isFetchingRef.current) {
            return;
          }

          isFetchingRef.current = true;
          void fetchResults(selectedGenres, pageRef.current + 1, true).finally(() => {
            isFetchingRef.current = false;
          });
        }
      },
      { rootMargin: "0px 0px 260px 0px" }
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [selectedGenres, hasNextPage, resultsLoading, isLoadingMore, fetchResults]);

  useEffect(() => {
    return () => {
      if (resultsDebounceRef.current) {
        window.clearTimeout(resultsDebounceRef.current);
      }
      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (shakeTimerRef.current) {
        window.clearTimeout(shakeTimerRef.current);
      }
    };
  }, []);

  const toggleGenre = (genreName) => {
    setSelectedGenres((current) => {
      if (current.includes(genreName)) {
        return current.filter((selectedGenre) => selectedGenre !== genreName);
      }

      if (current.length >= 3) {
        if (shakeTimerRef.current) {
          window.clearTimeout(shakeTimerRef.current);
        }
        setShakeId(genreName);
        shakeTimerRef.current = window.setTimeout(() => {
          setShakeId(null);
          shakeTimerRef.current = null;
        }, 300);
        return current;
      }

      return [...current, genreName];
    });
  };

  const renderLoadingCards = () =>
    [1, 2, 3].map((rank) => (
      <article
        className={`trending-card trending-skeleton-card${rank === 1 ? " trending-card-featured" : ""}`}
        key={`skeleton-${rank}`}
        aria-hidden="true"
      >
        <div className="trending-card-skeleton-media" />
        <span className="trending-rank">#{rank}</span>
        <div className="trending-card-overlay">
          <div className="trending-skeleton-line trending-skeleton-title" />
          <div className="trending-skeleton-line trending-skeleton-genre" />
        </div>
      </article>
    ));

  const renderResultCards = () =>
    results.map((anime, index) => (
      <article
        className={`trending-card${index === 0 ? " trending-card-featured" : ""}`}
        key={anime.id}
      >
        <img src={anime.image} alt={`${anime.title} anime poster`} />
        <span className="trending-rank">#{index + 1}</span>
        <div className="trending-card-overlay">
          <h3>{anime.title}</h3>
          <span className="trending-genre">
            {anime.genres?.length ? anime.genres.slice(0, 2).join(", ") : "Unknown"}
          </span>
        </div>
      </article>
    ));

  if (!hero) {
    return null;
  }

  return (
    <section className="worlds">
      <div className="worlds-hero">
        <h1 className="worlds-heading">{hero.heading}</h1>
        <p className="worlds-subheading">{hero.subheading}</p>
      </div>

      {visibleGenres.length === 0 ? (
        <div className="worlds-status">Loading genres...</div>
      ) : (
        <div className="worlds-pill-grid">
          {visibleGenres.map((genreName) => (
            <button
              key={genreName}
              type="button"
              className={`worlds-pill${selectedGenres.includes(genreName) ? " worlds-pill-active" : ""}${shakeId === genreName ? " worlds-pill-shake" : ""}`}
              onClick={() => toggleGenre(genreName)}
            >
              {genreName}
            </button>
          ))}
        </div>
      )}

      {selectedGenres.length > 0 && (
        <div className="worlds-results-wrapper">
          {resultsLoading ? (
            <div className="worlds-results-grid">
              <div className="trending-card-row">{renderLoadingCards()}</div>
            </div>
          ) : resultsError ? (
            <div className="worlds-status worlds-error">{resultsError}</div>
          ) : results.length === 0 ? (
            <div className="worlds-status">No anime found for this combination — try a different mix.</div>
          ) : (
            <div className="worlds-results-grid">
              <div className="trending-card-row">{renderResultCards()}</div>
            </div>
          )}

          {isLoadingMore && <div className="worlds-status">Loading more...</div>}
          <div ref={sentinelRef} className="worlds-sentinel" />
        </div>
      )}
    </section>
  );
 }
