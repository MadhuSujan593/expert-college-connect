import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Menu, 
  X, 
  Search, 
  User, 
  Building2, 
  GraduationCap,
  ChevronDown,
  LogOut,
  Settings,
  UserCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout, getDashboardRoute } = useAuth();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Find Experts', path: '/search/experts' },
    { name: 'Find Requirements', path: '/search/requirements' },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              ExpertConnect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-sm font-semibold transition-all duration-300 px-6 py-3 rounded-full relative ${
                  isActive(item.path) 
                    ? 'text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {isActive(item.path) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg"></div>
                )}
                <span className="relative z-10">{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              // Authenticated User Menu
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 text-sm font-semibold text-gray-700 hover:text-gray-900 bg-white/80 hover:bg-white border border-gray-200 px-4 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <UserCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="max-w-32 truncate">{user?.fullName}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-64 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 py-3 overflow-hidden"
                  >
                    <div className="px-6 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-900">{user?.fullName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <p className="text-xs text-blue-600 font-medium mt-1">
                        {user?.role === 'EXPERT' ? 'Expert' : user?.role === 'COLLEGE_ADMIN' ? 'Institution Admin' : 'User'}
                      </p>
                    </div>
                    
                    <Link
                      to={getDashboardRoute()}
                      className="flex items-center space-x-3 px-6 py-4 text-gray-700 hover:bg-blue-50/70 hover:text-blue-600 transition-all duration-200"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Dashboard</span>
                    </Link>
                    
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center space-x-3 px-6 py-4 text-red-600 hover:bg-red-50/70 transition-all duration-200"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              // Guest User Buttons
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors px-4 py-2"
                >
                  Sign In
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-8 py-3.5 rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
                  >
                    <span>Join Now</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-64 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 py-3 overflow-hidden"
                    >
                      <Link
                        to="/register/expert"
                        className="flex items-center space-x-4 px-6 py-4 text-gray-700 hover:bg-blue-50/70 hover:text-blue-600 transition-all duration-200 group"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold">Join as Expert</div>
                          <div className="text-xs text-gray-500">Share your expertise</div>
                        </div>
                      </Link>
                      <Link
                        to="/register/college"
                        className="flex items-center space-x-4 px-6 py-4 text-gray-700 hover:bg-purple-50/70 hover:text-purple-600 transition-all duration-200 group"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold">Join as Institution</div>
                          <div className="text-xs text-gray-500">Find expert partners</div>
                        </div>
                      </Link>
                    </motion.div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 transition-colors p-3 rounded-2xl hover:bg-gray-50"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 bg-white/90 backdrop-blur-xl"
          >
            <div className="px-6 pt-6 pb-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block px-6 py-4 rounded-2xl text-base font-semibold transition-all duration-200 ${
                    isActive(item.path)
                      ? 'text-white bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-4 pb-2 border-t border-gray-100 space-y-3">
                {isAuthenticated ? (
                  // Authenticated Mobile Menu
                  <>
                    <div className="px-6 py-3 bg-gray-50/80 rounded-2xl mx-3">
                      <p className="font-semibold text-gray-900">{user?.fullName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <p className="text-xs text-blue-600 font-medium mt-1">
                        {user?.role === 'EXPERT' ? 'Expert' : user?.role === 'COLLEGE_ADMIN' ? 'Institution Admin' : 'User'}
                      </p>
                    </div>
                    <Link
                      to={getDashboardRoute()}
                      className="flex items-center space-x-3 px-6 py-4 text-base font-semibold text-gray-700 hover:bg-blue-50/70 hover:text-blue-600 rounded-2xl transition-all duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Dashboard</span>
                    </Link>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center space-x-3 px-6 py-4 text-base font-semibold text-red-600 hover:bg-red-50/70 rounded-2xl transition-all duration-200"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  // Guest Mobile Menu
                  <>
                    <Link
                      to="/login"
                      className="block px-6 py-4 text-base font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-2xl transition-all duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register/expert"
                      className="flex items-center space-x-4 px-6 py-4 text-base font-semibold text-gray-700 hover:bg-blue-50/70 hover:text-blue-600 rounded-2xl transition-all duration-200 group"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span>Join as Expert</span>
                    </Link>
                    <Link
                      to="/register/college"
                      className="flex items-center space-x-4 px-6 py-4 text-base font-semibold text-gray-700 hover:bg-purple-50/70 hover:text-purple-600 rounded-2xl transition-all duration-200 group"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                      <span>Join as Institution</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 