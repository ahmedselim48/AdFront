// ===== PAYMENTS MODELS =====

export interface CreateSubscriptionRequestDto {
  provider?: 'paypal' | 'mock';
}

export interface CheckoutSessionDto {
  sessionId: string;
  url: string;
  amount: number;
  currency: string;
  provider: string;
}

export interface ConfirmSubscriptionRequestDto {
  sessionId: string;
}

export interface SubscriptionDto {
  userId: string;
  isActive: boolean;
  endDate: Date;
  provider: string;
  amount: number;
  daysLeft: number;
}

export interface PaymentRequestDto {
  provider: string;
  amount: number;
}

export interface PaymentResponseDto {
  success: boolean;
  transactionId: string;
  provider: string;
  expiryDate: string;
}

export interface PaymentLogDto {
  id: string;
  provider: string;
  eventType: string;
  referenceId: string;
  payload: string;
  userId: string;
  createdAt: Date;
}

export interface PaymentOptions {
  useMock: boolean;
  subscription: {
    monthlyAmount: number;
  };
  paypal: {
    clientId: string;
    clientSecret: string;
    environment: 'sandbox' | 'production';
  };
}
