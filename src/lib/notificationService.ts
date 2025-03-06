import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Email configuration
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: import.meta.env.VITE_EMAIL_USER,
    pass: import.meta.env.VITE_EMAIL_PASSWORD,
  },
});

// Twilio configuration
const twilioClient = twilio(
  import.meta.env.VITE_SMS_ACCOUNT_SID,
  import.meta.env.VITE_SMS_AUTH_TOKEN
);

interface BookingDetails {
  spotName: string;
  duration: number;
  totalAmount: number;
  startTime: Date;
  endTime: Date;
  address: string;
}

export const sendBookingConfirmation = async (
  email: string,
  phone: string,
  booking: BookingDetails
) => {
  try {
    // Send email confirmation
    await emailTransporter.sendMail({
      from: import.meta.env.VITE_EMAIL_USER,
      to: email,
      subject: 'Parking Spot Booking Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Booking Confirmation</h2>
          <p>Thank you for booking a parking spot with us!</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Booking Details:</h3>
            <p><strong>Location:</strong> ${booking.spotName}</p>
            <p><strong>Address:</strong> ${booking.address}</p>
            <p><strong>Duration:</strong> ${booking.duration} hours</p>
            <p><strong>Start Time:</strong> ${booking.startTime.toLocaleString()}</p>
            <p><strong>End Time:</strong> ${booking.endTime.toLocaleString()}</p>
            <p><strong>Total Amount:</strong> ₹${booking.totalAmount}</p>
          </div>
          
          <p>Please show this confirmation email when you arrive at the parking spot.</p>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              If you have any questions, please don't hesitate to contact us.
            </p>
          </div>
        </div>
      `,
    });

    // Send SMS confirmation
    await twilioClient.messages.create({
      body: `Booking Confirmed! Spot: ${booking.spotName}, Duration: ${booking.duration}hrs, Amount: ₹${booking.totalAmount}. Show this SMS at arrival.`,
      from: import.meta.env.VITE_SMS_FROM_NUMBER,
      to: phone,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending notifications:', error);
    return { success: false, error };
  }
};

export const sendOTP = async (phone: string, otp: string) => {
  try {
    await twilioClient.messages.create({
      body: `Your SpotMaster verification code is: ${otp}. Valid for 5 minutes.`,
      from: import.meta.env.VITE_SMS_FROM_NUMBER,
      to: phone,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return { success: false, error };
  }
}; 