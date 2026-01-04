import React from 'react';
import { motion } from 'framer-motion';
import {
    Activity,
    Users,
    Briefcase,
    ClipboardCheck,
    Plus,
    ChevronRight,
    TrendingUp,
    AlertCircle,
    Search
} from 'lucide-react';
import StatsCard from '../../../components/common/StatsCard';
import { Link } from 'react-router-dom';

const DashboardOverview = ({
    stats,
    user,
    recentRequirements = [],
    loading,
    onCreateRequirement
}) => {

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="space-y-4 max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col">
            {/* Header Section - Compact */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">
                        Welcome back, {user?.fullName?.split(' ')[0] || 'Admin'} 👋
                    </p>
                </div>
                <button
                    onClick={onCreateRequirement}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-[3px] font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 text-xs"
                >
                    <Plus className="w-4 h-4" />
                    Post Requirement
                </button>
            </div>

            {/* Stats Grid - Compact */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0"
            >
                <StatsCard
                    title="Total Jobs"
                    value={stats.totalRequirements}
                    icon={Briefcase}
                    color="blue"
                    trend="up"
                    trendValue="+12%"
                    loading={loading}
                />
                <StatsCard
                    title="Active Jobs"
                    value={stats.activeRequirements}
                    icon={Briefcase}
                    color="emerald"
                    trend="neutral"
                    trendValue="Open Now"
                    loading={loading}
                />
                <StatsCard
                    title="Urgent Needs"
                    value={stats.urgentRequirements}
                    icon={AlertCircle}
                    color="amber"
                    trend={stats.urgentRequirements > 0 ? "down" : "neutral"}
                    trendValue={stats.urgentRequirements > 0 ? "Action needed" : "Stable"}
                    loading={loading}
                />
                <StatsCard
                    title="Profile Health"
                    value={`${stats.profileCompleteness}%`}
                    icon={Activity}
                    color="violet"
                    trend="neutral"
                    trendValue="Complete"
                    loading={loading}
                />
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 flex-1 min-h-0">
                {/* Recent Activity / Requirements - Scrollable within container */}
                <div className="xl:col-span-2 flex flex-col min-h-0">
                    <div className="bg-white rounded-sm border border-slate-200/60 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <h2 className="text-base font-bold text-slate-900">Recent Job Postings</h2>
                            <Link
                                to="/dashboard/college?tab=requirements"
                                className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 group transition-colors"
                            >
                                View All
                                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                    <p className="text-slate-500 text-xs font-medium">Loading activity...</p>
                                </div>
                            ) : recentRequirements.length > 0 ? (
                                <div className="divide-y divide-slate-50">
                                    {recentRequirements.map((req) => (
                                        <div key={req.id} className="p-3 hover:bg-slate-50/80 transition-colors group cursor-pointer flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-sm bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                                <Briefcase className="w-5 h-5" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h4 className="text-xs font-bold text-slate-900 truncate">
                                                        {req.title}
                                                    </h4>
                                                    <span className={`
                                                        px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
                                                        ${req.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}
                                                    `}>
                                                        {req.status || 'Active'}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-slate-500 flex items-center gap-2">
                                                    <span className="font-medium text-slate-700">
                                                        {req.category?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                                    </span>
                                                    <span className="w-0.5 h-0.5 rounded-full bg-slate-300"></span>
                                                    <span>Posted {new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                </p>
                                            </div>

                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <div className="w-12 h-12 bg-slate-50 rounded-sm flex items-center justify-center mx-auto mb-3">
                                        <Plus className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <h3 className="text-slate-900 font-bold text-sm mb-1">No jobs posted yet</h3>
                                    <p className="text-slate-500 text-xs mb-4 max-w-xs mx-auto">Create your first job requirement to start matching with top industry experts.</p>
                                    <button
                                        onClick={onCreateRequirement}
                                        className="px-6 py-2.5 bg-slate-900 text-white rounded-[3px] text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
                                    >
                                        Post a Job
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Column - Compact */}
                <div className="space-y-4 flex flex-col">
                    {/* Premium Plan Card - Compact */}
                    <div className="relative overflow-hidden rounded-sm bg-slate-900 text-white shadow-xl shadow-indigo-900/20 group shrink-0">
                        {/* Abstract Background Shapes */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-1000"></div>
                        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-emerald-500 blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>

                        <div className="relative z-10 p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-gradient-to-r from-amber-300 to-orange-400 text-amber-950 shadow-sm">
                                    Premium
                                </span>
                            </div>

                            <h3 className="text-lg font-bold mb-1">
                                Unlock Elite Features
                            </h3>
                            <p className="text-slate-300 text-xs mb-4 leading-relaxed max-w-[90%]">
                                Get direct access to top-tier experts, advanced analytics, and priority support.
                            </p>

                            <Link
                                to="/subscription-plans"
                                className="block w-full text-center py-2.5 bg-white text-slate-950 rounded-[3px] text-xs font-bold hover:bg-indigo-50 transition-colors shadow-lg active:scale-[0.98] transform duration-200"
                            >
                                Upgrade Plan
                            </Link>
                        </div>
                    </div>

                    {/* Quick Actions - Compact */}
                    <div className="bg-white rounded-sm border border-slate-200/60 shadow-sm p-4 flex-1">
                        <h2 className="text-base font-bold text-slate-900 mb-3">Quick Actions</h2>
                        <div className="space-y-2">
                            <Link
                                to="/dashboard/college?tab=experts"
                                className="flex items-center gap-3 p-3 rounded-sm bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 hover:border-indigo-100 transition-all group"
                            >
                                <div className="w-8 h-8 rounded-sm bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                                    <Search className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">Find Experts</h3>
                                    <p className="text-[10px] text-slate-500">Search 120+ pros</p>
                                </div>
                            </Link>

                            <Link
                                to="/dashboard/college?tab=applications"
                                className="flex items-center gap-3 p-3 rounded-sm bg-slate-50 hover:bg-amber-50/50 border border-slate-100 hover:border-amber-100 transition-all group"
                            >
                                <div className="w-8 h-8 rounded-sm bg-white flex items-center justify-center text-amber-600 shadow-sm">
                                    <ClipboardCheck className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">Review Applications</h3>
                                    <p className="text-[10px] text-slate-500">Pending reviews</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
