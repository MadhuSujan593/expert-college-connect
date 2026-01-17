import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertCircle,
    Search,
    Filter,
    Building2,
    Star,
    Users,
    Shield,
    Mail,
    Phone,
    X
} from 'lucide-react';
import ExpertProfileModal from '../../../components/common/ExpertProfileModal';

const ExpertsTab = ({
    user,
    mySubscription,
    showPlanLimitationModal,
    setLimitationType,
    getLimitationDetails,
    subsLoading,
    revealedExpertIds,
    setRevealedExpertIds,
    apiService
}) => {
    // Validate user prop
    if (!user) {
        console.error('ExpertsTab: user prop is undefined');
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading...</h3>
                <p className="text-gray-600 mb-4">Please wait while we load your information.</p>
            </div>
        );
    }
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [experts, setExperts] = useState([]);
    const [totalExperts, setTotalExperts] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        page: 1,
        limit: 12
    });
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const categories = [
        'All Categories',
        'Technology & Innovation',
        'Business & Marketing',
        'Academic & Professional',
        'Training & Development',
        'Specialized Fields'
    ];

    const [debouncedQuery, setDebouncedQuery] = useState('');

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Reset page when debounced query changes (search happened)
    useEffect(() => {
        // Skip reset on initial mount if query is empty (avoids double fetch)
        if (debouncedQuery !== '') {
            setFilters(prev => ({ ...prev, page: 1 }));
        }
    }, [debouncedQuery]);

    // Fetch experts from API
    const fetchExperts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const searchFilters = { ...filters };

            // Smart search logic: detect if search query might be a city and apply location filter
            if (debouncedQuery.trim()) {
                const query = debouncedQuery.trim();

                // Check if the search query might be a city (common city names with variations)
                const commonCities = [
                    'mumbai', 'delhi', 'bangalore', 'banglore', 'bengaluru', 'hyderabad', 'chennai', 'kolkata', 'pune',
                    'ahmedabad', 'jaipur', 'surat', 'lucknow', 'kanpur', 'nagpur', 'indore',
                    'thane', 'bhopal', 'visakhapatnam', 'pimpri-chinchwad', 'patna', 'vadodara',
                    'noida', 'gurgaon', 'gurugram', 'faridabad', 'ghaziabad', 'meerut', 'raipur', 'ranchi', 'jabalpur',
                    'bombay', 'calcutta', 'madras', // Include old names
                    'bang', 'beng', 'bengal' // Include partial matches for bangalore
                ];

                // More flexible city matching - check if query contains city name or vice versa
                const isCitySearch = commonCities.some(city => {
                    const queryLower = query.toLowerCase();
                    const cityLower = city.toLowerCase();
                    const match = queryLower.includes(cityLower) || cityLower.includes(queryLower) || queryLower === cityLower;
                    if (match) {
                        console.log('🔍 City match found:', { query: queryLower, city: cityLower });
                    }
                    return match;
                });

                if (isCitySearch) {
                    // If it's a city search, only use location filter for better results
                    console.log('🔍 City search detected:', query);
                    searchFilters.location = query;
                    // Don't set query when it's a city search to avoid conflicts
                    delete searchFilters.query;
                } else {
                    // Regular search query
                    console.log('🔍 Regular search query:', query);
                    searchFilters.query = query;
                }
            }

            // Add category filter if selected
            if (selectedCategory && selectedCategory !== 'All Categories') {
                // For category filtering, we'll search by category name in multiple fields
                // This is more flexible than trying to match specific skills
                if (searchFilters.query) {
                    // If user has typed something, combine it with category
                    searchFilters.query = `${searchFilters.query} ${selectedCategory}`;
                } else {
                    // If no search query, just search by category
                    searchFilters.query = selectedCategory;
                }
                // Remove skills filter as it's too restrictive
                delete searchFilters.skills;
            }

            console.log('🔍 Search query:', debouncedQuery);
            console.log('🔍 Final search filters:', searchFilters);

            const response = await apiService.searchExperts(searchFilters);

            if (filters.page === 1) {
                // First page: replace all experts
                setExperts(response?.experts || []);
            } else {
                // Subsequent pages: append new experts
                setExperts(prev => [...prev, ...(response?.experts || [])]);
            }

            setTotalExperts(response?.total || 0);

            // Check if there are more experts to load using backend's totalPages
            setHasMore(filters.page < (response?.totalPages || 1));
        } catch (err) {
            console.error('Error fetching experts:', err);

            // Handle authentication errors specifically
            if (err.message && (err.message.includes('Authentication expired') || err.message.includes('Unauthorized'))) {
                setError('Your session has expired. Please refresh the page and try again.');
            } else {
                setError('Failed to load experts. Please try again.');
            }
            setExperts([]);
        } finally {
            setLoading(false);
        }
    }, [debouncedQuery, selectedCategory, filters, apiService]);

    // Fetch experts on component mount and when filters change
    useEffect(() => {
        fetchExperts();
    }, [fetchExperts]);

    // Handle category change
    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setFilters(prev => ({ ...prev, page: 1 }));
    };

    // Load more experts
    const loadMoreExperts = async () => {
        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);
        setFilters(prev => ({ ...prev, page: prev.page + 1 }));
        setIsLoadingMore(false);
    };

    // Contact modal state
    const [showContactModal, setShowContactModal] = useState(false);
    const [selectedExpert, setSelectedExpert] = useState(null);
    const [revealedContactDetails, setRevealedContactDetails] = useState(null);

    // Profile modal state
    const [showProfileModal, setShowProfileModal] = useState(false);

    // Handle contact expert
    const handleContactExpert = (expert) => {
        setSelectedExpert(expert);

        // Check if subscription is needed for contact revelation
        if (!mySubscription?.plan && !revealedExpertIds.has(expert.id)) {
            // User needs subscription to reveal contact
            const limitation = getLimitationDetails();
            if (limitation) {
                setLimitationType(limitation.type);
                showPlanLimitationModal(true);
                return;
            }
        }

        // Check if this expert has been revealed in current session
        if (revealedExpertIds.has(expert.id)) {
            // Expert was already revealed, show contact details
            setRevealedContactDetails({
                email: expert.user?.email,
                phone: expert.user?.phone,
                fullName: expert.user?.fullName
            });
        } else {
            // Expert not revealed yet, show masked details
            setRevealedContactDetails(null);
        }

        setShowContactModal(true);
    };

    // Handle view profile
    const handleViewProfile = (expert) => {
        setSelectedExpert(expert);
        setShowProfileModal(true);
    };

    // Close modals
    const closeContactModal = () => {
        setShowContactModal(false);
        setSelectedExpert(null);
        setRevealedContactDetails(null);
    };

    const closeProfileModal = () => {
        setShowProfileModal(false);
        setSelectedExpert(null);
    };

    // Loading skeleton
    const ExpertSkeleton = () => (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-0 animate-pulse overflow-hidden">
            <div className="p-5">
                <div className="flex items-start space-x-4 mb-4">
                    <div className="w-14 h-14 bg-slate-200 rounded-full shrink-0"></div>
                    <div className="flex-1 space-y-2 min-w-0">
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                    <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                </div>
            </div>
            <div className="h-12 bg-slate-50 border-t border-slate-100"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search experts by name, expertise, skills, or company..."
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-[3px] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 hover:border-indigo-300 transition-colors text-sm"
                            />
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="sm:w-64">
                        <select
                            value={selectedCategory}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-[3px] text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 hover:border-indigo-300 transition-colors text-sm bg-white"
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Active Filters Indicator */}
                {(searchQuery || selectedCategory !== 'All Categories') && (
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-600">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <span className="font-bold text-slate-700">Active filters:</span>
                        {searchQuery && (
                            <span className="inline-flex items-center px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
                                Search: {searchQuery}
                            </span>
                        )}
                        {selectedCategory !== 'All Categories' && (
                            <span className="inline-flex items-center px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-100">
                                Category: {selectedCategory}
                            </span>
                        )}
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory('All Categories');
                            }}
                            className="ml-auto text-xs font-bold text-slate-500 hover:text-slate-800 underline"
                        >
                            Clear All
                        </button>
                    </div>
                )}
            </div>

            {/* Results Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                            {loading ? 'Loading experts...' : (
                                (searchQuery || selectedCategory !== 'All Categories')
                                    ? `${experts.length} Expert${experts.length !== 1 ? 's' : ''} Found`
                                    : `${totalExperts} Expert${totalExperts !== 1 ? 's' : ''} Available`
                            )}
                        </h3>
                        {searchQuery && (
                            <p className="text-sm text-gray-600 mt-1">
                                Results for "{searchQuery}"
                            </p>
                        )}
                    </div>
                    {experts.length > 0 && (
                        <div className="text-sm text-gray-500">
                            Showing {experts.length} of {totalExperts} experts
                            {(searchQuery || selectedCategory !== 'All Categories') && totalExperts > experts.length && (
                                <span className="ml-2 text-blue-600">
                                    (filtered results)
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Error State */}
                {error && (
                    <div className="text-center py-12">
                        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={fetchExperts}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <ExpertSkeleton key={i} />
                        ))}
                    </div>
                )}

                {/* No Results State */}
                {!loading && !error && experts.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No experts found</h3>
                        <p className="text-gray-600 mb-4">
                            {searchQuery
                                ? `No experts match your search for "${searchQuery}". Try adjusting your search terms.`
                                : 'No experts are currently available. Please check back later.'
                            }
                        </p>
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedCategory('All Categories');
                                }}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                )}

                {/* Experts Grid */}
                {!loading && !error && experts.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {experts.map(expert => (
                            <motion.div
                                key={expert.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="group bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 flex flex-col overflow-hidden"
                            >
                                {/* Expert Header */}
                                <div className="p-3 flex-1">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="relative shrink-0">
                                            {expert.profilePicture ? (
                                                <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 shrink-0">
                                                    <img
                                                        src={expert.profilePicture}
                                                        alt={`${expert.user?.fullName}'s profile`}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm" style={{ display: 'none' }}>
                                                        {expert.user?.fullName?.charAt(0) || 'E'}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-sm border border-slate-200 shrink-0">
                                                    {expert.user?.fullName?.charAt(0) || 'E'}
                                                </div>
                                            )}
                                            {expert.isVerified && (
                                                <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full border border-white shadow-sm">
                                                    <div className="bg-indigo-50 p-0.5 rounded-full">
                                                        <Shield className="w-3 h-3 text-indigo-600" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-indigo-600 transition-colors" title={expert.user?.fullName}>
                                                {expert.user?.fullName || 'Expert Name'}
                                            </h4>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                                                <Building2 className="w-3 h-3 shrink-0" />
                                                <span className="truncate max-w-[120px]">{expert.company || 'Not specified'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Job Title & Rating */}
                                    <div className="mt-2 flex items-center justify-between gap-2">
                                        <div className="text-xs text-slate-700 font-medium truncate" title={expert.jobTitle}>
                                            {expert.jobTitle || 'Professional'}
                                        </div>

                                        {/* Rating - Only show if > 0 */}
                                        {expert.averageRating > 0 && (
                                            <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 shrink-0">
                                                <Star className="w-3 h-3 text-amber-500 fill-current" />
                                                <span className="text-[10px] font-bold text-amber-700">
                                                    {expert.averageRating.toFixed(1)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons - Bottom Full Width */}
                                <button
                                    onClick={() => handleViewProfile(expert)}
                                    className="w-full py-2.5 bg-white text-slate-600 text-xs font-bold border-t border-slate-100 hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    View Profile
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Load More Section */}
                {!loading && !error && experts.length > 0 && (
                    <div className="text-center mt-8">
                        {/* Load More Button (Manual) */}
                        {hasMore && (
                            <button
                                onClick={loadMoreExperts}
                                disabled={isLoadingMore}
                                className="px-8 py-3 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoadingMore ? 'Loading...' : 'Load More Experts'}
                            </button>
                        )}

                        {/* Loading More Indicator */}
                        {isLoadingMore && (
                            <div className="mt-4">
                                <div className="inline-flex items-center space-x-2 text-gray-600">
                                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span>Loading more experts...</span>
                                </div>
                            </div>
                        )}

                        {/* End of Results - Only show when there are many experts */}
                        {!hasMore && experts.length > 0 && experts.length >= 20 && (
                            <div className="mt-4 text-gray-500">
                                <p>You've reached the end of all available experts.</p>
                                <p className="text-sm">Showing {experts.length} of {totalExperts} experts</p>
                            </div>
                        )}

                        {/* Intersection Observer Trigger for Auto-loading */}
                        <div id="load-more-trigger" className="h-4 w-full" />
                    </div>
                )}

                {/* Scroll to Top Button */}
                {showScrollTop && (
                    <button
                        onClick={scrollToTop}
                        className="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 z-40 flex items-center justify-center"
                        title="Scroll to top"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    </button>
                )}

                {/* Contact Modal */}
                {showContactModal && selectedExpert && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        {selectedExpert.profilePicture ? (
                                            <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200">
                                                <img
                                                    src={selectedExpert.profilePicture}
                                                    alt={`${selectedExpert.user?.fullName}'s profile`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                                {selectedExpert.user?.fullName?.charAt(0) || 'E'}
                                            </div>
                                        )}
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900">
                                                {selectedExpert.user?.fullName}
                                            </h2>
                                            <p className="text-sm text-gray-600">{selectedExpert.jobTitle}</p>
                                            {selectedExpert.company && (
                                                <p className="text-xs text-gray-500">{selectedExpert.company}</p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={closeContactModal}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>

                                {/* Show message if already revealed */}
                                {revealedContactDetails && (
                                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                            <span className="text-sm text-green-700 font-medium">Contact details already revealed</span>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    {/* Email */}
                                    <div className="flex items-center space-x-3">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-700">
                                            {revealedContactDetails?.email || (selectedExpert.user?.email ? '••••••••••@•••' : 'Not provided')}
                                        </span>
                                    </div>

                                    {/* Phone */}
                                    {(revealedContactDetails?.phone || selectedExpert.user?.phone) && (
                                        <div className="flex items-center space-x-3">
                                            <Phone className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-700">
                                                {revealedContactDetails?.phone || '••••••••••'}
                                            </span>
                                        </div>
                                    )}

                                    {/* Single Reveal Button - only show if not revealed */}
                                    {!revealedContactDetails && (
                                        <div className="pt-3">
                                            <button
                                                onClick={async () => {
                                                    // Check subscription before revealing contact
                                                    if (!mySubscription?.plan) {
                                                        const limitation = getLimitationDetails();
                                                        if (limitation) {
                                                            setLimitationType(limitation.type);
                                                            showPlanLimitationModal(true);
                                                            return;
                                                        }
                                                    }

                                                    try {
                                                        const response = await apiService.revealExpertContact(selectedExpert.id);
                                                        if (response.success && response.contactDetails) {
                                                            const { email, phone, fullName } = response.contactDetails;

                                                            // Store revealed contact details in state
                                                            setRevealedContactDetails({
                                                                email,
                                                                phone,
                                                                fullName
                                                            });

                                                            // Add expert ID to revealed set
                                                            setRevealedExpertIds(prev => {
                                                                const newSet = new Set([...prev, selectedExpert.id]);
                                                                return newSet;
                                                            });

                                                            // Contact details revealed successfully
                                                            // Refresh subscription data to show updated usage
                                                            if (window.refreshSubscriptionData) {
                                                                await window.refreshSubscriptionData();
                                                            }
                                                        }
                                                    } catch (e) {
                                                        console.error('Contact revelation error:', e);
                                                        if (e.message && e.message.includes('Expert contact view limit reached')) {
                                                            // Show plan limitation modal for expert contacts
                                                            if (window.handleExpertContactLimit) {
                                                                window.handleExpertContactLimit();
                                                            }
                                                        } else {
                                                            alert(e.message || 'Unable to reveal contact. Please check your plan limits.');
                                                        }
                                                    }
                                                }}
                                                className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-medium rounded-md transition-all duration-300 shadow-sm hover:shadow-md"
                                            >
                                                Reveal Contact Details
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="p-6 border-t border-gray-200 flex space-x-3">
                                <button
                                    onClick={closeContactModal}
                                    className="px-6 py-2 bg-white text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-300 shadow-sm hover:shadow-md"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={async () => {
                                        // Check subscription before revealing contact
                                        if (!mySubscription?.plan) {
                                            const limitation = getLimitationDetails();
                                            if (limitation) {
                                                setLimitationType(limitation.type);
                                                showPlanLimitationModal(true);
                                                return;
                                            }
                                        }

                                        try {
                                            const response = await apiService.revealExpertContact(selectedExpert.id);
                                            if (response.success && response.contactDetails) {
                                                const { email, fullName } = response.contactDetails;
                                                if (email) {
                                                    const mailtoLink = `mailto:${email}?subject=Collaboration Opportunity&body=Hi ${fullName},%0A%0AI'm interested in collaborating with you for a project. Could you please let me know your availability and discuss the details?%0A%0ABest regards,`;
                                                    window.open(mailtoLink, '_blank');
                                                    alert('Contact details revealed! Email client opened.');
                                                } else {
                                                    alert('Email not available');
                                                }

                                                // Add expert ID to revealed set
                                                setRevealedExpertIds(prev => {
                                                    const newSet = new Set([...prev, selectedExpert.id]);
                                                    return newSet;
                                                });

                                                // Contact details revealed successfully
                                                // Note: Subscription usage will update when user navigates or refreshes
                                            }
                                        } catch (e) {
                                            console.error('Contact revelation error:', e);
                                            if (e.message && e.message.includes('Expert contact view limit reached')) {
                                                // Show plan limitation modal for expert contacts
                                                if (window.handleExpertContactLimit) {
                                                    window.handleExpertContactLimit();
                                                }
                                            } else {
                                                alert(e.message || 'Unable to reveal contact. Please check your plan limits.');
                                            }
                                        }
                                    }}
                                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-md transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Contact Expert
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Profile Modal */}
                <ExpertProfileModal
                    isOpen={showProfileModal}
                    expert={selectedExpert}
                    onClose={closeProfileModal}
                    onContactExpert={() => {
                        if (revealedExpertIds.has(selectedExpert.id) && selectedExpert.user?.email) {
                            const subject = `Expert Inquiry - ${selectedExpert.user.fullName}`;
                            const body = `Dear ${selectedExpert.user.fullName},\n\nI hope this email finds you well. I am reaching out regarding your expertise.\n\nBest regards,`;
                            const mailtoLink = `mailto:${selectedExpert.user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                            window.open(mailtoLink);
                            closeProfileModal();
                        }
                    }}
                    revealedExpertIds={revealedExpertIds}
                    onRevealContact={(expertId) => {
                        setRevealedExpertIds(prev => {
                            const newSet = new Set([...prev, expertId]);
                            return newSet;
                        });
                        if (window.refreshSubscriptionData) {
                            window.refreshSubscriptionData();
                        }
                    }}
                    mySubscription={mySubscription}
                    getLimitationDetails={getLimitationDetails}
                    showPlanLimitationModal={showPlanLimitationModal}
                    setLimitationType={setLimitationType}
                    apiService={apiService}
                    subsLoading={subsLoading}
                />
            </div>
        </div>
    );
};

export default ExpertsTab;
