import { Link } from 'react-router-dom';
import BookCover from './BookCover';
import { useAuth } from '../store/AuthContext';

export default function BookInfo({ book }) {
  const { user } = useAuth();
  const available = book.availableCopies > 0;

  return (
    <div className="details">
      <div className="details__cover">
        <BookCover book={book} />
      </div>
      <div className="stack">
        <h1>{book.title}</h1>
        <p className="muted">{book.author}</p>
        {book.category && <p>Категория: {book.category.name}</p>}
        <p>{book.description}</p>
        <span className={`badge badge--${available ? 'success' : 'danger'}`}>
          {available
            ? `Свободно копий: ${book.availableCopies} из ${book.copies}`
            : 'Все копии сейчас выданы'}
        </span>
        <div>
          {user ? (
            <Link className="btn btn--primary" to={`/books/${book.id}/read`}>
              Читать онлайн
            </Link>
          ) : (
            <Link className="btn btn--secondary" to="/login">
              Войдите, чтобы читать онлайн
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
