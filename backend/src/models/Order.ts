import prisma from '../config/prisma';

export const OrderModel = {
  async create(data: {
    userId: string;
    orderItems: {
      productId: string;
      name: string;
      quantity: number;
      price: number;
      image: string;
    }[];
    shippingAddress: Record<string, string>;
    paymentMethod: string;
    totalPrice: number;
  }) {
    /* ── Stock verification ── */
    for (const item of data.orderItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (product === null) {
        throw new Error(`Product not found: ${item.name}`);
      }
      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${item.name}. Available: ${product.stock}`,
        );
      }
    }

    return prisma.order.create({
      data: {
        userId: data.userId,
        shippingAddress: JSON.stringify(data.shippingAddress),
        paymentMethod: data.paymentMethod,
        totalPrice: data.totalPrice,
        isPaid: false,
        orderItems: {
          create: data.orderItems.map((item) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image,
          })),
        },
      },
      include: { orderItems: true },
    });
  },

  async confirmPayment(
    id: string,
    paymentResult: {
      id: string;
      status: string;
      update_time: string;
      email_address: string;
    },
  ) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });

    if (order === null) {
      throw new Error('Order not found');
    }

    if (order.isPaid) {
      throw new Error('Order has already been paid');
    }

    return prisma.$transaction(async (tx) => {
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return tx.order.update({
        where: { id },
        data: {
          isPaid: true,
          paidAt: new Date(),
          paymentResult: JSON.stringify(paymentResult),
        },
        include: { orderItems: true },
      });
    });
  },

  async findByUser(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: { orderItems: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: true,
        user: { select: { name: true, email: true } },
      },
    });
  },

  async findAll() {
    return prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        orderItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async updateDelivery(id: string) {
    return prisma.order.update({
      where: { id },
      data: { isDelivered: true, deliveredAt: new Date() },
    });
  },
};
