import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useAction } from '../hooks/useAction';
import { email, minLength, required, validate } from '../utils/validators';
import { HOME_BY_ROLE } from '../utils/constants';
import Field from '../components/Field';
import Button from '../components/Button';

const SCHEMA = { email: [required, email], password: [required, minLength(6)] };

const LOGIN_ERRORS = {
  401: 'Неверный логин или пароль',
  403: 'Ваш аккаунт заблокирован, обратитесь в библиотеку',
};

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const [submit, pending] = useAction(async (credentials) => {
    try {
      const profile = await login(credentials);
      navigate(HOME_BY_ROLE[profile.role], { replace: true });
    } catch (error) {
      error.userMessage = LOGIN_ERRORS[error.response?.status] ?? error.userMessage;
      throw error;
    }
  });

  if (user) return <Navigate to={HOME_BY_ROLE[user.role]} replace />;

  const handleChange = (event) => setValues({ ...values, [event.target.name]: event.target.value });

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = validate(values, SCHEMA);
    setErrors(found);
    if (!Object.keys(found).length) submit(values);
  };

  return (
    <form
      className="card stack"
      style={{ maxWidth: 420, margin: '0 auto' }}
      onSubmit={handleSubmit}
      noValidate
    >
      <h1>Вход</h1>
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="username"
        value={values.email}
        onChange={handleChange}
        error={errors.email}
      />
      <Field
        label="Пароль"
        name="password"
        type="password"
        autoComplete="current-password"
        value={values.password}
        onChange={handleChange}
        error={errors.password}
      />
      <Button type="submit" loading={pending}>
        Войти
      </Button>
    </form>
  );
}
