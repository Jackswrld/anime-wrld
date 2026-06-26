import "./styles/History.css";
import namakuraPoster from "../assets/first.jpg";
import narutoPoster from "../assets/naruto.jpg";

const timelineEntries = [
  {
    range: "1910s - 1940s",
    title: "Early Years",
    text: "Japanese animation began in 1917 with films like Namakura-gatana (The Dull Sword). Influenced by Western animation, pioneers like Seitaro Kitayama and Jun'ichi Kouchi emerged. World War II saw anime used for propaganda and nationalistic purposes.",
  },
  {
    range: "1940s - 1960s",
    title: "Post-War Era",
    text: "Osamu Tezuka's Astro Boy (1963) revolutionized anime with modern styles and storytelling. Tezuka's production studio set industry standards.",
    featured: true,
  },
  {
    range: "1990s - 2000s",
    title: "Global Recognition",
    text: "Dragon Ball Z, Sailor Moon, and Pokemon gained international popularity. Anime conventions and online communities emerged worldwide.",
  },
  {
    range: "2010s - present",
    title: "Modern Era",
    text: "Digital production and streaming services increased accessibility globally. Hits like Attack on Titan, One Piece, and Demon Slayer solidified anime's global appeal.",
  },
];

const animeCards = [
  {
    title: "Namakura-gatana",
    subtitle: "The First Anime Ever Created",
    image: namakuraPoster,
  },
  {
    title: "Naruto",
    subtitle: "Best Anime of All Time",
    image: narutoPoster,
  },
];

const History = () => {
  return (
    <section className="history-section" id="history">
      <div className="history-inner">
        <div className="history-content">
          <div className="history-heading">
            <h2>History</h2>
            <p>About Anime</p>
          </div>

          <div className="history-timeline" aria-label="Anime history timeline">
            {timelineEntries.map((entry) => (
              <article className="history-entry" key={entry.title}>
                <span className="history-dot" aria-hidden="true" />
                <span className="history-badge">{entry.range}</span>
                <h3>{entry.title}</h3>
                <p className={entry.featured ? "history-featured-text" : ""}>
                  {entry.text}
                </p>
              </article>
            ))}
          </div>

          <a className="history-read-more" href="https://en.wikipedia.org/wiki/History_of_anime" target="_blank" rel="noopener noreferrer">
            Read More
          </a>
        </div>

        <div className="history-card-column" aria-label="Historic anime cards">
          {animeCards.map((anime) => (
            <article className="history-anime-card" key={anime.title}>
              <div className="history-card-copy">
                <h3>{anime.title}</h3>
                <p>{anime.subtitle}</p>
              </div>
              <img src={anime.image} alt={`${anime.title} poster`} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default History;
