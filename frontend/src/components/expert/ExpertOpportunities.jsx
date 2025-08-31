import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, MapPin, Clock, Users, Briefcase, Calendar, Star, Eye, FileText, IndianRupee } from 'lucide-react';
import apiService from '../../utils/api';
import RequirementDetails from './RequirementDetails';

const ExpertOpportunities = () => {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    category: '',
    search: '',
    location: '',
    budgetMin: '',
    budgetMax: '',
    isUrgent: false
  });
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalRequirements, setTotalRequirements] = useState(0);
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showDetailsView, setShowDetailsView] = useState(false);
  const [selectedRequirementId, setSelectedRequirementId] = useState(null);
  const [appliedRequirements, setAppliedRequirements] = useState(new Set());

  const observer = useRef();
  const lastRequirementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
        loadMoreRequirements();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, isLoadingMore]);

  // Fetch requirements
  const fetchRequirements = useCallback(async (isLoadMore = false) => {
    try {
      setLoading(!isLoadMore);
      setError(null);
      
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== false) {
          queryParams.append(key, value);
        }
      });

      console.log('🔍 Fetching requirements with params:', queryParams.toString());
      const response = await apiService.get(`/requirements?${queryParams.toString()}`);
      
      console.log('📡 API Response:', response);
      console.log('📋 Requirements data:', response.data);
      
      if (isLoadMore) {
        setRequirements(prev => [...prev, ...(response.requirements || [])]);
      } else {
        setRequirements(response.requirements || []);
      }
      
      setTotalRequirements(response.total || 0);
      setHasMore(response.page < response.totalPages);
      
      console.log('✅ Requirements set:', response.requirements?.length || 0);
      console.log('📊 Total:', response.total);
      console.log('📄 Page:', response.page);
      console.log('📚 Total Pages:', response.totalPages);
    } catch (err) {
      console.error('❌ Error fetching requirements:', err);
      setError('Failed to load requirements. Please try again.');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [filters]);

  // Load more requirements
  const loadMoreRequirements = () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setFilters(prev => ({ ...prev, page: prev.page + 1 }));
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await apiService.get('/requirements/categories');
      setCategories(response || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch expert's applications to know which requirements they've already applied for
  const fetchExpertApplications = async () => {
    try {
      console.log('🔍 Fetching expert applications...');
      const response = await apiService.get('/applications/my-applications');
      console.log('📡 Expert applications response:', response);
      
      if (response.data && response.data.applications) {
        const appliedIds = new Set(response.data.applications.map(app => app.requirementId));
        console.log('✅ Applied requirement IDs:', Array.from(appliedIds));
        setAppliedRequirements(appliedIds);
      } else {
        console.log('⚠️ No applications found in response');
        console.log('📋 Response structure:', response);
      }
    } catch (err) {
      console.error('❌ Error fetching expert applications:', err);
      // Set empty set to avoid undefined state
      setAppliedRequirements(new Set());
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  // Handle search
  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  // Apply filters
  const applyFilters = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      category: '',
      search: '',
      location: '',
      budgetMin: '',
      budgetMax: '',
      isUrgent: false
    });
  };



  // Show requirement details
  const showRequirementDetails = (requirementId) => {
    setSelectedRequirementId(requirementId);
    setShowDetailsView(true);
  };

  // Go back to opportunities list
  const goBackToOpportunities = () => {
    setShowDetailsView(false);
    setSelectedRequirementId(null);
  };

  // Handle successful application from details view
  const handleApplicationSuccess = () => {
    setAppliedRequirements(prev => new Set([...prev, selectedRequirementId]));
    goBackToOpportunities();
    fetchRequirements();
  };

  // Effects
  useEffect(() => {
    console.log('🚀 Component mounted, fetching requirements...');
    fetchRequirements();
  }, [fetchRequirements]);

  useEffect(() => {
    fetchCategories();
    fetchExpertApplications();
  }, []);

  // Format budget
  const formatBudget = (budget, budgetType) => {
    if (!budget) return 'Negotiable';
    if (budgetType === 'RANGE') return `₹${budget} - Negotiable`;
    return `₹${budget}`;
  };

  // Format deadline
  const formatDeadline = (deadline) => {
    if (!deadline) return 'No deadline';
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays} days left`;
    return date.toLocaleDateString();
  };

  if (loading && requirements.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show details view if selected
  if (showDetailsView) {
    return (
      <RequirementDetails
        requirementId={selectedRequirementId}
        onBack={goBackToOpportunities}
        onApplySuccess={handleApplicationSuccess}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                     <div>
             <h1 className="text-2xl font-bold text-gray-900">Browse Opportunities</h1>
             <p className="text-gray-600 mt-1">Find requirements and review details before applying</p>
           </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search requirements by title, description, or category..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  placeholder="City, State"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Budget Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.budgetMin}
                    onChange={(e) => handleFilterChange('budgetMin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.budgetMax}
                    onChange={(e) => handleFilterChange('budgetMax', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Urgent Only */}
              <div className="flex items-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.isUrgent}
                    onChange={(e) => handleFilterChange('isUrgent', e.target.checked)}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Urgent Only</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear All
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Requirements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requirements.map((requirement, index) => (
          <motion.div
            key={requirement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            ref={index === requirements.length - 1 ? lastRequirementRef : null}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {requirement.title}
                </h3>
                {requirement.isUrgent && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                    Urgent
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                {requirement.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {requirement.category}
                </span>
                {requirement.subcategory && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                    {requirement.subcategory}
                  </span>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="p-6 space-y-3">
              {/* College Info */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Briefcase className="w-4 h-4" />
                <span>{requirement.collegeprofile?.institutionName || 'College Name'}</span>
              </div>

              {/* Location */}
              {requirement.collegeprofile?.city && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{requirement.collegeprofile.city}</span>
                </div>
              )}

                             {/* Budget */}
               <div className="flex items-center gap-2 text-sm text-gray-600">
                 <IndianRupee className="w-4 h-4" />
                 <span>{formatBudget(requirement.budget, requirement.budgetType)}</span>
               </div>

              {/* Deadline */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{formatDeadline(requirement.deadline)}</span>
              </div>

              {/* Posted Date */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Posted {new Date(requirement.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

                                      {/* Action */}
             <div className="p-6 pt-0">
               {appliedRequirements.has(requirement.id) ? (
                 <button
                   disabled
                   className="w-full px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed font-medium"
                 >
                   Already Applied
                 </button>
               ) : (
                 <button
                   onClick={(e) => {
                     e.stopPropagation();
                     showRequirementDetails(requirement.id);
                   }}
                   className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                 >
                   View Details
                 </button>
               )}
 
             </div>
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center py-6">
          <button
            onClick={loadMoreRequirements}
            disabled={isLoadingMore}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {isLoadingMore ? 'Loading...' : 'Load More Opportunities'}
          </button>
        </div>
      )}

      {/* End of Results */}
      {!hasMore && requirements.length > 0 && (
        <div className="text-center py-6 text-gray-500">
          <p>You've reached the end of all available opportunities.</p>
          <p className="text-sm">Showing {requirements.length} of {totalRequirements} opportunities</p>
        </div>
      )}

      {/* No Results */}
      {!loading && requirements.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
          <p className="text-gray-500">Try adjusting your filters or search terms.</p>
        </div>
      )}

      
    </div>
  );
};

export default ExpertOpportunities;
