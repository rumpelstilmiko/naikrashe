import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createStudent, getStudents, setStudentBlocked } from '../../api/admin';
import { useAction } from '../../hooks/useAction';
import { useDebounce } from '../../hooks/useDebounce';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../store/ToastContext';
import { downloadCsv } from '../../utils/csv';
import { email, minLength, required, validate } from '../../utils/validators';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import Field from '../../components/Field';
import Button from '../../components/Button';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';

const SCHEMA = {
  fullName: [required],
  email: [required, email],
  group: [required],
  password: [required, minLength(6)],
};

const CSV_COLUMNS = [
  { label: 'ФИО', get: (student) => student.fullName },
  { label: 'Email', get: (student) => student.email },
  { label: 'Группа', get: (student) => student.group },
  { label: 'Статус', get: (student) => (student.blocked ? 'Заблокирован' : 'Активен') },
];

function StudentForm({ onClose, onSaved }) {
  const toast = useToast();
  const [values, setValues] = useState({ fullName: '', email: '', group: '', password: '' });
  const [errors, setErrors] = useState({});

  const [submit, pending] = useAction(async () => {
    await createStudent(values);
    toast.success('Студент добавлен');
    onSaved();
  });

  const handleChange = (event) => setValues({ ...values, [event.target.name]: event.target.value });

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = validate(values, SCHEMA);
    setErrors(found);
    if (!Object.keys(found).length) submit();
  };

  return (
    <Modal open title="Новый студент" onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <Field
          label="ФИО"
          name="fullName"
          value={values.fullName}
          onChange={handleChange}
          error={errors.fullName}
        />
        <Field
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
        />
        <Field
          label="Группа"
          name="group"
          value={values.group}
          onChange={handleChange}
          error={errors.group}
        />
        <Field
          label="Временный пароль"
          name="password"
          type="text"
          autoComplete="off"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />
        <div className="row row--end">
          <Button variant="secondary" type="button" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" loading={pending}>
            Добавить
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminStudents() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const { data, loading, error, reload } = useFetch(
    () => getStudents({ search: debounced || undefined }),
    [debounced],
  );
  const [adding, setAdding] = useState(false);
  const [target, setTarget] = useState(null);

  const [confirmToggle, pending] = useAction(async () => {
    await setStudentBlocked(target.id, !target.blocked);
    toast.success(target.blocked ? 'Студент разблокирован' : 'Студент заблокирован');
    setTarget(null);
    reload();
  });

  return (
    <>
      <div className="row row--between">
        <h1>Студенты</h1>
        <div className="row">
          <Button
            variant="secondary"
            disabled={!data?.items.length}
            onClick={() => downloadCsv('students.csv', CSV_COLUMNS, data.items)}
          >
            Экспорт CSV
          </Button>
          <Button onClick={() => setAdding(true)}>Добавить студента</Button>
        </div>
      </div>
      <Field
        label="Поиск по имени или email"
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {loading && <Spinner />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {!loading && data?.items.length === 0 && (
        <EmptyState title="По вашему запросу ничего не найдено" />
      )}
      {!loading && data?.items.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ФИО</th>
                <th>Email</th>
                <th>Группа</th>
                <th>Статус</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.items.map((student) => (
                <tr key={student.id}>
                  <td>
                    <Link to={`/admin/students/${student.id}`}>{student.fullName}</Link>
                  </td>
                  <td>{student.email}</td>
                  <td>{student.group}</td>
                  <td>
                    <span className={`badge badge--${student.blocked ? 'danger' : 'success'}`}>
                      {student.blocked ? 'Заблокирован' : 'Активен'}
                    </span>
                  </td>
                  <td className="actions">
                    <Button variant="secondary" onClick={() => setTarget(student)}>
                      {student.blocked ? 'Разблокировать' : 'Заблокировать'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {adding && (
        <StudentForm
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            reload();
          }}
        />
      )}
      <ConfirmModal
        open={Boolean(target)}
        title={target?.blocked ? 'Разблокировать студента?' : 'Заблокировать студента?'}
        text={`${target?.fullName}${target?.blocked ? ' снова сможет входить в систему.' : ' не сможет войти в систему.'}`}
        confirmLabel={target?.blocked ? 'Разблокировать' : 'Заблокировать'}
        loading={pending}
        onConfirm={confirmToggle}
        onClose={() => setTarget(null)}
      />
    </>
  );
}
