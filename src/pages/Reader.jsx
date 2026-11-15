import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getBook, getBookFile } from '../api/books';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../store/AuthContext';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';

const ZOOM_LEVELS = [75, 100, 125, 150, 200];

export default function Reader() {
  const { id } = useParams();
  const { user } = useAuth();
  const progressKey = `reading_progress:${user.id}:${id}`;

  const book = useFetch(() => getBook(id), [id]);
  const file = useFetch(() => getBookFile(id), [id]);
  const [page, setPage] = useState(() => Number(localStorage.getItem(progressKey)) || 1);
  const [zoom, setZoom] = useState(100);
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    if (!file.data) return undefined;
    const url = URL.createObjectURL(file.data);
    setPdfUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file.data]);

  useEffect(() => {
    localStorage.setItem(progressKey, String(page));
  }, [page, progressKey]);

  if (book.loading || file.loading) return <Spinner />;
  if (book.error || file.error) {
    return <ErrorState error={book.error || file.error} onRetry={file.reload} />;
  }

  return (
    <>
      <div className="row row--between">
        <h1>{book.data.title}</h1>
        <Link to={`/books/${id}`} className="btn btn--secondary">
          К описанию
        </Link>
      </div>
      <div className="row reader-bar">
        <Button
          variant="secondary"
          disabled={page <= 1}
          onClick={() => setPage((value) => value - 1)}
        >
          Назад
        </Button>
        <input
          type="number"
          min="1"
          aria-label="Номер страницы"
          value={page}
          onChange={(event) => setPage(Math.max(1, Number(event.target.value) || 1))}
        />
        <Button variant="secondary" onClick={() => setPage((value) => value + 1)}>
          Вперёд
        </Button>
        <select
          aria-label="Масштаб"
          value={zoom}
          onChange={(event) => setZoom(Number(event.target.value))}
        >
          {ZOOM_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}%
            </option>
          ))}
        </select>
      </div>
      <iframe
        key={`${page}-${zoom}`}
        className="reader"
        title={`Чтение: ${book.data.title}`}
        src={pdfUrl ? `${pdfUrl}#page=${page}&zoom=${zoom}` : undefined}
      />
    </>
  );
}
