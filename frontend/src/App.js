import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/global.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import HomePage from './pages/Home/HomePage';
import ProductsPage from './pages/Products/ProductsPage';
import ProductDetailPage from './pages/Products/ProductDetailPage';
import CartPage from './pages/Cart/CartPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import AdminPage from './pages/Admin/AdminPage';
import OrdersPage, { OrderDetailPage } from './pages/Orders/OrdersPage';

function ProtectedRoute({ children, adminOnly }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
  return children;
}

function AppLayout({ children }) {
  return <>
    <Navbar />
    {children}
    <Footer />
  </>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin/*" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
            <Route path="/" element={<AppLayout><HomePage /></AppLayout>} />
            <Route path="/products" element={<AppLayout><ProductsPage /></AppLayout>} />
            <Route path="/products/:slug" element={<AppLayout><ProductDetailPage /></AppLayout>} />
            <Route path="/cart" element={<AppLayout><ProtectedRoute><CartPage /></ProtectedRoute></AppLayout>} />
            <Route path="/orders" element={<AppLayout><ProtectedRoute><OrdersPage /></ProtectedRoute></AppLayout>} />
            <Route path="/orders/:id" element={<AppLayout><ProtectedRoute><OrderDetailPage /></ProtectedRoute></AppLayout>} />
          </Routes>
          <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar theme="colored" />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
