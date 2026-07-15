import axios from 'axios';
import { useState, useEffect } from 'react';

import { getAxiosErrorMessage } from '../utils/errorUtils';

interface OrderItem {
  product: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  id: string;
  orderItems: OrderItem[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  createdAt: string;
}

export function useOrders(): {
  data: Order[] | null;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get<Order[]>('/api/orders');
        setData(response.data);
      } catch (err: unknown) {
        setError(getAxiosErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    void fetchOrders();
  }, []);

  return { data, loading, error };
}

export function useOrder(id: string | undefined): {
  data: Order | null;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id === undefined) {
      return;
    }

    const fetchOrder = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get<Order>(`/api/orders/${id}`);
        setData(response.data);
      } catch (err: unknown) {
        setError(getAxiosErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    void fetchOrder();
  }, [id]);

  return { data, loading, error };
}
