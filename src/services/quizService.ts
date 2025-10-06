import { v4 as uuidv4 } from 'uuid';

// Question interface
export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

// Quiz interface
export interface Quiz {
  id: string;
  userId: string;
  score: number;
  datePlayed: string;
  questions: string[]; // Array of question IDs
  answers: number[]; // Array of selected options
}

// Initialize questions in localStorage if not exists
export const initializeQuestions = (): void => {
  const questions = localStorage.getItem('quizQuestions');
  
  if (!questions) {
    const sampleQuestions: Question[] = [
      {
        id: uuidv4(),
        text: 'What is the capital of France?',
        options: ['London', 'Berlin', 'Paris', 'Madrid'],
        correctOption: 2,
        category: 'Geography',
        difficulty: 'easy'
      },
      {
        id: uuidv4(),
        text: 'Who painted the Mona Lisa?',
        options: ['Vincent van Gogh', 'Leonardo da Vinci', 'Pablo Picasso', 'Michelangelo'],
        correctOption: 1,
        category: 'Art',
        difficulty: 'easy'
      },
      {
        id: uuidv4(),
        text: 'What is the chemical symbol for gold?',
        options: ['Go', 'Gd', 'Au', 'Ag'],
        correctOption: 2,
        category: 'Science',
        difficulty: 'easy'
      },
      {
        id: uuidv4(),
        text: 'Which planet is known as the Red Planet?',
        options: ['Venus', 'Mars', 'Jupiter', 'Mercury'],
        correctOption: 1,
        category: 'Astronomy',
        difficulty: 'easy'
      },
      {
        id: uuidv4(),
        text: 'What is the largest ocean on Earth?',
        options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
        correctOption: 3,
        category: 'Geography',
        difficulty: 'medium'
      }
    ];
    
    localStorage.setItem('quizQuestions', JSON.stringify(sampleQuestions));
  }
  
  // Initialize quizzes if not exists
  const quizzes = localStorage.getItem('quizResults');
  if (!quizzes) {
    localStorage.setItem('quizResults', JSON.stringify([]));
  }
};

// Get all questions
export const getQuestions = (): Question[] => {
  const questions = localStorage.getItem('quizQuestions');
  return questions ? JSON.parse(questions) : [];
};

// Get random questions for a quiz
export const getRandomQuestions = (count: number = 5): Question[] => {
  const allQuestions = getQuestions();
  const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Add new question
export const addQuestion = (questionData: Omit<Question, 'id'>): Question => {
  const questions = getQuestions();
  
  const newQuestion: Question = {
    id: uuidv4(),
    ...questionData
  };
  
  questions.push(newQuestion);
  localStorage.setItem('quizQuestions', JSON.stringify(questions));
  
  return newQuestion;
};

// Update question
export const updateQuestion = (questionId: string, questionData: Partial<Question>): Question | null => {
  const questions = getQuestions();
  const questionIndex = questions.findIndex((q) => q.id === questionId);
  
  if (questionIndex === -1) {
    return null;
  }
  
  questions[questionIndex] = {
    ...questions[questionIndex],
    ...questionData
  };
  
  localStorage.setItem('quizQuestions', JSON.stringify(questions));
  
  return questions[questionIndex];
};

// Delete question
export const deleteQuestion = (questionId: string): boolean => {
  const questions = getQuestions();
  const updatedQuestions = questions.filter((q) => q.id !== questionId);
  
  if (updatedQuestions.length === questions.length) {
    return false;
  }
  
  localStorage.setItem('quizQuestions', JSON.stringify(updatedQuestions));
  return true;
};

// Save quiz result
export const saveQuizResult = (userId: string, quizData: {
  questions: string[],
  answers: number[],
  score: number
}): Quiz => {
  const quizzes = getQuizResults();
  
  const newQuiz: Quiz = {
    id: uuidv4(),
    userId,
    score: quizData.score,
    datePlayed: new Date().toISOString(),
    questions: quizData.questions,
    answers: quizData.answers
  };
  
  quizzes.push(newQuiz);
  localStorage.setItem('quizResults', JSON.stringify(quizzes));
  
  return newQuiz;
};

// Get quiz results
export const getQuizResults = (): Quiz[] => {
  const quizzes = localStorage.getItem('quizResults');
  return quizzes ? JSON.parse(quizzes) : [];
};

// Get user's quiz results
export const getUserQuizzes = (userId: string): Quiz[] => {
  const quizzes = getQuizResults();
  return quizzes.filter((quiz) => quiz.userId === userId);
};

// Calculate quiz statistics
export const getQuizStatistics = () => {
  const quizzes = getQuizResults();
  
  const totalQuizzes = quizzes.length;
  const averageScore = totalQuizzes > 0
    ? quizzes.reduce((sum, quiz) => sum + quiz.score, 0) / totalQuizzes
    : 0;
  
  const userCounts: Record<string, number> = {};
  quizzes.forEach(quiz => {
    userCounts[quiz.userId] = (userCounts[quiz.userId] || 0) + 1;
  });
  
  const mostActiveUserId = Object.entries(userCounts)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0])[0] || null;
  
  return {
    totalQuizzes,
    averageScore,
    mostActiveUserId
  };
};

// Initialize questions on first load
initializeQuestions();