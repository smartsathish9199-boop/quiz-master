import { useState, useEffect } from 'react';
import { 
  Download, 
  Filter, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight,
  CreditCard,
  DollarSign,
  Brain
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getTransactions, Transaction } from '../../services/transactionService';
import { getUsers } from '../../services/userService';

type TransactionType = 'all' | 'add_funds' | 'quiz_fee' | 'quiz_win';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  
  // Filters
  const [filterType, setFilterType] = useState<TransactionType>('all');
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: '',
    to: ''
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(10);
  
  // Revenue stats
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [revenueByType, setRevenueByType] = useState({
    add_funds: 0,
    quiz_fee: 0,
    quiz_win: 0
  });
  
  // Load transactions on component mount
  useEffect(() => {
    const allTransactions = getTransactions();
    setTransactions(allTransactions);
    setFilteredTransactions(allTransactions);
    
    // Calculate revenue stats
    calculateRevenueStats(allTransactions);
  }, []);
  
  // Apply filters when filter values change
  useEffect(() => {
    applyFilters();
  }, [filterType, dateRange, transactions]);
  
  const applyFilters = () => {
    let filtered = [...transactions];
    
    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    }
    
    // Filter by date range
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from);
      filtered = filtered.filter(transaction => new Date(transaction.timestamp) >= fromDate);
    }
    
    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      // Set time to end of day
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(transaction => new Date(transaction.timestamp) <= toDate);
    }
    
    setFilteredTransactions(filtered);
    setCurrentPage(1);
  };
  
  const calculateRevenueStats = (transactionList: Transaction[]) => {
    let total = 0;
    let addFunds = 0;
    let quizFee = 0;
    let quizWin = 0;
    
    transactionList.forEach(transaction => {
      switch (transaction.type) {
        case 'add_funds':
          addFunds += transaction.amount;
          total += transaction.amount;
          break;
        case 'quiz_fee':
          quizFee += Math.abs(transaction.amount);
          total += Math.abs(transaction.amount);
          break;
        case 'quiz_win':
          quizWin += Math.abs(transaction.amount);
          total -= Math.abs(transaction.amount);
          break;
      }
    });
    
    setTotalRevenue(total);
    setRevenueByType({
      add_funds: addFunds,
      quiz_fee: quizFee,
      quiz_win: quizWin
    });
  };
  
  // Pagination logic
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  
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
  
  // Get user by ID
  const getUserById = (userId: string) => {
    const users = getUsers();
    const user = users.find(user => user.id === userId);
    return user ? user.username : userId;
  };
  
  // Transaction type icon
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'add_funds':
        return <CreditCard size={20} className="text-green-500" />;
      case 'quiz_fee':
        return <Brain size={20} className="text-red-500" />;
      case 'quiz_win':
        return <DollarSign size={20} className="text-blue-500" />;
      default:
        return null;
    }
  };
  
  // Export transactions as CSV
  const exportTransactionsCSV = () => {
    // Create CSV headers
    const headers = ['ID', 'User', 'Amount', 'Type', 'Date'];
    
    // Create CSV rows
    const rows = filteredTransactions.map(transaction => [
      transaction.id,
      getUserById(transaction.userId),
      transaction.amount.toFixed(2),
      transaction.type.replace('_', ' '),
      new Date(transaction.timestamp).toISOString()
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create a blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
            <p className="text-gray-600">View and analyze all financial transactions</p>
          </div>
          
          <button
            onClick={exportTransactionsCSV}
            className="mt-4 md:mt-0 flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={18} />
            <span>Export CSV</span>
          </button>
        </div>
        
        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase">Total Revenue</p>
                <h3 className="text-2xl font-bold text-gray-800">${totalRevenue.toFixed(2)}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <CreditCard size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase">Deposits</p>
                <h3 className="text-2xl font-bold text-gray-800">${revenueByType.add_funds.toFixed(2)}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Brain size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase">Quiz Fees</p>
                <h3 className="text-2xl font-bold text-gray-800">${revenueByType.quiz_fee.toFixed(2)}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase">Payouts</p>
                <h3 className="text-2xl font-bold text-gray-800">${revenueByType.quiz_win.toFixed(2)}</h3>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Filter size={18} className="mr-2 text-gray-500" />
            Filters
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as TransactionType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Transactions</option>
                <option value="add_funds">Deposits</option>
                <option value="quiz_fee">Quiz Fees</option>
                <option value="quiz_win">Payouts</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        
        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentTransactions.length > 0 ? (
                  currentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-800">#{transaction.id.slice(0, 8)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{getUserById(transaction.userId)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getTransactionIcon(transaction.type)}
                          <span className="ml-2 text-sm capitalize">
                            {transaction.type.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{formatDate(transaction.timestamp)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className={`text-sm font-medium ${
                          transaction.type === 'quiz_win'
                            ? 'text-red-600'
                            : transaction.type === 'add_funds'
                              ? 'text-green-600'
                              : 'text-blue-600'
                        }`}>
                          {transaction.type === 'quiz_win' ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <TrendingUp size={32} className="text-gray-300 mb-3" />
                        <p className="text-gray-500">No transactions found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {filteredTransactions.length > transactionsPerPage && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {indexOfFirstTransaction + 1} to {Math.min(indexOfLastTransaction, filteredTransactions.length)} of {filteredTransactions.length} transactions
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>
                
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminTransactions;