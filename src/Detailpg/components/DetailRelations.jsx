import { Link } from "react-router-dom";
import DetailSection from "./DetailSection";

const formatTitleCase = (value) =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const getRelationTitle = (node) => node.title?.english || node.title?.romaji || node.title?.native || "";

const getMetaLine = (node) => {
  const parts = [
    node.format ? formatTitleCase(node.format) : null,
    node.status ? formatTitleCase(node.status) : null,
  ].filter(Boolean);

  return parts.join(" · ");
};

const RelationCardContent = ({ edge, metaLine }) => {
  const { node } = edge;
  const coverSrc = node.coverImage?.large || "";

  return (
    <>
      {coverSrc ? (
        <img className="detail-rel-thumb" src={coverSrc} alt="" />
      ) : (
        <div
          className="detail-rel-thumb detail-rel-thumb-placeholder"
          style={{ backgroundColor: node.coverImage?.color || "var(--color-surface)" }}
          aria-hidden="true"
        />
      )}
      <div className="detail-rel-info">
        <span className="detail-rel-type">{formatTitleCase(edge.relationType)}</span>
        <span className="detail-rel-title">{getRelationTitle(node)}</span>
        {metaLine && <span className="detail-rel-meta">{metaLine}</span>}
      </div>
    </>
  );
};

const RelationCard = ({ edge }) => {
  const { node } = edge;
  const metaLine = getMetaLine(node);

  if (node.type === "ANIME") {
    return (
      <Link to={`/anime/${node.id}`} className="detail-rel-card detail-rel-card-link">
        <RelationCardContent edge={edge} metaLine={metaLine} />
      </Link>
    );
  }

  return (
    <div className="detail-rel-card">
      <RelationCardContent edge={edge} metaLine={metaLine} />
    </div>
  );
};

const DetailRelations = ({ relations }) => {
  const edges = (relations?.edges ?? []).filter((edge) => !edge.node.isAdult);

  if (edges.length === 0) {
    return null;
  }

  return (
    <DetailSection title="Relations">
      <div className="detail-rel-grid">
        {edges.map((edge) => (
          <RelationCard key={edge.id} edge={edge} />
        ))}
      </div>
    </DetailSection>
  );
};

export default DetailRelations;
