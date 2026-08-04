import DetailSection from "./DetailSection";

const toTitleCase = (value) =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const ROLE_PRIORITY = { MAIN: 0, SUPPORTING: 1, BACKGROUND: 2 };
const MAX_CHARACTERS = 6;

const getRolePriority = (role) => (role in ROLE_PRIORITY ? ROLE_PRIORITY[role] : 3);

const CharacterCard = ({ edge }) => {
  const { node, voiceActors } = edge;
  const characterImage = node.image?.large || "";
  const va = voiceActors && voiceActors.length > 0 ? voiceActors[0] : null;
  const vaImage = va?.image?.large || "";

  return (
    <div className="detail-char-card">
      <div className="detail-char-side detail-char-side-left">
        {characterImage ? (
          <img className="detail-char-image" src={characterImage} alt="" />
        ) : (
          <div className="detail-char-image detail-char-image-placeholder" aria-hidden="true" />
        )}
        <div className="detail-char-info">
          <span className="detail-char-name">{node.name?.full}</span>
          <span className="detail-char-role">{edge.role && toTitleCase(edge.role)}</span>
        </div>
      </div>

      <div className="detail-char-side detail-char-side-right">
        {va && (
          <>
            <div className="detail-char-va-info">
              <span className="detail-char-va-name">{va.name?.full}</span>
              <span className="detail-char-va-lang">{va.languageV2?.toUpperCase()}</span>
            </div>
            {vaImage ? (
              <img className="detail-char-image" src={vaImage} alt="" />
            ) : (
              <div className="detail-char-image detail-char-image-placeholder" aria-hidden="true" />
            )}
          </>
        )}
      </div>
    </div>
  );
};

const DetailCharacters = ({ characters }) => {
  const edges = characters?.edges ?? [];

  if (edges.length === 0) {
    return null;
  }

  const sortedEdges = [...edges]
    .sort((a, b) => getRolePriority(a.role) - getRolePriority(b.role))
    .slice(0, MAX_CHARACTERS);

  return (
    <DetailSection title="Characters">
      <div className="detail-char-grid">
        {sortedEdges.map((edge) => (
          <CharacterCard key={edge.id} edge={edge} />
        ))}
      </div>
    </DetailSection>
  );
};

export default DetailCharacters;
