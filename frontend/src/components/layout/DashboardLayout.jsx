import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';

const DashboardLayout = ({ children, user, logout, activeTab, setActiveTab, logoUrl }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            <Sidebar
                user={user}
                logout={logout}
                isOpen={sidebarOpen}
                toggleSidebar={toggleSidebar}
                mobile={true} // Passed to logic to handle mobile overlay
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                logoUrl={logoUrl}
            />

            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                {/* Mobile Header */}
                <div className="lg:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <span className="font-semibold text-slate-900">
                            {user?.role === 'EXPERT' || window.location.pathname.includes('/expert') ? 'Expert Connect' : 'CollegeConnect'}
                        </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                        {/* Simple avatar placeholder for mobile header */}
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">
                            {user?.fullName?.charAt(0) || 'U'}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
                    {children}
                </main>
            </div>

            {/* Toast Container for Dashboard-specific toasts if needed, though App.jsx usually handles it globally. 
          Keeping strictly layout focus here. */}
        </div>
    );
};

export default DashboardLayout;
