export interface PaymentRequest {
  amount: number;
  productId: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentId: string;
  transactionId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  provider: 'esewa' | 'khalti';
  message: string;
}

export interface PaymentVerification {
  success: boolean;
  transactionId: string;
  status: 'completed' | 'failed';
  message: string;
}

class MockPaymentService {
  // Simulate eSewa payment
  async initiateEsewaPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    console.log('💰 Mock eSewa Payment Initiated:', paymentRequest);
    
    // Simulate API delay
    await this.simulateDelay(1000);
    
    const paymentId = `ESEWA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      paymentId,
      transactionId: `TXN_${Date.now()}`,
      amount: paymentRequest.amount,
      status: 'pending',
      provider: 'esewa',
      message: 'Payment initiated successfully. Redirect to eSewa for completion.'
    };
  }

  // Simulate Khalti payment
  async initiateKhaltiPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    console.log('💰 Mock Khalti Payment Initiated:', paymentRequest);
    
    // Simulate API delay
    await this.simulateDelay(1000);
    
    const paymentId = `KHALTI_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      paymentId,
      transactionId: `TXN_${Date.now()}`,
      amount: paymentRequest.amount,
      status: 'pending',
      provider: 'khalti',
      message: 'Payment initiated successfully. Redirect to Khalti for completion.'
    };
  }

  // Simulate payment verification
  async verifyPayment(paymentId: string, provider: 'esewa' | 'khalti'): Promise<PaymentVerification> {
    console.log('🔍 Verifying payment:', { paymentId, provider });
    
    await this.simulateDelay(800);
    
    // Simulate random success/failure (80% success rate)
    const isSuccess = Math.random() > 0.2;
    
    return {
      success: isSuccess,
      transactionId: `TXN_${Date.now()}`,
      status: isSuccess ? 'completed' : 'failed',
      message: isSuccess 
        ? 'Payment verified successfully' 
        : 'Payment verification failed'
    };
  }

  // Simulate payment cancellation
  async cancelPayment(paymentId: string): Promise<{ success: boolean; message: string }> {
    console.log('❌ Cancelling payment:', paymentId);
    
    await this.simulateDelay(500);
    
    return {
      success: true,
      message: 'Payment cancelled successfully'
    };
  }

  // Get payment status
  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    await this.simulateDelay(300);
    
    // Simulate different statuses
    const statuses: Array<'pending' | 'completed' | 'failed'> = ['pending', 'completed', 'failed'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      success: randomStatus === 'completed',
      paymentId,
      transactionId: `TXN_${Date.now()}`,
      amount: Math.floor(Math.random() * 10000) + 100,
      status: randomStatus,
      provider: Math.random() > 0.5 ? 'esewa' : 'khalti',
      message: `Payment is ${randomStatus}`
    };
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const mockPaymentService = new MockPaymentService();