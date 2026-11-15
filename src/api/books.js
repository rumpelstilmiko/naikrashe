import { request } from './client';

export const getBooks = (params) => request({ url: '/books', params });
export const getBook = (id) => request({ url: `/books/${id}` });
export const getBookByQr = (code) => request({ url: `/books/qr/${code}` });
export const getBookFile = (id) => request({ url: `/books/${id}/file`, responseType: 'blob' });

export const saveBook = (id, formData) =>
  request({ method: id ? 'put' : 'post', url: id ? `/books/${id}` : '/books', data: formData });
export const deleteBook = (id) => request({ method: 'delete', url: `/books/${id}` });

export const getCategories = () => request({ url: '/categories' });
export const saveCategory = (id, data) =>
  request({ method: id ? 'put' : 'post', url: id ? `/categories/${id}` : '/categories', data });
export const deleteCategory = (id) => request({ method: 'delete', url: `/categories/${id}` });
