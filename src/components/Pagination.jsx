import Button from './Button';

export default function Pagination({ page, total, size, onChange }) {
  const pages = Math.max(1, Math.ceil(total / size));
  if (pages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Страницы">
      <Button variant="secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Назад
      </Button>
      <span className="muted">
        {page} из {pages}
      </span>
      <Button variant="secondary" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Вперёд
      </Button>
    </nav>
  );
}
