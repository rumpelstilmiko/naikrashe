import axios from 'axios';
import { mockAdapter } from '../mocks/adapter';

export const TOKEN_KEY = 'library_token';
export const USER_KEY = 'library_user';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  ...(useMocks && { adapter: mockAdapter }),
});

let unauthorizedHandler = () => {};

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isLogin = error.config?.url?.includes('/auth/login');
    if (status === 401 && !isLogin) unauthorizedHandler();
    error.userMessage = error.response
      ? error.response.data?.message || 'Что-то пошло не так. Попробуйте ещё раз'
      : 'Нет связи с сервером';
    return Promise.reject(error);
  },
);

export const request = (config) => client(config).then((response) => response.data);

export default client;
