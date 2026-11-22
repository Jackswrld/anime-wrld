import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import "../components/styles/Detail.css";
import { fetchAnimeDetail } from "../api/anilist";
import DetailBanner from "./components/DetailBanner";
import DetailSidebar from "./components/DetailSidebar";
import DetailHeader from "./components/DetailHeader";
import DetailRelations from "./components/DetailRelations";
import DetailCharacters from "./components/DetailCharacters";
import DetailStaff from "./components/DetailStaff";
import DetailRecommendations from "./components/DetailRecommendations";
import DetailStreaming from "./components/DetailStreaming";
import DetailTrailer from "./components/DetailTrailer";
import { DetailLoading, DetailError, DetailNotFound } from "./components/DetailStates";

const Detail = () => {
  const { id } = useParams();
  const [media, setMedia] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const loadRef = useRef(() => {});

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setStatus("loading");
      setMedia(null);
      window.scrollTo(0, 0);

      try {
        const result = await fetchAnimeDetail(id);

        if (cancelled) {
          return;
        }

        if (result === null || result.isAdult === true) {
          setStatus("notfound");
          return;
        }

        setMedia(result);
        setStatus("ready");
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error.message);
          setStatus("error");
        }
      }
    };

    loadRef.current = load;
    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status === "loading") {
    return <DetailLoading />;
  }

  if (status === "error") {
    return <DetailError message={errorMessage} onRetry={() => loadRef.current()} />;
  }

  if (status === "notfound") {
    return <DetailNotFound />;
  }

  return (
    <div className="detail-page" data-anime-id={id}>
      <DetailBanner bannerImage={media.bannerImage} color={media.coverImage?.color} />

      <div className="detail-grid">
        <DetailSidebar media={media} />

        <div className="detail-main">
          <DetailHeader media={media} />
          <DetailRelations relations={media.relations} />
          <DetailCharacters characters={media.characters} />
          <DetailStaff staff={media.staff} />
          <DetailRecommendations recommendations={media.recommendations} />
          <DetailStreaming externalLinks={media.externalLinks} />
          <DetailTrailer trailer={media.trailer} />
        </div>
      </div>
    </div>
  );
};

export default Detail;
