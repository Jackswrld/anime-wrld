const DetailBanner = ({ bannerImage, color }) => {
  const style = bannerImage
    ? { backgroundImage: `url(${bannerImage})` }
    : { backgroundColor: color || "var(--color-bg)" };

  return (
    <div className="detail-banner" style={style}>
      <div className="detail-banner-fade" />
    </div>
  );
};

export default DetailBanner;
