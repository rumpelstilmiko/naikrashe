import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { ROLES } from '../utils/constants';

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="header">
        <div className="container header__inner">
          <Link to="/" className="brand">
            Библиотека
          </Link>
          <button
            className="burger"
            aria-label="Меню"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            ☰
          </button>
          <nav className={`nav ${menuOpen ? 'nav--open' : ''}`} onClick={() => setMenuOpen(false)}>
            <NavLink to="/books">Каталог</NavLink>
            {user?.role === ROLES.STUDENT && <NavLink to="/profile">Мои книги</NavLink>}
            {user?.role === ROLES.ADMIN && <NavLink to="/admin">Управление</NavLink>}
            {!user && <NavLink to="/login">Войти</NavLink>}
            <button className="nav__button" onClick={toggle}>
              {theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
            </button>
            {user && (
              <button className="nav__button" onClick={logout}>
                Выйти
              </button>
            )}
          </nav>
        </div>
      </header>
      <main className="container main">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container muted">Онлайн-библиотека</div>
      </footer>
    </>
  );
}
