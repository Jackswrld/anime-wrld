import DetailSection from "./DetailSection";

const HEX_COLOR_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const isValidHexColor = (value) => typeof value === "string" && HEX_COLOR_PATTERN.test(value);

const DetailStreaming = ({ externalLinks }) => {
  const streamingLinks = (externalLinks ?? []).filter((link) => link.type === "STREAMING");

  if (streamingLinks.length === 0) {
    return null;
  }

  return (
    <DetailSection title="Watch Officially">
      <div className="detail-stream-row">
        {streamingLinks.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="detail-stream-pill"
          >
            <span
              className="detail-stream-dot"
              style={{ backgroundColor: isValidHexColor(link.color) ? link.color : "var(--color-accent-cyan)" }}
              aria-hidden="true"
            />
            {link.site}
          </a>
        ))}
      </div>
    </DetailSection>
  );
};

export default DetailStreaming;
