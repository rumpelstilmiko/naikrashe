import { Link } from 'react-router-dom';
import BookCover from './BookCover';
import { useAuth } from '../store/AuthContext';

export default function BookCard({ book }) {
  const { user } = useAuth();
  const href = user ? `/books/${book.id}` : `/books/qr/${book.qrCode}`;
  return (
    <Link to={href} className="book-card">
      <BookCover book={book} />
      <h3>{book.title}</h3>
      <p className="muted">{book.author}</p>
      <span className={`badge badge--${book.availableCopies > 0 ? 'success' : 'danger'}`}>
        {book.availableCopies > 0 ? `Свободно: ${book.availableCopies}` : 'Все копии выданы'}
      </span>
    </Link>
  );
}
