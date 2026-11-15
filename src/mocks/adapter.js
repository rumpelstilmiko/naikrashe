import { AxiosError } from 'axios';
import { db, newId, FINE_PER_DAY } from './db';

const DELAY_MS = 350;
const DAY_MS = 24 * 60 * 60 * 1000;

const fail = (status, message, code) => Object.assign(new Error(message), { status, code });

const publicUser = (user) => {
  const copy = { ...user };
  delete copy.password;
  return copy;
};

const fineOf = (loan) => {
  if (loan.returnedAt && loan.finePaid) return 0;
  const end = loan.returnedAt ? new Date(loan.returnedAt) : new Date();
  const overdueDays = Math.max(0, Math.floor((end - new Date(loan.dueDate)) / DAY_MS));
  return overdueDays * FINE_PER_DAY;
};

const loanView = (loan) => {
  const fine = loan.finePaid ? 0 : fineOf(loan);
  const overdue = !loan.returnedAt && new Date(loan.dueDate) < new Date();
  return {
    ...loan,
    book: db.books.find((book) => book.id === loan.bookId),
    student: publicUser(db.users.find((user) => user.id === loan.studentId)),
    fine,
    status: loan.returnedAt ? 'RETURNED' : overdue ? 'OVERDUE' : 'ACTIVE',
  };
};

const activeLoans = () => db.loans.filter((loan) => !loan.returnedAt);

const bookView = (book) => ({
  ...book,
  category: db.categories.find((category) => category.id === book.categoryId),
  availableCopies: book.copies - activeLoans().filter((loan) => loan.bookId === book.id).length,
});

const paginate = (items, { page = 1, size = 8 }) => ({
  items: items.slice((page - 1) * size, page * size),
  total: items.length,
  page: Number(page),
  size: Number(size),
});

const matchesText = (text, query) => !query || text.toLowerCase().includes(query.toLowerCase());

const sortBooks = (books, sort) => {
  const popularity = (book) => db.loans.filter((loan) => loan.bookId === book.id).length;
  const sorters = {
    title: (a, b) => a.title.localeCompare(b.title),
    createdAt: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    popular: (a, b) => popularity(b) - popularity(a),
  };
  return [...books].sort(sorters[sort] || sorters.title);
};

const readBody = (data) => {
  if (!data) return {};
  if (typeof data === 'string') return JSON.parse(data);
  if (data instanceof FormData) return Object.fromEntries(data.entries());
  return data;
};

const bookFromBody = (body, current = {}) => ({
  ...current,
  title: body.title,
  author: body.author,
  categoryId: Number(body.categoryId),
  description: body.description,
  copies: Number(body.copies),
  coverUrl:
    body.cover instanceof File && body.cover.size
      ? URL.createObjectURL(body.cover)
      : (current.coverUrl ?? null),
});

const routes = [
  [
    'post',
    '/auth/login',
    ({ body }) => {
      const found = db.users.find(
        (user) => user.email === body.email && user.password === body.password,
      );
      if (!found) throw fail(401, 'Неверный логин или пароль');
      if (found.blocked)
        throw fail(403, 'Ваш аккаунт заблокирован, обратитесь в библиотеку', 'BLOCKED');
      return { token: `mock.${found.id}`, user: publicUser(found) };
    },
  ],

  [
    'get',
    '/books',
    ({ query }) => {
      const filtered = db.books
        .filter((book) => matchesText(`${book.title} ${book.author}`, query.search))
        .filter((book) => !query.categoryId || book.categoryId === Number(query.categoryId))
        .map(bookView)
        .filter((book) => !query.available || book.availableCopies > 0);
      return paginate(sortBooks(filtered, query.sort), query);
    },
  ],
  [
    'get',
    '/books/qr/:code',
    ({ params }) => {
      const book = db.books.find((item) => item.qrCode === params.code);
      if (!book) throw fail(404, 'Книга не найдена');
      return bookView(book);
    },
  ],
  [
    'get',
    '/books/:id/file',
    async ({ auth }) => {
      if (!auth) throw fail(401, 'Требуется вход');
      const response = await fetch(`${import.meta.env.BASE_URL}sample.pdf`);
      return response.blob();
    },
  ],
  [
    'get',
    '/books/:id',
    ({ params, auth }) => {
      if (!auth) throw fail(401, 'Требуется вход');
      const book = db.books.find((item) => item.id === Number(params.id));
      if (!book) throw fail(404, 'Книга не найдена');
      return bookView(book);
    },
  ],
  [
    'post',
    '/books',
    ({ body, auth }) => {
      if (auth?.role !== 'ADMIN') throw fail(403, 'Нет доступа');
      const id = newId();
      const book = {
        ...bookFromBody(body),
        id,
        qrCode: `BOOK-${String(id).padStart(4, '0')}`,
        createdAt: new Date().toISOString(),
      };
      db.books.unshift(book);
      return bookView(book);
    },
  ],
  [
    'put',
    '/books/:id',
    ({ params, body, auth }) => {
      if (auth?.role !== 'ADMIN') throw fail(403, 'Нет доступа');
      const index = db.books.findIndex((item) => item.id === Number(params.id));
      if (index < 0) throw fail(404, 'Книга не найдена');
      db.books[index] = bookFromBody(body, db.books[index]);
      return bookView(db.books[index]);
    },
  ],
  [
    'delete',
    '/books/:id',
    ({ params, auth }) => {
      if (auth?.role !== 'ADMIN') throw fail(403, 'Нет доступа');
      const id = Number(params.id);
      if (activeLoans().some((loan) => loan.bookId === id))
        throw fail(409, 'Книга сейчас на руках, удалить нельзя');
      db.books = db.books.filter((book) => book.id !== id);
      return null;
    },
  ],

  ['get', '/categories', () => db.categories],
  [
    'post',
    '/categories',
    ({ body }) => {
      const category = { id: newId(), name: body.name };
      db.categories.push(category);
      return category;
    },
  ],
  [
    'put',
    '/categories/:id',
    ({ params, body }) => {
      const category = db.categories.find((item) => item.id === Number(params.id));
      category.name = body.name;
      return category;
    },
  ],
  [
    'delete',
    '/categories/:id',
    ({ params }) => {
      const id = Number(params.id);
      if (db.books.some((book) => book.categoryId === id))
        throw fail(409, 'В категории есть книги, удалить нельзя');
      db.categories = db.categories.filter((category) => category.id !== id);
      return null;
    },
  ],

  [
    'get',
    '/me/loans',
    ({ auth }) => {
      const mine = db.loans.filter((loan) => loan.studentId === auth.id).map(loanView);
      const active = mine.filter((loan) => !loan.returnedAt);
      return {
        active,
        history: mine.filter((loan) => loan.returnedAt),
        totalFine: mine.reduce((sum, loan) => sum + loan.fine, 0),
      };
    },
  ],
  [
    'post',
    '/me/password',
    ({ auth, body }) => {
      const user = db.users.find((item) => item.id === auth.id);
      if (user.password !== body.currentPassword) throw fail(400, 'Текущий пароль указан неверно');
      user.password = body.newPassword;
      return null;
    },
  ],

  [
    'get',
    '/admin/stats',
    () => {
      const loans = db.loans.map(loanView);
      const debtors = new Set(loans.filter((loan) => loan.fine > 0).map((loan) => loan.studentId));
      const byDay = Array.from({ length: 7 }, (_, index) => {
        const day = new Date(Date.now() - (6 - index) * DAY_MS).toLocaleDateString('ru-RU');
        return {
          day,
          count: db.loans.filter(
            (loan) => new Date(loan.issuedAt).toLocaleDateString('ru-RU') === day,
          ).length,
        };
      });
      return {
        totalBooks: db.books.length,
        activeLoans: activeLoans().length,
        debtors: debtors.size,
        unpaidFines: loans.reduce((sum, loan) => sum + loan.fine, 0),
        loansByDay: byDay,
      };
    },
  ],
  [
    'get',
    '/admin/students',
    ({ query }) => {
      const students = db.users
        .filter((user) => user.role === 'STUDENT')
        .filter((user) => matchesText(`${user.fullName} ${user.email}`, query.search))
        .map(publicUser);
      return paginate(students, { size: 50, ...query });
    },
  ],
  [
    'post',
    '/admin/students',
    ({ body }) => {
      if (db.users.some((user) => user.email === body.email))
        throw fail(409, 'Студент с таким email уже есть');
      const student = {
        id: newId(),
        role: 'STUDENT',
        blocked: false,
        fullName: body.fullName,
        email: body.email,
        group: body.group,
        password: body.password,
      };
      db.users.push(student);
      return publicUser(student);
    },
  ],
  [
    'patch',
    '/admin/students/:id/:action',
    ({ params }) => {
      const student = db.users.find((user) => user.id === Number(params.id));
      student.blocked = params.action === 'block';
      return publicUser(student);
    },
  ],
  [
    'get',
    '/admin/students/:id',
    ({ params }) => {
      const student = db.users.find((user) => user.id === Number(params.id));
      if (!student) throw fail(404, 'Студент не найден');
      const loans = db.loans.filter((loan) => loan.studentId === student.id).map(loanView);
      return {
        student: publicUser(student),
        active: loans.filter((loan) => !loan.returnedAt),
        history: loans.filter((loan) => loan.returnedAt),
      };
    },
  ],

  ['get', '/admin/loans', () => activeLoans().map(loanView)],
  ['get', '/admin/debtors', () => db.loans.map(loanView).filter((loan) => loan.fine > 0)],
  [
    'post',
    '/admin/loans',
    ({ body }) => {
      const book = db.books.find((item) => item.id === Number(body.bookId));
      if (bookView(book).availableCopies < 1) throw fail(409, 'Книга уже выдана');
      const loan = {
        id: newId(),
        bookId: book.id,
        studentId: Number(body.studentId),
        issuedAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + Number(body.days) * DAY_MS).toISOString(),
        returnedAt: null,
        finePaid: false,
      };
      db.loans.push(loan);
      return loanView(loan);
    },
  ],
  [
    'post',
    '/admin/loans/:id/return',
    ({ params }) => {
      const loan = db.loans.find((item) => item.id === Number(params.id));
      loan.returnedAt = new Date().toISOString();
      return loanView(loan);
    },
  ],
  [
    'post',
    '/admin/loans/:id/pay-fine',
    ({ params }) => {
      const loan = db.loans.find((item) => item.id === Number(params.id));
      loan.finePaid = true;
      return loanView(loan);
    },
  ],
].map(([method, path, handler]) => ({
  method,
  handler,
  pattern: new RegExp(`^${path.replace(/:\w+/g, '([^/]+)')}$`),
  keys: [...path.matchAll(/:(\w+)/g)].map((match) => match[1]),
}));

