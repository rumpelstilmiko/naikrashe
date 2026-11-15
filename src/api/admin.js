import { request } from './client';

export const getStats = () => request({ url: '/admin/stats' });

export const getStudents = (params) => request({ url: '/admin/students', params });
export const getStudent = (id) => request({ url: `/admin/students/${id}` });
export const createStudent = (data) => request({ method: 'post', url: '/admin/students', data });
export const setStudentBlocked = (id, blocked) =>
  request({ method: 'patch', url: `/admin/students/${id}/${blocked ? 'block' : 'unblock'}` });

export const getActiveLoans = () => request({ url: '/admin/loans' });
export const getDebtors = () => request({ url: '/admin/debtors' });
export const issueLoan = (data) => request({ method: 'post', url: '/admin/loans', data });
export const returnLoan = (id) => request({ method: 'post', url: `/admin/loans/${id}/return` });
export const markFinePaid = (id) => request({ method: 'post', url: `/admin/loans/${id}/pay-fine` });
