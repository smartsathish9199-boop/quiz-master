import { loadScript } from '../utils/loadScript';

interface PaymentOptions {
  amount: number;
  currency?: string;
  name: string;
  description?: string;
  orderId?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

export const initializeRazorpay = async (options: PaymentOptions): Promise<any> => {
  try {
    // Load Razorpay script
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    
    if (!res) {
      throw new Error('Razorpay SDK failed to load');
    }

    const rzp = new (window as any).Razorpay({
      key: 'rzp_test_AcFY4djFN57zq9', // Replace with your actual key
      amount: options.amount * 100, // Amount in paise
      currency: options.currency || 'INR',
      name: options.name,
      description: options.description,
      order_id: options.orderId,
      prefill: options.prefill,
      handler: function (response: any) {
        console.log('Payment successful:', response);
        // Handle successful payment
      },
      modal: {
        ondismiss: function () {
          console.log('Payment modal closed');
        }
      }
    });

    rzp.open();
    return rzp;
  } catch (error) {
    console.error('Error initializing payment:', error);
    throw error;
  }
};

export const createRazorpayOrder = async (amount: number): Promise<string> => {
  try {
    // This would typically be an API call to your backend
    // For demo, we'll simulate an order creation
    return 'order_' + Math.random().toString(36).substring(7);
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};