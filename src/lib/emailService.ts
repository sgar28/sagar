import nodemailer from 'nodemailer';

interface EmailConfig {
  to: string;
  subject: string;
  text: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: import.meta.env.VITE_EMAIL_USER,
    pass: import.meta.env.VITE_EMAIL_PASSWORD,
  },
});

export const sendEmail = async ({ to, subject, text, html }: EmailConfig) => {
  try {
    const info = await transporter.sendMail({
      from: import.meta.env.VITE_EMAIL_USER,
      to,
      subject,
      text,
      html,
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

export const sendBookingConfirmation = async (
  email: string,
  bookingDetails: {
    spotName: string;
    duration: number;
    totalAmount: number;
    startTime: Date;
    endTime: Date;
  }
) => {
  const subject = 'Parking Spot Booking Confirmation';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Booking Confirmation</h2>
      <p>Thank you for booking a parking spot with us!</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Booking Details:</h3>
        <p><strong>Location:</strong> ${bookingDetails.spotName}</p>
        <p><strong>Duration:</strong> ${bookingDetails.duration} hours</p>
        <p><strong>Start Time:</strong> ${bookingDetails.startTime.toLocaleString()}</p>
        <p><strong>End Time:</strong> ${bookingDetails.endTime.toLocaleString()}</p>
        <p><strong>Total Amount:</strong> ₹${bookingDetails.totalAmount}</p>
      </div>
      
      <p>Please show this confirmation email when you arrive at the parking spot.</p>
      
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          If you have any questions, please don't hesitate to contact us.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject,
    text: `Booking Confirmation for ${bookingDetails.spotName}`,
    html,
  });
}; 