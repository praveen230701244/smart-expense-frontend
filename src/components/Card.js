export default function Card({ title, children }) {
  return (
    <section className="card">
      {title ? <div className="cardTitle">{title}</div> : null}
      <div className="cardBody">{children}</div>
    </section>
  );
}

