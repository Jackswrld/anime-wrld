import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchAnime } from "../api/anilist";

const DEBOUNCE_MS = 400;
const MIN_CHARS = 2;
// Session cache shared by the desktop and mobile search boxes; keeps repeat
// searches off the network (AniList rate-limits aggressively).
const resultCache = new Map();

const getTitle = (anime) => anime.title?.english ?? anime.title?.romaji ?? "Untitled";

const formatMeta = (anime) =>
  [anime.format?.replace(/_/g, " "), anime.seasonYear].filter(Boolean).join(" · ");

const NavbarSearch = ({ variant = "desktop", onNavigate }) => {
  const navigate = useNavigate();
  const listId = useId();
  const wrapperRef = useRef(null);
  const requestIdRef = useRef(0);
  const [term, setTerm] = useState("");
  // Latest settled response, tagged with the search key it belongs to.
  const [response, setResponse] = useState({ key: "", results: [], failed: false });
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const trimmed = term.trim();
  const key = trimmed.toLowerCase();
  const cached = resultCache.get(key);

  // Derive what to show from the current term, so stale responses never leak in.
  let status = "idle"; // idle | loading | ready | error
  let results = [];
  if (trimmed.length >= MIN_CHARS) {
    if (cached) {
      status = "ready";
      results = cached;
    } else if (response.key === key) {
      status = response.failed ? "error" : "ready";
      results = response.results;
    } else {
      status = "loading";
    }
  }

  useEffect(() => {
    const requestId = ++requestIdRef.current;

    if (trimmed.length < MIN_CHARS || resultCache.has(key)) {
      return undefined;
    }

    const timer = setTimeout(async () => {
      try {
        const media = await searchAnime(trimmed);
        resultCache.set(key, media);
        if (requestId === requestIdRef.current) {
          setResponse({ key, results: media, failed: false });
          setActiveIndex(-1);
        }
      } catch {
        if (requestId === requestIdRef.current) {
          setResponse({ key, results: [], failed: true });
        }
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [trimmed, key]);

  useEffect(() => {
    const handleOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const openAnime = (anime) => {
    setIsOpen(false);
    setTerm("");
    setActiveIndex(-1);
    onNavigate?.();
    navigate(`/anime/${anime.id}`);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      return;
    }
    if (!results.length) {
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((index) => (index <= 0 ? results.length - 1 : index - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      openAnime(results[activeIndex >= 0 ? activeIndex : 0]);
    }
  };

  const showPanel = isOpen && trimmed.length >= MIN_CHARS;

  return (
    <div className={`navbar-search-wrap navbar-search-wrap--${variant}`} ref={wrapperRef}>
      <label className={variant === "mobile" ? "navbar-mobile-search" : "navbar-search"}>
        <input
          className="navbar-search-input"
          type="search"
          placeholder="Search anime..."
          value={term}
          onChange={(event) => {
            setTerm(event.target.value);
            setActiveIndex(-1);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-label="Search anime"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
          autoComplete="off"
        />
        <i className="fas fa-search navbar-search-icon" aria-hidden="true" />
      </label>

      {showPanel && (
        <div className="navbar-search-panel">
          {status === "loading" && <p className="navbar-search-status">Searching…</p>}
          {status === "error" && <p className="navbar-search-status">Search is unavailable right now. Try again in a moment.</p>}
          {status === "ready" && results.length === 0 && (
            <p className="navbar-search-status">No anime found for “{trimmed}”.</p>
          )}
          {status === "ready" && results.length > 0 && (
            <ul className="navbar-search-results" id={listId} role="listbox" aria-label="Search results">
              {results.map((anime, index) => (
                <li
                  key={anime.id}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={`navbar-search-result${index === activeIndex ? " navbar-search-result--active" : ""}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => openAnime(anime)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  {anime.coverImage?.large ? (
                    <img className="navbar-search-thumb" src={anime.coverImage.large} alt="" loading="lazy" />
                  ) : (
                    <span className="navbar-search-thumb" aria-hidden="true" />
                  )}
                  <span className="navbar-search-text">
                    <span className="navbar-search-title">{getTitle(anime)}</span>
                    {formatMeta(anime) && <span className="navbar-search-meta">{formatMeta(anime)}</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NavbarSearch;
