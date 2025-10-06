import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Brain, Trophy, User, CreditCard, Clock, CheckCircle, Star, Users, Calendar, Award, Flame, Crown } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { getCompetitions } from '../services/competitionService';
import { getUserQuizzes } from '../services/quizService';
import { getLeaderboard } from '../services/gamificationService';

const Home = () => {
  const { isAuthenticated, isAdmin } = useUser();
  const upcomingCompetitions = getCompetitions()
    .filter(comp => new Date(comp.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 3);

  // Get top performers from leaderboard
  const topPerformers = getLeaderboard().slice(0, 5);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Trophy className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-orange-500" />;
      default:
        return <Star className="h-6 w-6 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center relative z-10">
            <div className="md:w-1/2 mb-12 md:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Level Up Your Knowledge
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                Compete, achieve, and earn rewards in our gamified quiz experience. Unlock achievements, climb the leaderboard, and become a quiz legend!
              </p>
              {isAuthenticated ? (
                <Link 
                  to={isAdmin ? "/admin" : "/user"} 
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-medium text-lg shadow-lg transition-all duration-300 inline-block transform hover:scale-105"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    to="/register" 
                    className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-medium text-lg shadow-lg transition-all duration-300 inline-block transform hover:scale-105"
                  >
                    Start Your Journey
                  </Link>
                  <Link 
                    to="/login" 
                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-medium text-lg transition-all duration-300 inline-block"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-white bg-opacity-10 rounded-full flex items-center justify-center relative animate-pulse">
                  <Brain size={120} className="text-white" />
                </div>
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                  <Trophy size={32} className="text-yellow-800" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-green-400 rounded-full flex items-center justify-center animate-pulse">
                  <Star size={24} className="text-green-800" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gamification Features */}
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
                Gamified Learning Experience
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Unlock achievements, level up, and compete with players worldwide
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
                  <Trophy size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Achievements</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Unlock rare achievements as you progress. From "First Quiz" to "Quiz Legend" - collect them all!
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                  <Star size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Level System</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Gain experience points and level up! Each quiz, achievement, and milestone brings you closer to the top.
                </p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                  <Flame size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Streak System</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Build your daily quiz streak! The longer you maintain it, the more rewards you'll earn.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Competitions */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
                Upcoming Competitions
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Join these exciting quiz competitions and win amazing prizes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {upcomingCompetitions.map((competition) => (
                <div key={competition.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <Trophy className="h-8 w-8 text-yellow-500" />
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                      Prize: ${competition.prizeMoney}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    {competition.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {competition.description}
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Calendar className="h-5 w-5 mr-2" />
                      <span>{new Date(competition.startTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Clock className="h-5 w-5 mr-2" />
                      <span>{new Date(competition.startTime).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Users className="h-5 w-5 mr-2" />
                      <span>Max Participants: {competition.maxParticipants}</span>
                    </div>
                  </div>
                  <Link
                    to={isAuthenticated ? "/competitions" : "/register"}
                    className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {isAuthenticated ? 'Join Competition' : 'Register to Join'}
                  </Link>
                </div>
              ))}
            </div>

            {upcomingCompetitions.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming competitions at the moment</p>
              </div>
            )}
          </div>
        </section>

        {/* Leaderboard Preview */}
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
                Top Quiz Masters
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                See who's leading the global leaderboard
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              {topPerformers.map((performer, index) => (
                <div 
                  key={performer.userId}
                  className={`bg-gradient-to-r p-6 mb-4 shadow-lg flex items-center justify-between transform hover:scale-102 transition-transform duration-300 rounded-xl ${
                    index === 0 ? 'from-yellow-100 to-yellow-200 border-2 border-yellow-300' :
                    index === 1 ? 'from-gray-100 to-gray-200 border-2 border-gray-300' :
                    index === 2 ? 'from-orange-100 to-orange-200 border-2 border-orange-300' :
                    'from-blue-50 to-blue-100 border border-blue-200'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="flex items-center space-x-3 mr-6">
                      {getRankIcon(index + 1)}
                      <span className="font-bold text-2xl text-gray-800">#{index + 1}</span>
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-xl text-gray-800">{performer.username}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Star className="h-4 w-4 mr-1" />
                          Level {performer.level}
                        </span>
                        <span>{performer.totalQuizzes} quizzes</span>
                        <span>{performer.averageScore.toFixed(1)}% avg</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">
                      {performer.totalExperience} XP
                    </div>
                  </div>
                </div>
              ))}

              {topPerformers.length === 0 && (
                <div className="text-center py-8">
                  <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No quiz masters yet - be the first!</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-white mb-12">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                  <User size={32} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Create Account</h3>
                <p className="text-gray-600 dark:text-gray-300">Register and set up your profile to get started with our gamified quiz platform.</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                  <CreditCard size={32} className="text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Add Funds</h3>
                <p className="text-gray-600 dark:text-gray-300">Add funds to your account wallet to play quizzes and compete in tournaments.</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                  <Clock size={32} className="text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Play & Level Up</h3>
                <p className="text-gray-600 dark:text-gray-300">Answer timed questions, gain XP, unlock achievements, and climb the leaderboard.</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mb-4">
                  <Trophy size={32} className="text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Win Rewards</h3>
                <p className="text-gray-600 dark:text-gray-300">Get high scores, maintain streaks, and earn amazing rewards and prizes.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Become a Quiz Legend?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto text-purple-100">
              Join thousands of quiz enthusiasts, unlock achievements, climb the leaderboard, and prove you're the ultimate quiz master!
            </p>
            {isAuthenticated ? (
              <Link 
                to={isAdmin ? "/admin" : "/user"} 
                className="bg-white text-purple-600 hover:bg-purple-50 px-8 py-3 rounded-lg font-medium text-lg shadow-lg transition-all duration-300 inline-block transform hover:scale-105"
              >
                Continue Your Journey
              </Link>
            ) : (
              <Link 
                to="/register" 
                className="bg-white text-purple-600 hover:bg-purple-50 px-8 py-3 rounded-lg font-medium text-lg shadow-lg transition-all duration-300 inline-block transform hover:scale-105"
              >
                Start Your Adventure
              </Link>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;