/**
 * PaymentProvider — abstracción para procesar pagos.
 * Permite cambiar entre mock (dev/test) y Stripe (prod) sin tocar la lógica de negocio.
 */

export interface CreatePaymentIntentParams {
  amount: number;       // en centavos (USD)
  currency: string;
  metadata?: Record<string, string>;
  receiptEmail?: string;
}

export interface PaymentIntentResult {
  id: string;
  status: string;
  clientSecret: string | null;
  amount: number;
  created: number;      // Unix timestamp (ms)
  receiptEmail: string | null;
}

export interface ConfirmPaymentParams {
  paymentIntentId: string;
}

export interface ConfirmPaymentResult {
  id: string;
  status: string;
  updateTime: string;   // ISO string
  emailAddress: string;
}

export interface PaymentProvider {
  readonly name: string;

  /** Crear un payment intent (no requiere confirmación inmediata) */
  createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult>;

  /** Confirmar pago después del checkout */
  confirmPayment(params: ConfirmPaymentParams): Promise<ConfirmPaymentResult>;
}
