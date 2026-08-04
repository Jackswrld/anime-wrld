import { useParams } from "react-router-dom";
import "../components/styles/Detail.css";
import detailFixture from "./detailFixture";
import DetailBanner from "./components/DetailBanner";
import DetailSidebar from "./components/DetailSidebar";
import DetailHeader from "./components/DetailHeader";
import DetailRelations from "./components/DetailRelations";
import DetailCharacters from "./components/DetailCharacters";
import DetailStaff from "./components/DetailStaff";

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
          <DetailRelations relations={media.relations} />
          <DetailCharacters characters={media.characters} />
          <DetailStaff staff={media.staff} />
        </div>
      </div>
    </div>
  );
};

export default Detail;
