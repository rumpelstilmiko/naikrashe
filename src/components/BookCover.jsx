const hueOf = (text) => [...text].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360;

export default function BookCover({ book }) {
  if (book.coverUrl) {
    return <img className="cover" src={book.coverUrl} alt={`Обложка книги «${book.title}»`} />;
  }
  return (
    <div
      className="cover cover--fallback"
      style={{ '--hue': hueOf(book.title) }}
      role="img"
      aria-label={`Обложка книги «${book.title}»`}
    >
      <span>{book.title}</span>
      <small>{book.author}</small>
    </div>
  );
}
