import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchTrendingAnime } from "../api/jikan";
import "./styles/Trending.css";

const Trending = () => {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      try {
        const data = await fetchTrendingAnime(controller.signal);
        setAnimeList(data);
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
    const controller = new AbortController();

    (async () => {
      try {
        const data = await fetchTrendingAnime(controller.signal);
        setAnimeList(data);
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
          key={anime.mal_id}
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
              <div className="trending-card-row" aria-label="Trending anime">
                {trendingCards}
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
