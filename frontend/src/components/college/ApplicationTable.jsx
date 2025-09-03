import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckSquare, 
  Square, 
  ChevronDown, 
  ChevronUp,
  Search,
  Download,
  MoreHorizontal,
  Eye,
  MessageSquare,
  User,
  Clock,
  Star,
  XCircle,
  CheckCircle,
  Mail
} from 'lucide-react';
import apiService from '../../utils/api';

const ApplicationTable = ({ 
  requirementId, 
  onViewProfile, 
  onUpdateStatus, 
  refreshKey = 0, // Add refresh key prop
  adminName = 'Admin' // Add admin name prop
}) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApplications, setTotalApplications] = useState(0);
  const [selectedApplications, setSelectedApplications] = useState(new Set());
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const ITEMS_PER_PAGE = 25;

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(filters.search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // Fetch applications with pagination and filters
  const fetchApplications = useCallback(async () => {
    if (!requirementId) return;

    try {
      setLoading(true);
      // Build query params, filtering out empty values
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        search: debouncedSearchTerm,
        sortBy,
        sortOrder
      });
      
      // Only add status if it has a value
      if (filters.status && filters.status.trim() !== '') {
        queryParams.append('status', filters.status);
      }

      const response = await apiService.get(`/applications/requirement/${requirementId}?${queryParams.toString()}`);
      
      console.log('🔍 ApplicationTable - API Response:', response);
      console.log('🔍 Query Params:', queryParams.toString());
      
      // Handle both response structures (with and without data wrapper)
      if (response.success && response.data) {
        setApplications(response.data.applications || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalApplications(response.data.total || 0);
      } else if (response.applications && Array.isArray(response.applications)) {
        // Direct response structure
        setApplications(response.applications);
        setTotalPages(response.totalPages || 1);
        setTotalApplications(response.total || 0);
      } else {
        console.log('❌ Unexpected response structure:', response);
        setApplications([]);
        setTotalPages(1);
        setTotalApplications(0);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
      setTotalPages(1);
      setTotalApplications(0);
    } finally {
      setLoading(false);
    }
  }, [requirementId, currentPage, debouncedSearchTerm, sortBy, sortOrder, filters.status]);

  // Fetch applications when component mounts or dependencies change
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications, refreshKey]); // Add refreshKey to dependencies

  // Handle bulk selection
  const handleSelectAll = () => {
    if (selectedApplications.size === applications.length) {
      setSelectedApplications(new Set());
    } else {
      setSelectedApplications(new Set(applications.map(app => app.id)));
    }
  };

  const handleSelectApplication = (applicationId) => {
    const newSelected = new Set(selectedApplications);
    if (newSelected.has(applicationId)) {
      newSelected.delete(applicationId);
    } else {
      newSelected.add(applicationId);
    }
    setSelectedApplications(newSelected);
  };

  // Bulk operations
  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedApplications.size === 0) return;

    try {
      const promises = Array.from(selectedApplications).map(applicationId =>
        apiService.put(`/applications/${applicationId}/status`, { status: newStatus })
      );

      await Promise.all(promises);
      setSelectedApplications(new Set());
      fetchApplications();
    } catch (error) {
      console.error('Error updating bulk status:', error);
    }
  };

  // Sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Get status info
  const getStatusInfo = (status) => {
    switch (status) {
      case 'PENDING':
        return { icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'Pending' };
      case 'SHORTLISTED':
        return { icon: Star, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Shortlisted' };
      case 'REJECTED':
        return { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100', label: 'Rejected' };
      case 'ACCEPTED':
        return { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Accepted' };
      default:
        return { icon: Clock, color: 'text-gray-600', bgColor: 'bg-gray-100', label: status };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const SortableHeader = ({ field, children }) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortBy === field && (
          sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
        )}
      </div>
    </th>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header with Bulk Actions */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Applications ({totalApplications})
            </h3>
            {selectedApplications.size > 0 && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {selectedApplications.size} selected
              </span>
            )}
          </div>
          
          {selectedApplications.size > 0 && (
            <div className="flex items-center gap-2">
              <select
                onChange={(e) => handleBulkStatusUpdate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Bulk Update Status</option>
                <option value="SHORTLISTED">Shortlist Selected</option>
                <option value="REJECTED">Reject Selected</option>
                <option value="ACCEPTED">Accept Selected</option>
              </select>
              <button
                onClick={() => setSelectedApplications(new Set())}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by expert name or email..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="REJECTED">Rejected</option>
            <option value="ACCEPTED">Accepted</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedApplications.size === applications.length && applications.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
                             <SortableHeader field="expert.fullName">Expert</SortableHeader>
               <SortableHeader field="status">Status</SortableHeader>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                 Actions
               </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : applications.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  No applications found
                </td>
              </tr>
            ) : (
              applications.map((application) => {
                const statusInfo = getStatusInfo(application.status);
                const StatusIcon = statusInfo.icon;

                                 return (
                   <tr 
                     key={application.id} 
                     className="hover:bg-blue-50 hover:shadow-sm cursor-pointer transition-all duration-200 border-l-4 border-l-transparent hover:border-l-blue-500 group"
                     onClick={() => {
                       // Navigate to requirement details with application context
                       if (application.requirement?.id) {
                         window.open(`/requirement/${application.requirement.id}`, '_blank');
                       }
                     }}
                     title="Click to view requirement details"
                   >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedApplications.has(application.id)}
                        onChange={() => handleSelectApplication(application.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {application.expert.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.expert.email}
                          </div>
                          <div className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-1">
                            Click to view requirement details →
                          </div>
                        </div>
                      </div>
                    </td>
                                         <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center gap-2">
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                           <StatusIcon className="w-3 h-3 mr-1" />
                           {statusInfo.label}
                         </span>
                         {application.reviewNotes && (
                           <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                             <MessageSquare className="w-3 h-3 mr-1" />
                             Feedback
                           </span>
                         )}
                       </div>
                     </td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                       <div className="flex items-center gap-2">
                         <button
                           onClick={(e) => {
                             e.stopPropagation(); // Prevent row click when clicking button
                             if (application.requirement?.id) {
                               window.open(`/requirement/${application.requirement.id}`, '_blank');
                             }
                           }}
                           className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                           title="View Requirement Details"
                         >
                           <Eye className="w-3 h-3 mr-1" />
                           View
                         </button>
                         <button
                           onClick={(e) => {
                             e.stopPropagation(); // Prevent row click when clicking button
                             onUpdateStatus(application);
                           }}
                           className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors"
                           title="Update Status"
                         >
                           <CheckCircle className="w-3 h-3 mr-1" />
                           Status
                         </button>
                         {application.reviewNotes ? (
                           // Show feedback when available
                           <div className="flex items-center gap-2">
                             <button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 // Show feedback in a tooltip or expand the row
                                 const feedback = `Feedback for ${application.expert.fullName}:\n\n${application.reviewNotes}`;
                                 alert(feedback);
                               }}
                               className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                               title="View Feedback"
                             >
                               <MessageSquare className="w-3 h-3 mr-1" />
                               Feedback
                             </button>
                             <button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 // Try to get the job title from different possible locations
                                 let jobTitle = 'Position';
                                 if (application.requirement?.title) {
                                   jobTitle = application.requirement.title;
                                 } else if (application.requirementTitle) {
                                   jobTitle = application.requirementTitle;
                                 } else if (application.jobTitle) {
                                   jobTitle = application.jobTitle;
                                 }
                                 
                                 const subject = `Application Inquiry - ${jobTitle}`;
                                 const body = `Dear ${application.expert.fullName},\n\nI hope this email finds you well. I am reaching out regarding your application for the ${jobTitle} position.\n\nBest regards,\n${adminName}`;
                                 
                                 const mailtoLink = `mailto:${application.expert.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                                 window.open(mailtoLink);
                               }}
                               className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                               title="Contact Expert via Email"
                             >
                               <Mail className="w-3 h-3 mr-1" />
                               Contact
                             </button>
                           </div>
                         ) : (
                           // Show contact button when no feedback
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               // Try to get the job title from different possible locations
                               let jobTitle = 'Position';
                               if (application.requirement?.title) {
                                 jobTitle = application.requirement.title;
                               } else if (application.requirementTitle) {
                                 jobTitle = application.requirementTitle;
                               } else if (application.jobTitle) {
                                 jobTitle = application.jobTitle;
                               }
                               
                               const subject = `Application Inquiry - ${jobTitle}`;
                               const body = `Dear ${application.expert.fullName},\n\nI hope this email finds you well. I am reaching out regarding your application for the ${jobTitle} position.\n\nBest regards,\n${adminName}`;
                               
                               const mailtoLink = `mailto:${application.expert.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                               window.open(mailtoLink);
                             }}
                             className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                             title="Contact Expert via Email"
                           >
                             <Mail className="w-3 h-3 mr-1" />
                             Contact
                           </button>
                         )}
                       </div>
                     </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalApplications)} of {totalApplications} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationTable;
