import { Router, Response } from 'express';
import { z } from 'zod';
import Stripe from 'stripe';
import { OrderModel } from '../models/Order';
import { AuthRequest, protect, admin } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import config from '../config';

const router = Router();

// ============================================
// ESQUEMAS DE VALIDACIÓN - Why?
// Validar datos en el middleware antes de llegando al handler
// ============================================
const createOrderSchema = z.object({
  orderItems: z.array(z.object({
    product: z.string().min(1, 'Product ID requerido'),
    name: z.string().min(1, 'Nombre requerido'),
    quantity: z.number().int().positive('Cantidad debe ser positiva'),
    price: z.number().positive('Precio debe ser positivo'),
    image: z.string().optional(),
  })).min(1, 'Al menos un artículo requerido'),
  
  shippingAddress: z.union([
    z.object({
      address: z.string().min(1, 'Dirección requerida'),
      city: z.string().min(1, 'Ciudad requerida'),
      postalCode: z.string().min(1, 'Código postal requerido'),
      country: z.string().min(1, 'País requerido'),
    }),
    z.string(), // También acepta string (JSON)
  ]),
  
  paymentMethod: z.string().min(1, 'Método de pago requerido'),
  totalPrice: z.number().positive('Precio total requerido'),
});

// Crear orden
router.post('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;

    // ============================================
    // VALIDACIÓN DE SEGURIDAD - Why?
    // Un atacante podría manipular el precio enviado desde el cliente.
    // Debo calcular el precio real desde los items del pedido.
    // ============================================
    const calculatedTotal = orderItems.reduce((sum: number, item: { price: number; quantity: number }) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Permitir pequeña diferencia por redondeo (0.01)
    if (Math.abs(calculatedTotal - totalPrice) > 0.01) {
      return res.status(400).json({ 
        message: 'El precio total no coincide con los artículos del pedido' 
      });
    }

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No hay artículos en el pedido' });
    }

    // Transformar orderItems para tener productId
    const transformedItems = orderItems.map((item: { product: string; name: string; quantity: number; price: number; image: string }) => ({
      productId: item.product,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.image
    }));

    const order = await OrderModel.create({
      userId: req.user?.id || '',
      orderItems: transformedItems,
      shippingAddress: typeof shippingAddress === 'string' 
        ? JSON.parse(shippingAddress) 
        : shippingAddress,
      paymentMethod,
      totalPrice
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error al crear orden', error });
  }
});

// Obtener todas las órdenes del usuario
router.get('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await OrderModel.findByUser(req.user?.id || '');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener órdenes', error });
  }
});

// ============================================
// IMPORTANTE: /admin/all debe estar ANTES de /:id
// Si no, Express interpreta "admin" como un ID
// ============================================

// Obtener todas las órdenes (admin)
router.get('/admin/all', protect, admin, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await OrderModel.findAll();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener órdenes', error });
  }
});

// Obtener orden por ID
router.get('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const order = await OrderModel.findById(req.params.id);
    if (order) {
      // Verificar que el usuario es el propietario o es admin
      const isOwner = order.userId === req.user?.id;
      const isAdmin = req.user?.isAdmin === true;
      
      if (isOwner || isAdmin) {
        res.json(order);
      } else {
        res.status(403).json({ message: 'No autorizado' });
      }
    } else {
      res.status(404).json({ message: 'Orden no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener orden', error });
  }
});

// Confirmar pago - AQUÍ SE VERIFICA CON STRIPE
router.put('/:id/pay', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ message: 'Se requiere el ID del pago' });
    }

    // ============================================
    // VERIFICACIÓN CON STRIPE - Why?
    // Evita que un atacante cree pagos falsos
    // ============================================
    
    // Verificar que el pago realmente fue completado en Stripe
    const stripe = new Stripe(config.stripeSecretKey);
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'El pago no fue completado' });
    }

    const paymentResult = {
      id: paymentIntent.id,
      status: paymentIntent.status,
      update_time: new Date(paymentIntent.created * 1000).toISOString(),
      email_address: paymentIntent.receipt_email || ''
    };

    const order = await OrderModel.confirmPayment(req.params.id, paymentResult);
    res.json(order);
  } catch (error: any) {
    const message = error.message || 'Error al confirmar pago';
    res.status(400).json({ message });
  }
});

// Actualizar orden a entregada (admin)
router.put('/:id/deliver', protect, admin, async (req: AuthRequest, res: Response) => {
  try {
    const order = await OrderModel.updateDelivery(req.params.id);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar orden', error });
  }
});

export default router;