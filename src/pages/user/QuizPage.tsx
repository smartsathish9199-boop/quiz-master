import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Brain, 
  ArrowRight, 
  Zap, 
  Star, 
  Trophy, 
  Target,
  Flame,
  Shield,
  Heart,
  Sparkles,
  Crown
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  getRandomQuestions, 
  saveQuizResult, 
  Question 
} from '../../services/quizService';
import { 
  getQuizPrize, 
  getHighScoreThreshold,
  getQuizFee,
  addUserTransaction 
} from '../../services/transactionService';
import {
  updateUserStats,
  checkAchievements,
  addExperience,
  unlockAchievement
} from '../../services/gamificationService';

const QUIZ_TIME_LIMIT = 30; // 30 seconds per question
const QUESTION_COUNT = 5;

interface PowerUp {
  id: string;
  name: string;
  icon: any;
  description: string;
  used: boolean;
}

const QuizPage = () => {
  const { user, updateBalance } = useUser();
  const navigate = useNavigate();
  const quizFee = getQuizFee();
  const [startTime] = useState(Date.now());

  useEffect(() => {
    // Check if user has sufficient balance
    if (user && user.balance < quizFee) {
      toast.error(`Insufficient balance. You need $${quizFee} to play.`);
      navigate('/user');
    }
  }, [user, quizFee, navigate]);

  // If no user or insufficient balance, redirect to dashboard
  if (!user || user.balance < quizFee) {
    return null;
  }
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME_LIMIT);
  const [isLoading, setIsLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [questionResult, setQuestionResult] = useState<'correct' | 'incorrect' | null>(null);
  const [experienceGained, setExperienceGained] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  
  // Load questions on component mount
  useEffect(() => {
    const loadQuestions = () => {
      setIsLoading(true);
      const randomQuestions = getRandomQuestions(QUESTION_COUNT);
      setQuestions(randomQuestions);
      setIsLoading(false);
    };
    
    loadQuestions();
  }, []);
  
  // Timer effect
  useEffect(() => {
    if (isLoading || quizCompleted) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-submit when time runs out
          if (selectedOption === null) {
            handleNextQuestion(-1); // -1 indicates no answer
          } else {
            handleNextQuestion(selectedOption);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [isLoading, quizCompleted, currentQuestionIndex, selectedOption]);
  
  // Reset timer when moving to next question
  useEffect(() => {
    if (!isLoading && !quizCompleted) {
      setTimeLeft(QUIZ_TIME_LIMIT);
      setSelectedOption(null);
      setShowCorrectAnswer(false);
      setQuestionResult(null);
    }
  }, [currentQuestionIndex, isLoading, quizCompleted]);

  const handleNextQuestion = (selectedOptionIndex: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedOptionIndex === currentQuestion.correctOption;
    
    // Show result animation
    setQuestionResult(isCorrect ? 'correct' : 'incorrect');
    setShowCorrectAnswer(true);
    
    // Update score and streak
    if (isCorrect) {
      const basePoints = 20;
      const timeBonus = Math.floor(timeLeft / 3); // Bonus for speed
      const streakBonus = streak * 5; // Bonus for streak
      const comboBonus = comboMultiplier * 10;
      let totalPoints = basePoints + timeBonus + streakBonus + comboBonus;
      
      setScore(prev => prev + totalPoints);
      setStreak(prev => prev + 1);
      setComboMultiplier(prev => Math.min(prev + 0.5, 3));
      setExperienceGained(prev => prev + totalPoints);
      
      // Show points animation
      toast.success(`+${totalPoints} points! 🎉`);
    } else {
      setStreak(0);
      setComboMultiplier(1);
    }
    
    // Save the answer
    const newAnswers = [...answers, selectedOptionIndex];
    setAnswers(newAnswers);
    
    // Move to next question after showing result
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Quiz completed, calculate final score
        finishQuiz(newAnswers);
      }
    }, 2000);
  };
  
  const finishQuiz = async (finalAnswers: number[]) => {
    if (!user) return;
    
    setQuizCompleted(true);
    
    // Calculate completion time
    const completionTime = Math.floor((Date.now() - startTime) / 1000);
    
    // Calculate score (percentage)
    const correctAnswers = finalAnswers.filter((answer, index) => 
      answer === questions[index].correctOption
    ).length;
    
    const scorePercentage = Math.round((correctAnswers / questions.length) * 100);
    
    // Save quiz result
    saveQuizResult(user.id, {
      questions: questions.map(q => q.id),
      answers: finalAnswers,
      score: scorePercentage
    });
    
    // Update user stats and check achievements
    updateUserStats(user.id, {
      score: scorePercentage,
      category: questions[0]?.category,
      completionTime
    });
    
    // Add base experience for completing quiz
    let totalExperienceGained = experienceGained + 50; // Base completion bonus
    
    // Bonus experience for high scores
    if (scorePercentage >= 90) {
      totalExperienceGained += 100;
    } else if (scorePercentage >= 70) {
      totalExperienceGained += 50;
    }
    
    addExperience(user.id, totalExperienceGained);
    
    // Check for score-based achievements
    if (scorePercentage === 100) {
      unlockAchievement(user.id, 'perfect_score');
    } else if (scorePercentage >= 90) {
      unlockAchievement(user.id, 'high_scorer');
    }
    
    // Check for speed achievement
    if (completionTime <= 120) { // 2 minutes
      unlockAchievement(user.id, 'speed_demon');
    }
    
    // Check for other achievements
    checkAchievements(user.id);
    
    // Check if user gets a prize
    const highScoreThreshold = getHighScoreThreshold();
    if (scorePercentage >= highScoreThreshold) {
      const prize = getQuizPrize();
      
      try {
        // Add prize transaction first
        await addUserTransaction({
          userId: user.id,
          amount: prize,
          type: 'quiz_win',
          timestamp: new Date().toISOString()
        });
        
        // Then update user balance
        const newBalance = user.balance + prize;
        updateBalance(newBalance);
        
        toast.success(`🎉 Congratulations! You won $${prize} for your high score!`);
      } catch (error) {
        console.error('Error processing prize:', error);
        toast.error('Error processing prize. Please contact support.');
      }
    }
    
    // Navigate to results page after a short delay
    setTimeout(() => {
      navigate('/result');
    }, 3000);
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Calculate progress percentage
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <Brain className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-yellow-400" size={24} />
          </div>
          <h2 className="text-xl font-semibold text-white animate-pulse">
            Preparing your mystical quiz...
          </h2>
        </div>
      </div>
    );
  }
  
  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-bounce">
              <Crown size={64} className="text-white" />
            </div>
            <div className="absolute -top-4 -right-4 animate-ping">
              <Sparkles size={32} className="text-yellow-400" />
            </div>
            <div className="absolute -bottom-4 -left-4 animate-ping delay-300">
              <Star size={28} className="text-orange-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 animate-pulse">
            Quest Complete! 🎉
          </h2>
          <div className="bg-gradient-to-r from-purple-800/50 to-pink-800/50 rounded-xl p-6 mb-4 border border-yellow-400/30">
            <p className="text-xl text-yellow-300 mb-2">
              Final Score: <span className="font-bold text-2xl text-yellow-400">{score}</span> points
            </p>
            <p className="text-lg text-purple-200">
              Experience Gained: <span className="font-bold text-yellow-400">+{experienceGained + 50}</span> XP
            </p>
          </div>
          <p className="text-purple-200 animate-pulse">
            Calculating mystical rewards...
          </p>
        </div>
      </div>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 relative overflow-hidden">
      {/* Mystical Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-pink-500 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-500 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-60 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Single Layout Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Main Quiz Container */}
          <div className="bg-black/60 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-yellow-400/50 relative overflow-hidden">
            {/* Mystical glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-purple-400/10 animate-pulse"></div>
            
            <div className="relative z-10 p-6 md:p-8">
              {/* Header with Stats and Timer */}
              <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">
                {/* Left Stats */}
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Trophy className="text-yellow-400 animate-pulse" size={24} />
                    <div>
                      <p className="text-xs sm:text-sm text-yellow-300">Score</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-400">{score}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Flame className={`${streak > 0 ? 'text-orange-400 animate-bounce' : 'text-gray-400'}`} size={24} />
                    <div>
                      <p className="text-xs sm:text-sm text-orange-300">Streak</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-400">{streak}</p>
                    </div>
                  </div>
                </div>
                
                {/* Round Timer */}
                <div className="relative">
                  <svg className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="rgba(255, 255, 255, 0.2)"
                      strokeWidth="6"
                      fill="transparent"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke={timeLeft < 10 ? '#ef4444' : '#fbbf24'}
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - timeLeft / QUIZ_TIME_LIMIT)}`}
                      className={`transition-all duration-1000 ${timeLeft < 10 ? 'animate-pulse' : ''}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Timer text in center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <span className={`font-mono text-lg font-bold ${
                        timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-yellow-400'
                      }`}>
                        {timeLeft}
                      </span>
                      <div className="text-xs sm:text-sm text-yellow-300 opacity-75">
                        sec
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-6 sm:mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs sm:text-sm lg:text-base text-yellow-300">Question {currentQuestionIndex + 1} of {questions.length}</span>
                  <span className="text-xs sm:text-sm lg:text-base text-yellow-300">{Math.round(progressPercentage)}% Complete</span>
                </div>
                <div className="h-2 sm:h-3 bg-black/50 rounded-full overflow-hidden border border-yellow-400/30">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500 ease-out relative"
                    style={{ width: `${progressPercentage}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full"></div>
                  </div>
                </div>
              </div>
              
              {/* Question Text */}
              <div className="bg-black/40 rounded-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border-2 border-yellow-400/70 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-transparent to-yellow-400/20 animate-pulse"></div>
                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white leading-relaxed relative z-10 text-center">
                  {currentQuestion.text}
                </h3>
                
                {currentQuestion.difficulty && (
                  <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                    <div className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold border-2 ${
                      currentQuestion.difficulty === 'easy' ? 'bg-green-500/20 text-green-300 border-green-400' :
                      currentQuestion.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400' :
                      'bg-red-500/20 text-red-300 border-red-400'
                    }`}>
                      {currentQuestion.difficulty.toUpperCase()}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Options */}
              <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedOption === index;
                  const isCorrect = index === currentQuestion.correctOption;
                  const showResult = showCorrectAnswer;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => !showResult && setSelectedOption(index)}
                      disabled={showResult}
                      className={`relative p-4 sm:p-5 lg:p-6 rounded-xl border-2 transition-all duration-300 transform text-left ${
                        showResult && isCorrect
                          ? 'border-green-400 bg-green-500/20 scale-105 shadow-lg shadow-green-400/50' :
                        showResult && isSelected && !isCorrect
                          ? 'border-red-400 bg-red-500/20 scale-95 shadow-lg shadow-red-400/50' :
                        isSelected
                          ? 'border-yellow-400 bg-yellow-400/20 scale-105 shadow-lg shadow-yellow-400/50' :
                        'border-yellow-400/30 bg-black/40 hover:border-yellow-400 hover:bg-yellow-400/10 hover:scale-102'
                      }`}
                    >
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl border-2 ${
                          showResult && isCorrect
                            ? 'bg-green-500 text-white border-green-400' :
                          showResult && isSelected && !isCorrect
                            ? 'bg-red-500 text-white border-red-400' :
                          isSelected
                            ? 'bg-yellow-400 text-black border-yellow-300' :
                          'bg-black/50 text-yellow-400 border-yellow-400/50'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className={`font-medium text-sm sm:text-base lg:text-lg ${
                          showResult && isCorrect
                            ? 'text-green-300' :
                          showResult && isSelected && !isCorrect
                            ? 'text-red-300' :
                          'text-white'
                        }`}>
                          {option}
                        </span>
                      </div>
                      
                      {/* Result Icons */}
                      {showResult && isCorrect && (
                        <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                          <CheckCircle className="text-green-400 animate-bounce" size={20} />
                        </div>
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                          <XCircle className="text-red-400 animate-pulse" size={20} />
                        </div>
                      )}

                      {/* Mystical glow for selected option */}
                      {isSelected && !showResult && (
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-transparent to-yellow-400/20 animate-pulse rounded-xl"></div>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* Next Button or Result Message */}
              {!showCorrectAnswer ? (
                <div className="text-center">
                  <button
                    onClick={() => handleNextQuestion(selectedOption !== null ? selectedOption : -1)}
                    disabled={selectedOption === null}
                    className={`flex items-center space-x-2 sm:space-x-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 transform border-2 mx-auto ${
                      selectedOption !== null
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-300 hover:to-orange-400 hover:scale-105 shadow-lg shadow-yellow-400/50 border-yellow-400'
                        : 'bg-gray-800/50 text-gray-500 cursor-not-allowed border-gray-600'
                    }`}
                  >
                    <span>{currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Quest'}</span>
                    <ArrowRight size={20} />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className={`inline-flex items-center space-x-2 sm:space-x-3 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base lg:text-lg border-2 ${
                    questionResult === 'correct' 
                      ? 'bg-green-500/20 text-green-300 border-green-400' 
                      : 'bg-red-500/20 text-red-300 border-red-400'
                  }`}>
                    {questionResult === 'correct' ? (
                      <>
                        <CheckCircle size={20} />
                        <span>Excellent! +{20 + Math.floor(timeLeft / 3) + (streak * 5)} points</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={20} />
                        <span>Not quite right. The quest continues!</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;