import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  let user = {};
  try {
    const raw = localStorage.getItem('user');
    if (raw && raw !== 'undefined') {
      user = JSON.parse(raw);
    }
  } catch (e) {
    user = {};
  }

  if (!user.accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
