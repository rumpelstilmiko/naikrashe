import { useState } from 'react';
import { getBooks } from '../api/books';
import { PAGE_SIZE } from '../utils/constants';
import { useDebounce } from './useDebounce';
import { useFetch } from './useFetch';

export function useBookSearch() {
  const [filters, setFilters] = useState({ search: '', categoryId: '', sort: 'title' });
  const [page, setPage] = useState(1);
  const search = useDebounce(filters.search);

  const result = useFetch(
    () =>
      getBooks({
        search: search || undefined,
        categoryId: filters.categoryId || undefined,
        sort: filters.sort,
        page,
        size: PAGE_SIZE,
      }),
    [search, filters.categoryId, filters.sort, page],
  );

  const updateFilters = (patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  return { filters, updateFilters, page, setPage, ...result };
}
