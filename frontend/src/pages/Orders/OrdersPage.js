import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getMyOrders, getOrder } from '../../api/orders';
import { toast } from 'react-toastify';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await getMyOrders();
        setOrders(res.data || []);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Unable to load orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) return <div className="container" style={{ padding: '40px 0' }}>Loading orders...</div>;

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h1 style={{ marginBottom: '24px' }}>My Orders</h1>
      {!orders.length ? (
        <div style={{ padding: '24px', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
          <p>You have no orders yet.</p>
          <Link to="/products" className="btn btn-primary">Start shopping</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {orders.map(order => (
            <div key={order.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ margin: '0 0 6px' }}>{order.order_number}</h3>
                  <p style={{ margin: 0, color: '#666' }}>{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 6px', fontWeight: 600 }}>${parseFloat(order.total).toFixed(2)}</p>
                  <p style={{ margin: 0, textTransform: 'capitalize' }}>{order.status}</p>
                </div>
              </div>
              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span>{order.item_count || 0} item(s)</span>
                <Link to={`/orders/${order.id}`} className="btn btn-primary">View Details</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const res = await getOrder(id);
        setOrder(res.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Unable to load order');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  if (loading) return <div className="container" style={{ padding: '40px 0' }}>Loading order...</div>;
  if (!order) return <div className="container" style={{ padding: '40px 0' }}>Order not found.</div>;

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <Link to="/orders">← Back to orders</Link>
      <h1 style={{ margin: '16px 0' }}>{order.order_number}</h1>
      <p><strong>Status:</strong> {order.status}</p>
      <p><strong>Total:</strong> ${parseFloat(order.total).toFixed(2)}</p>
      <p><strong>Placed:</strong> {new Date(order.created_at).toLocaleString()}</p>

      <h2 style={{ marginTop: '24px' }}>Items</h2>
      <div style={{ display: 'grid', gap: '12px' }}>
        {(order.items || []).map(item => (
          <div key={item.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <strong>{item.product_name}</strong>
              <span>Qty: {item.quantity}</span>
            </div>
            <div style={{ marginTop: '6px', color: '#666' }}>${parseFloat(item.price).toFixed(2)} each</div>
          </div>
        ))}
      </div>
    </div>
  );
}
