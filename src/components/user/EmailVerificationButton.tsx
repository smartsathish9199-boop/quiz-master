import { useState } from 'react';
import { Mail, Shield } from 'lucide-react';
import EmailVerificationModal from '../auth/EmailVerificationModal';
import toast from 'react-hot-toast';

interface EmailVerificationButtonProps {
  email: string;
  onVerified?: () => void;
  className?: string;
}

const EmailVerificationButton = ({ email, onVerified, className = '' }: EmailVerificationButtonProps) => {
  const [showModal, setShowModal] = useState(false);

  const handleVerified = () => {
    setShowModal(false);
    toast.success('Email verified successfully!');
    onVerified?.();
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${className}`}
      >
        <Shield size={18} />
        <span>Verify Email</span>
      </button>

      {showModal && (
        <EmailVerificationModal
          email={email}
          onVerified={handleVerified}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default EmailVerificationButton;