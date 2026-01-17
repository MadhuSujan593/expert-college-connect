import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    BarChart3,
    Star,
    Eye,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronRight,
    CreditCard
} from 'lucide-react';
import StatsCard from '../../../components/common/StatsCard';

const ExpertOverview = ({ stats, applicationStats, user, profile, subscription, workExperiences, onTabChange }) => {
    const navigate = useNavigate();





    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Welcome Section */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Welcome back, {user?.fullName?.split(' ')[0] || 'Expert'}! 👋
                    </h1>
                    <p className="text-slate-500 mt-1">Here's what's happening with your profile today.</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Removed Profile Completion Indicator */}
                </div>

                {/* Missing Fields Tooltip/List */}

            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Pending Applications"
                    value={applicationStats?.pending || 0}
                    icon={Clock}
                    color="amber"
                    trend="neutral"
                    trendValue="-"
                    delay={0}
                />
                <StatsCard
                    title="Shortlisted"
                    value={applicationStats?.shortlisted || 0}
                    icon={Eye}
                    color="blue"
                    trend="up"
                    trendValue="+20%" // Placeholder trend
                    delay={1}
                />
                <StatsCard
                    title="Rejected"
                    value={applicationStats?.rejected || 0}
                    icon={XCircle}
                    color="rose"
                    trend="neutral"
                    trendValue="-"
                    delay={2}
                />
                <StatsCard
                    title="Average Rating"
                    value={stats?.averageRating ? Number(stats.averageRating).toFixed(1) : "0.0"}
                    icon={Star}
                    color="amber"
                    trend="neutral"
                    trendValue="0%"
                    delay={3}
                />
            </motion.div>

            {/* Bottom Section - Sidebar content as full width or grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Subscription & Boost Profile */}
                <motion.div variants={itemVariants} className="space-y-6">
                    {/* Subscription Status Card */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Star className="w-24 h-24 text-indigo-600" />
                        </div>
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 relative z-10">
                            <CreditCard className="w-5 h-5 text-indigo-600" />
                            Subscription Status
                        </h3>

                        <div className="relative z-10">
                            {subscription ? (
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-sm text-slate-500 mb-1">Current Plan</p>
                                            <h4 className="text-xl font-bold text-slate-800">{subscription.plan?.name || 'Standard Plan'}</h4>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${subscription.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {subscription.status || 'Active'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 text-sm text-slate-600 mb-6">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            <span>Expires: {(subscription.endsAt || subscription.endDate) ? new Date(subscription.endsAt || subscription.endDate).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => navigate('/subscription-plans')}
                                        className="w-full py-2 bg-indigo-50 text-indigo-600 font-bold text-sm rounded-[3px] hover:bg-indigo-100 transition-colors"
                                    >
                                        Upgrade Subscription
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <div className="mb-4">
                                        <p className="text-sm text-slate-500 mb-1">Current Plan</p>
                                        <h4 className="text-xl font-bold text-slate-800">No Active Plan</h4>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-6">
                                        You have no active subscription. Subscribe now to apply for opportunities.
                                    </p>
                                    <button
                                        onClick={() => navigate('/subscription-plans')}
                                        className="w-full py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-[3px] shadow-sm hover:bg-indigo-700 transition-colors"
                                    >
                                        View Plans
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-indigo-600" />
                            Quick Actions
                        </h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => onTabChange('ratings')}
                                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
                            >
                                <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600">Check Ratings</span>
                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => onTabChange('opportunities')}
                                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
                            >
                                <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600">Find Opportunities</span>
                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => onTabChange('profile')}
                                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
                            >
                                <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600">Update Profile</span>
                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default ExpertOverview;
