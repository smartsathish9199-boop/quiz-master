import { useState } from 'react';
import { XCircle, CreditCard, Check } from 'lucide-react';
import { initializeRazorpay } from '../../services/paymentService';
import toast from 'react-hot-toast';

interface PaymentModalProps {
  onClose: () => void;
  onAddFunds: (amount: number) => void;
}

const PaymentModal = ({ onClose, onAddFunds }: PaymentModalProps) => {
  const [amount, setAmount] = useState<number>(100);
  const [processing, setProcessing] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);
  
  const predefinedAmounts = [100, 500, 1000, 5000];
  
  const handlePayment = async () => {
    try {
      setProcessing(true);
      
      await initializeRazorpay({
        amount,
        name: 'QuizMaster',
        description: 'Add funds to wallet',
        prefill: {
          name: 'John Doe',
          email: 'john@example.com',
          contact: '9999999999'
        }
      });
      
      setCompleted(true);
      onAddFunds(amount);
    } catch (error) {
      toast.error('Payment failed. Please try again.');
      console.error('Payment error:', error);
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Add Funds</h2>
            <button 
              onClick={onClose}
              className="text-white hover:text-red-200 transition-colors"
            >
              <XCircle size={24} />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {!completed ? (
            <div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Select Amount
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  {predefinedAmounts.map((predefinedAmount) => (
                    <button
                      key={predefinedAmount}
                      type="button"
                      className={`py-3 px-4 rounded-lg transition-colors text-sm sm:text-base ${
                        amount === predefinedAmount
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                      onClick={() => setAmount(predefinedAmount)}
                    >
                      ${predefinedAmount}
                    </button>
                  ))}
                </div>
                <div className="flex items-center mt-3">
                  <span className="text-gray-700 font-medium mr-2">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                    min="100"
                    max="50000"
                  />
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <CreditCard className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Secure Payment</h3>
                    <p className="mt-1 text-sm text-blue-600">
                      Your transaction is secured by Razorpay's payment gateway
                    </p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handlePayment}
                disabled={processing}
                className={`w-full py-4 px-4 rounded-lg font-medium text-white text-base ${
                  processing 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } transition-colors flex items-center justify-center`}
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3" />
                    Processing...
                  </>
                ) : (
                  `Pay $${amount}`
                )}
              </button>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-green-100">
                <Check className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
              <p className="text-gray-600">
                ${amount} has been added to your account.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;