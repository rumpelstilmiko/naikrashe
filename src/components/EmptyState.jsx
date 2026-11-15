export default function EmptyState({ title, text, children }) {
  return (
    <div className="empty">
      <p className="empty__title">{title}</p>
      {text && <p className="muted">{text}</p>}
      {children}
    </div>
  );
}
