import { getCategories } from '../api/books';
import { useFetch } from '../hooks/useFetch';
import Field from './Field';

export default function BookFilters({ filters, onChange }) {
  const { data: categories } = useFetch(getCategories);

  return (
    <div className="filters">
      <Field
        label="Поиск по названию или автору"
        type="search"
        value={filters.search}
        onChange={(event) => onChange({ search: event.target.value })}
      />
      <Field
        as="select"
        label="Категория"
        value={filters.categoryId}
        onChange={(event) => onChange({ categoryId: event.target.value })}
      >
        <option value="">Все категории</option>
        {categories?.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Field>
      <Field
        as="select"
        label="Сортировка"
        value={filters.sort}
        onChange={(event) => onChange({ sort: event.target.value })}
      >
        <option value="title">По названию</option>
        <option value="createdAt">Сначала новые</option>
      </Field>
    </div>
  );
}
