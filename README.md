# naikrashe
# Онлайн-библиотека: Frontend

Frontend для системы онлайн-библиотеки (Library Management System). Интерфейс работает с готовым Backend API и делится на три зоны:

- **Гость**: просмотр каталога, страница книги по QR-коду, вход.
- **Студент**: поиск и онлайн-чтение книг, личный кабинет.
- **Администратор**: управление книгами, категориями и студентами, выдача и возврат книг.

**Демо:** https://naikrashe.vercel.app/admin/books

## Стек

- React 18 + Vite
- React Router 6: маршрутизация и защищённые роуты по ролям
- Axios: общий клиент с interceptors
- Чистый CSS (mobile first, CSS-переменные, светлая и тёмная темы)
- qrcode: генерация QR-кодов книг
- ESLint + Prettier

## Установка и запуск

Нужен Node.js (LTS).

```bash
git clone https://github.com/rumpelstilmiko/naikrashe.git
cd naikrashe
cp .env.example .env
npm install
npm run dev
```

Приложение откроется на http://localhost:5173.

Другие команды:

```bash
npm run build    # production-сборка
npm run preview  # просмотр сборки
npm run lint     # проверка ESLint
npm run format   # форматирование Prettier
```

## Переменные окружения

Файл `.env.example`:

```
VITE_API_URL=http://localhost:8080/api
VITE_USE_MOCKS=true
```

| Переменная | Описание |
| --- | --- |
| `VITE_API_URL` | Базовый URL Backend API |
| `VITE_USE_MOCKS` | `true` запускает приложение на моках, `false` отправляет запросы на реальный API |

## Как подключиться к реальному API

1. В `.env` укажите `VITE_USE_MOCKS=false`.
2. Укажите адрес бэкенда в `VITE_API_URL`.
3. Перезапустите `npm run dev`.

Все запросы лежат в `src/api/`. Общий клиент (`src/api/client.js`) подставляет JWT в заголовок `Authorization`, а при ответе 401 разлогинивает пользователя и перенаправляет на `/login` с уведомлением «Сессия истекла». Если пути или поля ответов вашего API отличаются, достаточно поправить файлы `auth.js`, `books.js` и `admin.js`.

## Как запустить на моках

Поставьте `VITE_USE_MOCKS=true`. Моки реализованы как адаптер axios (`src/mocks/`), ведут себя как бэкенд и сами считают штрафы и доступность копий. Данные хранятся в памяти и сбрасываются при перезагрузке страницы.

## Тестовые логины (режим моков)

| Роль | Email | Пароль |
| --- | --- | --- |
| ADMIN | `admin@library.kg` | `admin123` |
| STUDENT | `student@library.kg` | `student123` |
| Заблокированный студент | `blocked@library.kg` | `blocked123` |

## Структура проекта

```
src/
  api/          # axios instance и запросы к эндпоинтам
  components/   # переиспользуемые UI-компоненты (Button, Modal, Field, Pagination...)
  pages/        # страницы (Home, Catalog, Login, Profile, Reader...)
    admin/      # страницы администратора
  layouts/      # шаблоны: общий Layout и AdminLayout
  routes/       # роутинг и ProtectedRoute
  store/        # глобальное состояние (Context: авторизация, уведомления)
  hooks/        # кастомные хуки (useFetch, useDebounce, useAction, useTheme...)
  utils/        # валидаторы, форматирование, CSV, константы
  mocks/        # моки API
  styles/       # глобальные стили
```

## Маршруты

| Путь | Доступ |
| --- | --- |
| `/` | все |
| `/books` | все |
| `/books/qr/:code` | все |
| `/login` | все (авторизованный уходит в свою зону) |
| `/books/:id`, `/books/:id/read` | STUDENT, ADMIN |
| `/profile` | STUDENT |
| `/admin`, `/admin/books`, `/admin/categories`, `/admin/students`, `/admin/students/:id`, `/admin/loans` | ADMIN |
| `/403`, `*` | страницы 403 и 404 |

## Скриншоты

### Desktop

<!-- Вставьте скриншоты: главная, каталог, страница книги, профиль студента, дашборд админа, выдача -->

### Mobile

<!-- Вставьте мобильные скриншоты -->

## Выполненные бонусные задачи

- Сохранение прогресса чтения: книга открывается на последней странице
- Графики на дашборде: выдачи за 7 дней
- Экспорт таблиц в CSV (книги, студенты, активные выдачи)
- Тёмная тема с переключателем

## Не реализовано

QR-сканер камерой, бронирование книг, мультиязычность (ru / kg / en), TypeScript, тесты.
