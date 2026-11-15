import { NavLink, Outlet } from 'react-router-dom';

const TABS = [
  { to: '/admin', label: 'Дашборд', end: true },
  { to: '/admin/books', label: 'Книги' },
  { to: '/admin/categories', label: 'Категории' },
  { to: '/admin/students', label: 'Студенты' },
  { to: '/admin/loans', label: 'Выдача и возврат' },
];

export default function AdminLayout() {
  return (
    <>
      <nav className="tabs" aria-label="Разделы управления">
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.end}>
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </>
  );
}
