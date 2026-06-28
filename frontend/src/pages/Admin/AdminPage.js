import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboard, getAllOrders, updateOrderStatus, getAllUsers, createUser, deleteUser } from '../../api/admin';
import { getProducts, createProduct, getCategories, updateProduct, deleteProduct, uploadImage } from '../../api/products';
import { toast } from 'react-toastify';
import './AdminPage.css';

const TABS = ['dashboard', 'products', 'orders', 'users'];

export default function AdminPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', stock: '', brand: '', category_id: '', sku: '', compare_price: '', is_featured: false, is_active: true, images: [], variants: [] });
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);

  useEffect(() => {
    if (tab === 'dashboard') getDashboard().then(r => setDashboard(r.data));
    if (tab === 'products') { getProducts({ limit: 50 }).then(r => setProducts(r.data.products)); getCategories().then(r => setCategories(r.data)); }
    if (tab === 'orders') getAllOrders().then(r => setOrders(r.data.orders));
    if (tab === 'users') getAllUsers().then(r => setUsers(r.data || [])).catch(() => setUsers([]));
  }, [tab]);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const data = { 
          ...newProduct, 
          price: parseFloat(newProduct.price), 
          stock: parseInt(newProduct.stock),
          compare_price: newProduct.compare_price ? parseFloat(newProduct.compare_price) : null,
          is_active: newProduct.is_active !== false
        };
        await updateProduct(editingProduct.id, data);
        toast.success('Product updated!');
      } else {
        const data = { ...newProduct, price: parseFloat(newProduct.price), stock: parseInt(newProduct.stock) };
        await createProduct(data);
        toast.success('Product created!');
      }
      setShowForm(false);
      setEditingProduct(null);
      setNewProduct({ name: '', price: '', description: '', stock: '', brand: '', category_id: '', sku: '', compare_price: '', is_featured: false, is_active: true, images: [], variants: [] });
      getProducts({ limit: 50 }).then(r => setProducts(r.data.products));
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({ name: product.name, price: product.price, description: product.description, stock: product.stock, brand: product.brand, category_id: product.category_id, sku: product.sku || '', compare_price: product.compare_price || '', is_featured: product.is_featured || false, is_active: product.is_active !== false, images: [], variants: [] });
    setShowForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      getProducts({ limit: 50 }).then(r => setProducts(r.data.products));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting product');
    }
  };

  const handleCancelEdit = () => {
    setShowForm(false);
    setEditingProduct(null);
    setNewProduct({ name: '', price: '', description: '', stock: '', brand: '', category_id: '', sku: '', compare_price: '', is_featured: false, is_active: true, images: [], variants: [] });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadImage(file);
      setNewProduct({
        ...newProduct,
        images: [...newProduct.images, { url: res.data.url, alt: newProduct.name }]
      });
      toast.success('Image uploaded');
      e.target.value = '';
    } catch (err) {
      toast.error('Error uploading image');
    }
  };

  const handleRemoveImage = (index) => {
    setNewProduct({
      ...newProduct,
      images: newProduct.images.filter((_, i) => i !== index)
    });
  };

  const handleStatusChange = async (id, status) => {
    try { await updateOrderStatus(id, status); getAllOrders().then(r => setOrders(r.data.orders)); toast.success('Status updated'); }
    catch { toast.error('Error'); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await createUser(newUser);
      toast.success('User created!');
      setShowUserForm(false);
      setNewUser({ name: '', email: '', password: '', role: 'customer' });
      getAllUsers().then(r => setUsers(r.data || []));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating user');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await deleteUser(id);
      toast.success('User deleted');
      getAllUsers().then(r => setUsers(r.data || []));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting user');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-brand">MAISON<br /><span>Admin</span></div>
        {TABS.map(t => <button key={t} className={`sidebar-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>)}
        <button className="sidebar-btn logout-btn" onClick={handleLogout}>Logout</button>
      </aside>
      <main className="admin-main">
        {tab === 'dashboard' && dashboard && (
          <div>
            <h1>Dashboard</h1>
            <div className="stat-grid">
              {[['Total Revenue', `$${parseFloat(dashboard.totalRevenue).toFixed(2)}`], ['Total Orders', dashboard.totalOrders], ['Products', dashboard.totalProducts], ['Customers', dashboard.totalUsers]].map(([label, val]) => (
                <div key={label} className="stat-card"><p className="stat-label">{label}</p><p className="stat-value">{val}</p></div>
              ))}
            </div>
            <h2>Top Products</h2>
            <table className="admin-table">
              <thead><tr><th>Product</th><th>Units Sold</th><th>Revenue</th></tr></thead>
              <tbody>{(dashboard.topProducts || []).map((p, i) => <tr key={i}><td>{p.name}</td><td>{p.sold}</td><td>${parseFloat(p.revenue).toFixed(2)}</td></tr>)}</tbody>
            </table>
          </div>
        )}
        {tab === 'products' && (
          <div>
            <div className="admin-header">
              <h1>Products</h1>
              <button className="btn btn-primary" onClick={() => { setEditingProduct(null); setNewProduct({ name: '', price: '', description: '', stock: '', brand: '', category_id: '', sku: '', compare_price: '', is_featured: false, is_active: true, images: [], variants: [] }); setShowForm(!showForm); }}>{showForm ? 'Cancel' : '+ Add Product'}</button>
            </div>
            {showForm && (
              <form className="product-form" onSubmit={handleCreateProduct}>
                <div className="grid-2">
                  {[['name','Name'],['brand','Brand'],['price','Price'],['stock','Stock'],['sku','SKU'],['compare_price','Compare Price']].map(([k, l]) => (
                    <div key={k} className="form-group"><label>{l}</label><input value={newProduct[k]} onChange={e => setNewProduct({ ...newProduct, [k]: e.target.value })} required={k !== 'sku' && k !== 'compare_price'} /></div>
                  ))}
                  <div className="form-group"><label>Category</label>
                    <select value={newProduct.category_id} onChange={e => setNewProduct({ ...newProduct, category_id: e.target.value })}>
                      <option value="">— select —</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group"><label>Description</label><textarea rows={3} value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} /></div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" id="featured" checked={newProduct.is_featured} onChange={e => setNewProduct({ ...newProduct, is_featured: e.target.checked })} />
                  <label htmlFor="featured" style={{ margin: 0 }}>Featured Product</label>
                </div>
                <div className="form-group">
                  <label>Product Images</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} />
                  {newProduct.images && newProduct.images.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px', marginTop: '12px' }}>
                      {newProduct.images.map((img, i) => (
                        <div key={i} style={{ position: 'relative', paddingBottom: '100%' }}>
                          <img src={img.url} alt={img.alt} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                          <button type="button" onClick={() => handleRemoveImage(i)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(255,0,0,0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '14px', lineHeight: 1 }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button type="submit" className="btn btn-primary">{editingProduct ? 'Update Product' : 'Create Product'}</button>
                {editingProduct && <button type="button" className="btn" onClick={handleCancelEdit}>Cancel</button>}
              </form>
            )}
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Brand</th><th>Price</th><th>Stock</th><th>Category</th><th>Actions</th></tr></thead>
              <tbody>{products.map(p => <tr key={p.id}><td>{p.name}</td><td>{p.brand}</td><td>${parseFloat(p.price).toFixed(2)}</td><td>{p.stock}</td><td>{p.category_name}</td><td><button className="btn btn-primary" onClick={() => handleEditProduct(p)}>Edit</button> <button className="btn btn-primary" onClick={() => handleDeleteProduct(p.id)}>Delete</button></td></tr>)}</tbody>
            </table>
          </div>
        )}        {tab === 'orders' && (
          <div>
            <h1>Orders</h1>
            <table className="admin-table">
              <thead><tr><th>Order #</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
              <tbody>{(orders || []).map(o => (
                <tr key={o.id}>
                  <td>{o.order_number}</td>
                  <td>{o.user_name}</td>
                  <td>${parseFloat(o.total).toFixed(2)}</td>
                  <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td>
                    <select value={o.status} onChange={e => handleStatusChange(o.id, e.target.value)}>
                      {['pending','confirmed','processing','shipped','delivered','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
        {tab === 'users' && (
          <div>
            <div className="admin-header">
              <h1>Users</h1>
              <button className="btn btn-primary" onClick={() => setShowUserForm(!showUserForm)}>{showUserForm ? 'Cancel' : '+ Add User'}</button>
            </div>
            {showUserForm && (
              <form className="product-form" onSubmit={handleCreateUser}>
                <div className="grid-2">
                  <div className="form-group"><label>Name</label><input value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} required /></div>
                  <div className="form-group"><label>Email</label><input type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required /></div>
                  <div className="form-group"><label>Password</label><input type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required /></div>
                  <div className="form-group"><label>Role</label>
                    <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">Create User</button>
              </form>
            )}
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Orders</th><th>Joined</th><th>Action</th></tr></thead>
              <tbody>{(users || []).map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.order_count}</td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td><button className="btn btn-primary" onClick={() => handleDeleteUser(user.id)}>Delete</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
