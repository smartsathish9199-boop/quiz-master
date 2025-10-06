import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  FileQuestion, 
  Wallet, 
  Settings, 
  LogOut, 
  User,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Upload,
  Award
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import Header from './Header';
import Footer from './Footer';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, isAdmin, logout, updateProfileImage } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  const userNavItems = [
    { path: '/user', label: 'Dashboard', icon: <Home size={20} /> },
    { path: '/competitions', label: 'Competitions', icon: <Trophy size={20} /> },
    { path: '/achievements', label: 'Achievements', icon: <Award size={20} /> },
    { path: '/result', label: 'Results', icon: <Trophy size={20} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];
  
  const adminNavItems = [
    { path: '/admin', label: 'Dashboard', icon: <Home size={20} /> },
    { path: '/admin/users', label: 'Users', icon: <Users size={20} /> },
    { path: '/admin/questions', label: 'Questions', icon: <FileQuestion size={20} /> },
    { path: '/admin/competitions', label: 'Competitions', icon: <Trophy size={20} /> },
    { path: '/admin/transactions', label: 'Transactions', icon: <Wallet size={20} /> },
  ];
  
  const navItems = isAdmin ? adminNavItems : userNavItems;

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateProfileImage(base64String);
        setIsUploadModalOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header onMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
      
      <div className="flex-grow flex flex-col md:flex-row">
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={closeMobileSidebar}
          />
        )}

        {/* Sidebar */}
        <aside className={`${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:relative z-50 md:z-auto ${
          isSidebarCollapsed ? 'w-16' : 'w-full md:w-64'
        } bg-white dark:bg-gray-800 shadow-md h-full md:h-[calc(100vh-64px)] md:sticky md:top-16 transition-all duration-300`}>
          <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>
            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-2'}`}>
              <div 
                className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 cursor-pointer overflow-hidden"
                onClick={() => setIsUploadModalOpen(true)}
              >
                {user?.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={20} className="text-blue-600 dark:text-blue-400" />
                )}
              </div>
              {!isSidebarCollapsed && (
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">{user?.username}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{isAdmin ? 'Administrator' : 'User'}</p>
                </div>
              )}
            </div>
          </div>
          
          <nav className="p-4 overflow-y-auto">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={closeMobileSidebar}
                    className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    {item.icon}
                    {!isSidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              ))}
              
              <li>
                <button
                  onClick={handleLogout}
                  className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors w-full text-left`}
                  title={isSidebarCollapsed ? 'Logout' : undefined}
                >
                  <LogOut size={20} />
                  {!isSidebarCollapsed && <span>Logout</span>}
                </button>
              </li>
            </ul>
          </nav>

          {/* Toggle Button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex absolute -right-3 top-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1.5 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {isSidebarCollapsed ? (
              <ChevronRight size={16} className="text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronLeft size={16} className="text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </aside>
        
        {/* Main Content */}
        <main className="flex-grow dark:bg-gray-900 min-h-0">
          {children}
        </main>
      </div>
      
      <Footer />

      {/* Profile Image Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Upload Profile Image</h3>
            <div className="mb-4">
              <label className="block w-full cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                  <Upload size={32} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-300">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">PNG, JPG up to 5MB</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;