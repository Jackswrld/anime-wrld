import { Link, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchTrendingAnime } from "../api/anilist";
import "./styles/Trending.css";

const normalizeTrendingAnime = (anime, index) => ({
  id: anime.id,
  title: anime.title?.romaji ?? anime.title?.english ?? "Unknown",
  image: anime.coverImage?.extraLarge ?? anime.coverImage?.large ?? "",
  genres: anime.genres ?? [],
  rank: index + 1,
});

const Trending = () => {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canScrollRow, setCanScrollRow] = useState(false);
  const [scrollLeftDisabled, setScrollLeftDisabled] = useState(true);
  const [scrollRightDisabled, setScrollRightDisabled] = useState(false);
  const scrollRowRef = useRef(null);
  const navigate = useNavigate();

  const updateScrollState = useCallback(() => {
    const el = scrollRowRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollRow(scrollWidth > clientWidth);
    setScrollLeftDisabled(scrollLeft <= 0);
    setScrollRightDisabled(scrollLeft + clientWidth >= scrollWidth - 1);
  }, []);

  const scrollRowBy = (direction) => {
    const el = scrollRowRef.current;
    if (!el) return;

    const card = el.querySelector(".trending-card");
    if (!card) return;

    const style = getComputedStyle(el);
    const gap = parseFloat(style.columnGap || style.gap) || 0;
    const distance = (card.clientWidth + gap) * direction;
    el.scrollBy({ left: distance, behavior: "smooth" });
  };

  const handleScroll = () => {
    const el = scrollRowRef.current;
    if (!el) return;

    setScrollLeftDisabled(el.scrollLeft <= 0);
    setScrollRightDisabled(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollRowBy(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollRowBy(1);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      try {
        const data = await fetchTrendingAnime();
        setAnimeList((data || []).map(normalizeTrendingAnime));
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          if (import.meta.env.DEV) {
            if (fetchError.message.includes("Jikan") || fetchError.message.includes("unavailable")) {
              console.warn("[Trending] Jikan/MAL outage detected", fetchError);
            } else {
              console.warn("[Trending] Unexpected fetch error:", fetchError);
            }
          }

          setError(
            "MyAnimeList is temporarily unreachable — this usually resolves within a few minutes. Tap to retry."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
    return () => controller.abort();
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const data = await fetchTrendingAnime();
        setAnimeList((data || []).map(normalizeTrendingAnime));
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          if (import.meta.env.DEV) {
            if (fetchError.message.includes("Jikan") || fetchError.message.includes("unavailable")) {
              console.warn("[Trending] Jikan/MAL outage detected", fetchError);
            } else {
              console.warn("[Trending] Unexpected fetch error:", fetchError);
            }
          }

          setError(
            "MyAnimeList is temporarily unreachable — this usually resolves within a few minutes. Tap to retry."
          );
        }
      } finally {
        setLoading(false);
      }
    })();
  };

  useEffect(() => {
    const handleResize = () => updateScrollState();

    updateScrollState();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateScrollState, animeList.length, loading]);

  const trendingCards = loading
    ? [1, 2, 3].map((rank) => (
        <article
          className={`trending-card ${
            rank === 1 ? "trending-card-featured" : ""
          } trending-skeleton-card`}
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
      ))
    : animeList.map((anime) => (
        <article
          className={`trending-card ${
            anime.rank === 1 ? "trending-card-featured" : ""
          }`}
          key={anime.id}
        >
          <img src={anime.image} alt={`${anime.title} anime poster`} />
          <span className="trending-rank">#{anime.rank}</span>
          <div className="trending-card-overlay">
            <h3>{anime.title}</h3>
            <span className="trending-genre">
              {anime.genres.length ? anime.genres.join(", ") : "Unknown"}
            </span>
          </div>
        </article>
      ));

  return (
    <section className="trending-section" id="trending">
      <div className="trending-inner">
        <div className="trending-heading">
          <h2>Trending Now</h2>
          <p>What the community is watching right now</p>
        </div>

        <div className="trending-showcase">
          {error ? (
            <div className="trending-error">
              <p>{error}</p>
              <button className="trending-retry-btn" onClick={handleRetry}>
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="trending-scroll-wrapper">
                <div
                  ref={scrollRowRef}
                  className="trending-card-row"
                  aria-label="Trending anime"
                  tabIndex={0}
                  onScroll={handleScroll}
                  onKeyDown={handleKeyDown}
                >
                  {trendingCards}
                </div>

                {canScrollRow && (
                  <button
                    type="button"
                    className="trending-scroll-button trending-scroll-button-left"
                    aria-label="Scroll trending left"
                    disabled={scrollLeftDisabled}
                    onClick={() => scrollRowBy(-1)}
                  >
                    ‹
                  </button>
                )}

                {canScrollRow && (
                  <button
                    type="button"
                    className="trending-scroll-button trending-scroll-button-right"
                    aria-label="Scroll trending right"
                    disabled={scrollRightDisabled}
                    onClick={() => scrollRowBy(1)}
                  >
                    ›
                  </button>
                )}
              </div>

              {!loading && (
                <Link
                  className="trending-view-all"
                  to="/catalogue"
                  onClick={(event) => {
                    event.preventDefault();
                    navigate("/catalogue");
                  }}
                >
                  View All →
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Trending;
