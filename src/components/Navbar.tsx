import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Menu, X, Hammer } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import LucideIcon from './LucideIcon';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="nav-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Hammer className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">ToolBox AI</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/ai-tools" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
              {t('nav.aiTools')}
            </Link>
            <Link to="/blog" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
              {t('nav.blog')}
            </Link>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5 text-slate-600" />
              ) : (
                <Sun className="h-5 w-5 text-yellow-400" />
              )}
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={toggleTheme}
              className="p-2 mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-slate-600 dark:text-slate-300"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-950 border-b dark:border-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/ai-tools"
              className="block px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
              onClick={() => setIsOpen(false)}
            >
              {t('nav.aiTools')}
            </Link>
            <Link
              to="/blog"
              className="block px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
              onClick={() => setIsOpen(false)}
            >
              {t('nav.blog')}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;