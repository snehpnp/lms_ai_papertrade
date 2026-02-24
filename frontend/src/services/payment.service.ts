// src/services/payment.service.ts

import axiosInstance from "@/lib/axios";


/**
 * Response returned after creating a Razorpay order
 */
export interface CreateOrderResponse {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string; // Razorpay public key for client-side checkout
}

/**
 * Response returned after verifying Razorpay payment
 */
export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  paymentId?: string;
}

const paymentService = {
  /**
   * Create a Razorpay order for a given course
   */
  async createOrder(params: {
    courseId: string;
    amount: number;
    currency?: string;
  }): Promise<CreateOrderResponse> {
    const { courseId, amount, currency = "INR" } = params;
    const response = await axiosInstance.post<CreateOrderResponse>(
      "/payments/create-order",
      {
        courseId,
        provider: "RAZORPAY",
        amount,
        currency,
      }
    );

    const data = response?.data;

    // Defensive validation
    if (!data?.orderId || !data?.paymentId || !data?.keyId) {
      throw new Error("Invalid create order response: missing required fields");
    }

    return data;
  },

  /**
   * Verify Razorpay payment after successful checkout
   */
  async verifyRazorpay(payload: {
    paymentId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Promise<VerifyPaymentResponse> {
    const response = await axiosInstance.post<VerifyPaymentResponse>(
      "/payments/verify/razorpay",
      payload
    );

    const data = response?.data;

    // Defensive validation
    if (typeof data?.success !== "boolean") {
      throw new Error("Invalid verify payment response");
    }

    return data;
  },

  /**
   * Get all payment history (Admin/Subadmin)
   */
  async getHistory() {
    const { data } = await axiosInstance.get("/payments/history");
    return data;
  },

  /**
   * Get my payment history (Student)
   */
  async getMyHistory() {
    const { data } = await axiosInstance.get("/payments/my/history");
    return data;
  },
};

export default paymentService;