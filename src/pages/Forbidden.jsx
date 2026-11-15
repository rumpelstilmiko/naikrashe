import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';

export default function Forbidden() {
  return (
    <EmptyState
      title="403 — нет доступа"
      text="У вашей учётной записи нет прав для просмотра этой страницы."
    >
      <Link to="/" className="btn btn--primary">
        На главную
      </Link>
    </EmptyState>
  );
}
