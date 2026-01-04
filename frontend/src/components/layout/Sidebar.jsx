import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    User,
    FileText,
    Users,
    LogOut,
    Settings,
    Menu,
    X,
    ChevronRight,
    Shield,
    CreditCard,
    HelpCircle,
    LayoutDashboard,
    Star,
    LayoutGrid,
    School,
    Briefcase,
    ClipboardCheck,
    Search,
    Award,
    GraduationCap
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

const Sidebar = ({ user, logout, isOpen, toggleSidebar, mobile, activeTab, setActiveTab }) => {
    const location = useLocation();

    // Always derive state from URL to ensure sync
    const currentTab = new URLSearchParams(location.search).get('tab') || 'overview';

    // Define navigation items based on user role
    const navItems = [
        { id: 'overview', label: 'Overview', icon: LayoutGrid, path: '/dashboard/college?tab=overview' },
        { id: 'profile', label: 'Profile', icon: School, path: '/dashboard/college?tab=profile' },
        { id: 'requirements', label: 'Requirements', icon: Briefcase, path: '/dashboard/college?tab=requirements' },
        { id: 'applications', label: 'Applications', icon: ClipboardCheck, path: '/dashboard/college?tab=applications' },
        { id: 'experts', label: 'Find Experts', icon: Search, path: '/dashboard/college?tab=experts' },
        { id: 'ratings', label: 'Ratings', icon: Award, path: '/dashboard/college?tab=ratings' },
    ];

    const isActive = (id) => {
        if (id === 'subscription') return location.pathname === '/subscription-plans';

        // Map sub-tabs to parent tabs
        if (id === 'ratings' && currentTab === 'rating-requests') return true;
        if (id === 'profile' && location.search.includes('verify')) return true; // Keep profile active during verification

        return currentTab === id;
    };

    const SidebarContent = ({ showCloseButton }) => (
        <div className="flex flex-col h-full bg-[#0F172A] text-slate-300">
            {/* Brand Section */}
            <div className="h-16 flex items-center px-6 border-b border-slate-800/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-white tracking-tight text-lg">CollegeConnect</span>
                </div>
                {showCloseButton && (
                    <button
                        onClick={toggleSidebar}
                        className="ml-auto p-2 rounded-[3px] text-slate-400 hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* User Quick Info */}
            <div className="px-4 py-6">
                <div className="p-4 rounded-sm bg-slate-900/50 border border-slate-800/50 flex items-center gap-3 relative overflow-hidden group">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                        <span className="text-sm font-bold text-white">
                            {user?.fullName?.charAt(0) || 'U'}
                        </span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <h4 className="text-sm font-medium text-white truncate">{user?.fullName || 'User'}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span className="text-xs text-slate-400">College Admin</span>
                        </div>
                    </div>
                    <div className="absolute inset-0 border-2 border-indigo-500/0 rounded-lg group-hover:border-indigo-500/10 transition-colors" />
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
                <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-2">Menu</p>

                {navItems.map((item) => (
                    <Link
                        key={item.id}
                        to={item.path}
                        onClick={(e) => {
                            if (setActiveTab) {
                                e.preventDefault();
                                setActiveTab(item.id);
                            }
                            if (mobile && toggleSidebar) toggleSidebar();
                        }}
                        className={`
              relative flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-all duration-200 group
              ${isActive(item.id)
                                ? 'text-white bg-indigo-600/10'
                                : 'hover:bg-slate-800/50 hover:text-white'
                            }
            `}
                    >
                        {isActive(item.id) && (
                            <motion.span
                                className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 24 }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                            />
                        )}
                        <item.icon className={`w-5 h-5 ${isActive(item.id) ? 'text-indigo-400' : 'text-slate-400 group-hover:text-indigo-400'} transition-colors`} />
                        <span>{item.label}</span>

                        {isActive(item.id) && (
                            <ChevronRight className="w-4 h-4 ml-auto text-indigo-400 opacity-50" />
                        )}
                    </Link>
                ))}

                <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6">Support</p>

                <Link to="/contact-us" className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all group">
                    <HelpCircle className="w-5 h-5 text-slate-500 group-hover:text-slate-300" />
                    <span>Help Center</span>
                </Link>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800/50">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-[3px] text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 h-screen sticky top-0 border-r border-slate-800">
                <SidebarContent showCloseButton={false} />
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {mobile && isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={toggleSidebar}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-[80%] max-w-xs z-50 lg:hidden shadow-2xl"
                        >
                            <SidebarContent showCloseButton={mobile} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
