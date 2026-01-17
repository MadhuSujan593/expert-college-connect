import React from 'react';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import ExpertOpportunities from '../../../components/expert/ExpertOpportunities';

const ExpertOpportunitiesTab = ({
    user,
    canAccessFeatures,
    onVerifyEmail,
    onVerifyPhone
}) => {

    if (!canAccessFeatures) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 max-w-2xl mx-auto mt-8 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Building2 className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Access Opportunities</h3>
                <p className="text-slate-500 mb-6">
                    Verify your contact information to browse and apply for expert opportunities.
                </p>

                <div className="space-y-3 max-w-xs mx-auto">
                    {!user?.isEmailVerified && (
                        <button
                            onClick={onVerifyEmail}
                            className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-[3px] transition-all shadow-sm"
                        >
                            Verify Email Address
                        </button>
                    )}
                    {!user?.isPhoneVerified && (
                        <button
                            onClick={onVerifyPhone}
                            className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-[3px] transition-all shadow-sm"
                        >
                            Verify Phone Number
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <ExpertOpportunities />
        </motion.div>
    );
};

export default ExpertOpportunitiesTab;
