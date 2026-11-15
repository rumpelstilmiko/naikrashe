import { Link, useParams } from 'react-router-dom';
import { getStudent } from '../../api/admin';
import { useFetch } from '../../hooks/useFetch';
import LoanTable from '../../components/LoanTable';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';

export default function StudentCard() {
  const { id } = useParams();
  const { data, loading, error, reload } = useFetch(() => getStudent(id), [id]);

  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const { student, active, history } = data;
  return (
    <div className="stack">
      <Link to="/admin/students">← Все студенты</Link>
      <h1>{student.fullName}</h1>
      <p className="muted">
        {student.email}, группа {student.group}
      </p>
      <section>
        <h2>Книги на руках</h2>
        {active.length ? <LoanTable loans={active} /> : <EmptyState title="Книг на руках нет" />}
      </section>
      <section>
        <h2>История выдач</h2>
        {history.length ? (
          <LoanTable loans={history} showDue={false} />
        ) : (
          <EmptyState title="История пуста" />
        )}
      </section>
    </div>
  );
}
