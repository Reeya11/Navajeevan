'use client';

import { useState, useEffect } from 'react';

interface PaymentComponentProps {
  productId: string;
  productName: string;
  amount: number;
  onPaymentSuccess: (transactionId: string) => void;
  onPaymentFailure: (error: string) => void;
}

// Separate component for form submission
function EsewaFormSubmitter({ formData }: { formData: any }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = formData.esewa_url;
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'esewa_url' && value) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value as string;
          form.appendChild(input);
        }
      });
      
      document.body.appendChild(form);
      console.log('🚀 Submitting form to eSewa...');
      form.submit();
    }, 100);

    return () => clearTimeout(timer);
  }, [formData]);

  return (
    <div className="text-center p-8">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
      <h2 className="text-2xl font-bold mb-2">Redirecting to eSewa...</h2>
      <p className="text-gray-600 mb-4">Please wait while we redirect you to the secure payment page.</p>
    </div>
  );
}

export default function PaymentComponent({ 
  productId, 
  productName, 
  amount, 
  onPaymentSuccess, 
  onPaymentFailure 
}: PaymentComponentProps) {
  const [selectedProvider, setSelectedProvider] = useState<'esewa' | 'khalti' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [esewaFormData, setEsewaFormData] = useState<any>(null);

  const handlePayment = async (provider: 'esewa' | 'khalti') => {
    setIsProcessing(true);
    setSelectedProvider(provider);

    try {
      const response = await fetch(`/api/payment/${provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          productId,
          productName,
          customerName: 'Test User',
          customerEmail: 'test@example.com',
          customerPhone: '9800000000'
        }),
      });

      const data = await response.json();
      console.log('🔍 Payment API Response:', data);

      if (data.success) {
        if (provider === 'esewa') {
          if (data.data.form_data) {
            setEsewaFormData(data.data.form_data);
          } else {
            setEsewaFormData({
              esewa_url: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
              amount: amount.toString(),
              tax_amount: '0',
              total_amount: amount.toString(),
              transaction_uuid: data.data.transaction_id,
              product_code: 'EPAYTEST',
              product_service_charge: '0',
              product_delivery_charge: '0',
              success_url: `${window.location.origin}/payment/success?transaction_uuid=${data.data.transaction_id}&product_id=${productId}&amount=${amount}&provider=esewa`,
              failure_url: `${window.location.origin}/payment/failed`,
              signed_field_names: 'total_amount,transaction_uuid,product_code',
              signature: 'temp_signature'
            });
          }
        } else if (provider === 'khalti') {
          // ✅ REAL Khalti redirect (no more mock!)
          console.log('🚀 Redirecting to Khalti:', data.data.payment_url);
          window.location.href = data.data.payment_url;
        }
      } else {
        setIsProcessing(false);
        onPaymentFailure(data.message || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      setIsProcessing(false);
      onPaymentFailure('Network error occurred');
    }
  };

  // Show form submitter when we have eSewa form data
  if (esewaFormData) {
    return <EsewaFormSubmitter formData={esewaFormData} />;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Complete Your Purchase</h3>
      
      <div className="mb-4">
        <p className="text-gray-600">Product: {productName}</p>
        <p className="text-2xl font-bold text-green-600">Rs. {amount}</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => handlePayment('esewa')}
          disabled={isProcessing}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
        >
          {isProcessing && selectedProvider === 'esewa' ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Connecting to eSewa...
            </div>
          ) : (
            <div className="flex items-center">
              <div className="bg-white text-orange-500 rounded p-1 mr-2 font-bold">e</div>
              Pay with eSewa
            </div>
          )}
        </button>

        <button
          onClick={() => handlePayment('khalti')}
          disabled={isProcessing}
          className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
        >
          {isProcessing && selectedProvider === 'khalti' ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Connecting to Khalti...
            </div>
          ) : (
            <div className="flex items-center">
              <div className="bg-white text-purple-500 rounded p-1 mr-2 font-bold">K</div>
              Pay with Khalti
            </div>
          )}
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">🔒 Secure Test Payment</h4>
        <div className="text-sm text-blue-700 space-y-2">
          <div>
            <p className="font-semibold">eSewa Test:</p>
            <p>ID: 9806800001 | Password: Nepal@123</p>
          </div>
          <div>
            <p className="font-semibold">Khalti Test:</p>
            <p>Mobile: 9800000000 | MPIN: 1111 | OTP: 987654</p>
          </div>
          <p className="text-blue-600 font-semibold">Note: Sandbox environment - no real money charged</p>
        </div>
      </div>
    </div>
  );
}