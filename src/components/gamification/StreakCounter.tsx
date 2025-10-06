import { Flame, Calendar, Target } from 'lucide-react';
import { UserStats } from '../../services/gamificationService';

interface StreakCounterProps {
  userStats: UserStats;
}

const StreakCounter = ({ userStats }: StreakCounterProps) => {
  const getStreakColor = (streak: number) => {
    if (streak >= 7) return 'from-red-500 to-orange-500';
    if (streak >= 3) return 'from-orange-500 to-yellow-500';
    if (streak >= 1) return 'from-yellow-500 to-green-500';
    return 'from-gray-400 to-gray-500';
  };

  const getStreakMessage = (streak: number) => {
    if (streak >= 7) return "You're on fire! 🔥";
    if (streak >= 3) return "Great momentum! 💪";
    if (streak >= 1) return "Keep it up! 👍";
    return "Start your streak today! 🚀";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="text-center">
        <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r ${getStreakColor(userStats.currentStreak)} flex items-center justify-center`}>
          <Flame size={32} className="text-white" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          {userStats.currentStreak} Day Streak
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {getStreakMessage(userStats.currentStreak)}
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="text-blue-500 mr-1" size={20} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Best Streak</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white">{userStats.longestStreak}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="text-green-500 mr-1" size={20} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Last Quiz</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white">
              {userStats.lastQuizDate 
                ? new Date(userStats.lastQuizDate).toLocaleDateString()
                : 'Never'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreakCounter;