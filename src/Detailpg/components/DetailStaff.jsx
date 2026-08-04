import DetailSection from "./DetailSection";

const MAX_STAFF = 4;

const StaffCard = ({ edge }) => {
  const { node, role } = edge;
  const image = node.image?.large || "";

  return (
    <div className="detail-staff-card">
      {image ? (
        <img className="detail-staff-image" src={image} alt="" />
      ) : (
        <div className="detail-staff-image detail-staff-image-placeholder" aria-hidden="true" />
      )}
      <div className="detail-staff-info">
        <span className="detail-staff-name">{node.name?.full}</span>
        <span className="detail-staff-role">{role}</span>
      </div>
    </div>
  );
};

const DetailStaff = ({ staff }) => {
  const edges = staff?.edges ?? [];

  if (edges.length === 0) {
    return null;
  }

  const visibleEdges = edges.slice(0, MAX_STAFF);

  return (
    <DetailSection title="Staff">
      <div className="detail-staff-grid">
        {visibleEdges.map((edge) => (
          <StaffCard key={edge.id} edge={edge} />
        ))}
      </div>
    </DetailSection>
  );
};

export default DetailStaff;
