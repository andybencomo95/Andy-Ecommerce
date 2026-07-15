/**
 * StripePaymentProvider — wrapper real de Stripe.
 * Solo se instancia cuando STRIPE_SECRET_KEY está presente.
 */

import Stripe from 'stripe';

import config from '../../config';

import type {
  PaymentProvider,
  CreatePaymentIntentParams,
  PaymentIntentResult,
  ConfirmPaymentParams,
  ConfirmPaymentResult,
} from './payment-provider.interface';

export class StripePaymentProvider implements PaymentProvider {
  readonly name = 'stripe';

  private readonly stripeClient: import('stripe').Stripe;

  constructor() {
    this.stripeClient = new Stripe(config.stripeSecretKey ?? '');
  }

  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
    const intent = await this.stripeClient.paymentIntents.create({
      amount: params.amount,
      currency: params.currency,
      metadata: params.metadata,
      receipt_email: params.receiptEmail,
      automatic_payment_methods: { enabled: true },
    });

    return {
      id: intent.id,
      status: intent.status,
      clientSecret: intent.client_secret,
      amount: intent.amount,
      created: intent.created * 1000,
      receiptEmail: intent.receipt_email,
    };
  }

  async confirmPayment(params: ConfirmPaymentParams): Promise<ConfirmPaymentResult> {
    const intent = await this.stripeClient.paymentIntents.retrieve(params.paymentIntentId);

    return {
      id: intent.id,
      status: intent.status,
      updateTime: new Date(intent.created * 1000).toISOString(),
      emailAddress: intent.receipt_email ?? '',
    };
  }
}
