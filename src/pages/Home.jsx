import { Link } from 'react-router-dom';
import { getBooks } from '../api/books';
import { useFetch } from '../hooks/useFetch';
import BookGrid from '../components/BookGrid';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import { LIBRARY_INFO } from '../utils/constants';

function BookSection({ title, sort }) {
  const { data, loading, error, reload } = useFetch(() => getBooks({ sort, size: 4 }), [sort]);
  return (
    <section className="section">
      <h2>{title}</h2>
      {loading && <Spinner />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && <BookGrid books={data.items} />}
    </section>
  );
}

export default function Home() {
  return (
    <>
      <section className="hero">
        <h1>Читайте онлайн, берите домой</h1>
        <p>
          Найдите книгу в каталоге, отсканируйте QR-код на полке или откройте её прямо в браузере.
        </p>
        <Link to="/books" className="btn btn--primary">
          Открыть каталог
        </Link>
      </section>

      <BookSection title="Новые поступления" sort="createdAt" />
      <BookSection title="Популярные книги" sort="popular" />

      <section className="card">
        <h2>О библиотеке</h2>
        <p>Адрес: {LIBRARY_INFO.address}</p>
        <p>Часы работы: {LIBRARY_INFO.hours}</p>
        <p>
          Контакты: {LIBRARY_INFO.phone}, {LIBRARY_INFO.email}
        </p>
      </section>
    </>
  );
}
