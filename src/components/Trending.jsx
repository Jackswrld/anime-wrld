import "./styles/Trending.css";

const trendingAnime = [
  {
    rank: 1,
    title: "Demon Slayer",
    genre: "Action",
    image:
      "https://placehold.co/600x800/172047/f8fafc?text=Demon+Slayer",
  },
  {
    rank: 2,
    title: "Your Name",
    genre: "Romance",
    image:
      "https://placehold.co/600x800/24324f/f8fafc?text=Your+Name",
  },
  {
    rank: 3,
    title: "Re:Zero",
    genre: "Isekai",
    image:
      "https://placehold.co/600x800/1d3140/f8fafc?text=Re%3AZero",
  },
];

const Trending = () => {
  return (
    <section className="trending-section" id="trending">
      <div className="trending-inner">
        <div className="trending-heading">
          <h2>Trending Now</h2>
          <p>What the community is watching right now</p>
        </div>

        <div className="trending-showcase">
          <div className="trending-card-row" aria-label="Trending anime">
            {trendingAnime.map((anime) => (
              <article
                className={`trending-card ${
                  anime.rank === 1 ? "trending-card-featured" : ""
                }`}
                key={anime.title}
              >
                <img src={anime.image} alt={`${anime.title} anime poster`} />
                <span className="trending-rank">#{anime.rank}</span>
                <div className="trending-card-overlay">
                  <h3>{anime.title}</h3>
                  <span className="trending-genre">{anime.genre}</span>
                </div>
              </article>
            ))}
          </div>

          <a className="trending-view-all" href="#trending-all">
            View All →
          </a>
        </div>
      </div>
    </section>
  );
};

export default Trending;
