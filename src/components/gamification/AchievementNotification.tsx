import { useEffect, useState } from 'react';
import { Trophy, X, Star, Crown, Flame, Zap } from 'lucide-react';
import { Achievement, UserAchievement } from '../../services/gamificationService';

interface AchievementNotificationProps {
  achievement: Achievement;
  userAchievement: UserAchievement;
  onClose: () => void;
}

const iconMap: { [key: string]: any } = {
  Trophy,
  Star,
  Crown,
  Flame,
  Zap,
  Play: Trophy,
  Brain: Trophy,
  Timer: Zap
};

const rarityColors = {
  common: 'from-gray-500 to-gray-600',
  rare: 'from-blue-500 to-blue-600',
  epic: 'from-purple-500 to-purple-600',
  legendary: 'from-yellow-500 to-orange-500'
};

const AchievementNotification = ({ achievement, userAchievement, onClose }: AchievementNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const IconComponent = iconMap[achievement.icon] || Trophy;

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`bg-gradient-to-r ${rarityColors[achievement.rarity]} p-1 rounded-xl shadow-2xl max-w-sm`}>
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-full bg-gradient-to-r ${rarityColors[achievement.rarity]} text-white`}>
                <IconComponent size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Achievement Unlocked!</h3>
                <h4 className="font-semibold text-gray-700">{achievement.title}</h4>
                <p className="text-sm text-gray-600">{achievement.description}</p>
                <div className="flex items-center mt-2 space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    achievement.rarity === 'common' ? 'bg-gray-100 text-gray-800' :
                    achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                    achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
                  </span>
                  <span className="text-sm font-medium text-green-600">+{achievement.points} XP</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementNotification;