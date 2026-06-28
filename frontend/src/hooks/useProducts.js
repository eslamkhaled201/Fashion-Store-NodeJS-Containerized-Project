import { useState, useEffect } from 'react';
import { getProducts } from '../api/products';

export function useProducts(filters = {}) {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getProducts(filters)
      .then(res => { setProducts(res.data.products); setTotal(res.data.total); setPages(res.data.pages); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [JSON.stringify(filters)]);

  return { products, total, pages, loading, error };
}
