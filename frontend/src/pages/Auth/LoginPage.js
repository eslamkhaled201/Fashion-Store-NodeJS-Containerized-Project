import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './AuthPages.css';

export default function LoginPage() {
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form);
      authLogin(res.data.token, res.data.user);
      toast.success('Welcome back!');
      navigate(res.data.user.role === 'admin' ? '/admin' : '/');
    } catch (err) { toast.error(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">MAISON</Link>
        <h1>Sign In</h1>
        <p>Welcome back. Please enter your details.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <p className="auth-switch">Don't have an account? <Link to="/register">Create one</Link></p>
        <p className="auth-hint">Demo admin: admin@fashionstore.com / admin123</p>
      </div>
    </div>
  );
}
