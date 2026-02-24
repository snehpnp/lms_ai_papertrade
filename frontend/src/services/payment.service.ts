// src/services/payment.service.ts
import axios from 'axios';

export interface CreateOrderResponse {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string; // Razorpay key ID for client
}

export const paymentService = {
  /**
   * Create a payment order for a given course.
   * provider is always 'RAZORPAY' for now.
   */
  async createOrder(courseId: string, amount: number, currency = 'INR') {
    const response = await axios.post<CreateOrderResponse>(
      `${import.meta.env.VITE_API_URL || ''}/api/v1/payments/create-order`,
      {
        courseId,
        provider: 'RAZORPAY',
        amount,
        currency,
      },
    );
    return response.data;
  },

  /** Verify Razorpay payment after successful checkout */
  async verifyRazorpay(payload: {
    paymentId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL || ''}/api/v1/payments/verify/razorpay`,
      payload,
    );
    return response.data;
  },
};
