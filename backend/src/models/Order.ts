import prisma from '../config/prisma';

export const OrderModel = {
  /**
   * Crear orden - NO descuenta stock aún
   * El stock se descuenta solo cuando se confirma el pago
   */
  async create(data: {
    userId: string;
    orderItems: {
      productId: string;
      name: string;
      quantity: number;
      price: number;
      image: string;
    }[];
    shippingAddress: {
      address: string;
      city: string;
      postalCode: string;
      country: string;
    };
    paymentMethod: string;
    totalPrice: number;
  }) {
    // Verificar stock disponible antes de crear la orden
    for (const item of data.orderItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });
      if (!product) {
        throw new Error(`Producto no encontrado: ${item.name}`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para ${item.name}. Disponible: ${product.stock}`);
      }
    }

    // Crear orden como "pendiente de pago"
    return prisma.order.create({
      data: {
        userId: data.userId,
        shippingAddress: JSON.stringify(data.shippingAddress),
        paymentMethod: data.paymentMethod,
        totalPrice: data.totalPrice,
        isPaid: false,
        orderItems: {
          create: data.orderItems.map(item => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image
          }))
        }
      },
      include: {
        orderItems: true
      }
    });
  },

  /**
   * Confirmar pago - AQUÍ se descuenta el stock
   * Usa transacción para garantizar atomicidad
   */
  async confirmPayment(id: string, paymentResult: {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
  }) {
    // Buscar la orden con sus items
    const order = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: true }
    });

    if (!order) {
      throw new Error('Orden no encontrada');
    }

    if (order.isPaid) {
      throw new Error('La orden ya fue pagada');
    }

    // Usar transacción para descontar stock Y marcar como pagada
    return prisma.$transaction(async (tx) => {
      // Descontar stock de cada producto
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      // Marcar orden como pagada
      return tx.order.update({
        where: { id },
        data: {
          isPaid: true,
          paidAt: new Date(),
          paymentResult: JSON.stringify(paymentResult)
        },
        include: {
          orderItems: true
        }
      });
    });
  },

  async findByUser(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: true
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: true,
        user: {
          select: { name: true, email: true }
        }
      }
    });
  },

  async findAll() {
    return prisma.order.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        },
        orderItems: true
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async updateDelivery(id: string) {
    return prisma.order.update({
      where: { id },
      data: {
        isDelivered: true,
        deliveredAt: new Date()
      }
    });
  }
};