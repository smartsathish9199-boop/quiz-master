import { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { User, Mail, Moon, Sun, Save, AlertCircle, CreditCard, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import EmailVerificationButton from '../../components/user/EmailVerificationButton';
import { sendOTPToCurrentUser, sendOTPToEmail } from '../../services/verificationService';

interface KYCDetails {
  fullName: string;
  dateOfBirth: string;
  panNumber: string;
  aadharNumber: string;
  address: string;
}

const SettingsPage = () => {
  const { user, updateProfile } = useUser();
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [kycDetails, setKYCDetails] = useState<KYCDetails>({
    fullName: '',
    dateOfBirth: '',
    panNumber: '',
    aadharNumber: '',
    address: ''
  });
  const [kycStatus, setKYCStatus] = useState<'pending' | 'verified' | 'not_submitted'>('not_submitted');

  const handleSendOTPToSelf = async () => {
    try {
      // Use the email from the form (in case user changed it)
      const result = await sendOTPToEmail(email);
      if (result.success) {
        toast.success(`OTP sent to ${email}`);
      } else {
        toast.error(result.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
    }
  };

  useEffect(() => {
    // Load theme preference from localStorage
    const theme = localStorage.getItem('theme');
    setIsDarkMode(theme === 'dark');
    
    // Apply theme to document
    document.documentElement.classList.toggle('dark', theme === 'dark');

    // Load KYC status
    const savedKYCStatus = localStorage.getItem('kycStatus');
    if (savedKYCStatus) {
      setKYCStatus(savedKYCStatus as 'pending' | 'verified' | 'not_submitted');
    }

    // Load KYC details
    const savedKYCDetails = localStorage.getItem('kycDetails');
    if (savedKYCDetails) {
      setKYCDetails(JSON.parse(savedKYCDetails));
    }
  }, []);

  const handleThemeToggle = () => {
    const newTheme = !isDarkMode ? 'dark' : 'light';
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      await updateProfile({
        username,
        email,
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKYCSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate KYC details
    if (!kycDetails.fullName || !kycDetails.dateOfBirth || !kycDetails.panNumber || 
        !kycDetails.aadharNumber || !kycDetails.address) {
      toast.error('Please fill all KYC details');
      return;
    }

    // Save KYC details
    localStorage.setItem('kycDetails', JSON.stringify(kycDetails));
    localStorage.setItem('kycStatus', 'pending');
    setKYCStatus('pending');
    setShowKYCModal(false);
    toast.success('KYC details submitted successfully');
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-blue-100">Manage your account preferences</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Profile Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Profile Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter username"
                      />
                    </div>
                  </div>

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
                        className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter email"
                      />
                    </div>
                    <div className="mt-2">
                      <EmailVerificationButton 
                        email={email} 
                        className="text-sm px-3 py-1"
                        onVerified={() => toast.success('Email verification updated!')}
                      />
                      <button
                        onClick={handleSendOTPToSelf}
                        className="ml-2 text-sm px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Send OTP to Email
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* KYC Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  KYC Verification
                </h2>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">
                          KYC Status: {' '}
                          <span className={`
                            ${kycStatus === 'verified' ? 'text-green-600 dark:text-green-400' : ''}
                            ${kycStatus === 'pending' ? 'text-yellow-600 dark:text-yellow-400' : ''}
                            ${kycStatus === 'not_submitted' ? 'text-red-600 dark:text-red-400' : ''}
                          `}>
                            {kycStatus === 'verified' ? 'Verified' : 
                             kycStatus === 'pending' ? 'Pending Verification' : 
                             'Not Submitted'}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Complete KYC to enable withdrawals
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowKYCModal(true)}
                      disabled={kycStatus === 'verified'}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        kycStatus === 'verified'
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {kycStatus === 'verified' ? 'Verified' : 'Complete KYC'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Theme Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Appearance
                </h2>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-2">
                    {isDarkMode ? (
                      <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    ) : (
                      <Sun className="h-5 w-5 text-yellow-500" />
                    )}
                    <span className="text-gray-700 dark:text-gray-300">
                      {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleThemeToggle}
                    className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    style={{
                      backgroundColor: isDarkMode ? '#4F46E5' : '#D1D5DB'
                    }}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isDarkMode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Warning Section */}
              <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Important Note
                    </h3>
                    <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                      Changing your email address will require re-verification. Make sure to use a valid email address.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-blue-400"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* KYC Modal */}
      {showKYCModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <h2 className="text-xl font-bold">KYC Verification</h2>
              <p className="text-blue-100">Complete your identity verification</p>
            </div>

            <form onSubmit={handleKYCSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={kycDetails.fullName}
                  onChange={(e) => setKYCDetails({ ...kycDetails, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={kycDetails.dateOfBirth}
                  onChange={(e) => setKYCDetails({ ...kycDetails, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  PAN Number
                </label>
                <input
                  type="text"
                  value={kycDetails.panNumber}
                  onChange={(e) => setKYCDetails({ ...kycDetails, panNumber: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Aadhar Number
                </label>
                <input
                  type="text"
                  value={kycDetails.aadharNumber}
                  onChange={(e) => setKYCDetails({ ...kycDetails, aadharNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="1234 5678 9012"
                  maxLength={12}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address
                </label>
                <textarea
                  value={kycDetails.address}
                  onChange={(e) => setKYCDetails({ ...kycDetails, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowKYCModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit KYC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SettingsPage;