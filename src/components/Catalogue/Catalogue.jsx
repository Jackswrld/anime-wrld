import { useCallback, useEffect, useRef, useState } from "react";
import { Play, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { fetchHeroAnime, selectHeroSlides } from "../../api/anilist";
import LatestReleases from "../LatestReleases";
import Footer from "../Footer";
import "./Catalogue.css";

const AUTO_ADVANCE_MS = 7000;

const sanitizeDescription = (raw) => {
  if (!raw) {
    return "";
  }

  return String(raw)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
};

const Catalogue = () => {
  const [heroSlides, setHeroSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const requestIdRef = useRef(0);

  const loadHeroAnime = useCallback(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    fetchHeroAnime()
      .then((media) => {
        if (requestIdRef.current !== requestId) return;

        const slides = selectHeroSlides(media, 5);

        if (!slides.length) {
          setError("No featured anime available right now. Please try again.");
          setHeroSlides([]);
          return;
        }

        setHeroSlides(slides);
        setCurrentIndex(0);
      })
      .catch(() => {
        if (requestIdRef.current !== requestId) return;
        setError("Couldn't load featured anime. Please try again.");
        setHeroSlides([]);
      })
      .finally(() => {
        if (requestIdRef.current === requestId) {
          setLoading(false);
        }
      });
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    loadHeroAnime();
  };

  useEffect(() => {
    loadHeroAnime();
    return () => {
      requestIdRef.current += 1;
    };
  }, [loadHeroAnime]);

  const goToSlide = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, [heroSlides.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % heroSlides.length);
  }, [heroSlides.length]);

  useEffect(() => {
    if (isPaused || heroSlides.length <= 1) {
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroSlides.length);
    }, AUTO_ADVANCE_MS);

    return () => clearInterval(intervalId);
  }, [currentIndex, isPaused, heroSlides.length]);

  const current = heroSlides[currentIndex];

  const renderHero = () => {
    if (loading) {
      return (
        <div className="catalogue-hero-skeleton-content" aria-hidden="true">
          <div className="catalogue-hero-skeleton-bar catalogue-hero-skeleton-bar-title" />
          <div className="catalogue-hero-skeleton-bar catalogue-hero-skeleton-bar-meta" />
          <div className="catalogue-hero-skeleton-bar catalogue-hero-skeleton-bar-desc" />
          <div className="catalogue-hero-skeleton-bar catalogue-hero-skeleton-bar-button" />
        </div>
      );
    }

    if (error || !current) {
      return (
        <div className="catalogue-hero-error-content">
          <p>{error ?? "No featured anime available right now. Please try again."}</p>
          <button type="button" className="catalogue-hero-retry-btn" onClick={handleRetry}>
            Try Again
          </button>
        </div>
      );
    }

    const displayTitle = current.title?.english ?? current.title?.romaji ?? "";

    const metaParts = [];
    if (current.seasonYear != null) {
      metaParts.push(String(current.seasonYear));
    }
    if (current.duration != null) {
      metaParts.push(`${current.duration} min per ep`);
    }
    if (current.genres && current.genres.length > 0) {
      metaParts.push(current.genres[0]);
    }

    const hasRating = current.averageScore != null;
    const hasStudio = current.studios?.nodes?.length > 0;
    const description = sanitizeDescription(current.description);

    return (
      <>
        <img
          key={current.id}
          className="catalogue-hero-bg"
          src={current.bannerImage}
          alt=""
          aria-hidden="true"
        />
        <div className="catalogue-hero-overlay" aria-hidden="true" />

        <div className="catalogue-hero-content">
          {hasRating && (
            <div className="catalogue-hero-rating">
              <Star className="catalogue-hero-rating-icon" size={16} fill="currentColor" />
              <span>{(current.averageScore / 10).toFixed(1)}/10</span>
            </div>
          )}

          <h1 className="catalogue-hero-title">{displayTitle}</h1>

          {metaParts.length > 0 && (
            <div className="catalogue-hero-meta">
              {metaParts.flatMap((part, index) =>
                index === 0
                  ? [
                      <span key={`part-${index}`}>{part}</span>,
                    ]
                  : [
                      <span key={`sep-${index}`} className="catalogue-hero-dot-sep" aria-hidden="true">
                        •
                      </span>,
                      <span key={`part-${index}`}>{part}</span>,
                    ]
              )}
            </div>
          )}

          <p className="catalogue-hero-description">{description}</p>

          {hasStudio && (
            <p className="catalogue-hero-studio">
              <span className="catalogue-hero-studio-label">Studio:</span>{" "}
              {current.studios.nodes[0].name}
            </p>
          )}

          <button type="button" className="catalogue-hero-cta">
            <Play size={18} fill="currentColor" />
            Watch Now
          </button>
        </div>

        {heroSlides.length > 1 && (
          <>
            <button
              type="button"
              className="catalogue-hero-arrow catalogue-hero-arrow-prev"
              aria-label="Previous slide"
              onClick={goToPrevious}
            >
              <ChevronLeft size={24} />
            </button>

            <button
              type="button"
              className="catalogue-hero-arrow catalogue-hero-arrow-next"
              aria-label="Next slide"
              onClick={goToNext}
            >
              <ChevronRight size={24} />
            </button>

            <div className="catalogue-hero-dots">
              {heroSlides.map((anime, index) => (
                <button
                  key={anime.id}
                  type="button"
                  className={`catalogue-hero-dot${index === currentIndex ? " catalogue-hero-dot-active" : ""}`}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === currentIndex ? "true" : undefined}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          </>
        )}
      </>
    );
  };

  return (
    <>
      <section
        className="catalogue-hero"
        role="region"
        aria-label="Featured anime"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {renderHero()}
      </section>

      <LatestReleases />

      <Footer />
    </>
  );
};

export default Catalogue;
