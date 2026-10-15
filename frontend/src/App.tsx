import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { getToken, clearToken } from './api';

function Nav() {
  const navigate = useNavigate();
  const loggedIn = !!getToken();
  const logout = () => { clearToken(); navigate('/login'); };
  return (
    <nav>
      <Link to="/" className="brand">Linkly</Link>
      <div>
        {loggedIn ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <div className="app">
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={getToken() ? <Dashboard /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </div>
  );
}
