import { useBookSearch } from '../hooks/useBookSearch';
import { PAGE_SIZE } from '../utils/constants';
import BookFilters from '../components/BookFilters';
import BookGrid from '../components/BookGrid';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

export default function Catalog() {
  const { filters, updateFilters, page, setPage, data, loading, error, reload } = useBookSearch();

  return (
    <>
      <h1>Каталог</h1>
      <BookFilters filters={filters} onChange={updateFilters} />
      {loading && <Spinner />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {!loading && data?.items.length === 0 && (
        <EmptyState title="По вашему запросу ничего не найдено" />
      )}
      {!loading && data?.items.length > 0 && (
        <>
          <BookGrid books={data.items} />
          <Pagination page={page} total={data.total} size={PAGE_SIZE} onChange={setPage} />
        </>
      )}
    </>
  );
}
