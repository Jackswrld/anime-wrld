import { useState } from "react";

const VISIBLE_COUNT = 8;

const isFilteredOut = (tag) =>
  tag.isMediaSpoiler || tag.isGeneralSpoiler || tag.isAdult || /hentai/i.test(tag.name);

const DetailTags = ({ tags }) => {
  const [showAll, setShowAll] = useState(false);

  const visibleTags = (tags ?? [])
    .filter((tag) => !isFilteredOut(tag))
    .sort((a, b) => b.rank - a.rank);

  if (visibleTags.length === 0) {
    return null;
  }

  const shownTags = showAll ? visibleTags : visibleTags.slice(0, VISIBLE_COUNT);
  const hasMore = visibleTags.length > VISIBLE_COUNT;

  return (
    <div className="detail-tag-panel">
      {shownTags.map((tag) => (
        <div key={tag.id} className="detail-tag-row">
          <span className="detail-tag-name">{tag.name}</span>
          <span className="detail-tag-rank">{tag.rank}%</span>
        </div>
      ))}

      {hasMore && (
        <button
          type="button"
          className="detail-tag-toggle"
          onClick={() => setShowAll((current) => !current)}
        >
          {showAll ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
};

export default DetailTags;
