import { useState } from 'react';
import {
  getActiveLoans,
  getDebtors,
  getStudents,
  issueLoan,
  markFinePaid,
  returnLoan,
} from '../../api/admin';
import { getBooks } from '../../api/books';
import { useAction } from '../../hooks/useAction';
import { useDebounce } from '../../hooks/useDebounce';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../store/ToastContext';
import { downloadCsv } from '../../utils/csv';
import { formatDate, formatMoney } from '../../utils/format';
import { positiveInt, required, validate } from '../../utils/validators';
import LoanTable from '../../components/LoanTable';
import ConfirmModal from '../../components/ConfirmModal';
import Field from '../../components/Field';
import Button from '../../components/Button';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';

const SCHEMA = { studentId: [required], bookId: [required], days: [required, positiveInt] };

const CSV_COLUMNS = [
  { label: 'Книга', get: (loan) => loan.book.title },
  { label: 'Студент', get: (loan) => loan.student.fullName },
  { label: 'Выдана', get: (loan) => formatDate(loan.issuedAt) },
  { label: 'Вернуть до', get: (loan) => formatDate(loan.dueDate) },
  { label: 'Штраф', get: (loan) => loan.fine },
];

function IssueForm({ onIssued }) {
  const toast = useToast();
  const [studentSearch, setStudentSearch] = useState('');
  const debounced = useDebounce(studentSearch);
  const students = useFetch(
    () => getStudents({ search: debounced || undefined, size: 20 }),
    [debounced],
  );
  const books = useFetch(() => getBooks({ available: true, size: 100 }));
  const [values, setValues] = useState({ studentId: '', bookId: '', days: 14 });
  const [errors, setErrors] = useState({});

  const [submit, pending] = useAction(async () => {
    await issueLoan(values);
    toast.success('Книга выдана');
    setValues({ studentId: '', bookId: '', days: 14 });
    books.reload();
    onIssued();
  });

  const handleChange = (event) => setValues({ ...values, [event.target.name]: event.target.value });

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = validate(values, SCHEMA);
    setErrors(found);
    if (!Object.keys(found).length) submit();
  };

  return (
    <form className="card" style={{ maxWidth: 520 }} onSubmit={handleSubmit} noValidate>
      <h3>Выдать книгу</h3>
      <Field
        label="Найти студента"
        type="search"
        value={studentSearch}
        onChange={(event) => setStudentSearch(event.target.value)}
      />
      <Field
        as="select"
        label="Студент"
        name="studentId"
        value={values.studentId}
        onChange={handleChange}
        error={errors.studentId}
      >
        <option value="">Выберите студента</option>
        {students.data?.items
          .filter((student) => !student.blocked)
          .map((student) => (
            <option key={student.id} value={student.id}>
              {student.fullName} ({student.group})
            </option>
          ))}
      </Field>
      <Field
        as="select"
        label="Книга (только доступные)"
        name="bookId"
        value={values.bookId}
        onChange={handleChange}
        error={errors.bookId}
      >
        <option value="">Выберите книгу</option>
        {books.data?.items.map((book) => (
          <option key={book.id} value={book.id}>
            {book.title} — свободно {book.availableCopies}
          </option>
        ))}
      </Field>
      <Field
        label="Срок, дней"
        name="days"
        type="number"
        min="1"
        value={values.days}
        onChange={handleChange}
        error={errors.days}
      />
      <Button type="submit" loading={pending}>
        Выдать
      </Button>
    </form>
  );
}

function ActiveLoans({ refreshKey, onChanged }) {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(getActiveLoans, [refreshKey]);
  const [target, setTarget] = useState(null);

  const [confirmReturn, pending] = useAction(async () => {
    const loan = await returnLoan(target.id);
    toast.success(
      loan.fine > 0 ? `Книга принята. Штраф: ${formatMoney(loan.fine)}` : 'Книга принята',
    );
    setTarget(null);
    reload();
    onChanged();
  });

  return (
    <section>
      <div className="row row--between">
        <h2>Активные выдачи</h2>
        <Button
          variant="secondary"
          disabled={!data?.length}
          onClick={() => downloadCsv('loans.csv', CSV_COLUMNS, data)}
        >
          Экспорт CSV
        </Button>
      </div>
      {loading && <Spinner />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data?.length === 0 && <EmptyState title="Активных выдач нет" />}
      {data?.length > 0 && (
        <LoanTable
          loans={data}
          showStudent
          renderActions={(loan) => (
            <Button variant="secondary" onClick={() => setTarget(loan)}>
              Принять возврат
            </Button>
          )}
        />
      )}
      <ConfirmModal
        open={Boolean(target)}
        title="Принять возврат?"
        text={`Книга «${target?.book.title}» от ${target?.student.fullName}.`}
        confirmLabel="Принять"
        loading={pending}
        onConfirm={confirmReturn}
        onClose={() => setTarget(null)}
      />
    </section>
  );
}

function Debtors({ refreshKey, onChanged }) {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(getDebtors, [refreshKey]);
  const [target, setTarget] = useState(null);

  const [confirmPaid, pending] = useAction(async () => {
    await markFinePaid(target.id);
    toast.success('Штраф отмечен как оплаченный');
    setTarget(null);
    reload();
    onChanged();
  });

  return (
    <section>
      <h2>Должники</h2>
      {loading && <Spinner />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data?.length === 0 && <EmptyState title="Должников нет" />}
      {data?.length > 0 && (
        <LoanTable
          loans={data}
          showStudent
          renderActions={(loan) => (
            <Button variant="secondary" onClick={() => setTarget(loan)}>
              Штраф оплачен
            </Button>
          )}
        />
      )}
      <ConfirmModal
        open={Boolean(target)}
        title="Отметить штраф оплаченным?"
        text={`${target?.student.fullName}: ${formatMoney(target?.fine)}.`}
        confirmLabel="Штраф оплачен"
        loading={pending}
        onConfirm={confirmPaid}
        onClose={() => setTarget(null)}
      />
    </section>
  );
}

export default function AdminLoans() {
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((value) => value + 1);

  return (
    <div className="stack">
      <h1>Выдача и возврат</h1>
      <IssueForm onIssued={refresh} />
      <ActiveLoans refreshKey={refreshKey} onChanged={refresh} />
      <Debtors refreshKey={refreshKey} onChanged={refresh} />
    </div>
  );
}
