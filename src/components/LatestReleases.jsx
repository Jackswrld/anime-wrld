import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Gift } from "lucide-react";
import AnimeCard from "./AnimeCard";
import { fetchLatestReleases } from "../api/anilist";
import "./styles/LatestReleases.css";

const SKELETON_COUNT = 6;

const LatestReleases = () => {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canScrollRow, setCanScrollRow] = useState(false);
  const [scrollLeftDisabled, setScrollLeftDisabled] = useState(true);
  const [scrollRightDisabled, setScrollRightDisabled] = useState(false);
  const scrollRowRef = useRef(null);
  const requestIdRef = useRef(0);

  const updateScrollState = useCallback(() => {
    const el = scrollRowRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollRow(scrollWidth > clientWidth + 1);
    setScrollLeftDisabled(scrollLeft <= 0);
    setScrollRightDisabled(scrollLeft + clientWidth >= scrollWidth - 1);
  }, []);

  const scrollRowBy = (direction) => {
    const el = scrollRowRef.current;
    if (!el) return;

    el.scrollBy({ left: el.clientWidth * direction, behavior: "smooth" });
  };

  const handleScroll = () => {
    const el = scrollRowRef.current;
    if (!el) return;

    setScrollLeftDisabled(el.scrollLeft <= 0);
    setScrollRightDisabled(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  };

  const loadLatestReleases = useCallback(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    fetchLatestReleases()
      .then((media) => {
        if (requestIdRef.current !== requestId) return;

        if (!media.length) {
          setError("No new episodes to show right now. Please try again.");
          setAnimeList([]);
          return;
        }

        setAnimeList(media);
      })
      .catch(() => {
        if (requestIdRef.current !== requestId) return;
        setError("Couldn't load the latest releases. Please try again.");
        setAnimeList([]);
      })
      .finally(() => {
        if (requestIdRef.current === requestId) {
          setLoading(false);
        }
      });
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    loadLatestReleases();
  };

  useEffect(() => {
    loadLatestReleases();
    return () => {
      requestIdRef.current += 1;
    };
  }, [loadLatestReleases]);

  useEffect(() => {
    const handleResize = () => updateScrollState();

    updateScrollState();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateScrollState, animeList.length, loading]);

  return (
    <section className="latest-section" id="latest-releases">
      <div className="latest-inner">
        <div className="latest-heading">
          <div className="latest-heading-row" >
          <h2>Latest Releases</h2>
          <Gift className="latest-heading-icon" aria-hidden="true" />
          </div>
          <p className="latest-heading-sub">
            <span className="latest-heading-bar" aria-hidden="true" />
            check out the new episodes
          </p>
        </div>

        {error ? (
          <div className="latest-error">
            <p>{error}</p>
            <button type="button" className="latest-retry-btn" onClick={handleRetry}>
              Try Again
            </button>
          </div>
        ) : (
          <div className="latest-scroll-wrapper">
            <div
              ref={scrollRowRef}
              className="latest-card-row"
              role="region"
              aria-label="Latest releases"
              onScroll={handleScroll}
            >
              {loading
                ? Array.from({ length: SKELETON_COUNT }, (_, index) => (
                    <div
                      className="latest-card-skeleton"
                      key={`skeleton-${index}`}
                      aria-hidden="true"
                    />
                  ))
                : animeList.map((anime) => (
                    <AnimeCard key={anime.id} anime={anime} badgeMode="current" />
                  ))}
            </div>

            {!loading && canScrollRow && (
              <button
                type="button"
                className="latest-scroll-button latest-scroll-button-left"
                aria-label="Scroll left"
                disabled={scrollLeftDisabled}
                onClick={() => scrollRowBy(-1)}
              >
                <ChevronLeft size={22} />
              </button>
            )}

            {!loading && canScrollRow && (
              <button
                type="button"
                className="latest-scroll-button latest-scroll-button-right"
                aria-label="Scroll right"
                disabled={scrollRightDisabled}
                onClick={() => scrollRowBy(1)}
              >
                <ChevronRight size={22} />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default LatestReleases;
