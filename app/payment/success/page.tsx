'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('verifying');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const transaction_uuid = searchParams.get('transaction_uuid');
      const pidx = searchParams.get('pidx');
      const product_id = searchParams.get('product_id');
      const amount = searchParams.get('amount');
      const provider = searchParams.get('provider') || 'esewa'; // Default to eSewa for backward compatibility
      
      console.log('🔍 Payment success params:', { 
        transaction_uuid, 
        pidx, 
        product_id, 
        amount, 
        provider 
      });

      // Determine payment ID based on provider
      let paymentId;
      if (provider === 'khalti') {
        paymentId = pidx; // Khalti uses pidx
      } else {
        paymentId = transaction_uuid; // eSewa uses transaction_uuid
      }

      if (!paymentId || !amount) {
        console.error('❌ Missing required parameters');
        setStatus('failed');
        return;
      }

      try {
        const verifyResponse = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentId: paymentId,
            provider: provider,
            amount: parseInt(amount)
          }),
        });

        const data = await verifyResponse.json();
        console.log('🔍 Verification response:', data);
        
        if (data.success && data.data.verified) {
          setStatus('success');
          setPaymentDetails({
            transactionId: data.data.transaction_id,
            provider: data.data.provider,
            amount: data.data.amount
          });
          
          // ✅ Save successful payment to your database here
          // await savePaymentToDatabase({
          //   productId: product_id,
          //   transactionId: data.data.transaction_id,
          //   provider: data.data.provider,
          //   amount: data.data.amount,
          //   status: 'completed'
          // });
          
        } else {
          setStatus('failed');
          setPaymentDetails({
            error: data.data.message
          });
        }
      } catch (error) {
        console.error('❌ Verification error:', error);
        setStatus('failed');
        setPaymentDetails({
          error: 'Network error during verification'
        });
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {status === 'verifying' && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Verifying Payment...</h2>
            <p className="text-gray-600">Please wait while we confirm your payment.</p>
            <div className="mt-4 text-sm text-gray-500">
              <p>This may take a few moments.</p>
            </div>
          </div>
        )}
        
        {status === 'success' && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">Payment Successful! 🎉</h2>
            <p className="text-gray-700 mb-4">Thank you for your purchase on Navajeevan Marketplace.</p>
            
            {paymentDetails && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-green-800 mb-2">Payment Details:</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>Provider:</strong> {paymentDetails.provider === 'khalti' ? 'Khalti' : 'eSewa'}</p>
                  <p><strong>Amount:</strong> Rs. {paymentDetails.amount}</p>
                  <p><strong>Transaction ID:</strong> {paymentDetails.transactionId}</p>
                </div>
              </div>
            )}
            
            <p className="text-gray-600 mb-6">
              The seller has been notified and will contact you shortly for delivery arrangements.
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Continue Shopping
              </button>
              <button 
                onClick={() => router.push('/dashboard')}
                className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                View Dashboard
              </button>
            </div>
          </div>
        )}
        
        {status === 'failed' && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Payment Failed</h2>
            
            {paymentDetails?.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700">{paymentDetails.error}</p>
              </div>
            )}
            
            <p className="text-gray-700 mb-6">
              Please try again or contact the seller directly for alternative payment methods.
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Go Back to Home
              </button>
              <button 
                onClick={() => router.back()}
                className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}