import { v4 as uuidv4 } from 'uuid';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'quiz_count' | 'score' | 'streak' | 'special';
  requirement: number;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
  notified: boolean;
}

export interface UserLevel {
  userId: string;
  level: number;
  experience: number;
  experienceToNext: number;
  totalExperience: number;
}

export interface UserStats {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastQuizDate: string;
  totalQuizzes: number;
  perfectScores: number;
  averageScore: number;
  favoriteCategory: string;
  fastestCompletion: number; // in seconds
}

// Predefined achievements
const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_quiz',
    title: 'Getting Started',
    description: 'Complete your first quiz',
    icon: 'Play',
    type: 'quiz_count',
    requirement: 1,
    points: 10,
    rarity: 'common'
  },
  {
    id: 'quiz_master',
    title: 'Quiz Master',
    description: 'Complete 10 quizzes',
    icon: 'Brain',
    type: 'quiz_count',
    requirement: 10,
    points: 50,
    rarity: 'rare'
  },
  {
    id: 'perfect_score',
    title: 'Perfectionist',
    description: 'Get a perfect score (100%)',
    icon: 'Star',
    type: 'score',
    requirement: 100,
    points: 25,
    rarity: 'rare'
  },
  {
    id: 'streak_3',
    title: 'On Fire',
    description: 'Maintain a 3-day quiz streak',
    icon: 'Flame',
    type: 'streak',
    requirement: 3,
    points: 30,
    rarity: 'rare'
  },
  {
    id: 'streak_7',
    title: 'Unstoppable',
    description: 'Maintain a 7-day quiz streak',
    icon: 'Zap',
    type: 'streak',
    requirement: 7,
    points: 75,
    rarity: 'epic'
  },
  {
    id: 'high_scorer',
    title: 'High Scorer',
    description: 'Score 90% or higher',
    icon: 'Trophy',
    type: 'score',
    requirement: 90,
    points: 20,
    rarity: 'common'
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete a quiz in under 2 minutes',
    icon: 'Timer',
    type: 'special',
    requirement: 120,
    points: 40,
    rarity: 'epic'
  },
  {
    id: 'legend',
    title: 'Quiz Legend',
    description: 'Complete 50 quizzes',
    icon: 'Crown',
    type: 'quiz_count',
    requirement: 50,
    points: 200,
    rarity: 'legendary'
  }
];

// Initialize gamification data
const initializeGamification = (): void => {
  if (!localStorage.getItem('userAchievements')) {
    localStorage.setItem('userAchievements', JSON.stringify([]));
  }
  if (!localStorage.getItem('userLevels')) {
    localStorage.setItem('userLevels', JSON.stringify([]));
  }
  if (!localStorage.getItem('userStats')) {
    localStorage.setItem('userStats', JSON.stringify([]));
  }
};

// Get all achievements
export const getAchievements = (): Achievement[] => {
  return ACHIEVEMENTS;
};

// Get user achievements
export const getUserAchievements = (userId: string): UserAchievement[] => {
  const achievements = localStorage.getItem('userAchievements');
  const allAchievements = achievements ? JSON.parse(achievements) : [];
  return allAchievements.filter((a: UserAchievement) => a.userId === userId);
};

// Unlock achievement
export const unlockAchievement = (userId: string, achievementId: string): UserAchievement | null => {
  const userAchievements = getUserAchievements(userId);
  
  // Check if already unlocked
  if (userAchievements.some(a => a.achievementId === achievementId)) {
    return null;
  }
  
  const newAchievement: UserAchievement = {
    id: uuidv4(),
    userId,
    achievementId,
    unlockedAt: new Date().toISOString(),
    notified: false
  };
  
  const allAchievements = JSON.parse(localStorage.getItem('userAchievements') || '[]');
  allAchievements.push(newAchievement);
  localStorage.setItem('userAchievements', JSON.stringify(allAchievements));
  
  // Add experience points
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (achievement) {
    addExperience(userId, achievement.points);
  }
  
  return newAchievement;
};

// Get user level
export const getUserLevel = (userId: string): UserLevel => {
  const levels = JSON.parse(localStorage.getItem('userLevels') || '[]');
  let userLevel = levels.find((l: UserLevel) => l.userId === userId);
  
  if (!userLevel) {
    userLevel = {
      userId,
      level: 1,
      experience: 0,
      experienceToNext: 100,
      totalExperience: 0
    };
    levels.push(userLevel);
    localStorage.setItem('userLevels', JSON.stringify(levels));
  }
  
  return userLevel;
};

// Add experience points
export const addExperience = (userId: string, points: number): UserLevel => {
  const levels = JSON.parse(localStorage.getItem('userLevels') || '[]');
  const userLevelIndex = levels.findIndex((l: UserLevel) => l.userId === userId);
  
  let userLevel = userLevelIndex >= 0 ? levels[userLevelIndex] : {
    userId,
    level: 1,
    experience: 0,
    experienceToNext: 100,
    totalExperience: 0
  };
  
  userLevel.experience += points;
  userLevel.totalExperience += points;
  
  // Check for level up
  while (userLevel.experience >= userLevel.experienceToNext) {
    userLevel.experience -= userLevel.experienceToNext;
    userLevel.level++;
    userLevel.experienceToNext = Math.floor(100 * Math.pow(1.5, userLevel.level - 1));
  }
  
  if (userLevelIndex >= 0) {
    levels[userLevelIndex] = userLevel;
  } else {
    levels.push(userLevel);
  }
  
  localStorage.setItem('userLevels', JSON.stringify(levels));
  return userLevel;
};

