import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, productId, productName, customerName, customerEmail, customerPhone } = body;

    if (!amount || !productId || !productName) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Your Khalti test secret key (replace with yours)
    const secretKey = "e7d4bb993a654a68883705b892e90364"; // ← REPLACE THIS

    const payload = {
      return_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/payment/success?provider=khalti&product_id=${productId}&amount=${amount}`,
      website_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}`,
      amount: amount * 100, // Khalti expects amount in paisa (Rs. 100 = 10000 paisa)
      purchase_order_id: `navajeevan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      purchase_order_name: productName.substring(0, 64), // Max 64 chars
      customer_info: {
        name: customerName || 'Test Customer',
        email: customerEmail || 'test@example.com',
        phone: customerPhone || '9800000000'
      }
    };

    console.log('🔍 Khalti payload:', payload);

    // Initiate Khalti payment
    const response = await fetch('https://a.khalti.com/api/v2/epayment/initiate/', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('🔍 Khalti response:', data);

    if (data.pidx) {
      return NextResponse.json({
        success: true,
        data: {
          payment_url: data.payment_url, // Use the payment_url from Khalti
          pidx: data.pidx,
          amount: amount,
          product_id: productId,
          status: 'initiated',
          message: 'Khalti payment initiated successfully'
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: data.detail || 'Failed to initiate Khalti payment'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Khalti payment error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}