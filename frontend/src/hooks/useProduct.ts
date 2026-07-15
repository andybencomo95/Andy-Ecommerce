import axios from 'axios';
import { useState, useEffect } from 'react';

import { getAxiosErrorMessage } from '../utils/errorUtils';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  createdAt: string;
}

export function useProduct(id: string | undefined): {
  data: Product | null;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id === undefined) {
      return;
    }

    const fetchProduct = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get<Product>(`/api/products/${id}`);
        setData(response.data);
      } catch (err: unknown) {
        setError(getAxiosErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    void fetchProduct();
  }, [id]);

  return { data, loading, error };
}
