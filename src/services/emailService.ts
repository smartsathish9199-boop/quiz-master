import { supabase } from '../lib/supabase';

interface CompetitionEmailDetails {
  title: string;
  startTime: string;
  endTime: string;
  entryFee: number;
  prizeMoney: number;
}

export const sendCompetitionRegistrationEmail = async (
  email: string,
  competitionDetails: CompetitionEmailDetails
) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('No authentication session found');
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/resend-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
         from:"team@lordsandkingsagro.com",
          to: email,
          subject: `Registration Confirmed: ${competitionDetails.title}`,
          type: 'competition_registration',
          data: {
            competitionDetails
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send email');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};