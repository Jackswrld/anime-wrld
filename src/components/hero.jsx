import heroImage from "../assets/New World.jpg";
import "./styles/Hero.css";

const Hero = () => {
  return (
    <section className="hero-section" id="hero" style={{ backgroundImage: `url("${heroImage}")` }}>
      <div className="hero-content">
        <h1 className="hero-title">
          Welcome To
          <span className="hero-brand">New World</span>
        </h1>

        <p className="hero-description">
          We are not just an anime site for streaming but also the origin and history of anime, you can learn about the
          first anime, best of all time and many more also fun facts about your favorite characters.
        </p>
      </div>
    </section>
  );
};

export default Hero;