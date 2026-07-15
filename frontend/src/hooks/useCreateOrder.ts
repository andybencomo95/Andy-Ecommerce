import axios from 'axios';
import { useState, useCallback } from 'react';

import { getAxiosErrorMessage } from '../utils/errorUtils';

interface OrderItemInput {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface CreateOrderInput {
  orderItems: OrderItemInput[];
  shippingAddress: Record<string, string>;
  paymentMethod: string;
  totalPrice: number;
}

interface Order {
  id: string;
  orderItems: OrderItemInput[];
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
}

export function useCreateOrder(): {
  createOrder: (input: CreateOrderInput) => Promise<Order | null>;
  loading: boolean;
  error: string | null;
} {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = useCallback(async (input: CreateOrderInput): Promise<Order | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<Order>('/api/orders', input);
      return response.data;
    } catch (err: unknown) {
      setError(getAxiosErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createOrder, loading, error };
}
