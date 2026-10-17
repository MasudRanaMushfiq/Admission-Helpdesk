export default function EmptyState({ title, text, children }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}
