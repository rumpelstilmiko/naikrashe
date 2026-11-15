import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './store/ToastContext';
import { AuthProvider } from './store/AuthContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
