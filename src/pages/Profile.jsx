import { useState } from 'react';
import { changePassword, getMyLoans } from '../api/auth';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';
import { useAction } from '../hooks/useAction';
import { useFetch } from '../hooks/useFetch';
import { formatMoney } from '../utils/format';
import { matches, minLength, required, validate } from '../utils/validators';
import LoanTable from '../components/LoanTable';
import Field from '../components/Field';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const SCHEMA = {
  currentPassword: [required],
  newPassword: [required, minLength(6)],
  confirmPassword: [required, matches('newPassword', 'Пароли не совпадают')],
};
const EMPTY_FORM = { currentPassword: '', newPassword: '', confirmPassword: '' };

function PasswordForm() {
  const toast = useToast();
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const [submit, pending] = useAction(async () => {
    await changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
    setValues(EMPTY_FORM);
    toast.success('Пароль изменён');
  });

  const handleChange = (event) => setValues({ ...values, [event.target.name]: event.target.value });

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = validate(values, SCHEMA);
    setErrors(found);
    if (!Object.keys(found).length) submit();
  };

  return (
    <form className="card" style={{ maxWidth: 420 }} onSubmit={handleSubmit} noValidate>
      <h3>Смена пароля</h3>
      <Field
        label="Текущий пароль"
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        value={values.currentPassword}
        onChange={handleChange}
        error={errors.currentPassword}
      />
      <Field
        label="Новый пароль"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        value={values.newPassword}
        onChange={handleChange}
        error={errors.newPassword}
      />
      <Field
        label="Повторите новый пароль"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        value={values.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
      />
      <Button type="submit" loading={pending}>
        Сменить пароль
      </Button>
    </form>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useFetch(getMyLoans);

  return (
    <>
      <h1>Мои книги</h1>
      {loading && <Spinner />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && (
        <div className="stack">
          {data.totalFine > 0 && (
            <p className="badge badge--danger">Текущие штрафы: {formatMoney(data.totalFine)}</p>
          )}

          <section>
            <h2>На руках</h2>
            {data.active.length === 0 ? (
              <EmptyState title="У вас пока нет книг" />
            ) : (
              <LoanTable loans={data.active} />
            )}
          </section>

          <section>
            <h2>История</h2>
            {data.history.length === 0 ? (
              <EmptyState title="История пуста" />
            ) : (
              <LoanTable loans={data.history} showDue={false} />
            )}
          </section>
        </div>
      )}

      <section className="section" style={{ marginTop: 40 }}>
        <h2>Профиль</h2>
        <div className="card" style={{ maxWidth: 420, marginBottom: 16 }}>
          <p>{user.fullName}</p>
          <p className="muted">{user.email}</p>
          {user.group && <p className="muted">Группа: {user.group}</p>}
        </div>
        <PasswordForm />
      </section>
    </>
  );
}
