import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, Calendar, Briefcase, X, Search } from 'lucide-react';
import apiService from '../../utils/api';

const RequirementSelector = ({ onRequirementSelect, selectedRequirementId }) => {
  const [requirements, setRequirements] = useState([]);
  const [filteredRequirements, setFilteredRequirements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch requirements
  const fetchRequirements = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/requirements/college');
      
      console.log('🔍 RequirementSelector - API Response:', response);
      
      if (response.requirements && Array.isArray(response.requirements)) {
        console.log('✅ Setting requirements:', response.requirements);
        setRequirements(response.requirements);
        setFilteredRequirements(response.requirements);
      } else {
        console.log('❌ No requirements in response:', response);
      }
    } catch (error) {
      console.error('Error fetching requirements:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter requirements based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRequirements(requirements);
    } else {
      const filtered = requirements.filter(req => 
        req.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRequirements(filtered);
    }
  }, [searchTerm, requirements]);

  useEffect(() => {
    fetchRequirements();
  }, [fetchRequirements]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.requirement-selector')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleRequirementSelect = (requirement) => {
    onRequirementSelect(requirement);
    setShowDropdown(false);
    setSearchTerm(''); // Clear search when requirement is selected
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const selectedRequirement = requirements.find(r => r.id === selectedRequirementId);

  return (
    <div className="requirement-selector">
      {/* Modern Search Bar */}
      <div className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={selectedRequirement ? "Type to search..." : "Filter by requirement (optional)..."}
            value={selectedRequirement ? selectedRequirement.title : searchTerm}
            onChange={(e) => {
              if (selectedRequirement) {
                // If there's a selected requirement, clear it and start searching
                onRequirementSelect(null);
                setSearchTerm(e.target.value);
              } else {
                setSearchTerm(e.target.value);
              }
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
          />
          {selectedRequirement && (
            <button
              onClick={() => {
                onRequirementSelect(null);
                setSearchTerm('');
                setShowDropdown(false);
              }}
              className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {/* Modern Dropdown */}
        {showDropdown && (
          <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-3">Loading requirements...</p>
              </div>
            ) : filteredRequirements.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium">No requirements found</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting your search terms</p>
              </div>
            ) : (
              <div className="py-2">
                {/* Requirement List */}
                {filteredRequirements.map((requirement) => (
                  <div
                    key={requirement.id}
                    onClick={() => handleRequirementSelect(requirement)}
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${
                      selectedRequirementId === requirement.id 
                        ? 'bg-blue-50 border-blue-500' 
                        : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {requirement.title}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>Posted: {formatDate(requirement.createdAt)}</span>
                          </div>
                          {requirement.department && (
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Briefcase className="w-3 h-3" />
                              <span>{requirement.department}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {selectedRequirementId === requirement.id && (
                        <div className="ml-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequirementSelector;
