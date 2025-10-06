import { Link } from 'react-router-dom';
import { Brain, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu Button */}
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu size={24} />
            </button>
          )}
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 mx-auto md:mx-0">
            <Brain className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-lg sm:text-xl text-gray-800 dark:text-white">QuizMaster</span>
          </Link>
          
          {/* Spacer for mobile */}
          {onMenuClick && <div className="w-10 md:hidden" />}
        </div>
      </div>
    </header>
  );
};

export default Header;