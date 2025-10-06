// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useUser } from '../contexts/UserContext';
// import { Eye, EyeOff, User, Lock } from 'lucide-react';
// import toast from 'react-hot-toast';
// import Header from '../components/layout/Header';
// import Footer from '../components/layout/Footer';
// import { supabase } from '../lib/supabase';
// import EmailVerificationModal from '../components/auth/EmailVerificationModal';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [showVerificationModal, setShowVerificationModal] = useState(false);
//   const [pendingEmail, setPendingEmail] = useState('');
  
//   const navigate = useNavigate();
//   const { login } = useUser();

//   const handleEmailLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!email || !password) {
//       toast.error('Please enter both email and password');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const { data, error } = await supabase.auth.signInWithPassword({
//         email,
//         password
//       });

//       if (error) {
//         throw error;
//       }

//       if (data.user) {
//         // Check if email is verified (in real app, check data.user.email_confirmed_at)
//         // For demo, we'll assume all emails need verification on first login
//         const isFirstLogin = !localStorage.getItem(`verified_${email}`);
        
//         if (isFirstLogin) {
//           setPendingEmail(email);
//           setShowVerificationModal(true);
//           return;
//         }

//         // Try to get profile, if it doesn't exist, create one
//         let { data: userData, error: profileError } = await supabase
//           .from('profiles')
//           .select('*')
//           .eq('user_id', data.user.id)
//           .single();

//         // If profile doesn't exist, create one
//         if (profileError && profileError.code === 'PGRST116') {
//           const username = data.user.user_metadata?.username || 
//                           data.user.user_metadata?.name || 
//                           data.user.email?.split('@')[0] || 
//                           'User';

//           const { data: newProfile, error: insertError } = await supabase
//             .from('profiles')
//             .insert([
//               {
//                 user_id: data.user.id,
//                 username: username,
//                 balance: 0
//               }
//             ])
//             .select()
//             .single();

//           if (insertError) {
//             console.error('Profile creation error:', insertError);
//             throw new Error('Failed to create user profile');
//           }

//           userData = newProfile;
//         } else if (profileError) {
//           console.error('Profile fetch error:', profileError);
//           throw new Error('Failed to fetch user profile');
//         }

//         login({
//           id: userData.user_id,
//           username: userData.username,
//           email: data.user.email || '',
//           balance: userData.balance || 0,
//           isAdmin: data.user.email === 'admin@quiz.com'
//         });
        
//         toast.success('Login successful');
//         navigate(data.user.email === 'admin@quiz.com' ? '/admin' : '/user');
//       }
//     } catch (error: any) {
//       console.error('Login error:', error);
//       toast.error(error.message || 'Login failed');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleEmailVerified = async () => {
//     setShowVerificationModal(false);
    
//     // Mark email as verified for demo purposes
//     localStorage.setItem(`verified_${pendingEmail}`, 'true');
    
//     // Continue with login process
//     try {
//       const { data } = await supabase.auth.getUser();
      
//       if (data.user) {
//         let { data: userData, error: profileError } = await supabase
//           .from('profiles')
//           .select('*')
//           .eq('user_id', data.user.id)
//           .single();

//         if (profileError && profileError.code === 'PGRST116') {
//           const username = data.user.user_metadata?.username || 
//                           data.user.user_metadata?.name || 
//                           data.user.email?.split('@')[0] || 
//                           'User';

//           const { data: newProfile, error: insertError } = await supabase
//             .from('profiles')
//             .insert([
//               {
//                 user_id: data.user.id,
//                 username: username,
//                 balance: 0
//               }
//             ])
//             .select()
//             .single();

//           if (insertError) {
//             console.error('Profile creation error:', insertError);
//             throw new Error('Failed to create user profile');
//           }

//           userData = newProfile;
//         }

//         login({
//           id: userData.user_id,
//           username: userData.username,
//           email: data.user.email || '',
//           balance: userData.balance || 0,
//           isAdmin: data.user.email === 'admin@quiz.com'
//         });
        
//         toast.success('Email verified and login successful');
//         navigate(data.user.email === 'admin@quiz.com' ? '/admin' : '/user');
//       }
//     } catch (error: any) {
//       console.error('Login error:', error);
//       toast.error(error.message || 'Login failed');
//     }
//   };

//   const handleVerificationClose = () => {
//     setShowVerificationModal(false);
//     setPendingEmail('');
//   };

//   const handleDemoUserLogin = () => {
//     login({
//       id: 'demo-user',
//       username: 'Demo User',
//       email: 'demo@quiz.com',
//       balance: 100,
//       isAdmin: false
//     });
    
//     toast.success('Demo login successful');
//     navigate('/user');
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-gray-50">
//       <Header />
      
//       <main className="flex-grow flex items-center justify-center p-4 sm:p-6">
//         <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-md">
//           <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">Welcome Back</h2>
          
//           <div className="relative mb-6">
//             <div className="absolute inset-0 flex items-center">
//               <div className="w-full border-t border-gray-200"></div>
//             </div>
//             <div className="relative flex justify-center text-sm">
//               <span className="px-2 bg-white text-gray-500">Sign in to continue</span>
//             </div>
//           </div>

