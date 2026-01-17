import React from 'react';
import { motion } from 'framer-motion';
import { Star, Shield, AlertCircle, Quote } from 'lucide-react';

const ExpertRatingsTab = ({ ratings, loading }) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-indigo-600"></div>
                <p className="mt-4 text-slate-500 font-medium">Loading reviews...</p>
            </div>
        );
    }

    if (!ratings || ratings.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Reviews Yet</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                    Reviews from colleges will appear here once you complete projects and receive feedback.
                </p>
            </div>
        );
    }

    // Calculate stats
    const averageRating = ratings.reduce((acc, curr) => acc + curr.overallRating, 0) / ratings.length;

    return (
        <div className="space-y-6">
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
                    <p className="text-indigo-100 font-medium text-sm">Overall Rating</p>
                    <div className="flex items-end gap-2 mt-1">
                        <span className="text-4xl font-bold">{averageRating.toFixed(1)}</span>
                        <span className="text-lg text-indigo-200 mb-1">/ 5.0</span>
                    </div>
                    <div className="flex gap-1 mt-3">
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star
                                key={star}
                                className={`w-5 h-5 ${star <= Math.round(averageRating) ? 'fill-white text-white' : 'text-indigo-400'}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-center">
                    <p className="text-slate-500 font-medium text-sm">Total Reviews</p>
                    <span className="text-3xl font-bold text-slate-900 mt-1">{ratings.length}</span>
                    <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
                        <Shield className="w-3 h-3" /> All Verified
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-3 opacity-5">
                        <Quote className="w-24 h-24 text-indigo-900" />
                    </div>
                    <p className="text-slate-500 font-medium text-sm">Recent Activity</p>
                    <span className="text-sm text-slate-900 font-semibold mt-auto">
                        Last review received on {new Date(ratings[0].createdAt || Date.now()).toLocaleDateString()}
                    </span>
                </div>
            </div>

            {/* Reviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ratings.map((rating) => (
                    <motion.div
                        key={rating.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300 p-6 flex flex-col"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                                    {rating.collegeName ? rating.collegeName.charAt(0) : 'C'}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">
                                        {rating.collegeName || 'College'}
                                    </h4>
                                    <p className="text-xs text-slate-500">
                                        {rating.projectTitle || 'Project Collaboration'}
                                    </p>
                                </div>
                            </div>
                            <div className="px-2 py-1 bg-amber-50 rounded-[3px] border border-amber-100 flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                                <span className="text-xs font-bold text-amber-700">{rating.overallRating}</span>
                            </div>
                        </div>

                        <div className="flex-1 mb-4 relative">
                            <Quote className="w-6 h-6 text-slate-100 absolute -top-1 -left-1 transform -scale-x-100" />
                            <p className="text-slate-600 text-sm leading-relaxed italic pl-6 pt-1">
                                "{rating.review || rating.feedback || 'No written feedback provided.'}"
                            </p>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-medium">
                                {new Date(rating.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-[3px] border border-emerald-100">
                                <Shield className="w-3 h-3" /> Verified Review
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ExpertRatingsTab;
