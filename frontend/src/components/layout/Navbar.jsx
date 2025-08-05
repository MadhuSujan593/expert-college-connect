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
  ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Find Experts', path: '/search/experts' },
    { name: 'Find Requirements', path: '/search/requirements' },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-heading font-bold text-foreground">
              ExpertConnect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                  isActive(item.path) 
                    ? 'text-primary-600 border-b-2 border-primary-600' 
                    : 'text-foreground/80'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="text-sm font-medium text-foreground/80 hover:text-primary-600 transition-colors"
            >
              Sign In
            </Link>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-1 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-lg transition-colors"
              >
                <span>Join Now</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-border py-2"
                >
                  <Link
                    to="/register/expert"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-foreground hover:bg-secondary-50 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>Join as Expert</span>
                  </Link>
                  <Link
                    to="/register/college"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-foreground hover:bg-secondary-50 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Join as College</span>
                  </Link>
                </motion.div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:text-primary-600 transition-colors"
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
            className="md:hidden border-t border-border"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-foreground/80 hover:text-primary-600 hover:bg-secondary-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-4 pb-3 border-t border-border">
                <Link
                  to="/login"
                  className="block px-3 py-2 text-base font-medium text-foreground/80 hover:text-primary-600 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register/expert"
                  className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-foreground/80 hover:text-primary-600 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-4 h-4" />
                  <span>Join as Expert</span>
                </Link>
                <Link
                  to="/register/college"
                  className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-foreground/80 hover:text-primary-600 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Join as College</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 