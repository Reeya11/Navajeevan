import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { paymentId, provider, amount } = body;

    if (!paymentId || !provider) {
      return NextResponse.json(
        { success: false, message: 'Payment ID and provider are required' },
        { status: 400 }
      );
    }

    console.log('🔍 Verifying payment:', { paymentId, provider, amount });

    if (provider === 'esewa') {
      // Real eSewa verification
      const verificationUrl = `https://rc-epay.esewa.com.np/api/epay/transaction/status/?product_code=EPAYTEST&total_amount=${amount}&transaction_uuid=${paymentId}`;
      
      console.log('Verifying eSewa payment:', { paymentId, amount, verificationUrl });
      
      const verificationResponse = await fetch(verificationUrl);
      const verificationData = await verificationResponse.json();

      console.log('eSewa verification response:', verificationData);

      // Map eSewa response to your expected format
      const mappedResponse = {
        verified: verificationData.status === 'COMPLETE',
        status: verificationData.status?.toLowerCase() || 'failed',
        transaction_id: paymentId,
        amount: amount,
        message: verificationData.status === 'COMPLETE' ? 'Payment verified successfully' : 'Payment verification failed',
        provider: 'esewa',
        timestamp: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        data: mappedResponse
      });

    } else if (provider === 'khalti') {
      // ✅ REAL Khalti verification
      const secretKey = "e7d4bb993a654a68883705b892e90364"; // ← REPLACE WITH YOUR SECRET KEY

      console.log('🔍 Verifying Khalti payment with pidx:', paymentId);

      const verifyResponse = await fetch('https://a.khalti.com/api/v2/epayment/lookup/', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          pidx: paymentId 
        }),
      });

      const verificationData = await verifyResponse.json();
      console.log('🔍 Khalti verification response:', verificationData);

      // Map Khalti response to your expected format
      const mappedResponse = {
        verified: verificationData.status === 'Completed',
        status: verificationData.status?.toLowerCase() || 'failed',
        transaction_id: paymentId,
        amount: amount,
        message: verificationData.status === 'Completed' 
          ? 'Payment verified successfully' 
          : verificationData.detail || 'Payment verification failed',
        provider: 'khalti',
        timestamp: new Date().toISOString(),
        khalti_response: verificationData // Include full response for debugging
      };

      return NextResponse.json({
        success: true,
        data: mappedResponse
      });

    } else {
      return NextResponse.json(
        { success: false, message: 'Unsupported payment provider' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('❌ Payment verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}