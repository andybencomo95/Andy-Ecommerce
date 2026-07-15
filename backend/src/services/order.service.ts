import { badRequest, notFound, forbidden } from '../errors/AppError';
import { OrderModel } from '../models/Order';
import type { ActorContext } from '../types';
import { orderLogger } from '../utils/logger';

import { getPaymentProvider } from './payment';

/* ── Types ── */

export interface OrderItemInput {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CreateOrderInput {
  orderItems: OrderItemInput[];
  shippingAddress: ShippingAddress | string;
  paymentMethod: string;
  totalPrice: number;
}

/* ── Service ── */

export const OrderService = {
  async create(input: CreateOrderInput, actor: ActorContext) {
    if (input.orderItems.length === 0) {
      throw badRequest('Order must contain at least one item');
    }

    const calculatedTotal = input.orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    if (Math.abs(calculatedTotal - input.totalPrice) > 0.01) {
      throw badRequest('Total price does not match order items');
    }

    const parsedAddress: Record<string, string> =
      typeof input.shippingAddress === 'string'
        ? (JSON.parse(input.shippingAddress) as Record<string, string>)
        : (input.shippingAddress as unknown as Record<string, string>);

    const order = await OrderModel.create({
      userId: actor.userId,
      orderItems: input.orderItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
      shippingAddress: parsedAddress,
      paymentMethod: input.paymentMethod,
      totalPrice: input.totalPrice,
    });

    orderLogger.info({ orderId: order.id, actor: actor.userId }, 'Order created');
    return order;
  },

  async byUser(actor: ActorContext) {
    return OrderModel.findByUser(actor.userId);
  },

  async byId(id: string, actor: ActorContext) {
    const order = await OrderModel.findById(id);
    if (order === null) {
      throw notFound('Order', id);
    }

    const isOwner = order.userId === actor.userId;
    if (!isOwner && !actor.isAdmin) {
      throw forbidden('You are not authorized to view this order');
    }
    return order;
  },

  async all(actor: ActorContext) {
    if (!actor.isAdmin) {
      throw forbidden('Only administrators can list all orders');
    }
    return OrderModel.findAll();
  },

  async confirmPayment(id: string, paymentIntentId: string, actor: ActorContext) {
    const order = await OrderModel.findById(id);
    if (order === null) {
      throw notFound('Order', id);
    }

    if (order.isPaid) {
      throw badRequest('Order has already been paid');
    }

    const provider = getPaymentProvider();

    const paymentResult = await provider.confirmPayment({ paymentIntentId });

    if (paymentResult.status !== 'succeeded') {
      throw badRequest(`Payment status is "${paymentResult.status}", expected "succeeded"`);
    }

    const updatedOrder = await OrderModel.confirmPayment(id, {
      id: paymentResult.id,
      status: paymentResult.status,
      update_time: paymentResult.updateTime,
      email_address: paymentResult.emailAddress,
    });

    orderLogger.info(
      { orderId: id, actor: actor.userId, provider: provider.name },
      'Payment confirmed',
    );
    return updatedOrder;
  },

  async markAsDelivered(id: string, actor: ActorContext) {
    if (!actor.isAdmin) {
      throw forbidden('Only administrators can update delivery status');
    }
    const order = await OrderModel.findById(id);
    if (order === null) {
      throw notFound('Order', id);
    }
    const updated = await OrderModel.updateDelivery(id);
    orderLogger.info({ orderId: id, actor: actor.userId }, 'Order marked as delivered');
    return updated;
  },
};
