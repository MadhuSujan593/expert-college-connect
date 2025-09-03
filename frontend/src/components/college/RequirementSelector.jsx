import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, Calendar, Briefcase, X } from 'lucide-react';
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
    <div className="requirement-selector bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900">Select Requirement</h2>
        <p className="text-xs text-gray-600">
          Choose a requirement to manage its applications
        </p>
      </div>

      {/* Compact Requirement Selector */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Select a Requirement
        </label>
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              placeholder={selectedRequirement ? "Type to search..." : "Search or select requirement..."}
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
              className="w-full flex items-center justify-between p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {selectedRequirement && (
              <button
                onClick={() => {
                  onRequirementSelect(null);
                  setSearchTerm('');
                  setShowDropdown(false);
                }}
                className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </div>
          </div>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              
              {loading ? (
                <div className="p-3 text-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-xs text-gray-500 mt-2">Loading...</p>
                </div>
              ) : filteredRequirements.length === 0 ? (
                <div className="p-3 text-center text-gray-500">
                  <Briefcase className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm">No requirements found</p>
                </div>
              ) : (
                <div className="py-1">
                  {/* Requirement List */}
                  {filteredRequirements.map((requirement) => (
                    <div
                      key={requirement.id}
                      onClick={() => handleRequirementSelect(requirement)}
                      className={`p-2 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedRequirementId === requirement.id ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                      }`}
                    >
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {requirement.title}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequirementSelector;
