import React, { useState, useEffect } from 'react';
import {
    Shield,
    Award,
    Users,
    Star
} from 'lucide-react';
import RatingRequestsList from '../../../components/college/RatingRequestsList';
import apiService from '../../../utils/api';

const RatingsTab = ({ ratingRequests, fetchRatingRequests, loadingRequests, onRateExpert }) => {
    const [receivedRatings, setReceivedRatings] = useState([]);
    const [loadingRatings, setLoadingRatings] = useState(true);
    const [hasMoreRequests, setHasMoreRequests] = useState(false);
    const [requestsPage, setRequestsPage] = useState(1);

    const [trustBadges] = useState([
        { name: 'Verified Institution', icon: Shield, color: 'blue' },
        { name: 'Quality Partner', icon: Award, color: 'green' },
        { name: 'Active Collaborator', icon: Users, color: 'purple' }
    ]);

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
            {/* Trust Badges */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Trust Badges & Recognition</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {trustBadges.map((badge, index) => {
                        const Icon = badge.icon;
                        const colorClasses = {
                            blue: 'bg-blue-50 text-blue-700 border-blue-200',
                            green: 'bg-green-50 text-green-700 border-green-200',
                            purple: 'bg-purple-50 text-purple-700 border-purple-200'
                        };

                        return (
                            <div key={index} className={`p-6 rounded-xl border ${colorClasses[badge.color]} text-center hover:shadow-md transition-all duration-200`}>
                                <Icon className={`w-10 h-10 mx-auto mb-3 text-${badge.color}-600`} />
                                <h4 className="font-semibold text-gray-900">{badge.name}</h4>
                                <p className="text-sm text-gray-600 mt-1">Verified and trusted</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Rating Requests Section - Restored Functionality */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Pending Rating Requests</h3>
                <RatingRequestsList
                    ratingRequests={ratingRequests || []}
                    onUpdate={() => fetchRatingRequests && fetchRatingRequests(1)}
                    hasMore={hasMoreRequests} // Using local state or prop if passed
                    loadingMore={loadingRequests}
                    onLoadMore={handleLoadMoreRequests}
                />
            </div>

            {/* Received Ratings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Ratings Received from Experts</h3>
                    <div className="text-sm text-gray-500">
                        {receivedRatings.length} rating{receivedRatings.length !== 1 ? 's' : ''} received
                    </div>
                </div>

                {loadingRatings ? (
                    <div className="flex justify-center py-8">
                        <span className="text-gray-500">Loading reviews...</span>
                    </div>
                ) : receivedRatings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No ratings received yet.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {receivedRatings.map(rating => (
                            <div key={rating.id} className="p-6 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-sm transition-all duration-200">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{rating.expertName || rating.expert?.fullName || 'Unknown Expert'}</h4>
                                        <p className="text-sm text-gray-600">{rating.category || 'General'}</p>
                                    </div>
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-5 h-5 ${i < Math.floor(rating.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                            />
                                        ))}
                                        <span className="ml-2 text-sm font-semibold text-gray-900">{rating.rating}</span>
                                    </div>
                                </div>
                                <p className="text-gray-700 mb-3 leading-relaxed">{rating.comment}</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-gray-500">{rating.date ? new Date(rating.date).toLocaleDateString() : 'N/A'}</p>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-xs text-gray-500">Verified</span>
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
