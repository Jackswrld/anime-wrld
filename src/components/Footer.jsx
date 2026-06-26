import "./styles/Footer.css";
import image from "../assets/logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <img src={image} alt="New World logo" className="footer-logo" />
          <div>
            <p className="footer-brand-title">New World Anime</p>
            <p className="footer-brand-text">
              Discover trending anime, fan stories, and fresh picks from the anime world.
            </p>
          </div>
        </div>

        <div className="footer-links">
          <div className="footer-column">
            <h4>Explore</h4>
            <a href="#home">Home</a>
            <a href="#animes">Animes</a>
            <a href="#categories">Categories</a>
          </div>

          <div className="footer-column">
            <h4>Support</h4>
            <a href="#faq">FAQ</a>
            <a href="#contact">Contact</a>
            <a href="#privacy">Privacy</a>
          </div>

          <div className="footer-column">
            <h4>Follow</h4>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              Twitter
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              Facebook
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {currentYear} New World Anime. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

