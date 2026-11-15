import { Route, Routes } from 'react-router-dom';
import Layout from '../layouts/Layout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import Home from '../pages/Home';
import Catalog from '../pages/Catalog';
import BookQr from '../pages/BookQr';
import BookDetails from '../pages/BookDetails';
import Reader from '../pages/Reader';
import Login from '../pages/Login';
import Profile from '../pages/Profile';
import NotFound from '../pages/NotFound';
import Forbidden from '../pages/Forbidden';
import Dashboard from '../pages/admin/Dashboard';
import AdminBooks from '../pages/admin/AdminBooks';
import AdminCategories from '../pages/admin/AdminCategories';
import AdminStudents from '../pages/admin/AdminStudents';
import StudentCard from '../pages/admin/StudentCard';
import AdminLoans from '../pages/admin/AdminLoans';
import { ROLES } from '../utils/constants';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="books" element={<Catalog />} />
        <Route path="books/qr/:code" element={<BookQr />} />
        <Route path="login" element={<Login />} />
        <Route path="403" element={<Forbidden />} />

        <Route element={<ProtectedRoute roles={[ROLES.STUDENT, ROLES.ADMIN]} />}>
          <Route path="books/:id" element={<BookDetails />} />
          <Route path="books/:id/read" element={<Reader />} />
        </Route>

        <Route element={<ProtectedRoute roles={[ROLES.STUDENT]} />}>
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route
          path="admin"
          element={
            <ProtectedRoute roles={[ROLES.ADMIN]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="books" element={<AdminBooks />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="students/:id" element={<StudentCard />} />
          <Route path="loans" element={<AdminLoans />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
