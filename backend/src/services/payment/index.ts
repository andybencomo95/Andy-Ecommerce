/**
 * Payment provider factory.
 * Retorna MockPaymentProvider por defecto.
 * Si STRIPE_SECRET_KEY está definida, retorna StripePaymentProvider.
 */

import config from '../../config';

import { MockPaymentProvider } from './mock-payment-provider';
import type { PaymentProvider } from './payment-provider.interface';
import { StripePaymentProvider } from './stripe-payment-provider';

let provider: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (provider !== null) {
    return provider;
  }

  if (config.stripeSecretKey !== undefined && config.stripeSecretKey !== '') {
    provider = new StripePaymentProvider();
  } else {
    provider = new MockPaymentProvider();
  }

  return provider;
}

/** Reset singleton (útil en tests) */
export function resetPaymentProvider(): void {
  provider = null;
}
