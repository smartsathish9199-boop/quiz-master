import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Brain, Clock, Trophy } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { getCompetitionById, saveParticipantScore } from '../../services/competitionService';
import { getQuestions, Question } from '../../services/quizService';
import toast from 'react-hot-toast';

const QUIZ_TIME_LIMIT = 30; // 30 seconds per question

const CompetitionQuizPage = () => {
  const { competitionId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [competition, setCompetition] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME_LIMIT);
  const [isLoading, setIsLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  useEffect(() => {
    if (!competitionId || !user) {
      navigate('/competitions');
      return;
    }
    
    const comp = getCompetitionById(competitionId);
    if (!comp) {
      toast.error('Competition not found');
      navigate('/competitions');
      return;
    }

    // Check if competition is active
    const now = new Date();
    const startTime = new Date(comp.startTime);
    const endTime = new Date(comp.endTime);

    if (now < startTime) {
      toast.error('Competition has not started yet');
      navigate('/competitions');
      return;
    }

    if (now > endTime) {
      toast.error('Competition has ended');
      navigate('/competitions');
      return;
    }
    
    setCompetition(comp);
    
    // Get competition questions
    const allQuestions = getQuestions();
    const competitionQuestions = allQuestions.filter(q => 
      comp.questions.includes(q.id)
    );
    
    setQuestions(competitionQuestions);
    setIsLoading(false);
  }, [competitionId, user, navigate]);
  
  // Timer effect
  useEffect(() => {
    if (isLoading || quizCompleted) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (selectedOption === null) {
            handleNextQuestion(-1);
          } else {
            handleNextQuestion(selectedOption);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isLoading, quizCompleted, currentQuestionIndex, selectedOption]);
  
  // Reset timer when moving to next question
  useEffect(() => {
    if (!isLoading && !quizCompleted) {
      setTimeLeft(QUIZ_TIME_LIMIT);
    }
  }, [currentQuestionIndex, isLoading, quizCompleted]);
  
  const handleNextQuestion = (selectedOptionIndex: number) => {
    const newAnswers = [...answers, selectedOptionIndex];
    setAnswers(newAnswers);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    } else {
      finishQuiz(newAnswers);
    }
  };
  
  const finishQuiz = async (finalAnswers: number[]) => {
    if (!user || !competition) return;
    
    setQuizCompleted(true);
    
    // Calculate score
    const correctAnswers = finalAnswers.filter((answer, index) => 
      answer === questions[index].correctOption
    ).length;
    
    const scorePercentage = Math.round((correctAnswers / questions.length) * 100);
    
    // Save participant score
    saveParticipantScore(user.id, scorePercentage);
    
    // Navigate to results page with competition data
    navigate('/result', {
      state: {
        competitionId: competition.id,
        score: scorePercentage,
        prizeMoney: competition.prizeMoney,
        questions,
        answers: finalAnswers
      }
    });
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mt-4">Loading competition...</h2>
        </div>
      </div>
    );
  }
  
  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-green-100 rounded-full">
            <Trophy size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Quiz Completed!</h2>
          <p className="text-gray-600 dark:text-gray-300">Redirecting to results...</p>
        </div>
      </div>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        {/* Quiz Header */}
        <div className="bg-blue-600 p-6 text-white relative">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold flex items-center">
              <Brain className="mr-2" size={24} />
              Quiz in Progress
            </h1>
            <div className="flex items-center space-x-1">
              <Clock size={20} />
              <span className={`font-mono ${timeLeft < 10 ? 'text-red-300 animate-pulse' : ''}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4 h-2 bg-blue-300 rounded-full">
            <div 
              className="h-full bg-white transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          <div className="mt-2 text-sm text-blue-100">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>
        
        {/* Question */}
        <div className="p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white mb-8">
            {currentQuestion.text}
          </h2>
          
          {/* Options */}
          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedOption(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedOption === index
                    ? 'border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/50'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-start">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
                    selectedOption === index
                      ? 'bg-blue-600 text-white dark:bg-blue-400'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-gray-800 dark:text-gray-200">{option}</span>
                </div>
              </button>
            ))}
          </div>
          
          {/* Next Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={() => handleNextQuestion(selectedOption !== null ? selectedOption : -1)}
              disabled={selectedOption === null}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedOption !== null
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionQuizPage;