import { useState } from 'react';
import { Mail, Send, CheckCircle, XCircle, User } from 'lucide-react';
import { sendOTPToUserById } from '../../services/verificationService';
import { getUsers } from '../../services/userService';
import toast from 'react-hot-toast';

interface SendOTPModalProps {
  onClose: () => void;
  userId?: string;
}

const SendOTPModal = ({ onClose, userId }: SendOTPModalProps) => {
  const [selectedUserId, setSelectedUserId] = useState(userId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; email?: string; error?: string } | null>(null);
  
  const users = getUsers();

  const handleSendOTP = async () => {
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await sendOTPToUserById(selectedUserId);
      setResult(response);
      
      if (response.success) {
        toast.success(`OTP sent successfully to ${response.email}`);
      } else {
        toast.error(response.error || 'Failed to send OTP');
      }
    } catch (error: any) {
      const errorResult = { success: false, error: error.message || 'Failed to send OTP' };
      setResult(errorResult);
      toast.error(errorResult.error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Mail size={32} />
            </div>
          </div>
          <h2 className="text-xl font-bold text-center">Send OTP to User</h2>
          <p className="text-blue-100 text-center mt-2">
            Send verification code to user's email
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {!userId && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select User
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Choose a user...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username} ({user.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedUser && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <User size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">{selectedUser.username}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{selectedUser.email}</p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className={`mb-6 p-4 rounded-lg ${
              result.success 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex items-center">
                {result.success ? (
                  <CheckCircle size={20} className="mr-2" />
                ) : (
                  <XCircle size={20} className="mr-2" />
                )}
                <div>
                  <p className="font-medium">
                    {result.success ? 'OTP Sent Successfully!' : 'Failed to Send OTP'}
                  </p>
                  {result.success && result.email && (
                    <p className="text-sm">Sent to: {result.email}</p>
                  )}
                  {!result.success && result.error && (
                    <p className="text-sm">{result.error}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSendOTP}
              disabled={!selectedUserId || isLoading}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                !selectedUserId || isLoading
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
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
          <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
            <Mail size={16} className="mr-2" />
            <span>OTP will be sent securely to the user's registered email</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendOTPModal;