import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const bookingSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .regex(/^[A-Z][a-zA-Z]*$/, 'First letter must be capital'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .regex(/^[A-Z][a-zA-Z]*$/, 'First letter must be capital'),
  email: z.string().email('Invalid email address'),
  phone: z.string()
    .min(10, 'Phone number must be 10 digits')
    .max(10, 'Phone number must be 10 digits')
    .regex(/^\d+$/, 'Phone number must contain only digits'),
  vehicleNumber: z.string()
    .min(1, 'Vehicle number is required'),
  duration: z.number()
    .min(1, 'Duration must be at least 1 hour'),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  spotId: string;
  pricePerHour: number;
}

export const BookingForm = ({ spotId, pricePerHour }: BookingFormProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema)
  });

  const initializeRazorpay = async () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (formData: BookingFormData) => {
    try {
      setIsProcessing(true);
      const res = await initializeRazorpay();

      if (!res) {
        toast.error('Razorpay SDK failed to load');
        return;
      }

      // Make API call to create order
      const order = await fetch('/api/create-order', {
        method: 'POST',
        body: JSON.stringify({
          amount: pricePerHour * formData.duration * 100, // Convert to paise
          spotId,
          ...formData,
        }),
      }).then(res => res.json());

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: 'INR',
        name: 'ParkMaster',
        description: 'Parking Spot Booking',
        order_id: order.id,
        handler: async (response: any) => {
          try {
            // Verify payment
            const data = await fetch('/api/verify-payment', {
              method: 'POST',
              body: JSON.stringify({
                orderId: order.id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            }).then(res => res.json());

            if (data.success) {
              toast.success('Booking confirmed! Check your email for details.');
            }
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error) {
      toast.error('Something went wrong');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-6">Book Parking Spot</h2>
      <form onSubmit={handleSubmit(handlePayment)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            {...register('firstName')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <input
            type="text"
            {...register('lastName')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            {...register('email')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            {...register('phone')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Vehicle Number</label>
          <input
            type="text"
            {...register('vehicleNumber')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.vehicleNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.vehicleNumber.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Duration (hours)</label>
          <input
            type="number"
            {...register('duration', { valueAsNumber: true })}
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.duration && (
            <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
          )}
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {isProcessing ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}; 