import { useEffect, useMemo, useRef, useState } from "react";
import "./Catalogue.css";

const API_BASE = "https://api.jikan.moe/v4";

const Catalogue = () => {
  const [animeList, setAnimeList] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debounceRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch(`${API_BASE}/genres/anime`);
        if (!response.ok) {
          throw new Error("Failed to load genres");
        }
        const json = await response.json();
        setGenres(json.data || []);
      } catch (err) {
        console.error(err);
        setError("Something went wrong. Please try again.");
      }
    };

    fetchGenres();
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    const fetchAnime = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set("page", String(currentPage));
        params.set("limit", "20");

        if (debouncedQuery) {
          params.set("q", debouncedQuery);
        }

        if (selectedGenres.length) {
          params.set("genres", selectedGenres.join(","));
        }

        const response = await fetch(`${API_BASE}/anime?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load anime");
        }

        const json = await response.json();
        setAnimeList(json.data || []);
        setTotalPages(json.pagination?.last_visible_page ?? 0);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError("Something went wrong. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, [debouncedQuery, selectedGenres, currentPage]);

  

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const toggleGenre = (genreId) => {
    setSelectedGenres((prev) => {
      const updated = prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId];
      return updated;
    });
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const paginationItems = useMemo(() => {
    if (totalPages <= 1) {
      return [];
    }

    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i += 1) {
        pages.push(i);
      }
      return pages;
    }

    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, "ellipsis", totalPages);
      return pages;
    }

    if (currentPage >= totalPages - 2) {
      pages.push(1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      return pages;
    }

    pages.push(1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages);
    return pages;
  }, [currentPage, totalPages]);

  const renderContent = () => {
    if (error) {
      return <div className="catalogue-error-state">Something went wrong. Please try again.</div>;
    }

    if (loading) {
      return (
        <div className="catalogue-grid">
          {Array.from({ length: 20 }, (_, index) => (
            <div key={index} className="catalogue-card catalogue-skeleton-card" />
          ))}
        </div>
      );
    }

    if (!animeList.length) {
      return (
        <div className="catalogue-empty-state">
          <p>No anime found. Try a different search.</p>
        </div>
      );
    }

    return (
      <div className="catalogue-grid">
        {animeList.map((anime) => (
          <article className="catalogue-card" key={anime.mal_id}>
            <div className="catalogue-card-image-wrapper">
              <img
                className="catalogue-card-image"
                src={anime.images?.jpg?.image_url}
                alt={anime.title}
              />
            </div>
            <div className="catalogue-card-body">
              <h3 className="catalogue-card-title">{anime.title}</h3>
              <div className="catalogue-card-genre-list">
                {anime.genres?.slice(0, 2).map((genre) => (
                  <span className="catalogue-card-genre" key={genre.mal_id}>
                    {genre.name}
                  </span>
                ))}
              </div>
              <div className="catalogue-card-meta">
                <span className="catalogue-card-score">★ {anime.score ?? "N/A"}</span>
                <span className="catalogue-card-episodes">
                  {anime.episodes != null ? `${anime.episodes} eps` : "? eps"}
                </span>
              </div>
              <button
                type="button"
                className="catalogue-card-button"
                onClick={() => {
                  // TODO: navigate to WatchPage with anime mal_id
                }}
              >
                Watch Now
              </button>
            </div>
          </article>
        ))}
      </div>
    );
  };

  return (
    <section className="catalogue-root">
      <div className="catalogue-header">
        <h1 className="catalogue-title">Browse Anime</h1>
        <p className="catalogue-subtitle">Discover your next obsession</p>
      </div>

      <div className="catalogue-search-wrap">
        <label className="catalogue-search-label">
          <svg
            className="catalogue-search-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M10.5 3a7.5 7.5 0 015.95 12.14l4.2 4.2a1 1 0 01-1.42 1.42l-4.2-4.2A7.5 7.5 0 1110.5 3zm0 2a5.5 5.5 0 100 11 5.5 5.5 0 000-11z"
              fill="currentColor"
            />
          </svg>
          <input
            className="catalogue-search-field"
            type="search"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search anime..."
          />
        </label>
      </div>

      <div className="catalogue-genre-row">
        {genres.map((genre) => {
          const isSelected = selectedGenres.includes(genre.mal_id);
          return (
            <button
              key={genre.mal_id}
              type="button"
              className={`catalogue-genre-pill${isSelected ? " selected" : ""}`}
              onClick={() => toggleGenre(genre.mal_id)}
            >
              {genre.name}
            </button>
          );
        })}
      </div>

      {renderContent()}

      {paginationItems.length > 0 && !loading && !error && (
        <div className="catalogue-pagination">
          <button
            type="button"
            className={`catalogue-pagination-button${currentPage === 1 ? " disabled" : ""}`}
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </button>

          {paginationItems.map((item, index) => {
            if (item === "ellipsis") {
              return (
                <span className="catalogue-pagination-ellipsis" key={`ellipsis-${index}`}>
                  …
                </span>
              );
            }
            return (
              <button
                key={item}
                type="button"
                className={`catalogue-pagination-button${item === currentPage ? " active" : ""}`}
                onClick={() => handlePageChange(item)}
              >
                {item}
              </button>
            );
          })}

          <button
            type="button"
            className={`catalogue-pagination-button${currentPage === totalPages ? " disabled" : ""}`}
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
};

export default Catalogue;
