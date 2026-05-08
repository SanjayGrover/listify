import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ListDetail from './pages/ListDetail';
import { useAuth } from './context/AuthContext';

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>Loading...</div>;
  return user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="*" element={<RootRedirect />} />
          <Route path="/lists/:id" element={<ProtectedRoute> <ListDetail /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;