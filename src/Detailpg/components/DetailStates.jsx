import { Link } from "react-router-dom";

export const DetailLoading = () => (
  <div className="detail-page">
    <div className="detail-load-banner detail-load-pulse" />
    <div className="detail-grid">
      <div className="detail-load-side detail-load-pulse" />
      <div className="detail-main">
        <div className="detail-load-bar detail-load-bar-title detail-load-pulse" />
        <div className="detail-load-bar detail-load-pulse" />
        <div className="detail-load-bar detail-load-pulse" />
        <div className="detail-load-bar detail-load-pulse" />
      </div>
    </div>
  </div>
);

export const DetailError = ({ message, onRetry }) => (
  <div className="detail-err-wrap">
    <h1 className="detail-err-heading">Something went wrong</h1>
    <p className="detail-err-message">{message}</p>
    <button type="button" className="detail-err-retry" onClick={onRetry}>
      Retry
    </button>
  </div>
);

export const DetailNotFound = () => (
  <div className="detail-404-wrap">
    <h1 className="detail-404-heading">Anime not found</h1>
    <p className="detail-404-message">We couldn&apos;t find the anime you&apos;re looking for.</p>
    <Link to="/" className="detail-404-link">
      Back to home
    </Link>
  </div>
);
