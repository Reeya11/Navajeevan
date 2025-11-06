import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { amount, productId, productName } = body;

    // Validate required fields
    if (!amount || !productId || !productName) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // eSewa Test Credentials
    const secretKey = "*gBm/:&EnhH.1/q"; // Note: Fixed the @ symbol issue
    
    const transaction_uuid = `navajeevan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create the data string for signature - CORRECT FORMAT
    const data = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=EPAYTEST`;
    
    console.log('🔍 Data for signature:', data);
    console.log('🔍 Secret key:', secretKey);
    
    // Generate signature - CORRECT METHOD
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(data)
      .digest('base64');

    console.log('🔍 Generated signature:', signature);

    // Return FORM DATA
    const formData = {
      amount: amount.toString(),
      tax_amount: '0',
      total_amount: amount.toString(),
      transaction_uuid: transaction_uuid,
      product_code: 'EPAYTEST',
      product_service_charge: '0',
      product_delivery_charge: '0',
      success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/payment/success?transaction_uuid=${transaction_uuid}&product_id=${productId}&amount=${amount}`,
      failure_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/payment/failed`,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      signature: signature,
      esewa_url: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form'
    };

    console.log('🔍 Final form data:', formData);

    return NextResponse.json({
      success: true,
      data: {
        form_data: formData,
        transaction_id: transaction_uuid,
        status: 'initiated',
        message: 'Payment initiated successfully'
      }
    });

  } catch (error) {
    console.error('eSewa payment error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}