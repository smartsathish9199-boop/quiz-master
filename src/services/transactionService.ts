import { v4 as uuidv4 } from 'uuid';

// Transaction interface
export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'add_funds' | 'quiz_fee' | 'quiz_win' | 'withdrawal';
  timestamp: string;
  details?: {
    method: string;
    accountHolder?: string;
    accountNumber?: string;
    ifscCode?: string;
    panNumber?: string;
    upiId?: string;
  };
}

// Fee for taking a quiz
const QUIZ_FEE = 5;

// Prize for high scores
const HIGH_SCORE_THRESHOLD = 80; // 80%
const QUIZ_PRIZE = 10;

// Initialize transactions in localStorage if not exists
export const initializeTransactions = (): void => {
  const transactions = localStorage.getItem('quizTransactions');
  
  if (!transactions) {
    localStorage.setItem('quizTransactions', JSON.stringify([]));
  }
};

// Get all transactions
export const getTransactions = (): Transaction[] => {
  const transactions = localStorage.getItem('quizTransactions');
  return transactions ? JSON.parse(transactions) : [];
};

// Get user's transactions
export const getUserTransactions = (userId: string): Transaction[] => {
  const transactions = getTransactions();
  return transactions.filter((transaction) => transaction.userId === userId);
};

// Add new transaction
export const addUserTransaction = (transactionData: Omit<Transaction, 'id'>): Transaction => {
  const transactions = getTransactions();
  
  const newTransaction: Transaction = {
    id: uuidv4(),
    ...transactionData
  };
  
  transactions.push(newTransaction);
  localStorage.setItem('quizTransactions', JSON.stringify(transactions));
  
  return newTransaction;
};

// Calculate total revenue
export const calculateTotalRevenue = (): number => {
  const transactions = getTransactions();
  return transactions.reduce((total, transaction) => {
    if (transaction.type === 'add_funds') {
      return total + transaction.amount;
    }
    return total;
  }, 0);
};

// Get quiz fee
export const getQuizFee = (): number => {
  return QUIZ_FEE;
};

// Get quiz prize
export const getQuizPrize = (): number => {
  return QUIZ_PRIZE;
};

// Get high score threshold
export const getHighScoreThreshold = (): number => {
  return HIGH_SCORE_THRESHOLD;
};

// Initialize transactions on first load
initializeTransactions();