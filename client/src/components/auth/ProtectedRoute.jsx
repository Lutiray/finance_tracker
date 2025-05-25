import { useAuth } from '@/context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  return user ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;