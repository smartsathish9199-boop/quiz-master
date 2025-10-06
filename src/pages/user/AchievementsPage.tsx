import { useState, useEffect } from 'react';
import { Trophy, Star, Award, TrendingUp } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useUser } from '../../contexts/UserContext';
import {
  getUserAchievements,
  getUserLevel,
  getUserStats,
  getAchievements
} from '../../services/gamificationService';
import AchievementGrid from '../../components/gamification/AchievementGrid';
import LevelProgress from '../../components/gamification/LevelProgress';
import StreakCounter from '../../components/gamification/StreakCounter';
import Leaderboard from '../../components/gamification/Leaderboard';

const AchievementsPage = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'achievements' | 'leaderboard'>('achievements');
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [userLevel, setUserLevel] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);

  useEffect(() => {
    if (user) {
      setUserAchievements(getUserAchievements(user.id));
      setUserLevel(getUserLevel(user.id));
      setUserStats(getUserStats(user.id));
    }
  }, [user]);

  if (!user || !userLevel || !userStats) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading achievements...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const allAchievements = getAchievements();
  const unlockedCount = userAchievements.length;
  const totalCount = allAchievements.length;
  const completionPercentage = (unlockedCount / totalCount) * 100;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Achievements & Progress
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track your quiz journey and unlock amazing achievements!
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <LevelProgress userLevel={userLevel} />
          </div>
          <div>
            <StreakCounter userStats={userStats} />
          </div>
        </div>

        {/* Achievement Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Achievement Progress</h2>
            <div className="flex items-center space-x-2">
              <Trophy className="text-yellow-500" size={24} />
              <span className="text-lg font-bold text-gray-800 dark:text-white">
                {unlockedCount}/{totalCount}
              </span>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-4">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {completionPercentage.toFixed(1)}% complete • {totalCount - unlockedCount} achievements remaining
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-8">
          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'achievements'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Trophy size={20} />
              <span>Achievements</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'leaderboard'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <TrendingUp size={20} />
              <span>Leaderboard</span>
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          {activeTab === 'achievements' ? (
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                Your Achievements
              </h2>
              <AchievementGrid userAchievements={userAchievements} />
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                Global Leaderboard
              </h2>
              <Leaderboard />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AchievementsPage;