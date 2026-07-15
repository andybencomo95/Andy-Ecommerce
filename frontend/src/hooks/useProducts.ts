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

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pages: number;
}

interface UseProductsParams {
  page?: number;
  category?: string;
  sort?: string;
  search?: string;
}

export function useProducts(params: UseProductsParams = {}): {
  data: ProductsResponse | null;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams();
        if (params.page !== undefined && params.page > 1) {
          query.set('page', String(params.page));
        }
        if (params.category !== undefined && params.category !== '') {
          query.set('category', params.category);
        }
        if (params.sort !== undefined && params.sort !== '') {
          query.set('sort', params.sort);
        }
        if (params.search !== undefined && params.search !== '') {
          query.set('search', params.search);
        }

        const searchStr = query.toString();
        const url = `/api/products${searchStr !== '' ? `?${searchStr}` : ''}`;
        const response = await axios.get<ProductsResponse>(url);
        setData(response.data);
      } catch (err: unknown) {
        setError(getAxiosErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    void fetchProducts();
  }, [params.page, params.category, params.sort, params.search]);

  return { data, loading, error };
}
