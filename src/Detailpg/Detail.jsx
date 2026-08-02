import { useParams } from "react-router-dom";
import "../components/styles/Detail.css";
import detailFixture from "./detailFixture";
import DetailBanner from "./components/DetailBanner";
import DetailSidebar from "./components/DetailSidebar";
import DetailHeader from "./components/DetailHeader";

const Detail = () => {
  const { id } = useParams();
  const media = detailFixture;

  return (
    <div className="detail-page" data-anime-id={id}>
      <DetailBanner bannerImage={media.bannerImage} color={media.coverImage?.color} />

      <div className="detail-grid">
        <DetailSidebar media={media} />

        <div className="detail-main">
          <DetailHeader media={media} />
        </div>
      </div>
    </div>
  );
};

export default Detail;
