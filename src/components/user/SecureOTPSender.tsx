import { useState } from 'react';
import { Mail, Send, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { sendOTPToEmail } from '../../services/verificationService';
import toast from 'react-hot-toast';

interface SecureOTPSenderProps {
  onClose?: () => void;
  title?: string;
  description?: string;
}

const SecureOTPSender = ({ 
  onClose, 
  title = "Send Secure OTP",
  description = "Enter an email address to send a secure verification code"
}: SecureOTPSenderProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await sendOTPToEmail(email.trim());
      setResult({
        success: response.success,
        message: response.message
      });

      if (response.success) {
        toast.success(`OTP sent successfully to ${email}`);
      } else {
        toast.error(response.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      const errorResult = {
        success: false,
        message: error.message || 'Failed to send OTP'
      };
      setResult(errorResult);
      toast.error(errorResult.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Shield size={32} />
          </div>
        </div>
        <h2 className="text-xl font-bold text-center">{title}</h2>
        <p className="text-blue-100 text-center mt-2">{description}</p>
      </div>

      {/* Content */}
      <div className="p-6">
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter email address"
                required
              />
            </div>
          </div>

          {result && (
            <div className={`p-4 rounded-lg ${
              result.success 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex items-center">
                {result.success ? (
                  <CheckCircle size={20} className="mr-2" />
                ) : (
                  <AlertCircle size={20} className="mr-2" />
                )}
                <p className="font-medium">{result.message}</p>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Close
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                isLoading || !email.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Send OTP</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security Features */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium text-gray-800 dark:text-white mb-2">Security Features</h4>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <li>• Cryptographically secure OTP generation</li>
            <li>• 10-minute expiration time</li>
            <li>• Rate limiting (1 OTP per minute per email)</li>
            <li>• Maximum 3 verification attempts</li>
            <li>• Automatic cleanup of expired OTPs</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SecureOTPSender;