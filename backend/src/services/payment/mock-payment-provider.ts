/**
 * MockPaymentProvider — simula pagos sin depender de Stripe.
 * Usado por defecto en desarrollo/testing.
 */

import type {
  PaymentProvider,
  CreatePaymentIntentParams,
  PaymentIntentResult,
  ConfirmPaymentParams,
  ConfirmPaymentResult,
} from './payment-provider.interface';

export class MockPaymentProvider implements PaymentProvider {
  readonly name = 'mock';

  private counter = 0;

  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
    this.counter += 1;

    /* Simular latency de red */
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      id: `pi_sim_${Date.now()}_${this.counter}`,
      status: 'requires_confirmation',
      clientSecret: `cs_sim_${Date.now()}_secret`,
      amount: params.amount,
      created: Date.now(),
      receiptEmail: params.receiptEmail ?? null,
    };
  }

  async confirmPayment(params: ConfirmPaymentParams): Promise<ConfirmPaymentResult> {
    await new Promise((resolve) => setTimeout(resolve, 50));

    return {
      id: params.paymentIntentId,
      status: 'succeeded',
      updateTime: new Date().toISOString(),
      emailAddress: '',
    };
  }
}
