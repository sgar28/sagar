import Razorpay from 'razorpay';
import { supabase } from './supabaseClient';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const createPaymentOrder = async (amount: number, bookingId: string) => {
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: bookingId,
      payment_capture: 1,
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  } catch (error) {
    console.error('Payment order creation failed:', error);
    throw error;
  }
};

export const verifyPayment = async (
  paymentId: string,
  orderId: string,
  signature: string
) => {
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest('hex');

  const isAuthentic = expectedSignature === signature;

  if (isAuthentic) {
    await supabase
      .from('bookings')
      .update({ 
        payment_status: 'completed',
        payment_id: paymentId 
      })
      .eq('id', orderId);
  }

  return isAuthentic;
};