//           <form onSubmit={handleEmailLogin} className="space-y-6">
//             <div className="space-y-1">
//               <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
//               <div className="relative">
//                 <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
//                   <User size={18} />
//                 </div>
//                 <input
//                   id="email"
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="w-full px-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
//                   placeholder="your@email.com"
//                 />
//               </div>
//             </div>
            
//             <div className="space-y-1">
//               <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
//               <div className="relative">
//                 <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
//                   <Lock size={18} />
//                 </div>
//                 <input
//                   id="password"
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="w-full px-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
//                   placeholder="••••••••"
//                 />
//                 <button
//                   type="button"
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>
//             </div>
            
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
//             >
//               {isLoading ? (
//                 <>
//                   <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
//                   <span>Signing In...</span>
//                 </>
//               ) : (
//                 'Sign In'
//               )}
//             </button>
            
//             <button
//               type="button"
//               onClick={handleDemoUserLogin}
//               className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
//             >
//               Try Demo Mode
//             </button>
            
//             <div className="text-center text-sm space-y-3">
//               <p className="text-gray-600">
//                 Don't have an account?{" "}
//                 <Link to="/register" className="text-blue-600 hover:underline">
//                   Register here
//                 </Link>
//               </p>
//               <p className="text-gray-500">
//                 Are you an administrator?{" "}
//                 <Link to="/admin/login" className="text-purple-600 hover:underline">
//                   Admin Login
//                 </Link>
//               </p>
//             </div>
//           </form>
//         </div>
//       </main>
      
//       {/* Email Verification Modal */}
//       {showVerificationModal && (
//         <EmailVerificationModal
//           email={pendingEmail}
//           onVerified={handleEmailVerified}
//           onClose={handleVerificationClose}
//         />
//       )}
      
//       <Footer />
//     </div>
//   );
// };

// export default Login;
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { supabase } from '../lib/supabase';
import EmailVerificationModal from '../components/auth/EmailVerificationModal';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  const navigate = useNavigate();
  const { login } = useUser();

  // -------------------- LOGIN HANDLER --------------------
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // 🔑 Check email confirmation
        if (!data.user.email_confirmed_at) {
          // If user not confirmed yet
          setPendingEmail(email);
          setShowVerificationModal(true);
          toast('Please verify your email before continuing.');
          return;
        }

        await fetchOrCreateProfile(data.user.id, data.user.email || '');
        toast.success('Login successful');
        navigate(data.user.email === 'admin@quiz.com' ? '/admin' : '/user');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      toast.error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------- PROFILE FETCH / CREATE --------------------
  const fetchOrCreateProfile = async (userId: string, email: string) => {
    let { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // create profile
      const username = email.split('@')[0];
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([{ user_id: userId, username, balance: 0 }])
        .select()
        .single();

      if (insertError) throw insertError;
      profile = newProfile;
    } else if (error) {
      throw error;
    }

    login({
      id: profile.user_id,
      username: profile.username,
      email,
      balance: profile.balance || 0,
      isAdmin: email === 'admin@quiz.com',
    });
  };

  // -------------------- AFTER EMAIL VERIFIED --------------------
  const handleEmailVerified = async () => {
    setShowVerificationModal(false);
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) throw error || new Error('User not found');
      await fetchOrCreateProfile(data.user.id, data.user.email || '');
      toast.success('Email verified and login successful');
      navigate(data.user.email === 'admin@quiz.com' ? '/admin' : '/user');
    } catch (err: any) {
      console.error('Verification error:', err);
      toast.error(err.message || 'Login failed');
    }
  };

  const handleVerificationClose = () => {
    setShowVerificationModal(false);
    setPendingEmail('');
  };

  // -------------------- DEMO LOGIN --------------------
  const handleDemoUserLogin = () => {
    login({
      id: 'demo-user',
      username: 'Demo User',
      email: 'demo@quiz.com',
      balance: 100,
      isAdmin: false,
    });
    toast.success('Demo login successful');
    navigate('/user');
  };

  // -------------------- JSX --------------------
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-md">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">
            Welcome Back
          </h2>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Sign in to continue
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-6">
            {/* EMAIL */}
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                  <span>Signing In...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {/* DEMO */}
            <button
              type="button"
              onClick={handleDemoUserLogin}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Try Demo Mode
            </button>

            {/* LINKS */}
            <div className="text-center text-sm space-y-3">
              <p className="text-gray-600">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:underline">
                  Register here
                </Link>
              </p>
              <p className="text-gray-500">
                Are you an administrator?{' '}
                <Link to="/admin/login" className="text-purple-600 hover:underline">
                  Admin Login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </main>

      {/* EMAIL VERIFICATION MODAL */}
      {showVerificationModal && (
        <EmailVerificationModal
          email={pendingEmail}
          onVerified={handleEmailVerified}
          onClose={handleVerificationClose}
        />
      )}

      <Footer />
    </div>
  );
};

export default Login;
