import { useParams } from 'react-router-dom';
import { getBook } from '../api/books';
import { useFetch } from '../hooks/useFetch';
import BookInfo from '../components/BookInfo';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';

export default function BookDetails() {
  const { id } = useParams();
  const { data, loading, error, reload } = useFetch(() => getBook(id), [id]);

  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  return <BookInfo book={data} />;
}
