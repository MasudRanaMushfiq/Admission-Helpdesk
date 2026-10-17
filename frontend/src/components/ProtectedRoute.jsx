import { Navigate } from 'react-router-dom';
import { homeFor, useAuth } from '../context/AuthContext';
import Loader from './Loader';

// UI-only role check (server checks too)
export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader fullPage />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={homeFor(user)} replace />;

  return children;
}
