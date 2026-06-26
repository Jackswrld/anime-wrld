import { useState } from "react";
import "./styles/FAC.css";
import gojo from "../assets/Gojo Satoru.jpg"
import luffy from "../assets/OnePiece.jpg"
import levi  from "../assets/levi.jpg"


// TODO: Replace mock data with Jikan API fetch when API phase begins
// Endpoint: https://api.jikan.moe/v4/characters
// This component is built scroll-ready for infinite data
const characters = [
  {
    id: 1,
    name: "Gojo Satoru",
    anime: "Jujutsu Kaisen",
    role: "Special Grade Jujutsu Sorcerer and teacher at Tokyo Jujutsu High",
    age: 28,
    flaws: ["Overconfident at times", "Underestimates opponents", "Emotionally distant", "Relies too heavily on his own power"],
    abilities: ["Infinity", "Six Eyes", "Unlimited Void", "Hollow Purple"],
    image: gojo,
    learnMore: "#",
  },
  {
    id: 2,
    name: "Monkey D. Luffy",
    anime: "One Piece",
    role: "Captain of the Straw Hat Pirates, determined to become King of the Pirates",
    age: 19,
    flaws: ["Reckless decision making", "Poor strategic thinking", "Easily manipulated through his friends", "Ignores danger signs"],
    abilities: ["Gum-Gum Fruit", "Haki", "Gear Fifth", "Conqueror's Haki"],
    image: luffy,
    learnMore: "#",
  },
  {
    id: 3,
    name: "Levi Ackerman",
    anime: "Attack on Titan",
    role: "Captain of the Survey Corps, humanity's strongest soldier",
    age: 30,
    flaws: ["Emotionally closed off", "Overly harsh with words", "Struggles to show vulnerability", "Carries guilt heavily"],
    abilities: ["Ackerman Power", "Masterful blade combat", "Omni-directional mobility", "Superhuman reflex"],
    image: levi,
    learnMore: "#",
  },
  {
    id: 4,
    name: "Naruto Uzumaki",
    anime: "Naruto",
    role: "Seventh Hokage of the Hidden Leaf Village",
    age: 17,
    flaws: ["Impulsive in battle", "Academically slow", "Stubborn to a fault", "Lets emotions override logic"],
    abilities: ["Nine-Tails Chakra Mode", "Shadow Clone Jutsu", "Rasengan", "Sage Mode"],
    image: "https://placehold.co/300x300?text=Naruto",
    learnMore: "#",
  },
  {
    id: 5,
    name: "Itachi Uchiha",
    anime: "Naruto",
    role: "Former ANBU Captain and Akatsuki member, secret protector of the Leaf",
    age: 21,
    flaws: ["Kept devastating secrets", "Sacrificed bonds for duty", "Cold exterior hides deep pain", "Undervalued his own life"],
    abilities: ["Sharingan", "Tsukuyomi", "Amaterasu", "Susanoo"],
    image: "https://placehold.co/300x300?text=Itachi",
    learnMore: "#",
  },
  {
    id: 6,
    name: "Mikasa Ackerman",
    anime: "Attack on Titan",
    role: "Elite soldier of the Survey Corps, fiercely loyal protector",
    age: 19,
    flaws: ["Overly protective of Eren", "Suppresses her own emotions", "Struggles with identity", "Puts others above herself dangerously"],
    abilities: ["Ackerman bloodline power", "Elite blade combat", "Tactical speed", "Superhuman endurance"],
    image: "https://placehold.co/300x300?text=Mikasa",
    learnMore: "#",
  },
  {
    id: 7,
    name: "Killua Zoldyck",
    anime: "Hunter x Hunter",
    role: "Former assassin from the Zoldyck family, Gon's closest friend",
    age: 12,
    flaws: ["Self-doubt in critical moments", "Conditioned to flee from stronger enemies", "Struggles with self-worth", "Overprotective of Gon"],
    abilities: ["Godspeed", "Transmutation Nen", "Lightning Aura", "Assassin techniques"],
    image: "https://placehold.co/300x300?text=Killua",
    learnMore: "#",
  },
  {
    id: 8,
    name: "Zero Two",
    anime: "Darling in the FranXX",
    role: "Elite FranXX pilot known as a Partner Killer",
    age: 16,
    flaws: ["Emotionally unpredictable", "Dangerous to her partners", "Struggles with human connection", "Acts on instinct over reason"],
    abilities: ["Hybrid Klaxosaur strength", "Strelizia piloting", "Accelerated healing", "Enhanced combat instincts"],
    image: "https://placehold.co/300x300?text=ZeroTwo",
    learnMore: "#",
  },
  {
    id: 9,
    name: "Light Yagami",
    anime: "Death Note",
    role: "Genius student turned self-appointed god of a new world",
    age: 17,
    flaws: ["God complex", "Manipulates everyone around him", "Cannot accept failure", "Loses his humanity progressively"],
    abilities: ["Death Note mastery", "Genius-level intellect", "Psychological manipulation", "Meticulous planning"],
    image: "https://placehold.co/300x300?text=Light",
    learnMore: "#",
  },
  {
    id: 10,
    name: "Rimuru Tempest",
    anime: "That Time I Got Reincarnated as a Slime",
    role: "Demon Lord and founder of the Jura Tempest Federation",
    age: 39,
    flaws: ["Too trusting of allies", "Hesitates before using full power", "Takes on too much responsibility alone", "Naive about political threats"],
    abilities: ["Great Sage", "Predator skill", "Rimuru's Unique Skills", "Infinite Regeneration"],
    image: "https://placehold.co/300x300?text=Rimuru",
    learnMore: "#",
  },
];

