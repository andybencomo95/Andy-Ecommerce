import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, CartState } from '../types/cart';

interface CartContextType extends CartState {
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// ============================================
// FUNCIÓN DE SANITIZACIÓN - Why?
// Previene inyección de código malicioso en el localStorage
// Verifica que el formato del cart sea válido
// ============================================
const sanitizeCart = (data: unknown): CartItem[] => {
  if (!Array.isArray(data)) return [];
  
  return data.filter((item): item is CartItem => {
    if (!item || typeof item !== 'object') return false;
    if (typeof item.quantity !== 'number' || item.quantity < 1) return false;
    if (!item.product || typeof item.product !== 'object') return false;
    if (typeof item.product.id !== 'string') return false;
    if (typeof item.product.price !== 'number') return false;
    return true;
  });
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    if (!saved) return [];
    
    try {
      const parsed = JSON.parse(saved);
      return sanitizeCart(parsed);
    } catch {
      // Si el JSON está corrupto, limpiar y empezar de cero
      localStorage.removeItem('cart');
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        // ============================================
        // VALIDACIÓN DE STOCK - Why?
        // No permitir más del stock disponible
        // ============================================
        if (product.stock && newQty > product.stock) {
          // Ya exceedede, no cambiar
          return prev;
        }
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: newQty }
            : item
        );
      }
      //Nuevo item, verificar stock
      if (product.stock && quantity > product.stock) {
        return prev;
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev =>
      prev.map(item => {
        if (item.product.id !== productId) return item;
        // ============================================
        // VALIDACIÓN DE STOCK - Why?
        // No permitir más del stock disponible
        // ============================================
        const maxQty = item.product.stock ?? quantity;
        const safeQty = Math.min(quantity, maxQty);
        return { ...item, quantity: safeQty };
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
};
