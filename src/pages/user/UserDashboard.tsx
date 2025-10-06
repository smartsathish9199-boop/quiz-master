import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, CreditCard, History, Trophy, Plus, AlertCircle, Wallet, Star, Flame, Award } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getUserQuizzes } from '../../services/quizService';
import { addUserTransaction, getQuizFee } from '../../services/transactionService';
import {
  getUserLevel,
  getUserStats,
  getUserAchievements,
  checkAchievements,
  addExperience
} from '../../services/gamificationService';
import WithdrawalModal from '../../components/user/WithdrawalModal';
import PaymentModal from '../../components/user/PaymentModal';
import LevelProgress from '../../components/gamification/LevelProgress';
import AchievementNotification from '../../components/gamification/AchievementNotification';

const UserDashboard = () => {
  const { user, updateBalance } = useUser();
  const navigate = useNavigate();
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showQuizPayment, setShowQuizPayment] = useState(false);
  const [userLevel, setUserLevel] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [newAchievements, setNewAchievements] = useState<any[]>([]);
  
  // Get user's quiz history
  const quizHistory = getUserQuizzes(user?.id || '');
  
  // Get quiz fee
  const quizFee = getQuizFee();

  useEffect(() => {
    if (user) {
      setUserLevel(getUserLevel(user.id));
      setUserStats(getUserStats(user.id));
      setUserAchievements(getUserAchievements(user.id));
      
      // Check for new achievements
      const newAchievs = checkAchievements(user.id);
      if (newAchievs.length > 0) {
        setNewAchievements(newAchievs);
      }
    }
  }, [user]);
  
  const startQuiz = () => {
    if (!user) return;
    
    // Check if user has enough balance
    if (user.balance < quizFee) {
      toast.error(`Insufficient balance. Please add at least $${quizFee} credits to play.`);
      return;
    }
    
    // Deduct fee from balance
    const newBalance = user.balance - quizFee;
    updateBalance(newBalance);
    
    // Record transaction
    addUserTransaction({
      userId: user.id,
      amount: -quizFee,
      type: 'quiz_fee',
      timestamp: new Date().toISOString()
    });
    
    toast.success('Quiz started! Good luck!');
    navigate('/quiz');
  };

  const handleAddFunds = (amount: number) => {
    if (!user) return;

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

    // Add experience for adding funds
    addExperience(user.id, 5);

    toast.success(`₹${amount} added successfully!`);
    setShowPaymentModal(false);
  };

  const handleWithdrawal = (amount: number, method: string, details: any) => {
    if (!user) return;

    // Update user balance
    const newBalance = user.balance - amount;
    updateBalance(newBalance);

    // Record withdrawal transaction
    addUserTransaction({
      userId: user.id,
      amount: -amount,
      type: 'withdrawal',
      timestamp: new Date().toISOString(),
      details: {
        method,
        ...details
      }
    });

    toast.success(`Withdrawal request for $${amount} has been initiated!`);
    setShowWithdrawalModal(false);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const hasEnoughBalance = user?.balance >= quizFee;
  const isDemoUser = user?.id === 'demo-user';

  const dismissAchievement = (index: number) => {
    setNewAchievements(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Achievement Notifications */}
        {newAchievements.map((userAchievement, index) => {
          const achievement = userAchievement.achievement;
          return (
            <AchievementNotification
              key={userAchievement.id}
              achievement={achievement}
              userAchievement={userAchievement}
              onClose={() => dismissAchievement(index)}
            />
          );
        })}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - User Info & Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <h2 className="text-xl sm:text-2xl font-bold">Welcome back!</h2>
                <p className="text-blue-100">{user?.username}</p>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-gray-600 dark:text-gray-300">Your Balance</span>
                  <span className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">${user?.balance.toFixed(2)}</span>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="flex items-center justify-center space-x-2 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={18} />
                    <span>Add Funds</span>
                  </button>

                  <button
                    onClick={() => setShowWithdrawalModal(true)}
                    className="flex items-center justify-center space-x-2 w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Wallet size={18} />
                    <span>Withdraw</span>
                  </button>
                  
                  {isDemoUser ? (
                    <button
                      onClick={startQuiz}
                      className="flex items-center justify-center space-x-2 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Brain size={18} />
                      <span>Start Quiz (Demo)</span>
                    </button>
                  ) : (
                    hasEnoughBalance ? (
                      <button
                        onClick={() => setShowQuizPayment(true)}
                        className="flex items-center justify-center space-x-2 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Brain size={18} />
                        <span>Play Quiz (${quizFee})</span>
                      </button>
                    ) : (
                      <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 text-sm text-yellow-800 dark:text-yellow-200">
                        <div className="flex items-start">
                          <AlertCircle className="flex-shrink-0 h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2" />
                          <p>
                            Add at least ${quizFee} to your balance to start playing quizzes!
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-gray-700 dark:text-gray-300 font-medium mb-2">About Quiz Mode</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Each quiz costs ${quizFee} to play. Answer all questions correctly to 
                    achieve the highest score and win rewards!
                  </p>
                </div>
              </div>
            </div>

            {/* Level Progress */}
            {userLevel && (
              <div className="mt-6">
                <LevelProgress userLevel={userLevel} />
              </div>
            )}
          </div>
          
          {/* Right Column - Stats & History */}
          <div className="lg:col-span-2">
            {/* Gamification Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 lg:mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-600 dark:text-gray-300 text-sm">Level</h3>
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{userLevel?.level || 1}</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-600 dark:text-gray-300 text-sm">Streak</h3>
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{userStats?.currentStreak || 0}</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-600 dark:text-gray-300 text-sm">Achievements</h3>
                  <Award className="h-5 w-5 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{userAchievements.length}</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-600 dark:text-gray-300 text-sm">Total XP</h3>
                  <Trophy className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{userLevel?.totalExperience || 0}</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 lg:mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 dark:text-gray-300">Total Quizzes</h3>
                  <Trophy className="h-6 w-6 text-purple-500" />
                </div>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{quizHistory.length}</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 dark:text-gray-300">High Score</h3>
                  <Brain className="h-6 w-6 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">
                  {quizHistory.length > 0 
                    ? Math.max(...quizHistory.map(q => q.score))
                    : 0}%
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 dark:text-gray-300">Spent</h3>
                  <CreditCard className="h-6 w-6 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">${(quizHistory.length * quizFee).toFixed(2)}</p>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Quiz History</h2>
                <History className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
              
              <div className="p-6">
                {quizHistory.length > 0 ? (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {quizHistory.slice(0, 5).map((quiz) => (
                      <div key={quiz.id} className="py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">Quiz #{quiz.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(quiz.datePlayed)}</p>
                        </div>
                        <div className="flex items-center space-x-2 self-start sm:self-auto">
                          <span className="text-lg font-bold text-gray-800 dark:text-white">{quiz.score}%</span>
                          <div 
                            className={`w-3 h-3 rounded-full ${
                              quiz.score >= 80 ? 'bg-green-500' : 
                              quiz.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">You haven't taken any quizzes yet.</p>
                    {isDemoUser ? (
                      <button
                        onClick={startQuiz}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Start Your First Quiz
                      </button>
                    ) : hasEnoughBalance ? (
                      <button
                        onClick={() => setShowQuizPayment(true)}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Play Your First Quiz
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowPaymentModal(true)}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add Funds to Start
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <WithdrawalModal
          onClose={() => setShowWithdrawalModal(false)}
          onWithdraw={handleWithdrawal}
          maxAmount={user?.balance || 0}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          onClose={() => setShowPaymentModal(false)}
          onAddFunds={handleAddFunds}
        />
      )}

      {/* Quiz Payment Confirmation Modal */}
      {showQuizPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
              <h2 className="text-xl font-bold">Start Quiz</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you ready to start the quiz? ${quizFee} will be deducted from your balance.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowQuizPayment(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowQuizPayment(false);
                    startQuiz();
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Start Quiz (${quizFee})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UserDashboard;