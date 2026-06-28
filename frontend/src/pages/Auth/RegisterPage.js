import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './AuthPages.css';

export default function RegisterPage() {
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await register(form);
      authLogin(res.data.token, res.data.user);
      toast.success('Account created!');
      navigate('/');
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">MAISON</Link>
        <h1>Create Account</h1>
        <p>Join us to start shopping.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Full Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
          <div className="form-group"><label>Password (min. 6 chars)</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} minLength={6} required /></div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
