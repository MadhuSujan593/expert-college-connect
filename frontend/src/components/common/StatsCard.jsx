import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatsCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    loading = false,
    delay = 0,
    color = "indigo"
}) => {

    const colorVariants = {
        indigo: "text-indigo-600 bg-indigo-50",
        emerald: "text-emerald-600 bg-emerald-50",
        violet: "text-violet-600 bg-violet-50",
        amber: "text-amber-600 bg-amber-50",
        blue: "text-blue-600 bg-blue-50",
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm h-full animate-pulse">
                <div className="flex justify-between items-start mb-4">
                    <div className="h-10 w-10 bg-slate-100 rounded-lg" />
                    <div className="h-4 w-16 bg-slate-100 rounded" />
                </div>
                <div className="h-8 w-1/2 bg-slate-100 rounded mb-2" />
                <div className="h-4 w-1/3 bg-slate-100 rounded" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: delay * 0.1 }}
            className="bg-white rounded-sm p-5 border border-slate-200/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-md transition-all duration-300 group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-sm ${colorVariants[color]} transition-colors`}>
                    <Icon className="w-5 h-5" />
                </div>

                {trend && (
                    <div className={`
                        flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full border
                        ${trend === 'up'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : trend === 'down'
                                ? 'bg-amber-50 text-amber-700 border-amber-100'
                                : 'bg-slate-50 text-slate-600 border-slate-100'}
                    `}>
                        {trend === 'up' && <TrendingUp className="w-3 h-3" />}
                        {trend === 'down' && <TrendingDown className="w-3 h-3" />}
                        {trend === 'neutral' && <Minus className="w-3 h-3" />}
                        <span>{trendValue}</span>
                    </div>
                )}
            </div>

            <div>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{value}</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">{title}</p>
            </div>
        </motion.div>
    );
};

export default StatsCard;
