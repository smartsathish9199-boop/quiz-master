import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  Brain, 
  RefreshCw,
  Calendar,
  Clock,
  DollarSign
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Question, getUserQuizzes } from '../../services/quizService';
import { useUser } from '../../contexts/UserContext';
import { getQuizFee } from '../../services/transactionService';

interface ResultLocationState {
  competitionId?: string;
  score: number;
  prizeMoney?: number;
  questions: Question[];
  answers: number[];
}

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const [resultState, setResultState] = useState<ResultLocationState | null>(null);
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const quizFee = getQuizFee();
  
  useEffect(() => {
    if (location.state && 'score' in location.state) {
      setResultState(location.state as ResultLocationState);
    }
    
    // Load quiz history
    if (user) {
      const history = getUserQuizzes(user.id);
      setQuizHistory(history.sort((a, b) => 
        new Date(b.datePlayed).getTime() - new Date(a.datePlayed).getTime()
      ));
    }
  }, [location, user]);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-purple-600 bg-purple-100';
    if (score >= 70) return 'text-green-600 bg-green-100';
    if (score >= 50) return 'text-blue-600 bg-blue-100';
    if (score >= 30) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getTotalEarnings = () => {
    return quizHistory.reduce((total, quiz) => {
      if (quiz.score >= 80) {
        return total + (quiz.prizeMoney || 10);
      }
      return total;
    }, 0);
  };

  const getTotalSpent = () => {
    return quizHistory.length * quizFee;
  };

  const renderDetailedResults = (quiz: any) => {
    if (!quiz.questions || !Array.isArray(quiz.questions) || 
        !quiz.answers || !Array.isArray(quiz.answers) ||
        !quiz.correctAnswers || !Array.isArray(quiz.correctAnswers)) {
      return null;
    }

    const minLength = Math.min(
      quiz.questions.length,
      quiz.answers.length,
      quiz.correctAnswers.length
    );

    if (minLength === 0) {
      return null;
    }

    return (
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: minLength }).map((_, qIndex) => {
          const isCorrect = quiz.answers[qIndex] === quiz.correctAnswers[qIndex];
          return (
            <div 
              key={`question-${qIndex}`}
              className={`p-3 rounded-lg border ${
                isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-center">
                {isCorrect ? (
                  <CheckCircle size={16} className="text-green-500 mr-2" />
                ) : (
                  <XCircle size={16} className="text-red-500 mr-2" />
                )}
                <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                  Question {qIndex + 1}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Show latest result if available
  const renderLatestResult = () => {
    if (!resultState) return null;

    return (
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <div className="text-center mb-8">
          <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${
            getScoreColor(resultState.score)
          }`}>
            <Trophy size={48} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {resultState.score}%
          </h2>
          <p className="text-gray-600">
            {resultState.score >= 80 ? 'Excellent work!' : 
             resultState.score >= 60 ? 'Good job!' : 
             'Keep practicing!'}
          </p>
        </div>

        {resultState.competitionId && resultState.prizeMoney && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-green-800">Competition Prize</h3>
                <p className="text-green-600">
                  {resultState.score >= 80 
                    ? `Congratulations! You've won $${resultState.prizeMoney}!`
                    : 'Keep trying to win prizes in future competitions!'}
                </p>
              </div>
              <DollarSign size={24} className="text-green-500" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resultState.questions.map((question, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border ${
                resultState.answers[index] === question.correctOption
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`mt-1 ${
                  resultState.answers[index] === question.correctOption
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}>
                  {resultState.answers[index] === question.correctOption
                    ? <CheckCircle size={20} />
                    : <XCircle size={20} />
                  }
                </div>
                <div>
                  <p className="font-medium text-gray-800 mb-2">{question.text}</p>
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`p-2 rounded ${
                          optIndex === question.correctOption
                            ? 'bg-green-100 text-green-800'
                            : optIndex === resultState.answers[index]
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Latest Result */}
          {renderLatestResult()}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600">Total Quizzes</h3>
                <Brain className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{quizHistory.length}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600">Average Score</h3>
                <Trophy className="h-6 w-6 text-yellow-500" />
              </div>
              <p className="text-3xl font-bold text-gray-800">
                {quizHistory.length > 0
                  ? Math.round(
                      quizHistory.reduce((sum, quiz) => sum + quiz.score, 0) / quizHistory.length
                    )
                  : 0}%
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600">Total Spent</h3>
                <DollarSign className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-gray-800">${getTotalSpent()}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600">Total Earned</h3>
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-800">${getTotalEarnings()}</p>
            </div>
          </div>

          {/* Quiz History */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Quiz History</h2>
            </div>

            {quizHistory.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {quizHistory.map((quiz, index) => (
                  <div key={quiz.id} className="p-6 hover:bg-gray-50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          getScoreColor(quiz.score)
                        }`}>
                          {quiz.score >= 80 ? (
                            <Trophy size={24} />
                          ) : (
                            <Brain size={24} />
                          )}
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-gray-800">
                            {quiz.competitionId ? 'Competition Quiz' : 'Practice Quiz'} #{quizHistory.length - index}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <div className="flex items-center">
                              <Calendar size={16} className="mr-1" />
                              {formatDate(quiz.datePlayed)}
                            </div>
                            <div className="flex items-center">
                              <Clock size={16} className="mr-1" />
                              {quiz.questions?.length || 0} questions
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 md:mt-0 flex items-center space-x-4">
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(quiz.score)}`}>
                            {quiz.score}%
                          </div>
                          {quiz.prizeMoney && quiz.score >= 80 && (
                            <div className="text-sm text-green-600 font-medium">
                              Won ${quiz.prizeMoney}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Detailed Results */}
                    {renderDetailedResults(quiz)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Brain size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">You haven't taken any quizzes yet.</p>
                <button
                  onClick={() => navigate('/user')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Brain size={18} className="mr-2" />
                  Start Your First Quiz
                </button>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={() => navigate('/user')}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={18} />
              <span>Back to Dashboard</span>
            </button>

            {quizHistory.length > 0 && (
              <button
                onClick={() => navigate('/quiz')}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <Brain size={18} />
                <span>Take Another Quiz</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResultPage;