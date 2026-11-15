import { useState } from 'react';
import { saveBook } from '../../api/books';
import { useAction } from '../../hooks/useAction';
import { useToast } from '../../store/ToastContext';
import { isImage, isPdf, positiveInt, required, validate } from '../../utils/validators';
import Modal from '../../components/Modal';
import Field from '../../components/Field';
import Button from '../../components/Button';

const buildSchema = (isEdit) => ({
  title: [required],
  author: [required],
  categoryId: [required],
  copies: [required, positiveInt],
  cover: [isImage],
  pdf: isEdit ? [isPdf] : [(file) => (file ? '' : 'Загрузите PDF-файл'), isPdf],
});

const initialValues = (book) => ({
  title: book?.title ?? '',
  author: book?.author ?? '',
  categoryId: book?.categoryId ?? '',
  description: book?.description ?? '',
  copies: book?.copies ?? 1,
  cover: null,
  pdf: null,
});

export default function BookFormModal({ open, book, categories, onClose, onSaved }) {
  const toast = useToast();
  const [values, setValues] = useState(() => initialValues(book));
  const [errors, setErrors] = useState({});

  const [submit, pending] = useAction(async () => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => value !== null && formData.append(key, value));
    await saveBook(book?.id, formData);
    toast.success(book ? 'Книга сохранена' : 'Книга успешно добавлена');
    onSaved();
  });

  const setField = (name, value) => setValues((prev) => ({ ...prev, [name]: value }));
  const handleChange = (event) => setField(event.target.name, event.target.value);
  const handleFile = (event) => setField(event.target.name, event.target.files[0] ?? null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = validate(values, buildSchema(Boolean(book)));
    setErrors(found);
    if (!Object.keys(found).length) submit();
  };

  return (
    <Modal open={open} title={book ? 'Редактировать книгу' : 'Добавить книгу'} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <Field
          label="Название"
          name="title"
          value={values.title}
          onChange={handleChange}
          error={errors.title}
        />
        <Field
          label="Автор"
          name="author"
          value={values.author}
          onChange={handleChange}
          error={errors.author}
        />
        <Field
          as="select"
          label="Категория"
          name="categoryId"
          value={values.categoryId}
          onChange={handleChange}
          error={errors.categoryId}
        >
          <option value="">Выберите категорию</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Field>
        <Field
          as="textarea"
          rows={3}
          label="Описание"
          name="description"
          value={values.description}
          onChange={handleChange}
        />
        <Field
          label="Количество копий"
          name="copies"
          type="number"
          min="1"
          value={values.copies}
          onChange={handleChange}
          error={errors.copies}
        />
        <Field
          label="Обложка (изображение)"
          name="cover"
          type="file"
          accept="image/*"
          onChange={handleFile}
          error={errors.cover}
        />
        <Field
          label="Файл книги (PDF)"
          name="pdf"
          type="file"
          accept="application/pdf"
          onChange={handleFile}
          error={errors.pdf}
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
