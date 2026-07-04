import { useState } from "react";
import "../components/styles/Anime.css";

const MOCK = [
  { mal_id: 1, title: "Astra Verse" },
  { mal_id: 2, title: "Black Tower" },
  { mal_id: 3, title: "Celestial Dawn" },
  { mal_id: 4, title: "Shadow Pulse" },
  { mal_id: 5, title: "9-Bit Samurai" },
  { mal_id: 6, title: "Arcane Festival" },
  { mal_id: 7, title: "Blue Horizon" },
  { mal_id: 8, title: "Crystal Crown" },
  { mal_id: 9, title: "Silver Warden" },
  { mal_id: 10, title: "Omega Drift" },
  { mal_id: 11, title: "Aurora Break" },
  { mal_id: 12, title: "Brightside" },
  { mal_id: 13, title: "Comet Riders" },
  { mal_id: 14, title: "Specter Code" },
  { mal_id: 15, title: "#Zero Protocol" },
  { mal_id: 16, title: "Alpha Night" },
  { mal_id: 17, title: "Basilisk Flame" },
  { mal_id: 18, title: "Catalyst Arc" },
  { mal_id: 19, title: "Solar Echo" },
  { mal_id: 20, title: "Byte Messiah" },
  { mal_id: 21, title: "Abyss Watch" },
  { mal_id: 22, title: "Beacon Dream" },
  { mal_id: 23, title: "Corsair Legend" },
  { mal_id: 24, title: "Starlight Run" },
  { mal_id: 25, title: "Axion Rift" },
  { mal_id: 26, title: "Blizzard Gate" },
  { mal_id: 27, title: "Chaos Seed" },
  { mal_id: 28, title: "Sentinel Prime" },
  { mal_id: 29, title: "3D Odyssey" },
  { mal_id: 30, title: "Artemis Fall" },
];

const alphabet = ["#", ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))];

function Animes() {
  const [selectedLetter, setSelectedLetter] = useState("A");

  const filteredAnime = MOCK.filter((anime) => {
    const firstChar = anime.title.trim().charAt(0).toUpperCase();
    if (selectedLetter === "#") {
      return /[^A-Z]/.test(firstChar);
    }
    return firstChar === selectedLetter;
  });

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
              onClick={() => setSelectedLetter(letter)}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {filteredAnime.length === 0 ? (
        <div className="animes-empty">No anime found starting with {selectedLetter}</div>
      ) : (
        <div className="animes-list">
          {filteredAnime.map((anime) => (
            <div key={anime.mal_id} className="animes-title">
              {anime.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Animes;
