import { Navigate, Route, Routes } from 'react-router-dom';
import { homeFor, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import Loader from './components/Loader';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentChat from './pages/StudentChat';
import AdminDashboard from './pages/AdminDashboard';
import AdminInbox from './pages/AdminInbox';
import AdminKB from './pages/AdminKB';
import AdminStudents from './pages/AdminStudents';
import AdminCategories from './pages/AdminCategories';

// Redirect logged-in users home
function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader fullPage />;
  return user ? <Navigate to={homeFor(user)} replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />

      <Route path="/chat" element={<ProtectedRoute role="student"><StudentChat /></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="inbox" element={<AdminInbox />} />
        <Route path="kb" element={<AdminKB />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="categories" element={<AdminCategories />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
