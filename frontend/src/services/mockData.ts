/**
 * Mock Data Service - Datos de demostración centralizados
 * 
 * Why? Evita hardcodear datos demo en múltiples archivos.
 * Facilita cambiar datos sin modificar componentes.
 */

import { Product } from '../types/cart';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Laptop Pro',
    description: 'Laptop de alta gama con procesador Intel i7, 16GB RAM, SSD 512GB',
    price: 999.99,
    image: 'https://via.placeholder.com/280x200?text=Laptop+Pro',
    category: 'Electrónica',
    stock: 10,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Camiseta Cotton',
    description: 'Camiseta de algodón 100%, colores varios',
    price: 29.99,
    image: 'https://via.placeholder.com/280x200?text=Camiseta',
    category: 'Ropa',
    stock: 50,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Zapatillas Running',
    description: 'Zapatillas deportivas para running, amortiguación advanced',
    price: 89.99,
    image: 'https://via.placeholder.com/280x200?text=Zapatillas',
    category: 'Deportes',
    stock: 25,
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Auriculares Bluetooth',
    description: 'Auriculares wireless con cancelación de ruido',
    price: 149.99,
    image: 'https://via.placeholder.com/280x200?text=Auriculares',
    category: 'Electrónica',
    stock: 30,
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Reloj Smart',
    description: 'Reloj inteligente con monitor de frecuencia cardíaca',
    price: 199.99,
    image: 'https://via.placeholder.com/280x200?text=Smart+Watch',
    category: 'Electrónica',
    stock: 20,
    createdAt: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Mochila',
    description: 'Mochila resistente al agua, múltiples compartimentos',
    price: 49.99,
    image: 'https://via.placeholder.com/280x200?text=Mochila',
    category: 'Accesorios',
    stock: 40,
    createdAt: new Date().toISOString()
  }
];

export const mockCategories = [
  'Electrónica',
  'Ropa',
  'Deportes',
  'Hogar',
  'Accesorios'
];

/**
 * Obtiene productos - usa la API real o devuelve mock según el parámetro
 */
export const getMockProducts = (apiProducts?: Product[]): Product[] => {
  // Si hay productos de la API, usarlos
  if (apiProducts && apiProducts.length > 0) {
    return apiProducts;
  }
  // Si no, devolver mock
  return mockProducts;
};

/**
 * Obtiene categorías
 */
export const getMockCategories = (apiCategories?: string[]): string[] => {
  if (apiCategories && apiCategories.length > 0) {
    return apiCategories;
  }
  return mockCategories;
};

/**
 * Obtiene un producto por ID
 */
export const getMockProductById = (id: string, apiProducts?: Product[]): Product | undefined => {
  const products = getMockProducts(apiProducts);
  return products.find(p => p.id === id);
};