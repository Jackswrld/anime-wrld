import DetailTags from "./DetailTags";

const toTitleCase = (value) =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const capitalizeFirst = (value) => value.charAt(0).toUpperCase() + value.slice(1);

const getMainStudioName = (studios) => {
  const edges = studios?.edges ?? [];
  if (edges.length === 0) {
    return null;
  }
  const mainEdge = edges.find((edge) => edge.isMain) ?? edges[0];
  return mainEdge.node?.name ?? null;
};

const getAllTimeRankings = (rankings) =>
  (rankings ?? []).filter((ranking) => ranking.allTime === true).slice(0, 2);

const DetailSidebar = ({ media }) => {
  const {
    coverImage,
    format,
    episodes,
    duration,
    status,
    season,
    seasonYear,
    averageScore,
    popularity,
    studios,
    source,
    rankings,
    tags,
  } = media;

  const coverSrc = coverImage?.extraLarge || coverImage?.large || "";
  const allTimeRankings = getAllTimeRankings(rankings);
  const studioName = getMainStudioName(studios);

  const seasonLine = [season ? capitalizeFirst(season.toLowerCase()) : null, seasonYear ?? null]
    .filter((part) => part !== null && part !== undefined)
    .join(" ");

  const stats = [
    { label: "Format", value: format },
    { label: "Episodes", value: episodes },
    { label: "Episode Duration", value: duration != null ? `${duration} mins` : null },
    { label: "Status", value: status ? toTitleCase(status) : null },
    { label: "Season", value: seasonLine || null },
    { label: "Average Score", value: averageScore != null ? `${averageScore}%` : null },
    { label: "Popularity", value: popularity != null ? popularity.toLocaleString() : null },
    { label: "Studio", value: studioName },
    { label: "Source", value: source ? toTitleCase(source) : null },
  ].filter((stat) => stat.value !== null && stat.value !== undefined && stat.value !== "");

  return (
    <aside className="detail-side">
      {coverSrc ? (
        <img className="detail-side-cover" src={coverSrc} alt="" />
      ) : (
        <div className="detail-side-cover detail-side-cover-placeholder" aria-hidden="true" />
      )}

      {allTimeRankings.length > 0 && (
        <div className="detail-side-rankings">
          {allTimeRankings.map((ranking) => (
            <div key={ranking.id} className="detail-side-rank-badge">
              <span
                className={
                  ranking.type === "POPULAR"
                    ? "detail-side-rank-icon detail-side-rank-icon-popular"
                    : "detail-side-rank-icon detail-side-rank-icon-rated"
                }
                aria-hidden="true"
              >
                {ranking.type === "POPULAR" ? "♥" : "★"}
              </span>
              <span className="detail-side-rank-text">
                #{ranking.rank} {capitalizeFirst(ranking.context)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="detail-side-stats">
        {stats.map((stat) => (
          <div key={stat.label} className="detail-side-stat-row">
            <span className="detail-side-stat-label">{stat.label}</span>
            <span className="detail-side-stat-value">{stat.value}</span>
          </div>
        ))}
      </div>

      <DetailTags tags={tags} />
    </aside>
  );
};

export default DetailSidebar;
