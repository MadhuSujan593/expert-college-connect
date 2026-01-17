import React, { useState, useEffect } from 'react';
import {
    Shield,
    Star
} from 'lucide-react';
import RatingRequestsList from '../../../components/college/RatingRequestsList';
import apiService from '../../../utils/api';

const RatingsTab = ({ ratingRequests, fetchRatingRequests, loadingRequests, onRateExpert }) => {
    const [receivedRatings, setReceivedRatings] = useState([]);
    const [loadingRatings, setLoadingRatings] = useState(true);
    const [hasMoreRequests, setHasMoreRequests] = useState(false);
    const [requestsPage, setRequestsPage] = useState(1);



    useEffect(() => {
        fetchReceivedRatings();
    }, []);

    const fetchReceivedRatings = async () => {
        try {
            setLoadingRatings(true);
            // Attempt to fetch college-specific ratings. 
            // If endpoint differs, this will need adjustment.
            const response = await apiService.get('/ratings/college');
            if (response && Array.isArray(response)) {
                setReceivedRatings(response);
            } else if (response && response.data && Array.isArray(response.data)) {
                setReceivedRatings(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch received ratings:', error);
            // Fallback to empty or keep loading state false
        } finally {
            setLoadingRatings(false);
        }
    };

    const handleLoadMoreRequests = () => {
        if (fetchRatingRequests) {
            fetchRatingRequests(requestsPage + 1, true);
            setRequestsPage(prev => prev + 1);
        }
    };

    return (
        <div className="space-y-8">


            {/* Rating Requests Section - Restored Functionality */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-900">Pending Rating Requests</h3>
                </div>
                <RatingRequestsList
                    ratingRequests={ratingRequests || []}
                    onUpdate={() => fetchRatingRequests && fetchRatingRequests(1)}
                    hasMore={hasMoreRequests} // Using local state or prop if passed
                    loadingMore={loadingRequests}
                    onLoadMore={handleLoadMoreRequests}
                />
            </div>

            {/* Received Ratings */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Star className="w-6 h-6 text-amber-400 fill-current" />
                        Ratings Received
                    </h3>
                    <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600 border border-slate-200">
                        {receivedRatings.length} rating{receivedRatings.length !== 1 ? 's' : ''} received
                    </div>
                </div>

                {loadingRatings ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-indigo-600"></div>
                        <span className="text-slate-500 font-medium">Loading reviews...</span>
                    </div>
                ) : receivedRatings.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h4 className="text-slate-900 font-bold mb-1">No ratings received yet</h4>
                        <p className="text-slate-500 text-sm">Ratings from experts will appear here</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {receivedRatings.map(rating => (
                            <div key={rating.id} className="p-6 bg-white rounded-xl border border-slate-200 hover:shadow-lg hover:border-indigo-100 transition-all duration-300 flex flex-col h-full group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                                            {(rating.expertName || rating.expert?.fullName || 'U').charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                                                {rating.expertName || rating.expert?.fullName || 'Unknown Expert'}
                                            </h4>
                                            <p className="text-xs text-slate-500 font-medium">{rating.category || 'General'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                        <Star className="w-4 h-4 text-amber-400 fill-current" />
                                        <span className="ml-1.5 text-sm font-bold text-slate-700">{rating.rating}</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-slate-600 text-sm leading-relaxed italic">"{rating.comment}"</p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                        {rating.date ? new Date(rating.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                    </p>
                                    <div className="flex items-center space-x-1.5 px-2 py-0.5 bg-emerald-50 rounded text-emerald-700 border border-emerald-100">
                                        <Shield className="w-3 h-3" />
                                        <span className="text-[10px] uppercase font-bold tracking-wider">Verified</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RatingsTab;
