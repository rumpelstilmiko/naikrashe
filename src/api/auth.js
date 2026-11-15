import { request } from './client';

export const login = (credentials) =>
  request({ method: 'post', url: '/auth/login', data: credentials });

export const getMyLoans = () => request({ url: '/me/loans' });

export const changePassword = (data) => request({ method: 'post', url: '/me/password', data });
