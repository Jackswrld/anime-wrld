import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./styles/Trending.css";

const Trending = () => {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    const loadTrending = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "https://api.jikan.moe/v4/top/anime?limit=3",
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const json = await response.json();

        const mapped = (json.data || []).map((item, index) => ({
          mal_id: item.mal_id,
          title: item.title,
          image: item.images?.jpg?.large_image_url ?? "",
          genres: item.genres?.slice(0, 2).map((genre) => genre.name) ?? ["Unknown"],
          score: item.score ?? "N/A",
          synopsis: item.synopsis ?? "",
          rank: index + 1,
        }));

        setAnimeList(mapped);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setError("Failed to load trending anime.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadTrending();

    return () => controller.abort();
  }, []);

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
            <div className="trending-error">{error}</div>
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
