import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

import type { Product, CartItem, CartState } from '../types/cart';

interface CartContextType extends CartState {
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const isValidCartItem = (item: unknown): item is CartItem => {
  if (item === null || typeof item !== 'object') {
    return false;
  }
  const candidate = item as Record<string, unknown>;
  if (typeof candidate.quantity !== 'number' || candidate.quantity < 1) {
    return false;
  }
  if (candidate.product === null || typeof candidate.product !== 'object') {
    return false;
  }
  const prod = candidate.product as Record<string, unknown>;
  if (typeof prod.id !== 'string') {
    return false;
  }
  if (typeof prod.price !== 'number') {
    return false;
  }
  return true;
};

const sanitizeCart = (data: unknown): CartItem[] => {
  if (!Array.isArray(data)) {
    return [];
  }
  return data.filter((item): item is CartItem => isValidCartItem(item));
};

export const CartProvider = ({ children }: { children: ReactNode }): React.JSX.Element => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    if (saved === null) {
      return [];
    }

    try {
      const parsed = JSON.parse(saved) as unknown;
      return sanitizeCart(parsed);
    } catch {
      localStorage.removeItem('cart');
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity = 1): void => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing !== undefined) {
        const newQty = existing.quantity + quantity;
        const maxStock = product.stock;
        if (maxStock !== undefined && newQty > maxStock) {
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      const maxStock = product.stock;
      if (maxStock !== undefined && quantity > maxStock) {
        return prev;
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string): void => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number): void => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id !== productId) {
          return item;
        }
        const maxQty = item.product.stock ?? quantity;
        const safeQty = Math.min(quantity, maxQty);
        return { ...item, quantity: safeQty };
      })
    );
  };

  const clearCart = (): void => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
};
