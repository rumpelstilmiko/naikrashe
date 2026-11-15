import { useState } from 'react';
import { deleteBook, getCategories } from '../../api/books';
import { useAction } from '../../hooks/useAction';
import { useBookSearch } from '../../hooks/useBookSearch';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../store/ToastContext';
import { PAGE_SIZE } from '../../utils/constants';
import { downloadCsv } from '../../utils/csv';
import BookFilters from '../../components/BookFilters';
import Pagination from '../../components/Pagination';
import ConfirmModal from '../../components/ConfirmModal';
import Button from '../../components/Button';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import BookFormModal from './BookFormModal';
import QrModal from './QrModal';

const CSV_COLUMNS = [
  { label: 'Название', get: (book) => book.title },
  { label: 'Автор', get: (book) => book.author },
  { label: 'Категория', get: (book) => book.category?.name },
  { label: 'Копий', get: (book) => book.copies },
  { label: 'Свободно', get: (book) => book.availableCopies },
];

export default function AdminBooks() {
  const toast = useToast();
  const { filters, updateFilters, page, setPage, data, loading, error, reload } = useBookSearch();
  const { data: categories } = useFetch(getCategories);
  const [editing, setEditing] = useState(null);
  const [qrBook, setQrBook] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const [confirmDelete, deletePending] = useAction(async () => {
    await deleteBook(deleting.id);
    toast.success('Книга удалена');
    setDeleting(null);
    reload();
  });

  const closeForm = () => setEditing(null);

  return (
    <>
      <div className="row row--between">
        <h1>Книги</h1>
        <div className="row">
          <Button
            variant="secondary"
            disabled={!data?.items.length}
            onClick={() => downloadCsv('books.csv', CSV_COLUMNS, data.items)}
          >
            Экспорт CSV
          </Button>
          <Button onClick={() => setEditing({})}>Добавить книгу</Button>
        </div>
      </div>

      <BookFilters filters={filters} onChange={updateFilters} />

      {loading && <Spinner />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {!loading && data?.items.length === 0 && (
        <EmptyState title="По вашему запросу ничего не найдено" />
      )}
      {!loading && data?.items.length > 0 && (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Автор</th>
                  <th>Категория</th>
                  <th>Свободно</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.items.map((book) => (
                  <tr key={book.id}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.category?.name}</td>
                    <td>
                      {book.availableCopies} / {book.copies}
                    </td>
                    <td className="actions">
                      <Button variant="secondary" onClick={() => setQrBook(book)}>
                        QR
                      </Button>
                      <Button variant="secondary" onClick={() => setEditing(book)}>
                        Изменить
                      </Button>
                      <Button variant="danger" onClick={() => setDeleting(book)}>
                        Удалить
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} total={data.total} size={PAGE_SIZE} onChange={setPage} />
        </>
      )}

      {editing && categories && (
        <BookFormModal
          open
          book={editing.id ? editing : null}
          categories={categories}
          onClose={closeForm}
          onSaved={() => {
            closeForm();
            reload();
          }}
        />
      )}
      <QrModal book={qrBook} onClose={() => setQrBook(null)} />
      <ConfirmModal
        open={Boolean(deleting)}
        title="Удалить книгу?"
        text={`Книга «${deleting?.title}» будет удалена без возможности восстановления.`}
        confirmLabel="Удалить"
        loading={deletePending}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