const FAC = () => {
  const [selectedCharacter, setSelectedCharacter] = useState(characters[0]);
  const [isFading, setIsFading] = useState(false);

  const handleCharacterSelect = (character) => {
    if (character.id === selectedCharacter.id || isFading) {
      return;
    }

    setIsFading(true);

    window.setTimeout(() => {
      setSelectedCharacter(character);
      setIsFading(false);
    }, 300);
  };

  return (
    <section className="fac-section" aria-labelledby="fac-title">
      <div className="fac-inner">
        <div className="fac-header">
          <p className="fac-label">Favorite Anime Characters</p>
          <h2 className="fac-title" id="fac-title">
            F.A.C
          </h2>
        </div>

        <div className="fac-layout">
          <aside className="fac-portrait-panel" aria-label="Favorite character list">
            {characters.map((character) => (
              <button
                className={`fac-portrait-card${selectedCharacter.id === character.id ? " fac-portrait-card-active" : ""}`}
                type="button"
                key={character.id}
                onClick={() => handleCharacterSelect(character)}
                aria-pressed={selectedCharacter.id === character.id}
              >
                <img className="fac-portrait-image" src={character.image} alt={character.name} />
                <span className="fac-portrait-name">{character.name}</span>
                <span className="fac-portrait-anime">{character.anime}</span>
              </button>
            ))}
          </aside>

          <article className={`fac-detail-card${isFading ? " fac-detail-card-fading" : ""}`}>
            <img className="fac-detail-image" src={selectedCharacter.image} alt={selectedCharacter.name} />

            <div className="fac-detail-body">
              <h3 className="fac-character-name">{selectedCharacter.name}</h3>

              <div className="fac-meta-block">
                <span className="fac-meta-label">Role</span>
                <p>{selectedCharacter.role}</p>
              </div>

              <div className="fac-age-row">
                <span className="fac-meta-label">Age</span>
                <span className="fac-age-badge">{selectedCharacter.age}</span>
              </div>

              <div className="fac-list-block">
                <h4>Character Flaws</h4>
                <ul className="fac-info-list">
                  {selectedCharacter.flaws.map((flaw) => (
                    <li key={flaw}>{flaw}</li>
                  ))}
                </ul>
              </div>

              <div className="fac-list-block">
                <h4>Abilities</h4>
                <ul className="fac-info-list">
                  {selectedCharacter.abilities.map((ability) => (
                    <li key={ability}>{ability}</li>
                  ))}
                </ul>
              </div>

              <a className="fac-learn-more" href={selectedCharacter.learnMore}>
                Learn More
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default FAC;
