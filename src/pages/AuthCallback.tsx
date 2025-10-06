import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useUser();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        if (!user) {
          throw new Error('No user found');
        }

        // Check if user profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        let userProfile = profile;

        // If profile doesn't exist, create one
        if (!profile) {
          // Get user metadata
          const username = user.user_metadata.username || 
                         user.user_metadata.name || 
                         user.user_metadata.full_name || 
                         user.email?.split('@')[0] || 
                         'User';

          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([
              {
                user_id: user.id,
                username: username,
                balance: 0
              }
            ])
            .select()
            .single();

          if (insertError) {
            console.error('Profile creation error:', insertError);
            throw new Error('Failed to create user profile');
          }

          userProfile = newProfile;
        }

        if (!userProfile) {
          throw new Error('Failed to get or create user profile');
        }

        // Log the user in
        login({
          id: userProfile.user_id,
          username: userProfile.username,
          email: user.email || '',
          balance: userProfile.balance || 0,
          isAdmin: user.email === 'admin@quiz.com'
        });

        toast.success('Successfully logged in!');
        navigate('/user');
      } catch (error: any) {
        console.error('Auth callback error:', error);
        toast.error(error.message || 'Authentication failed. Please try again.');
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, login]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;