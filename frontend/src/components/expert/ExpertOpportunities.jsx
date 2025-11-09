import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Clock, Users, Briefcase, Calendar, Star, Eye, FileText, IndianRupee, Building2, Calendar as CalendarIcon, Building as BuildingOfficeIcon, Clock as ClockIcon, IndianRupee as CurrencyRupeeIcon, Sparkles } from 'lucide-react';
import apiService from '../../utils/api';
import RequirementCard from '../common/RequirementCard';

const ExpertOpportunities = () => {
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: ''
  });
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalRequirements, setTotalRequirements] = useState(0);
  const [appliedRequirements, setAppliedRequirements] = useState(new Set());
  const [applicationStatuses, setApplicationStatuses] = useState(new Map());

  const observer = useRef();
  const lastRequirementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
        console.log('🔄 Intersection observer triggered - loading more requirements');
        console.log('📊 Current state:', { 
          hasMore, 
          isLoadingMore, 
          currentRequirements: requirements.length,
          totalRequirements 
        });
        loadMoreRequirements();
      }
    }, {
      threshold: 0.1,
      rootMargin: '200px' // Load more content earlier
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, isLoadingMore, requirements.length, totalRequirements]);

  // Fetch requirements with recommendations
  const fetchRequirements = useCallback(async (isLoadMore = false) => {
    try {
      setLoading(!isLoadMore);
      setError(null);
      
      console.log('🔍 Fetching requirements with recommendations...', 'Search:', filters.search);
      const response = await apiService.getRecommendedOpportunities(filters.page, filters.limit, 0, filters.search); // Get all with minScore = 0
      
      console.log('📡 API Response:', response);
      console.log('📋 Requirements data:', response.opportunities);
      
      // Sort by recommendation score (highest first), then by date
      const sortedRequirements = (response.opportunities || []).sort((a, b) => {
        const scoreA = a.recommendation?.score || 0;
        const scoreB = b.recommendation?.score || 0;
        
        // First sort by recommendation score (descending)
        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }
        
        // Then sort by date (newest first)
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      if (isLoadMore) {
        console.log('📥 Adding to existing requirements:', sortedRequirements.length);
        setRequirements(prev => {
          const newList = [...prev, ...sortedRequirements];
          console.log('📋 Total requirements after adding:', newList.length);
          return newList;
        });
      } else {
        console.log('🔄 Setting initial requirements:', sortedRequirements.length);
        setRequirements(sortedRequirements);
      }
      
      setTotalRequirements(response.pagination?.totalCount || 0);
      const currentPage = response.pagination?.currentPage || 1;
      const totalPages = response.pagination?.totalPages || 1;
      const shouldHaveMore = currentPage < totalPages;
      
      console.log('📊 Pagination check:', { currentPage, totalPages, shouldHaveMore });
      setHasMore(shouldHaveMore);
      
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
    if (isLoadingMore || !hasMore) {
      console.log('🚫 Cannot load more:', { isLoadingMore, hasMore });
      return;
    }
    console.log('📥 Loading more requirements...');
    setIsLoadingMore(true);
    // Update filters to trigger next page fetch
    setFilters(prev => {
      const nextPage = prev.page + 1;
      console.log('📄 Loading page:', nextPage);
      return { ...prev, page: nextPage };
    });
  };


  // Fetch expert's applications to know which requirements they've already applied for
  const fetchExpertApplications = async () => {
    try {
      console.log('🔍 Fetching expert applications...');
      const response = await apiService.get('/applications/my-applications');
      console.log('📡 Expert applications response:', response);
      
      if (response.data && response.data.applications) {
        const appliedIds = new Set();
        const statusMap = new Map();
        
        response.data.applications.forEach(app => {
          appliedIds.add(app.requirementId);
          statusMap.set(app.requirementId, app.status);
        });
        
        console.log('✅ Applied requirement IDs:', Array.from(appliedIds));
        console.log('📊 Application statuses:', Object.fromEntries(statusMap));
        setAppliedRequirements(appliedIds);
        setApplicationStatuses(statusMap);
      } else {
        console.log('⚠️ No applications found in response');
        console.log('📋 Response structure:', response);
      }
    } catch (err) {
      console.error('❌ Error fetching expert applications:', err);
      // Set empty set to avoid undefined state
      setAppliedRequirements(new Set());
      setApplicationStatuses(new Map());
    }
  };


  // Handle search
  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };





  // Show requirement details
  const showRequirementDetails = (requirementId) => {
    navigate(`/requirement/${requirementId}`);
  };

  // Effects
  useEffect(() => {
    console.log('🚀 Component mounted, fetching requirements...');
    fetchRequirements(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Handle search changes - reset to page 1 and refetch
    console.log('🔍 Search term changed:', filters.search);
    fetchRequirements(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  // Fetch next page when page changes (infinite scroll)
  useEffect(() => {
    if (filters.page > 1) {
      console.log('📄 Page changed, fetching more:', filters.page);
      fetchRequirements(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page]);

  useEffect(() => {
    fetchExpertApplications();
  }, []);



  if (loading && requirements.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }



  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        <div className="space-y-6">
       {/* Header */}
       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Browse Opportunities</h1>
            <p className="text-gray-600 text-sm">Find requirements and review details before applying</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search requirements by title, description, or category..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      {/* Unified Opportunities List */}
      {requirements.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">All Opportunities</h2>
              <p className="text-sm text-gray-600">Browse all available opportunities. Add skills to get personalized recommendations.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {requirements.map((requirement, index) => (
              <motion.div
                key={requirement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                ref={index === requirements.length - 1 ? lastRequirementRef : null}
              >
                <RequirementCard
                  requirement={requirement}
                  variant="expert"
                  onClick={() => showRequirementDetails(requirement.id)}
                  applicationStatus={appliedRequirements.has(requirement.id) ? applicationStatuses.get(requirement.id) : null}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Loading More Indicator (infinite scroll only) */}
      {isLoadingMore && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
            <span>Loading more opportunities...</span>
          </div>
        </div>
      )}

       {/* End of Results */}
       {!hasMore && requirements.length > 0 && (
         <div className="flex flex-col items-center py-8 text-gray-500">
           <div className="text-center">
             <p className="text-lg font-medium mb-2">You've reached the end of all available opportunities.</p>
             <p className="text-sm">Showing {requirements.length} of {totalRequirements} opportunities</p>
           </div>
         </div>
       )}

       {/* No Results */}
       {!loading && requirements.length === 0 && (
         <div className="flex flex-col items-center justify-center py-16">
           <FileText className="w-16 h-16 text-gray-400 mb-4" />
           <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
           <p className="text-gray-500 text-center">Try adjusting your filters or search terms.</p>
         </div>
       )}
         </div>
       </div>
     </div>
  );
};

export default ExpertOpportunities;

