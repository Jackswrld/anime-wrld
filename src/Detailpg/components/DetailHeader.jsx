import { useState } from "react";

const NAMED_ENTITIES = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

const decodeEntities = (value) =>
  value.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;/g, (match) => NAMED_ENTITIES[match]);

const normalizeDescription = (raw) => {
  if (!raw) {
    return [];
  }

  const withNewlines = raw.replace(/<br\s*\/?>/gi, "\n");
  const withoutTags = withNewlines.replace(/<[^>]*>/g, "");
  const decoded = decodeEntities(withoutTags);

  return decoded
    .split("\n")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
};

const DetailHeader = ({ media }) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const titleVariants = [
    { key: "english", value: media.title?.english },
    { key: "romaji", value: media.title?.romaji },
    { key: "native", value: media.title?.native },
  ];
  const primaryVariant = titleVariants.find((variant) => variant.value) ?? { key: null, value: "" };
  const subtitle = titleVariants
    .filter((variant) => variant.key !== primaryVariant.key && variant.value)
    .map((variant) => variant.value)
    .join(" · ");

  const genres = media.genres ?? [];
  const descriptionParagraphs = normalizeDescription(media.description);
  const isDescriptionLikelyClamped =
    descriptionParagraphs.length > 1 ||
    descriptionParagraphs.some((paragraph) => paragraph.length > 200);

  return (
    <div className="detail-head">
      <h1 className="detail-head-title">{primaryVariant.value}</h1>

      {subtitle && <p className="detail-head-subtitle">{subtitle}</p>}

      {genres.length > 0 && (
        <div className="detail-head-genres">
          {genres.map((genre) => (
            <span key={genre} className="detail-head-genre-pill">
              {genre}
            </span>
          ))}
        </div>
      )}

      {descriptionParagraphs.length > 0 && (
        <div className="detail-head-description">
          <div
            className={
              isDescriptionLikelyClamped && !isDescriptionExpanded
                ? "detail-head-description-text detail-head-description-clamped"
                : "detail-head-description-text"
            }
          >
            {descriptionParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {isDescriptionLikelyClamped && (
            <button
              type="button"
              className="detail-head-description-toggle"
              onClick={() => setIsDescriptionExpanded((current) => !current)}
            >
              {isDescriptionExpanded ? "Read less" : "Read more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DetailHeader;
