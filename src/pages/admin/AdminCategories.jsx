import { useState } from 'react';
import { deleteCategory, getCategories, saveCategory } from '../../api/books';
import { useAction } from '../../hooks/useAction';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../store/ToastContext';
import { required, validate } from '../../utils/validators';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import Field from '../../components/Field';
import Button from '../../components/Button';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';

function CategoryForm({ category, onClose, onSaved }) {
  const toast = useToast();
  const [name, setName] = useState(category.name ?? '');
  const [errors, setErrors] = useState({});

  const [submit, pending] = useAction(async () => {
    await saveCategory(category.id, { name });
    toast.success('Категория сохранена');
    onSaved();
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = validate({ name }, { name: [required] });
    setErrors(found);
    if (!Object.keys(found).length) submit();
  };

  return (
    <Modal
      open
      title={category.id ? 'Редактировать категорию' : 'Новая категория'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate>
        <Field
          label="Название"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={errors.name}
        />
        <div className="row row--end">
          <Button variant="secondary" type="button" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" loading={pending}>
            Сохранить
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminCategories() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(getCategories);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const [confirmDelete, deletePending] = useAction(async () => {
    await deleteCategory(deleting.id);
    toast.success('Категория удалена');
    setDeleting(null);
    reload();
  });

  return (
    <>
      <div className="row row--between">
        <h1>Категории</h1>
        <Button onClick={() => setEditing({})}>Добавить категорию</Button>
      </div>
      {loading && <Spinner />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data?.length === 0 && <EmptyState title="Категорий пока нет" />}
      {data?.length > 0 && (
        <div className="table-wrap">
          <table>
            <tbody>
              {data.map((category) => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td className="actions">
                    <Button variant="secondary" onClick={() => setEditing(category)}>
                      Изменить
                    </Button>
                    <Button variant="danger" onClick={() => setDeleting(category)}>
                      Удалить
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && (
        <CategoryForm
          category={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
      <ConfirmModal
        open={Boolean(deleting)}
        title="Удалить категорию?"
        text={`Категория «${deleting?.name}» будет удалена.`}
        confirmLabel="Удалить"
        loading={deletePending}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
