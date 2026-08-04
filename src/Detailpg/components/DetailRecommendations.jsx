import { Link } from "react-router-dom";
import DetailSection from "./DetailSection";

const MAX_RECOMMENDATIONS = 6;

const getRecommendationTitle = (title) => title?.english || title?.romaji || title?.native || "";

const RecommendationCard = ({ node }) => {
  const media = node.mediaRecommendation;
  const coverSrc = media.coverImage?.large || "";
  const title = getRecommendationTitle(media.title);

  return (
    <Link to={`/anime/${media.id}`} className="detail-rec-card">
      {coverSrc ? (
        <img className="detail-rec-cover" src={coverSrc} alt="" />
      ) : (
        <div
          className="detail-rec-cover"
          style={{ backgroundColor: media.coverImage?.color || "var(--color-surface)" }}
          aria-hidden="true"
        />
      )}
      <span className="detail-rec-title">{title}</span>
    </Link>
  );
};

const DetailRecommendations = ({ recommendations }) => {
  const nodes = recommendations?.nodes ?? [];

  const visibleNodes = nodes
    .filter((node) => node.mediaRecommendation != null)
    .filter((node) => !node.mediaRecommendation.isAdult)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, MAX_RECOMMENDATIONS);

  if (visibleNodes.length === 0) {
    return null;
  }

  return (
    <DetailSection title="Recommendations">
      <div className="detail-rec-row">
        {visibleNodes.map((node) => (
          <RecommendationCard key={node.id} node={node} />
        ))}
      </div>
    </DetailSection>
  );
};

export default DetailRecommendations;
