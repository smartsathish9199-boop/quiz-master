// Verification service for handling OTP generation and email verification

export interface OTPResult {
  success: boolean;
  message: string;
  email?: string;
  error?: string;
}

export interface VerificationResult {
  success: boolean;
  message: string;
}

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expires: number; attempts: number }>();

/**
 * Generate a secure 6-digit OTP
 */
export function generateOTP(): string {
  // Use crypto.getRandomValues for secure random number generation
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const randomNumber = array[0];
  return (randomNumber % 900000 + 100000).toString();
}

/**
 * Send verification email with OTP using Supabase Edge Function
 */
export async function sendVerificationEmail(email: string, otp: string): Promise<VerificationResult> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        to: email,
        subject: 'Your QuizMaster Verification Code',
        type: 'verification',
        data: {
          otp: otp,
          expiresIn: '10 minutes'
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send email');
    }

    return {
      success: true,
      message: 'Verification email sent successfully'
    };
  } catch (error: any) {
    console.error('Error sending verification email:', error);
    return {
      success: false,
      message: error.message || 'Failed to send verification email'
    };
  }
}

/**
 * Store OTP securely with expiration and rate limiting
 */
function storeOTP(email: string, otp: string): void {
  const expires = Date.now() + (10 * 60 * 1000); // 10 minutes
  otpStore.set(email, { otp, expires, attempts: 0 });
  
  // Clean up expired OTPs
  setTimeout(() => {
    otpStore.delete(email);
  }, 10 * 60 * 1000);
}

/**
 * Verify OTP against stored value with security measures
 */
export async function verifyOTP(email: string, otp: string): Promise<VerificationResult> {
  try {
    const stored = otpStore.get(email);
    
    if (!stored) {
      return {
        success: false,
        message: 'OTP not found or expired'
      };
    }

    // Check if OTP has expired
    if (Date.now() > stored.expires) {
      otpStore.delete(email);
      return {
        success: false,
        message: 'OTP has expired'
      };
    }

    // Rate limiting - max 3 attempts
    if (stored.attempts >= 3) {
      otpStore.delete(email);
      return {
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      };
    }

    // Verify OTP
    if (stored.otp === otp) {
      otpStore.delete(email);
      return {
        success: true,
        message: 'OTP verified successfully'
      };
    } else {
      // Increment failed attempts
      stored.attempts++;
      return {
        success: false,
        message: 'Invalid OTP'
      };
    }
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return {
      success: false,
      message: 'Failed to verify OTP'
    };
  }
}

/**
 * Send OTP to user by ID with security measures
 */
export async function sendOTPToUserById(userId: string): Promise<OTPResult> {
  try {
    // Get user from localStorage (in production, use proper database)
    const users = JSON.parse(localStorage.getItem('quizUsers') || '[]');
    const user = users.find((u: any) => u.id === userId);
    
    if (!user) {
      return {
        success: false,
        message: 'User not found',
        error: 'User not found'
      };
    }

    // Rate limiting - check if OTP was sent recently
    const lastSent = localStorage.getItem(`otp_last_sent_${user.email}`);
    if (lastSent && Date.now() - parseInt(lastSent) < 60000) { // 1 minute cooldown
      return {
        success: false,
        message: 'Please wait before requesting another OTP',
        error: 'Rate limit exceeded'
      };
    }

    const otp = generateOTP();
    storeOTP(user.email, otp);
    
    const emailResult = await sendVerificationEmail(user.email, otp);
    
    if (emailResult.success) {
      // Store last sent timestamp
      localStorage.setItem(`otp_last_sent_${user.email}`, Date.now().toString());
      
      return {
        success: true,
        message: 'OTP sent successfully',
        email: user.email
      };
    } else {
      return {
        success: false,
        message: emailResult.message,
        error: emailResult.message
      };
    }
  } catch (error: any) {
    console.error('Error sending OTP to user:', error);
    return {
      success: false,
      message: 'Failed to send OTP',
      error: error.message
    };
  }
}

/**
 * Send OTP to current authenticated user
 */
export async function sendOTPToCurrentUser(): Promise<OTPResult> {
  try {
    const currentUser = JSON.parse(localStorage.getItem('quizUser') || 'null');
    
    if (!currentUser) {
      return {
        success: false,
        message: 'No authenticated user found',
        error: 'User not authenticated'
      };
    }

    // Rate limiting
    const lastSent = localStorage.getItem(`otp_last_sent_${currentUser.email}`);
    if (lastSent && Date.now() - parseInt(lastSent) < 60000) {
      return {
        success: false,
        message: 'Please wait before requesting another OTP',
        error: 'Rate limit exceeded'
      };
    }

    const otp = generateOTP();
    storeOTP(currentUser.email, otp);
    
    const emailResult = await sendVerificationEmail(currentUser.email, otp);
    
    if (emailResult.success) {
      localStorage.setItem(`otp_last_sent_${currentUser.email}`, Date.now().toString());
      
      return {
        success: true,
        message: 'OTP sent successfully',
        email: currentUser.email
      };
    } else {
      return {
        success: false,
        message: emailResult.message,
        error: emailResult.message
      };
    }
  } catch (error: any) {
    console.error('Error sending OTP to current user:', error);
    return {
      success: false,
      message: 'Failed to send OTP',
      error: error.message
    };
  }
}

/**
 * Send OTP to any email address (with additional security checks)
 */
export async function sendOTPToEmail(email: string): Promise<OTPResult> {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        message: 'Invalid email format',
        error: 'Invalid email format'
      };
    }

    // Rate limiting per email
    const lastSent = localStorage.getItem(`otp_last_sent_${email}`);
    if (lastSent && Date.now() - parseInt(lastSent) < 60000) {
      return {
        success: false,
        message: 'Please wait before requesting another OTP',
        error: 'Rate limit exceeded'
      };
    }

    const otp = generateOTP();
    storeOTP(email, otp);
    
    const emailResult = await sendVerificationEmail(email, otp);
    
    if (emailResult.success) {
      localStorage.setItem(`otp_last_sent_${email}`, Date.now().toString());
      
      return {
        success: true,
        message: 'OTP sent successfully',
        email: email,
      };
    } else {
      return {
        success: false,
        message: emailResult.message,
        error: emailResult.message
      };
    }
  } catch (error: any) {
    console.error('Error sending OTP to email:', error);
    return {
      success: false,
      message: 'Failed to send OTP',
      error: error.message
    };
  }
}

/**
 * Clean up expired OTPs (call periodically)
 */
export function cleanupExpiredOTPs(): void {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expires) {
      otpStore.delete(email);
    }
  }
}

// Clean up expired OTPs every 5 minutes
setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);
