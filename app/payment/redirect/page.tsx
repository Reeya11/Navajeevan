'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PaymentRedirect() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('loading');
  
  useEffect(() => {
    const data = searchParams.get('data');
    const provider = searchParams.get('provider');
    
    console.log('🔍 Redirect page params:', { data, provider }); // DEBUG

    if (!data || data === 'undefined') {
      console.error('❌ No data parameter found');
      setStatus('error');
      return;
    }

    if (provider === 'esewa') {
      try {
        const formData = JSON.parse(decodeURIComponent(data));
        console.log('🔍 Parsed form data:', formData); // DEBUG
        
        if (!formData.esewa_url) {
          throw new Error('Missing eSewa URL');
        }

        // Create and submit form
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
        form.submit();
        setStatus('redirecting');
      } catch (error) {
        console.error('❌ Error processing redirect:', error);
        setStatus('error');
      }
    }
  }, [searchParams]);

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-2">Redirect Error</h2>
          <p className="text-gray-600">Failed to redirect to payment gateway.</p>
          <button 
            onClick={() => window.history.back()}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold mb-2">
          {status === 'redirecting' ? 'Redirecting to eSewa...' : 'Preparing Payment...'}
        </h2>
        <p className="text-gray-600">Please wait while we redirect you to the secure payment page.</p>
      </div>
    </div>
  );
}