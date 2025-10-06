import { Trophy, Star, Crown, Flame, Zap, Lock, Play, Brain, Timer } from 'lucide-react';
import { Achievement, UserAchievement, getAchievements } from '../../services/gamificationService';

interface AchievementGridProps {
  userAchievements: UserAchievement[];
}

const iconMap: { [key: string]: any } = {
  Trophy,
  Star,
  Crown,
  Flame,
  Zap,
  Play,
  Brain,
  Timer
};

const rarityColors = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-400 to-blue-500',
  epic: 'from-purple-400 to-purple-500',
  legendary: 'from-yellow-400 to-orange-500'
};

const AchievementGrid = ({ userAchievements }: AchievementGridProps) => {
  const allAchievements = getAchievements();
  const unlockedIds = userAchievements.map(ua => ua.achievementId);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {allAchievements.map((achievement) => {
        const isUnlocked = unlockedIds.includes(achievement.id);
        const IconComponent = iconMap[achievement.icon] || Trophy;
        
        return (
          <div
            key={achievement.id}
            className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
              isUnlocked
                ? `bg-gradient-to-br ${rarityColors[achievement.rarity]} border-transparent text-white shadow-lg transform hover:scale-105`
                : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
            }`}
          >
            <div className="text-center">
              <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                isUnlocked ? 'bg-white/20' : 'bg-gray-300 dark:bg-gray-700'
              }`}>
                {isUnlocked ? (
                  <IconComponent size={24} />
                ) : (
                  <Lock size={24} />
                )}
              </div>
              
              <h3 className={`font-bold text-sm mb-1 ${
                isUnlocked ? 'text-white' : 'text-gray-600 dark:text-gray-400'
              }`}>
                {achievement.title}
              </h3>
              
              <p className={`text-xs mb-2 ${
                isUnlocked ? 'text-white/80' : 'text-gray-500 dark:text-gray-500'
              }`}>
                {achievement.description}
              </p>
              
              <div className="flex items-center justify-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isUnlocked
                    ? 'bg-white/20 text-white'
                    : achievement.rarity === 'common' ? 'bg-gray-200 text-gray-600' :
                      achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-600' :
                      achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-600' :
                      'bg-yellow-100 text-yellow-600'
                }`}>
                  {achievement.rarity}
                </span>
                
                {isUnlocked && (
                  <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                    +{achievement.points} XP
                  </span>
                )}
              </div>
            </div>
            
            {isUnlocked && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Trophy size={12} className="text-white" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AchievementGrid;