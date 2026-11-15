export const required = (value) =>
  value === undefined || value === null || String(value).trim() === '' ? 'Обязательное поле' : '';

export const email = (value) => (/^\S+@\S+\.\S+$/.test(value) ? '' : 'Введите корректный email');

export const minLength = (min) => (value) =>
  String(value).length >= min ? '' : `Минимум ${min} символов`;

export const positiveInt = (value) =>
  Number.isInteger(Number(value)) && Number(value) > 0 ? '' : 'Введите целое число больше нуля';

export const matches = (otherKey, message) => (value, values) =>
  value === values[otherKey] ? '' : message;

export const isImage = (file) =>
  !file || file.type.startsWith('image/') ? '' : 'Нужно изображение';

export const isPdf = (file) => (!file || file.type === 'application/pdf' ? '' : 'Нужен PDF-файл');

export const validate = (values, schema) =>
  Object.fromEntries(
    Object.entries(schema)
      .map(([field, rules]) => [
        field,
        rules.map((rule) => rule(values[field], values)).find(Boolean),
      ])
      .filter(([, message]) => message),
  );
