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
  const [applicationStats, setApplicationStats] = useState({
    shortlisted: 0,
    rejected: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const ITEMS_PER_PAGE = 25;

  // Calculate application stats
  const calculateStats = (apps) => {
    const shortlisted = apps.filter(app => app.status === 'SHORTLISTED').length;
    const rejected = apps.filter(app => app.status === 'REJECTED').length;
    return { shortlisted, rejected };
  };

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
      let applicationsData = [];
      if (response.success && response.data) {
        applicationsData = response.data.applications || [];
        setApplications(applicationsData);
        setTotalPages(response.data.totalPages || 1);
        setTotalApplications(response.data.total || 0);
      } else if (response.applications && Array.isArray(response.applications)) {
        // Direct response structure
        applicationsData = response.applications;
        setApplications(applicationsData);
        setTotalPages(response.totalPages || 1);
        setTotalApplications(response.total || 0);
      } else {
        console.log('❌ Unexpected response structure:', response);
        setApplications([]);
        setTotalPages(1);
        setTotalApplications(0);
      }

      // Calculate and set stats
      const stats = calculateStats(applicationsData);
      setApplicationStats(stats);
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
      className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors duration-200"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1.5">
        {children}
        {sortBy === field && (
          sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-primary-600" /> : <ChevronDown className="w-3 h-3 text-primary-600" />
        )}
      </div>
    </th>
  );

  return (
    <div className="card w-full">
      {/* Header with Bulk Actions */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-bold text-neutral-900">
                    Applications
                  </h3>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md font-medium">
                      {applicationStats.shortlisted} Shortlisted
                    </span>
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md font-medium">
                      {applicationStats.rejected} Rejected
                    </span>
                  </div>
                </div>
                <p className="text-sm text-neutral-500">
                  {totalApplications} total applications
                </p>
              </div>
            </div>
            {selectedApplications.size > 0 && (
              <span className="px-4 py-2 bg-primary-100 text-primary-800 text-sm font-semibold rounded-xl border border-primary-200">
                {selectedApplications.size} selected
              </span>
            )}
          </div>
          
          {selectedApplications.size > 0 && (
            <div className="flex items-center gap-3">
              <select
                onChange={(e) => handleBulkStatusUpdate(e.target.value)}
                className="input text-sm"
              >
                <option value="">Bulk Update Status</option>
                <option value="SHORTLISTED">Shortlist</option>
                <option value="REJECTED">Rejected</option>
                <option value="PENDING">Pending</option>
              </select>
              <button
                onClick={() => setSelectedApplications(new Set())}
                className="btn-ghost btn-sm"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-neutral-100">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by expert name or email..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="input w-full pl-10"
            />
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="input text-sm"
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
      <div className="overflow-x-auto w-full">
        <table className="table-modern w-full">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left w-12">
                <input
                  type="checkbox"
                  checked={selectedApplications.size === applications.length && applications.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500 w-4 h-4"
                />
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider w-1/3">
                <div className="flex items-center gap-1.5">
                  Expert
                  {sortBy === 'expert.fullName' && (
                    sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-primary-600" /> : <ChevronDown className="w-3 h-3 text-primary-600" />
                  )}
                </div>
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider w-32">
                <div className="flex items-center gap-1.5">
                  Status
                  {sortBy === 'status' && (
                    sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-primary-600" /> : <ChevronDown className="w-3 h-3 text-primary-600" />
                  )}
                </div>
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider w-1/3">
                 Actions
               </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="px-3 py-8 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-200 border-t-primary-600"></div>
                    <p className="text-neutral-500 font-medium text-sm">Loading applications...</p>
                  </div>
                </td>
              </tr>
            ) : applications.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-3 py-8 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-neutral-400" />
                    </div>
                    <div>
                      <p className="text-neutral-600 font-semibold text-base">No applications found</p>
                      <p className="text-neutral-500 text-sm">Try adjusting your search or filter criteria</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              applications.map((application) => {
                const statusInfo = getStatusInfo(application.status);
                const StatusIcon = statusInfo.icon;

                                 return (
                   <tr 
                     key={application.id} 
                     className="hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 transition-all duration-200 border-l-4 border-l-transparent hover:border-l-primary-500 group"
                   >
                    <td className="px-3 py-2 w-12">
                      <input
                        type="checkbox"
                        checked={selectedApplications.has(application.id)}
                        onChange={() => handleSelectApplication(application.id)}
                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500 w-4 h-4"
                      />
                    </td>
                    <td className="px-3 py-2 w-1/3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center shadow-sm">
                          <User className="w-4 h-4 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-neutral-900 truncate">
                            {application.expert.fullName}
                          </div>
                          <div className="text-xs text-neutral-600 truncate">
                            {application.expert.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 w-32">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold border ${statusInfo.bgColor} ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1.5" />
                          {statusInfo.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 w-1/3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewProfile(application.expert);
                          }}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-all duration-200 border border-primary-200"
                          title="View Expert Profile"
                        >
                          <User className="w-3 h-3 mr-1.5" />
                          View Profile
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(application);
                          }}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-all duration-200 border border-primary-200"
                          title="Update Status"
                        >
                          <CheckCircle className="w-3 h-3 mr-1.5" />
                          Update Status
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
                          className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-success-600 bg-success-50 rounded-lg hover:bg-success-100 transition-all duration-200 border border-success-200"
                          title="Contact Expert via Email"
                        >
                          <Mail className="w-3 h-3 mr-1.5" />
                          Contact
                        </button>
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
        <div className="p-6 border-t border-neutral-200 bg-gradient-to-r from-neutral-50 to-neutral-100">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-600 font-medium">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalApplications)} of {totalApplications} results
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-neutral-700 font-semibold bg-white rounded-xl border border-neutral-200">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
