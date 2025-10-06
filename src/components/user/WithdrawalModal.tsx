import { useState } from 'react';
import { XCircle, CreditCard, Check, Building, Smartphone } from 'lucide-react';

interface WithdrawalModalProps {
  onClose: () => void;
  onWithdraw: (amount: number, method: string, details: any) => void;
  maxAmount: number;
}

const WithdrawalModal = ({ onClose, onWithdraw, maxAmount }: WithdrawalModalProps) => {
  const [amount, setAmount] = useState<number>(100);
  const [withdrawalMethod, setWithdrawalMethod] = useState<'bank' | 'upi'>('bank');
  const [processing, setProcessing] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);

  // Bank Account Details
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [panNumber, setPanNumber] = useState('');

  // UPI Details
  const [upiId, setUpiId] = useState('');
  const [upiPanNumber, setUpiPanNumber] = useState('');

  const predefinedAmounts = [100, 500, 1000, 5000];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const details = withdrawalMethod === 'bank' 
      ? {
          accountHolder,
          accountNumber,
          ifscCode,
          panNumber,
          method: 'bank'
        }
      : {
          upiId,
          panNumber: upiPanNumber,
          method: 'upi'
        };

    setProcessing(true);
    
    setTimeout(() => {
      setProcessing(false);
      setCompleted(true);
      
      setTimeout(() => {
        onWithdraw(amount, withdrawalMethod, details);
      }, 1500);
    }, 2000);
  };

  const validateForm = () => {
    if (withdrawalMethod === 'bank') {
      return (
        amount > 0 &&
        amount <= maxAmount &&
        accountHolder.trim() !== '' &&
        accountNumber.trim() !== '' &&
        ifscCode.trim() !== '' &&
        panNumber.trim() !== ''
      );
    } else {
      return (
        amount > 0 &&
        amount <= maxAmount &&
        upiId.trim() !== '' &&
        upiPanNumber.trim() !== ''
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Withdraw Funds</h2>
            <button 
              onClick={onClose}
              className="text-white hover:text-red-200 transition-colors"
            >
              <XCircle size={24} />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {!completed ? (
            <form onSubmit={handleSubmit}>
              {/* Withdrawal Method Selection */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Select Withdrawal Method
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-colors ${
                      withdrawalMethod === 'bank'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setWithdrawalMethod('bank')}
                  >
                    <Building size={24} className={withdrawalMethod === 'bank' ? 'text-purple-600' : 'text-gray-500'} />
                    <span className={`mt-2 ${withdrawalMethod === 'bank' ? 'text-purple-600' : 'text-gray-700'}`}>
                      Bank Account
                    </span>
                  </button>
                  
                  <button
                    type="button"
                    className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-colors ${
                      withdrawalMethod === 'upi'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setWithdrawalMethod('upi')}
                  >
                    <Smartphone size={24} className={withdrawalMethod === 'upi' ? 'text-purple-600' : 'text-gray-500'} />
                    <span className={`mt-2 ${withdrawalMethod === 'upi' ? 'text-purple-600' : 'text-gray-700'}`}>
                      UPI
                    </span>
                  </button>
                </div>
              </div>

              {/* Amount Selection */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Select Amount
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {predefinedAmounts.map((predefinedAmount) => (
                    <button
                      key={predefinedAmount}
                      type="button"
                      className={`py-2 px-4 rounded-lg transition-colors ${
                        amount === predefinedAmount
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                      onClick={() => setAmount(predefinedAmount)}
                    >
                      ₹{predefinedAmount}
                    </button>
                  ))}
                </div>
                <div className="flex items-center mt-3">
                  <span className="text-gray-700 font-medium mr-2">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="100"
                    max={maxAmount}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Maximum withdrawal amount: ₹{maxAmount}
                </p>
              </div>

              {/* Bank Account Details */}
              {withdrawalMethod === 'bank' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter account holder name"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter account number"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter IFSC code"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      PAN Number
                    </label>
                    <input
                      type="text"
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter PAN number"
                    />
                  </div>
                </div>
              )}

              {/* UPI Details */}
              {withdrawalMethod === 'upi' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter UPI ID"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      PAN Number
                    </label>
                    <input
                      type="text"
                      value={upiPanNumber}
                      onChange={(e) => setUpiPanNumber(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter PAN number"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={processing || !validateForm()}
                className={`w-full mt-6 py-3 px-4 rounded-lg font-medium text-white ${
                  processing || !validateForm()
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700'
                } transition-colors flex items-center justify-center`}
              >
                {processing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  `Withdraw ₹${amount}`
                )}
              </button>
              
              <p className="text-xs text-gray-500 mt-4 text-center">
                Withdrawal requests are typically processed within 2-3 business days.
              </p>
            </form>
          ) : (
            <div className="text-center py-10">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-green-100">
                <Check className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Withdrawal Initiated!</h3>
              <p className="text-gray-600">
                Your withdrawal request for ₹{amount} has been submitted successfully.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawalModal;