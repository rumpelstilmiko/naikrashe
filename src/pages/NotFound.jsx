import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';

export default function NotFound() {
  return (
    <EmptyState
      title="404 — страница не найдена"
      text="Возможно, ссылка устарела или в ней опечатка."
    >
      <Link to="/" className="btn btn--primary">
        На главную
      </Link>
    </EmptyState>
  );
}
