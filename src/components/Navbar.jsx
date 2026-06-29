import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import logoImage from "../assets/logo.png";
import "./styles/Navbar.css";

const Navbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navbarRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  return (
    <header className="navbar-header" ref={navbarRef}>
      <nav className="navbar-container" aria-label="Main navigation">
        <Link className="navbar-brand" to="/" onClick={closeMobileMenu}>
          <img className="navbar-logo" src={logoImage} alt="New World logo" />
        </Link>

        <div className="navbar-links">
          <Link className="navbar-link" to="/">
            Home
          </Link>
          <Link className="navbar-link" to="/animes">
            Animes
          </Link>
          <Link className="navbar-link" to="/categories">
            Categories
          </Link>
        </div>

        <div className="navbar-actions">
          <label className="navbar-search">
            <input className="navbar-search-input" type="search" placeholder="Search..." />
            <i className="fas fa-search navbar-search-icon" aria-hidden="true" />
          </label>

          <Link className="navbar-latest-button" to="/catalogue">
            Latest Anime
          </Link>
        </div>

        <button
          className="navbar-menu-button"
          type="button"
          onClick={() => setIsMobileOpen((currentValue) => !currentValue)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileOpen}
        >
          <i className={isMobileOpen ? "fas fa-times" : "fas fa-bars"} aria-hidden="true" />
        </button>
      </nav>

      <div className={`navbar-mobile-menu ${isMobileOpen ? "navbar-mobile-menu--open" : ""}`}>
        <Link className="navbar-mobile-link" to="/" onClick={closeMobileMenu}>
          Home
        </Link>
        <Link className="navbar-mobile-link" to="/animes" onClick={closeMobileMenu}>
          Animes
        </Link>
        <Link className="navbar-mobile-link" to="/categories" onClick={closeMobileMenu}>
          Categories
        </Link>

        <label className="navbar-mobile-search">
          <input className="navbar-search-input" type="search" placeholder="Search..." />
          <i className="fas fa-search navbar-search-icon" aria-hidden="true" />
        </label>

        <Link className="navbar-mobile-latest-button" to="/catalogue" onClick={closeMobileMenu}>
          Latest Anime
        </Link>
      </div>
    </header>
  );
};

export default Navbar;



