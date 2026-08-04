import { useState } from "react";
import { Play } from "lucide-react";
import DetailSection from "./DetailSection";

const DetailTrailer = ({ trailer }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!trailer || !trailer.id || trailer.site?.toLowerCase() !== "youtube") {
    return null;
  }

  return (
    <DetailSection title="Trailer">
      <div className="detail-trailer-frame">
        {isPlaying ? (
          <iframe
            className="detail-trailer-iframe"
            src={`https://www.youtube.com/embed/${trailer.id}?autoplay=1`}
            title="Trailer"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            frameBorder="0"
          />
        ) : (
          <button
            type="button"
            className="detail-trailer-play"
            style={trailer.thumbnail ? { backgroundImage: `url(${trailer.thumbnail})` } : undefined}
            onClick={() => setIsPlaying(true)}
            aria-label="Play trailer"
          >
            <span className="detail-trailer-play-icon-wrap">
              <Play className="detail-trailer-play-icon" aria-hidden="true" />
            </span>
          </button>
        )}
      </div>
    </DetailSection>
  );
};

export default DetailTrailer;
