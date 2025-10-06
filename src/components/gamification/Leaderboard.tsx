import { Trophy, Medal, Award, Star, TrendingUp } from 'lucide-react';
import { getLeaderboard } from '../../services/gamificationService';

const Leaderboard = () => {
  const leaderboard = getLeaderboard();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="text-yellow-500" size={24} />;
      case 2:
        return <Medal className="text-gray-400" size={24} />;
      case 3:
        return <Award className="text-orange-500" size={24} />;
      default:
        return <Star className="text-blue-500" size={20} />;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300';
      case 2:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300';
      case 3:
        return 'bg-gradient-to-r from-orange-100 to-orange-200 border-orange-300';
      default:
        return 'bg-white border-gray-200';
    }
  };

  return (
    <div className="space-y-3">
      {leaderboard.map((player, index) => (
        <div
          key={player.userId}
          className={`p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${getRankBg(index + 1)}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getRankIcon(index + 1)}
                <span className="font-bold text-lg text-gray-800">#{index + 1}</span>
              </div>
              
              <div>
                <h3 className="font-bold text-gray-800">{player.username}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Level {player.level}</span>
                  <span>{player.totalQuizzes} quizzes</span>
                  <span>{player.averageScore.toFixed(1)}% avg</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center text-blue-600">
                <TrendingUp size={16} className="mr-1" />
                <span className="font-bold">{player.totalExperience} XP</span>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {leaderboard.length === 0 && (
        <div className="text-center py-8">
          <Trophy size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No players on the leaderboard yet.</p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;