const DAY_MS = 24 * 60 * 60 * 1000;
const daysFromNow = (days) => new Date(Date.now() + days * DAY_MS).toISOString();

export const FINE_PER_DAY = 10;

export const db = {
  nextId: 100,
  categories: [
    { id: 1, name: 'Программирование' },
    { id: 2, name: 'Литература' },
    { id: 3, name: 'История' },
    { id: 4, name: 'Наука' },
  ],
  users: [
    {
      id: 1,
      fullName: 'Администратор',
      email: 'admin@library.kg',
      password: 'admin123',
      role: 'ADMIN',
    },
    {
      id: 2,
      fullName: 'Айбек Тоилбеков',
      email: 'student@library.kg',
      password: 'student123',
      role: 'STUDENT',
      group: 'ИС-21',
      blocked: false,
    },
    {
      id: 3,
      fullName: 'Айгерим Сыдыкова',
      email: 'aigerim@library.kg',
      password: 'student123',
      role: 'STUDENT',
      group: 'ИС-22',
      blocked: false,
    },
    {
      id: 4,
      fullName: 'Заблокированный Студент',
      email: 'blocked@library.kg',
      password: 'blocked123',
      role: 'STUDENT',
      group: 'ИС-21',
      blocked: true,
    },
  ],
  books: [
    ['Чистый код', 'Роберт Мартин', 1, 3],
    ['Eloquent JavaScript', 'Marijn Haverbeke', 1, 2],
    ['Изучаем React', 'Алекс Бэнкс', 1, 1],
    ['Манас', 'Народный эпос', 2, 4],
    ['Прощай, Гюльсары!', 'Чингиз Айтматов', 2, 3],
    ['Джamilя', 'Чингиз Айтматов', 2, 2],
    ['Краткая история времени', 'Стивен Хокинг', 4, 2],
    ['Sapiens', 'Юваль Ной Харари', 3, 3],
    ['Великий шёлковый путь', 'Валери Хансен', 3, 1],
    ['Космос', 'Карл Саган', 4, 2],
    ['Алгоритмы. Построение и анализ', 'Томас Кормен', 1, 2],
    ['Мастер и Маргарита', 'Михаил Булгаков', 2, 3],
  ].map(([title, author, categoryId, copies], index) => ({
    id: index + 1,
    title: title.replace('Джamilя', 'Джамиля'),
    author,
    categoryId,
    copies,
    description: 'Краткая аннотация книги. В реальном API это поле приходит с бэкенда.',
    coverUrl: null,
    qrCode: `BOOK-${String(index + 1).padStart(4, '0')}`,
    createdAt: daysFromNow(-index * 3),
  })),
  loans: [
    {
      id: 1,
      bookId: 1,
      studentId: 2,
      issuedAt: daysFromNow(-20),
      dueDate: daysFromNow(-5),
      returnedAt: null,
      finePaid: false,
    },
    {
      id: 2,
      bookId: 4,
      studentId: 2,
      issuedAt: daysFromNow(-5),
      dueDate: daysFromNow(2),
      returnedAt: null,
      finePaid: false,
    },
    {
      id: 3,
      bookId: 8,
      studentId: 2,
      issuedAt: daysFromNow(-3),
      dueDate: daysFromNow(11),
      returnedAt: null,
      finePaid: false,
    },
    {
      id: 4,
      bookId: 5,
      studentId: 2,
      issuedAt: daysFromNow(-40),
      dueDate: daysFromNow(-26),
      returnedAt: daysFromNow(-27),
      finePaid: true,
    },
    {
      id: 5,
      bookId: 2,
      studentId: 3,
      issuedAt: daysFromNow(-12),
      dueDate: daysFromNow(-2),
      returnedAt: null,
      finePaid: false,
    },
    {
      id: 6,
      bookId: 7,
      studentId: 3,
      issuedAt: daysFromNow(-2),
      dueDate: daysFromNow(12),
      returnedAt: null,
      finePaid: false,
    },
  ],
};

export const newId = () => {
  db.nextId += 1;
  return db.nextId;
};
