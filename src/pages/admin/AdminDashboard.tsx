import { useState, useEffect } from 'react';
import { Users, FileQuestion, DollarSign, Brain, Activity, TrendingUp } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getUsers } from '../../services/userService';
import { getQuestions, getQuizStatistics } from '../../services/quizService';
import { getTransactions, calculateTotalRevenue } from '../../services/transactionService';

const AdminDashboard = () => {
  const [userCount, setUserCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  
  useEffect(() => {
    // Fetch dashboard data
    const users = getUsers();
    setUserCount(users.length);
    
    const questions = getQuestions();
    setQuestionCount(questions.length);
    
    const quizStats = getQuizStatistics();
    setTotalQuizzes(quizStats.totalQuizzes);
    setAverageScore(quizStats.averageScore);
    
    const revenue = calculateTotalRevenue();
    setTotalRevenue(revenue);
    
    const transactions = getTransactions();
    setRecentTransactions(transactions.slice(0, 5));
  }, []);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome to the quiz management system.</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase">Total Users</p>
                <h3 className="text-2xl font-bold text-gray-800">{userCount}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FileQuestion size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase">Total Questions</p>
                <h3 className="text-2xl font-bold text-gray-800">{questionCount}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase">Total Revenue</p>
                <h3 className="text-2xl font-bold text-gray-800">${totalRevenue.toFixed(2)}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <Brain size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase">Total Quizzes</p>
                <h3 className="text-2xl font-bold text-gray-800">{totalQuizzes}</h3>
              </div>
            </div>
          </div>
        </div>
        
        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Average Score Chart */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Quiz Statistics</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-500">Average Score</p>
                  <h3 className="text-3xl font-bold text-gray-800">{averageScore.toFixed(1)}%</h3>
                </div>
                <div className="p-4 bg-blue-50 rounded-full">
                  <Activity size={32} className="text-blue-600" />
                </div>
              </div>
              
              <div className="h-10 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  style={{ width: `${averageScore}%` }}
                ></div>
              </div>
              
              <div className="mt-6 grid grid-cols-3 divide-x divide-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Quizzes</p>
                  <p className="text-xl font-semibold text-gray-800">{totalQuizzes}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Users</p>
                  <p className="text-xl font-semibold text-gray-800">{userCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Questions</p>
                  <p className="text-xl font-semibold text-gray-800">{questionCount}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
            </div>
            <div className="p-6">
              {recentTransactions.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="py-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800 capitalize">
                          {transaction.type.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-gray-500">{formatDate(transaction.timestamp)}</p>
                      </div>
                      <div className={`text-lg font-bold ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No transactions yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;