// Get user stats
export const getUserStats = (userId: string): UserStats => {
  const stats = JSON.parse(localStorage.getItem('userStats') || '[]');
  let userStats = stats.find((s: UserStats) => s.userId === userId);
  
  if (!userStats) {
    userStats = {
      userId,
      currentStreak: 0,
      longestStreak: 0,
      lastQuizDate: '',
      totalQuizzes: 0,
      perfectScores: 0,
      averageScore: 0,
      favoriteCategory: '',
      fastestCompletion: 0
    };
    stats.push(userStats);
    localStorage.setItem('userStats', JSON.stringify(stats));
  }
  
  return userStats;
};

// Update user stats after quiz
export const updateUserStats = (userId: string, quizData: {
  score: number;
  category?: string;
  completionTime: number;
}): UserStats => {
  const stats = JSON.parse(localStorage.getItem('userStats') || '[]');
  const userStatsIndex = stats.findIndex((s: UserStats) => s.userId === userId);
  
  let userStats = userStatsIndex >= 0 ? stats[userStatsIndex] : {
    userId,
    currentStreak: 0,
    longestStreak: 0,
    lastQuizDate: '',
    totalQuizzes: 0,
    perfectScores: 0,
    averageScore: 0,
    favoriteCategory: '',
    fastestCompletion: 0
  };
  
  const today = new Date().toDateString();
  const lastQuizDay = userStats.lastQuizDate ? new Date(userStats.lastQuizDate).toDateString() : '';
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
  
  // Update streak
  if (lastQuizDay === today) {
    // Same day, don't change streak
  } else if (lastQuizDay === yesterday) {
    // Consecutive day
    userStats.currentStreak++;
  } else if (lastQuizDay === '') {
    // First quiz
    userStats.currentStreak = 1;
  } else {
    // Streak broken
    userStats.currentStreak = 1;
  }
  
  userStats.longestStreak = Math.max(userStats.longestStreak, userStats.currentStreak);
  userStats.lastQuizDate = new Date().toISOString();
  userStats.totalQuizzes++;
  
  if (quizData.score === 100) {
    userStats.perfectScores++;
  }
  
  // Update average score
  userStats.averageScore = ((userStats.averageScore * (userStats.totalQuizzes - 1)) + quizData.score) / userStats.totalQuizzes;
  
  // Update fastest completion
  if (userStats.fastestCompletion === 0 || quizData.completionTime < userStats.fastestCompletion) {
    userStats.fastestCompletion = quizData.completionTime;
  }
  
  if (userStatsIndex >= 0) {
    stats[userStatsIndex] = userStats;
  } else {
    stats.push(userStats);
  }
  
  localStorage.setItem('userStats', JSON.stringify(stats));
  return userStats;
};

// Check for new achievements
export const checkAchievements = (userId: string): UserAchievement[] => {
  const userStats = getUserStats(userId);
  const userAchievements = getUserAchievements(userId);
  const unlockedIds = userAchievements.map(a => a.achievementId);
  const newAchievements: UserAchievement[] = [];
  
  ACHIEVEMENTS.forEach(achievement => {
    if (unlockedIds.includes(achievement.id)) return;
    
    let shouldUnlock = false;
    
    switch (achievement.type) {
      case 'quiz_count':
        shouldUnlock = userStats.totalQuizzes >= achievement.requirement;
        break;
      case 'streak':
        shouldUnlock = userStats.currentStreak >= achievement.requirement;
        break;
      case 'score':
        // This should be checked per quiz, not here
        break;
      case 'special':
        if (achievement.id === 'speed_demon') {
          shouldUnlock = userStats.fastestCompletion > 0 && userStats.fastestCompletion <= achievement.requirement;
        }
        break;
    }
    
    if (shouldUnlock) {
      const newAchievement = unlockAchievement(userId, achievement.id);
      if (newAchievement) {
        newAchievements.push(newAchievement);
      }
    }
  });
  
  return newAchievements;
};

// Get leaderboard
export const getLeaderboard = (): Array<{
  userId: string;
  username: string;
  level: number;
  totalExperience: number;
  averageScore: number;
  totalQuizzes: number;
}> => {
  const levels = JSON.parse(localStorage.getItem('userLevels') || '[]');
  const stats = JSON.parse(localStorage.getItem('userStats') || '[]');
  const users = JSON.parse(localStorage.getItem('quizUsers') || '[]');
  
  return levels
    .map((level: UserLevel) => {
      const userStats = stats.find((s: UserStats) => s.userId === level.userId);
      const user = users.find((u: any) => u.id === level.userId);
      
      return {
        userId: level.userId,
        username: user?.username || 'Unknown',
        level: level.level,
        totalExperience: level.totalExperience,
        averageScore: userStats?.averageScore || 0,
        totalQuizzes: userStats?.totalQuizzes || 0
      };
    })
    .sort((a, b) => b.totalExperience - a.totalExperience)
    .slice(0, 10);
};

// Initialize on load
initializeGamification();