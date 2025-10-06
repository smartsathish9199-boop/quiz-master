import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Calendar,
  Clock,
  Users,
  DollarSign,
  Timer,
  AlertCircle
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useUser } from '../../contexts/UserContext';
import {
  Competition,
  Participant,
  getCompetitions,
  getCompetitionParticipants,
  registerParticipant,
  updateParticipantPayment
} from '../../services/competitionService';
import { addUserTransaction } from '../../services/transactionService';
import { sendCompetitionRegistrationEmail } from '../../services/emailService';
import PaymentModal from '../../components/user/PaymentModal';
import toast from 'react-hot-toast';

const CompetitionsPage = () => {
  const navigate = useNavigate();
  const { user, updateBalance } = useUser();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadCompetitions();
    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadCompetitions = () => {
    const allCompetitions = getCompetitions();
    setCompetitions(allCompetitions);
  };

  const handleRegister = (competition: Competition) => {
    if (!user) {
      toast.error('Please login to register');
      return;
    }

    if (user.balance < competition.entryFee) {
      setSelectedCompetition(competition);
      setShowPaymentModal(true);
      return;
    }

    processRegistration(competition);
  };

  const processRegistration = async (competition: Competition) => {
    if (!user) return;

    try {
      // Register participant
      const participant = registerParticipant(competition.id, user.id);

      // Deduct entry fee
      const newBalance = user.balance - competition.entryFee;
      updateBalance(newBalance);

      // Record transaction
      addUserTransaction({
        userId: user.id,
        amount: -competition.entryFee,
        type: 'quiz_fee',
        timestamp: new Date().toISOString()
      });

      // Mark as paid
      updateParticipantPayment(participant.id, true);

      // Send confirmation email
      await sendCompetitionRegistrationEmail(user.email, {
        title: competition.title,
        startTime: competition.startTime,
        endTime: competition.endTime,
        entryFee: competition.entryFee,
        prizeMoney: competition.prizeMoney,
      });

      toast.success('Successfully registered for competition');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to register for competition');
    }
  };

  const handleAddFunds = (amount: number) => {
    if (!user || !selectedCompetition) return;

    // Update user balance
    const newBalance = user.balance + amount;
    updateBalance(newBalance);

    // Record transaction
    addUserTransaction({
      userId: user.id,
      amount: amount,
      type: 'add_funds',
      timestamp: new Date().toISOString()
    });

    toast.success(`₹${amount} added successfully!`);
    setShowPaymentModal(false);

    // If user now has enough balance, process registration
    if (newBalance >= selectedCompetition.entryFee) {
      processRegistration(selectedCompetition);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeRemaining = (startTime: string) => {
    const now = currentTime;
    const start = new Date(startTime);
    const diff = start.getTime() - now.getTime();

    if (diff <= 0) return 'Started';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const isRegistered = (competition: Competition): boolean => {
    if (!user) return false;
    const participants = getCompetitionParticipants(competition.id);
    return participants.some(p => p.userId === user.id && p.paid);
  };

  const isCompetitionActive = (competition: Competition): boolean => {
    const now = currentTime;
    const start = new Date(competition.startTime);
    const end = new Date(competition.endTime);
    return now >= start && now <= end;
  };

  const canStartQuiz = (competition: Competition): boolean => {
    return isRegistered(competition) && isCompetitionActive(competition);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Quiz Competitions</h1>
          <p className="text-gray-600 dark:text-gray-300">Join scheduled competitions and win prizes!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitions.map((competition) => (
            <div
              key={competition.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {competition.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                      {competition.description}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isCompetitionActive(competition)
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : new Date(competition.startTime) > currentTime
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {isCompetitionActive(competition) 
                      ? 'Active'
                      : new Date(competition.startTime) > currentTime
                        ? 'Upcoming'
                        : 'Ended'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Calendar size={16} className="mr-2" />
                    <span className="text-sm">Starts: {formatDateTime(competition.startTime)}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Clock size={16} className="mr-2" />
                    <span className="text-sm">Ends: {formatDateTime(competition.endTime)}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Timer size={16} className="mr-2" />
                    <span className="text-sm">Time remaining: {getTimeRemaining(competition.startTime)}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Users size={16} className="mr-2" />
                    <span className="text-sm">
                      Participants: {getCompetitionParticipants(competition.id).length}/{competition.maxParticipants}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <DollarSign size={16} className="mr-2" />
                    <span className="text-sm">Entry Fee: ${competition.entryFee}</span>
                  </div>
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <Trophy size={16} className="mr-2" />
                    <span className="text-sm">Prize Pool: ${competition.prizeMoney}</span>
                  </div>
                </div>

                <div className="mt-6">
                  {isRegistered(competition) ? (
                    <button
                      onClick={() => canStartQuiz(competition) ? navigate(`/competition-quiz/${competition.id}`) : null}
                      disabled={!canStartQuiz(competition)}
                      className={`w-full py-2 px-4 rounded-lg font-medium ${
                        canStartQuiz(competition)
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : isCompetitionActive(competition)
                            ? 'bg-yellow-600 text-white cursor-wait'
                            : 'bg-gray-200 text-gray-600 cursor-not-allowed'
                      } transition-colors`}
                    >
                      {canStartQuiz(competition)
                        ? 'Start Quiz'
                        : isCompetitionActive(competition)
                          ? 'Starting Soon...'
                          : new Date(competition.startTime) > currentTime
                            ? 'Registered - Waiting to Start'
                            : 'Competition Ended'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRegister(competition)}
                      disabled={new Date(competition.startTime) <= currentTime}
                      className={`w-full py-2 px-4 rounded-lg font-medium ${
                        new Date(competition.startTime) > currentTime
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-200 text-gray-600 cursor-not-allowed'
                      } transition-colors`}
                    >
                      {new Date(competition.startTime) > currentTime ? 'Register Now' : 'Registration Closed'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {competitions.length === 0 && (
          <div className="text-center py-12">
            <Trophy size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No competitions available at the moment.</p>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedCompetition && (
          <PaymentModal
            onClose={() => setShowPaymentModal(false)}
            onAddFunds={handleAddFunds}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default CompetitionsPage;