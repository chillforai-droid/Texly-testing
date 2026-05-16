import React from 'react';
import { Link } from 'react-router-dom';
import { Sun } from 'lucide-react'; // Keep only sun icon for illustration

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600">Toolbox</span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Home</Link>
              <Link to="/tools" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Tools</Link>
              <Link to="/ai-tools" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">AI Tools</Link>
              <Link to="/blog" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Blog</Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Dark mode toggle removed */}
            <Sun className="h-5 w-5 text-gray-500" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;