const authFromHeaders = (headers) => {
  const token = String(headers?.Authorization ?? '').replace('Bearer ', '');
  const id = token.startsWith('mock.') ? Number(token.slice(5)) : null;
  const user = db.users.find((item) => item.id === id);
  return user && !user.blocked ? user : null;
};

const isPublic = (method, path) =>
  path === '/auth/login' ||
  (method === 'get' &&
    (path === '/books' || path.startsWith('/books/qr/') || path === '/categories'));

const dispatch = async (config) => {
  const method = config.method.toLowerCase();
  const path = `/${config.url}`.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  const auth = authFromHeaders(config.headers);

  if (!isPublic(method, path) && !auth) throw fail(401, 'Сессия истекла');
  if (path.startsWith('/admin') && auth.role !== 'ADMIN') throw fail(403, 'Нет доступа');

  const route = routes.find((item) => item.method === method && item.pattern.test(path));
  if (!route) throw fail(404, 'Эндпоинт не найден');

  const values = path.match(route.pattern).slice(1);
  const params = Object.fromEntries(route.keys.map((key, index) => [key, values[index]]));
  return route.handler({ params, query: config.params || {}, body: readBody(config.data), auth });
};

export const mockAdapter = (config) =>
  new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const data = await dispatch(config);
        resolve({ data, status: 200, statusText: 'OK', headers: {}, config, request: {} });
      } catch (error) {
        const response = {
          data: { message: error.message, code: error.code },
          status: error.status || 500,
          statusText: '',
          headers: {},
          config,
        };
        reject(new AxiosError(error.message, AxiosError.ERR_BAD_REQUEST, config, {}, response));
      }
    }, DELAY_MS);
  });
