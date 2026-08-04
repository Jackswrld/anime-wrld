const isEmptyChildren = (children) => {
  if (children === null || children === undefined || children === false) {
    return true;
  }

  if (Array.isArray(children)) {
    return children.length === 0;
  }

  return false;
};

const DetailSection = ({ title, children }) => {
  if (isEmptyChildren(children)) {
    return null;
  }

  return (
    <section className="detail-sec">
      <h2 className="detail-sec-heading">{title}</h2>
      {children}
    </section>
  );
};

export default DetailSection;
