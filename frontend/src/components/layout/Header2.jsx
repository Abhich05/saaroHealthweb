import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header2 = () => {
  const navigate = useNavigate();

  return (
    <header className="flex items-center relative z-10 justify-between px-6 sm:px-10 py-4 bg-white shadow-sm border-b border-gray-100">
      {/* Logo Section */}
      <div className="flex items-center">
        <img
          src="/saaro-health3.png"
          alt="Saaro Health Logo"
          className="h-8 w-auto object-contain hover:scale-105 transition-transform duration-200"
        />
      </div>

      {/* Navigation */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
        <a 
          href="#" 
          className="text-gray-700 hover:text-purple-600 transition-colors duration-200 relative group"
        >
          About
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-200 group-hover:w-full"></span>
        </a>
        <a 
          href="#" 
          className="text-gray-700 hover:text-purple-600 transition-colors duration-200 relative group"
        >
          Features
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-200 group-hover:w-full"></span>
        </a>
        <a 
          href="#" 
          className="text-gray-700 hover:text-purple-600 transition-colors duration-200 relative group"
        >
          Pricing
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-200 group-hover:w-full"></span>
        </a>
        <a 
          href="#" 
          className="text-gray-700 hover:text-purple-600 transition-colors duration-200 relative group"
        >
          Contact
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-200 group-hover:w-full"></span>
        </a>

        {/* Login Button */}
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm font-semibold 
                   shadow-sm hover:shadow-md transform hover:scale-[1.02] transition-all duration-200 
                   focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
          onClick={() => navigate('/login')}
        >
          <span className="flex items-center">
            Login
            <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>
      </nav>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center gap-3">
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold 
                   shadow-sm hover:shadow-md transition-all duration-200"
          onClick={() => navigate('/login')}
        >
          Login
        </button>
        
        <button 
          className="p-2 text-gray-600 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
          aria-label="Menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header2;