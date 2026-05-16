import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">About</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/about" className="text-gray-500 hover:text-gray-700">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-500 hover:text-gray-700">Contact</Link></li>
              <li><Link to="/privacy" className="text-gray-500 hover:text-gray-700">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-500 hover:text-gray-700">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">Tools</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/tools/image-compressor" className="text-gray-500 hover:text-gray-700">Image Compressor</Link></li>
              <li><Link to="/tools/background-remover" className="text-gray-500 hover:text-gray-700">Background Remover</Link></li>
              <li><Link to="/tools/image-enhancer" className="text-gray-500 hover:text-gray-700">Image Enhancer</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/privacy" className="text-gray-500 hover:text-gray-700">Privacy</Link></li>
              <li><Link to="/terms" className="text-gray-500 hover:text-gray-700">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 text-center">
          <p className="text-gray-400 text-sm">&copy; 2025 Toolbox. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;