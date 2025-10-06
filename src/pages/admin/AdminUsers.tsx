import { useState, useEffect } from 'react';
import { 
  Search, 
  Trash2, 
  AlertCircle, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  CreditCard,
  MoreHorizontal,
  Mail,
  Shield
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getUsers, deleteUser, updateUserBalance, User } from '../../services/userService';
import { getUserQuizzes } from '../../services/quizService';
import { getUserTransactions } from '../../services/transactionService';
import SendOTPModal from '../../components/admin/SendOTPModal';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'view' | 'delete' | 'addFunds' | 'sendOTP'>('view');
  const [addFundsAmount, setAddFundsAmount] = useState<number>(10);
  const [showOTPModal, setShowOTPModal] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  
  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);
  
  // Apply search filter when search term changes
  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
    setCurrentPage(1);
  }, [searchTerm, users]);
  
  const loadUsers = () => {
    const allUsers = getUsers();
    setUsers(allUsers);
    setFilteredUsers(allUsers);
  };
  
  const handleDeleteUser = (userId: string) => {
    // Delete user
    deleteUser(userId);
    
    // Refresh user list
    loadUsers();
    
    toast.success('User deleted successfully');
    setIsModalOpen(false);
  };
  
  const handleAddFunds = () => {
    if (!selectedUser) return;
    
    // Update user balance
    const newBalance = selectedUser.balance + addFundsAmount;
    updateUserBalance(selectedUser.id, newBalance);
    
    // Refresh user list
    loadUsers();
    
    toast.success(`$${addFundsAmount} added to ${selectedUser.username}'s account`);
    setIsModalOpen(false);
  };
  
  // Calculate pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  
  // Get user's quiz count
  const getUserQuizCount = (userId: string) => {
    const quizzes = getUserQuizzes(userId);
    return quizzes.length;
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
            <p className="text-gray-600">View and manage user accounts</p>
          </div>
          
          <div className="mt-4 md:mt-0 relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
        
        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quizzes
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-800">{user.username}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-600">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-600">${user.balance.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-600">{getUserQuizCount(user.id)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setModalAction('view');
                              setIsModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowOTPModal(true);
                            }}
                            className="text-purple-600 hover:text-purple-800"
                          >
                            Send OTP
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setModalAction('addFunds');
                              setIsModalOpen(true);
                            }}
                            className="text-green-600 hover:text-green-800"
                          >
                            Add Funds
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setModalAction('delete');
                              setIsModalOpen(true);
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <RefreshCw size={32} className="text-gray-300 mb-3" />
                        {searchTerm ? (
                          <p className="text-gray-500">No users found matching "{searchTerm}"</p>
                        ) : (
                          <p className="text-gray-500">No users found</p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {filteredUsers.length > usersPerPage && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
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
      
      {/* Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
            {/* View User Details */}
            {modalAction === 'view' && (
              <>
                <div className="bg-blue-600 px-6 py-4 text-white">
                  <h3 className="text-lg font-bold">User Details</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500">Username</p>
                      <p className="font-medium text-gray-800">{selectedUser.username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-800">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Balance</p>
                      <p className="font-medium text-gray-800">${selectedUser.balance.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Quizzes Taken</p>
                      <p className="font-medium text-gray-800">{getUserQuizCount(selectedUser.id)}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-medium text-gray-800 mb-3">Recent Transactions</h4>
                    {getUserTransactions(selectedUser.id).slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex justify-between items-center py-2">
                        <div>
                          <p className="font-medium text-gray-800 capitalize">
                            {transaction.type.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <p className={`font-medium ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </>
            )}
            
            {/* Delete User Confirmation */}
            {modalAction === 'delete' && (
              <>
                <div className="bg-red-600 px-6 py-4 text-white">
                  <h3 className="text-lg font-bold">Confirm Deletion</h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-6 text-red-600">
                    <AlertCircle size={24} className="mr-3" />
                    <p className="font-medium">Are you sure you want to delete this user?</p>
                  </div>
                  <p className="text-gray-600 mb-6">
                    This will permanently delete <strong>{selectedUser.username}</strong>'s account 
                    and all associated data. This action cannot be undone.
                  </p>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteUser(selectedUser.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete User
                    </button>
                  </div>
                </div>
              </>
            )}
            
            {/* Add Funds */}
            {modalAction === 'addFunds' && (
              <>
                <div className="bg-green-600 px-6 py-4 text-white">
                  <h3 className="text-lg font-bold">Add Funds</h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <CreditCard size={24} className="mr-3 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-800">Add funds to {selectedUser.username}'s account</p>
                      <p className="text-sm text-gray-500">Current balance: ${selectedUser.balance.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount to Add
                    </label>
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">$</span>
                      <input
                        type="number"
                        value={addFundsAmount}
                        onChange={(e) => setAddFundsAmount(Number(e.target.value))}
                        min="1"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    {[10, 20, 50, 100].map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setAddFundsAmount(amount)}
                        className={`py-2 rounded-lg transition-colors ${
                          addFundsAmount === amount
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddFunds}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Add Funds
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Send OTP Modal */}
      {showOTPModal && selectedUser && (
        <SendOTPModal
          userId={selectedUser.id}
          onClose={() => {
            setShowOTPModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminUsers;