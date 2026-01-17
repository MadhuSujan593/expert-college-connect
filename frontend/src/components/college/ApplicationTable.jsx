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

      let response;
      if (requirementId) {
        // Fetch applications for specific requirement
        response = await apiService.get(`/applications/requirement/${requirementId}?${queryParams.toString()}`);
      } else {
        // Fetch all applications for the college
        response = await apiService.get(`/applications/college?${queryParams.toString()}`);
      }

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
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Filters Section */}
      <div className="px-6 py-5 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by expert name or email..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-[3px] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 hover:border-indigo-300 transition-colors text-sm"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-4 py-2.5 border border-slate-200 rounded-[3px] text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 hover:border-indigo-300 transition-colors text-sm bg-white"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedApplications.size > 0 && (
        <div className="px-6 py-3 bg-indigo-50 border-b border-indigo-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-bold text-indigo-900">
                {selectedApplications.size} application{selectedApplications.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <select
                onChange={(e) => handleBulkStatusUpdate(e.target.value)}
                className="px-3 py-1.5 border border-indigo-200 rounded-[3px] text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white font-medium"
              >
                <option value="">Bulk Update Status</option>
                <option value="SHORTLISTED">Shortlist</option>
                <option value="REJECTED">Rejected</option>
                <option value="PENDING">Pending</option>
              </select>
              <button
                onClick={() => setSelectedApplications(new Set())}
                className="px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-bold transition-colors"
                title="Clear Selection"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left w-12">
                <input
                  type="checkbox"
                  checked={selectedApplications.size === applications.length && applications.length > 0}
                  onChange={handleSelectAll}
                  className="rounded-[3px] border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                <div className="flex items-center gap-1.5 cursor-pointer hover:text-indigo-600" onClick={() => handleSort('expert.fullName')}>
                  Expert
                  {sortBy === 'expert.fullName' && (
                    sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-indigo-600" /> : <ChevronDown className="w-3 h-3 text-indigo-600" />
                  )}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                <div className="flex items-center gap-1.5 cursor-pointer hover:text-indigo-600" onClick={() => handleSort('status')}>
                  Status
                  {sortBy === 'status' && (
                    sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-indigo-600" /> : <ChevronDown className="w-3 h-3 text-indigo-600" />
                  )}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                Applied Date
              </th>
              {!requirementId && (
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Requirement
                </th>
              )}
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={requirementId ? "5" : "6"} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-indigo-600"></div>
                    <p className="text-slate-500 font-medium text-sm">Loading applications...</p>
                  </div>
                </td>
              </tr>
            ) : applications.length === 0 ? (
              <tr>
                <td colSpan={requirementId ? "5" : "6"} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200">
                      <User className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-slate-900 font-bold text-base">No applications found</p>
                      <p className="text-slate-500 text-sm">Try adjusting your search or filter criteria</p>
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
                    className="hover:bg-slate-50/80 transition-colors duration-200 group"
                  >
                    <td className="px-6 py-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedApplications.has(application.id)}
                        onChange={() => handleSelectApplication(application.id)}
                        className="rounded-[3px] border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center shadow-sm border border-slate-200 shrink-0">
                          {application.expert.profilePicture ? (
                            <img src={application.expert.profilePicture} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-slate-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                            {application.expert.fullName}
                          </div>
                          <div className="text-xs text-slate-500 truncate font-medium">
                            {application.expert.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${statusInfo.bgColor.replace('bg-', 'border-').replace('100', '200')} ${statusInfo.bgColor} ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3 mr-1.5" />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      {formatDate(application.createdAt)}
                    </td>
                    {!requirementId && (
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900">
                          {application.requirement?.title || 'N/A'}
                        </div>
                        {application.requirement?.department && (
                          <div className="text-xs text-slate-500 font-medium">
                            {application.requirement.department}
                          </div>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewProfile(application.expert);
                          }}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-slate-700 bg-white rounded-[3px] hover:bg-slate-50 transition-colors border border-slate-200 shadow-sm hover:shadow-md"
                          title="View Expert Profile"
                        >
                          <Eye className="w-3 h-3 mr-1.5" />
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(application);
                          }}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-[3px] hover:bg-slate-800 transition-colors shadow-sm hover:shadow-md"
                          title="Update Status"
                        >
                          <CheckCircle className="w-3 h-3 mr-1.5" />
                          Status
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
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
                          className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-[3px] hover:bg-indigo-100 transition-colors border border-indigo-100 shadow-sm hover:shadow-md"
                          title="Contact Expert via Email"
                        >
                          <Mail className="w-3 h-3 mr-1.5" />
                          Email
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
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500 font-medium">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalApplications)} of {totalApplications} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-[3px] hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                Previous
              </button>
              <div className="flex items-center gap-1 px-2">
                <span className="text-sm font-bold text-slate-900">{currentPage}</span>
                <span className="text-sm text-slate-400">/</span>
                <span className="text-sm font-bold text-slate-500">{totalPages}</span>
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-[3px] hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
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
