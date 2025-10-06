import { useEffect, useState } from 'react';
import { Star, TrendingUp } from 'lucide-react';
import { UserLevel } from '../../services/gamificationService';

interface LevelProgressProps {
  userLevel: UserLevel;
  showAnimation?: boolean;
}

const LevelProgress = ({ userLevel, showAnimation = false }: LevelProgressProps) => {
  const [animatedExp, setAnimatedExp] = useState(0);
  const progressPercentage = (userLevel.experience / userLevel.experienceToNext) * 100;

  useEffect(() => {
    if (showAnimation) {
      const timer = setTimeout(() => {
        setAnimatedExp(userLevel.experience);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedExp(userLevel.experience);
    }
  }, [userLevel.experience, showAnimation]);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Star size={16} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-white">Level {userLevel.level}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {animatedExp} / {userLevel.experienceToNext} XP
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center text-green-600 dark:text-green-400">
            <TrendingUp size={16} className="mr-1" />
            <span className="text-sm font-medium">{userLevel.totalExperience} Total XP</span>
          </div>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      <div className="mt-2 text-center">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {userLevel.experienceToNext - userLevel.experience} XP to next level
        </span>
      </div>
    </div>
  );
};

export default LevelProgress;