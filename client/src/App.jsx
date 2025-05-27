import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import AuthPage from '@/pages/auth/AuthPage';
import Dashboard from '@/pages/dashboard/Dashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@/styles/index.scss';
import ErrorBoundary from './components/errorBoundary/ErrorBoundary';

function App() {

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastContainer position="bottom-right" />
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;