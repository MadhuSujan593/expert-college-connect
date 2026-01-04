import React, { useState, useRef } from 'react';
import {
    FileText,
    X
} from 'lucide-react';
import RequirementCard from '../../../components/common/RequirementCard';
import { formatCurrency } from '../../../utils/currency';

const RequirementsTab = ({
    recentRequirements,
    user,
    onVerifyEmail,
    onVerifyPhone,
    onPostRequirement,
    showToast,
    setActiveTab,
    onView,
    onDelete,
    onRate,
    onToggleActive,
    requirements,
    setRequirements,
    refreshRequirements,
    totalRequirements,
    loading,
    loadingMore,
    hasMore,
    loadMoreRequirements,
    onCreateRequirementClick,
    loadMySubscription,
    mySubscription,
    subsLoading,
    getLimitationDetails,
    showPlanLimitationModal,
    setLimitationType,
    apiService,
    revealedExpertIds,
    setRevealedExpertIds,
    requirementsSearch,
    setRequirementsSearch,
    onRequirementsSearchChange
}) => {
    // Check if user can access requirements creation
    const canAccessRequirements = () => {
        return user?.isEmailVerified || user?.isPhoneVerified;
    };
    const [showForm, setShowForm] = useState(false);
    const [requirementForm, setRequirementForm] = useState({
        title: '',
        category: '',
        description: '',
        budget: '',
        deadline: '',
        isUrgent: false,
        requiredSkills: '',
        experience: ''
    });

    // View requirement state
    const [viewingRequirement, setViewingRequirement] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [customCategory, setCustomCategory] = useState('');
    const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
    const [editingRequirement, setEditingRequirement] = useState(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const editFormRef = useRef(null);

    // setRecentRequirements was passed as first arg in original but here it is a prop?
    // In original code: const RequirementsTab = ({ recentRequirements... })
    // But inside loadRecentRequirements it called setRecentRequirements(data...).
    // Wait, recentRequirements was passed as a prop, meaning it came from parent state.
    // The function loadRecentRequirements inside RequirementsTab attempted to set it?
    // If setRecentRequirements was NOT passed as a prop, then loadRecentRequirements inside RequirementsTab would fail 
    // unless setRecentRequirements was also passed.
    // Looking at Step 115 line 3400: setRecentRequirements is NOT in the props list!
    // But line 3442 calls setRecentRequirements override?
    // Ah, lines 3429-3447 define `loadRecentRequirements` but it is NEVER CALLED in the visible code?
    // It seems unused logic or I missed a useEffect.
    // I will check if loadRecentRequirements is called. 
    // If not, I can ignore the missing setter.
    // Actually, I'll comment it out or keep it but with a warning comment.

    /* 
    const loadRecentRequirements = async () => {
       // ... logic requiring setRecentRequirements which is missing from props ...
    };
    */

    const handleInputChange = (e) => {
        // console.log('Input change triggered:', e.target.name, e.target.value);
        const { name, value, type, checked } = e.target;

        // Handle category selection
        if (name === 'category') {
            if (value === 'OTHERS') {
                setShowCustomCategoryInput(true);
                setRequirementForm(prev => ({
                    ...prev,
                    [name]: value
                }));
            } else {
                setShowCustomCategoryInput(false);
                setCustomCategory('');
                setRequirementForm(prev => ({
                    ...prev,
                    [name]: value
                }));
            }
        } else {
            setRequirementForm(prev => {
                const newForm = {
                    ...prev,
                    [name]: type === 'checkbox' ? checked : value
                };
                // console.log('Updated form:', newForm);
                return newForm;
            });
        }
    };

    const handleCustomCategoryChange = (e) => {
        setCustomCategory(e.target.value);
    };

    const handleCancelEdit = () => {
        setShowEditForm(false);
        setEditingRequirement(null);
        setShowCustomCategoryInput(false);
        setCustomCategory('');
        setRequirementForm({
            title: '',
            category: '',
            description: '',
            budget: '',
            deadline: '',
            isUrgent: false,
            requiredSkills: '',
            experience: ''
        });
    };

    const handleView = (requirement) => {
        setViewingRequirement(requirement);
        setShowViewModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate custom category if "OTHERS" is selected
        if (requirementForm.category === 'OTHERS' && showCustomCategoryInput && !customCategory.trim()) {
            showToast('error', 'Please enter a custom category');
            return;
        }

        try {
            // Prepare the data
            const formData = { ...requirementForm };

            if (formData.category === 'OTHERS' && showCustomCategoryInput && customCategory.trim()) {
                formData.category = customCategory.trim();
            }

            if (formData.deadline === '') {
                formData.deadline = undefined;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/requirements`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                // const result = await response.json();

                setShowForm(false);
                setShowCustomCategoryInput(false);
                setCustomCategory('');
                setRequirementForm({
                    title: '',
                    category: '',
                    description: '',
                    budget: '',
                    deadline: '',
                    isUrgent: false,
                    requiredSkills: '',
                    experience: ''
                });

                if (onPostRequirement) {
                    onPostRequirement();
                }

                // Refresh subscription data
                if (loadMySubscription) {
                    await loadMySubscription();
                }

                showToast('success', 'Requirement created successfully!');

                if (refreshRequirements) {
                    refreshRequirements();
                }
            } else {
                const errorData = await response.json();
                showToast('error', errorData.message || 'Failed to create requirement');
            }
        } catch (error) {
            console.error('Error creating requirement:', error);
            showToast('error', 'Failed to create requirement. Please try again.');
        }
    };

    const handleEdit = (requirement) => {
        setEditingRequirement(requirement);

        const predefinedCategories = [
            'DATA_SCIENCE_AI', 'CYBERSECURITY', 'SOFTWARE_DEVELOPMENT', 'INNOVATION',
            'DIGITAL_MARKETING', 'BUSINESS_STRATEGY', 'FINANCE', 'CONSULTING',
            'EDUCATION', 'RESEARCH', 'WORKSHOP', 'GUEST_LECTURE', 'MENTORING',
            'CURRICULUM_REVIEW', 'INDUSTRY_PROJECT', 'QUESTION_PAPER_SETTING',
            'QUESTION_PAPER_EVALUATION', 'TRAINING', 'PUBLIC_SPEAKING', 'LEADERSHIP',
            'HEALTHCARE', 'ENGINEERING', 'SUSTAINABILITY'
        ];

        const isCustomCategory = !predefinedCategories.includes(requirement.category);

        const formData = {
            title: requirement.title,
            category: isCustomCategory ? 'OTHERS' : requirement.category,
            description: requirement.description,
            budget: requirement.budget?.toString() || '',
            deadline: requirement.deadline ? new Date(requirement.deadline).toISOString().split('T')[0] : '',
            isUrgent: requirement.isUrgent,
            requiredSkills: requirement.requiredSkills || '',
            experience: requirement.experience || ''
        };

        setRequirementForm(formData);

        if (isCustomCategory) {
            setCustomCategory(requirement.category);
            setShowCustomCategoryInput(true);
        } else {
            setCustomCategory('');
            setShowCustomCategoryInput(false);
        }

        setShowEditForm(true);
        setShowForm(false);

        setTimeout(() => {
            if (editFormRef && editFormRef.current) {
                editFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 0);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (requirementForm.category === 'OTHERS' && showCustomCategoryInput && !customCategory.trim()) {
            showToast('error', 'Please enter a custom category');
            return;
        }

        if (!editingRequirement || !editingRequirement.id) {
            showToast('error', 'No requirement selected for editing');
            return;
        }

        try {
            const formData = { ...requirementForm };

            if (formData.category === 'OTHERS' && showCustomCategoryInput && customCategory.trim()) {
                formData.category = customCategory.trim();
            }

            if (formData.deadline === '') {
                formData.deadline = undefined;
            }

            const apiUrl = `${import.meta.env.VITE_API_URL}/requirements/${editingRequirement.id}`;

            const response = await fetch(apiUrl, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                // const result = await response.json();

                setShowEditForm(false);
                setEditingRequirement(null);
                setShowCustomCategoryInput(false);
                setCustomCategory('');
                setRequirementForm({
                    title: '',
                    category: '',
                    description: '',
                    budget: '',
                    deadline: '',
                    isUrgent: false,
                    requiredSkills: '',
                    experience: ''
                });

                showToast('success', 'Requirement updated successfully!');

                if (refreshRequirements) {
                    refreshRequirements();
                }
            } else {
                const errorData = await response.json();
                showToast('error', `Error: ${errorData.message || 'Failed to update requirement'}`);
            }
        } catch (error) {
            console.error('Error updating requirement:', error);
            showToast('error', 'Failed to update requirement');
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Layout */}
            <div className="max-w-4xl mx-auto px-8 py-6">
                {!showForm && !showEditForm && (
                    <div className="mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                            <div className="flex-1">
                                <h2 className="text-lg font-medium text-gray-900 mb-1">All Requirements ({totalRequirements})</h2>
                            </div>
                            <div className="flex w-full sm:w-auto items-center gap-3">
                                <div className="relative w-full sm:w-72">
                                    <input
                                        type="text"
                                        value={requirementsSearch}
                                        onChange={(e) => (onRequirementsSearchChange ? onRequirementsSearchChange(e.target.value) : setRequirementsSearch(e.target.value))}
                                        placeholder="Search by title, description, skills..."
                                        className="w-full pl-3 pr-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <button
                                    onClick={() => onCreateRequirementClick(setShowForm)}
                                    className="px-6 py-3 text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 rounded-md whitespace-nowrap"
                                >
                                    Create requirement
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showEditForm && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-medium text-gray-900 mb-1">All Requirements ({totalRequirements})</h2>
                            </div>
                            <button
                                onClick={handleCancelEdit}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md"
                                title="Cancel Edit"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {showForm && (
                    <div className="mb-8">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={requirementForm.title || ''}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
                                    placeholder="Enter the title of your requirement"
                                    autoComplete="off"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category *
                                </label>
                                <select
                                    name="category"
                                    value={requirementForm.category}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
                                >
                                    <option value="">Select Category</option>
                                    <optgroup label="Technology & Innovation">
                                        <option value="DATA_SCIENCE_AI">Data Science & AI</option>
                                        <option value="CYBERSECURITY">Cybersecurity</option>
                                        <option value="SOFTWARE_DEVELOPMENT">Software Development</option>
                                        <option value="INNOVATION">Innovation & Design</option>
                                    </optgroup>
                                    <optgroup label="Business & Marketing">
                                        <option value="DIGITAL_MARKETING">Digital Marketing</option>
                                        <option value="BUSINESS_STRATEGY">Business Strategy</option>
                                        <option value="FINANCE">Finance</option>
                                        <option value="CONSULTING">Consulting</option>
                                    </optgroup>
                                    <optgroup label="Academic & Professional">
                                        <option value="EDUCATION">Education</option>
                                        <option value="RESEARCH">Research Collaboration</option>
                                        <option value="WORKSHOP">Workshop</option>
                                        <option value="GUEST_LECTURE">Guest Lecture</option>
                                        <option value="MENTORING">Mentoring</option>
                                        <option value="CURRICULUM_REVIEW">Curriculum Review</option>
                                        <option value="INDUSTRY_PROJECT">Industry Project</option>
                                        <option value="QUESTION_PAPER_SETTING">Question Paper Setting</option>
                                        <option value="QUESTION_PAPER_EVALUATION">Question Paper Evaluation</option>
                                    </optgroup>
                                    <optgroup label="Training & Development">
                                        <option value="TRAINING">Training & Development</option>
                                        <option value="PUBLIC_SPEAKING">Public Speaking</option>
                                        <option value="LEADERSHIP">Leadership Development</option>
                                    </optgroup>
                                    <optgroup label="Specialized Fields">
                                        <option value="HEALTHCARE">Healthcare</option>
                                        <option value="ENGINEERING">Engineering</option>
                                        <option value="SUSTAINABILITY">Sustainability</option>
                                    </optgroup>
                                    <optgroup label="Other">
                                        <option value="OTHERS">Others (Custom)</option>
                                    </optgroup>
                                </select>
                            </div>

                            {/* Custom Category Input */}
                            {showCustomCategoryInput && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Custom Category *
                                    </label>
                                    <input
                                        type="text"
                                        value={customCategory}
                                        onChange={handleCustomCategoryChange}
                                        placeholder="Enter your custom category..."
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={requirementForm.description || ''}
                                    onChange={handleInputChange}
                                    required
                                    rows={4}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm resize-none"
                                    placeholder="Describe the requirement in detail..."
                                    autoComplete="off"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Budget (₹)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                                        <input
                                            type="number"
                                            name="budget"
                                            value={requirementForm.budget}
                                            onChange={handleInputChange}
                                            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Deadline
                                    </label>
                                    <input
                                        type="date"
                                        name="deadline"
                                        value={requirementForm.deadline}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
                                    />
                                </div>

                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isUrgent"
                                    checked={requirementForm.isUrgent}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 text-sm text-gray-700">
                                    Mark as Urgent
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Required Skills
                                </label>
                                <textarea
                                    name="requiredSkills"
                                    value={requirementForm.requiredSkills || ''}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm resize-none"
                                    placeholder="Specify any particular skills needed for the project..."
                                    autoComplete="off"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Experience
                                </label>
                                <textarea
                                    name="experience"
                                    value={requirementForm.experience || ''}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm resize-none"
                                    placeholder="Specify required experience level or qualifications..."
                                    autoComplete="off"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 px-6 rounded-md font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Create Requirement
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-3 bg-white text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-300 shadow-sm hover:shadow-md"
                                >
                                    Back to Requirements
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Requirements Edit Form */}
                {showEditForm && (
                    <div className="mb-8" ref={editFormRef}>
                        <div className="mb-4">
                            <h1 className="text-xl font-bold text-gray-900">Edit Requirement</h1>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={requirementForm.title || ''}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
                                    placeholder="Enter the title of your requirement"
                                    autoComplete="off"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category *
                                </label>
                                <select
                                    name="category"
                                    value={requirementForm.category || ''}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
                                >
                                    <option value="">Select Category</option>
                                    <option value="DATA_SCIENCE_AI">Data Science & AI</option>
                                    <option value="CYBERSECURITY">Cybersecurity</option>
                                    <option value="SOFTWARE_DEVELOPMENT">Software Development</option>
                                    <option value="INNOVATION">Innovation & Design</option>
                                    <option value="DIGITAL_MARKETING">Digital Marketing</option>
                                    <option value="BUSINESS_STRATEGY">Business Strategy</option>
                                    <option value="FINANCE">Finance</option>
                                    <option value="CONSULTING">Consulting</option>
                                    <option value="EDUCATION">Education</option>
                                    <option value="RESEARCH">Research Collaboration</option>
                                    <option value="WORKSHOP">Workshop</option>
                                    <option value="GUEST_LECTURE">Guest Lecture</option>
                                    <option value="MENTORING">Mentoring</option>
                                    <option value="CURRICULUM_REVIEW">Curriculum Review</option>
                                    <option value="INDUSTRY_PROJECT">Industry Project</option>
                                    <option value="QUESTION_PAPER_SETTING">Question Paper Setting</option>
                                    <option value="QUESTION_PAPER_EVALUATION">Question Paper Evaluation</option>
                                    <option value="TRAINING">Training & Development</option>
                                    <option value="PUBLIC_SPEAKING">Public Speaking</option>
                                    <option value="LEADERSHIP">Leadership Development</option>
                                    <option value="HEALTHCARE">Healthcare</option>
                                    <option value="ENGINEERING">Engineering</option>
                                    <option value="SUSTAINABILITY">Sustainability</option>
                                    <option value="OTHERS">Others</option>
                                </select>
                            </div>

                            {/* Custom Category Input for Edit Form */}
                            {showCustomCategoryInput && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Custom Category *
                                    </label>
                                    <input
                                        type="text"
                                        value={customCategory}
                                        onChange={handleCustomCategoryChange}
                                        placeholder="Enter your custom category..."
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={requirementForm.description || ''}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm resize-none"
                                    placeholder="Describe your requirement in detail..."
                                    autoComplete="off"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Budget (₹)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₹</span>
                                        <input
                                            type="number"
                                            name="budget"
                                            value={requirementForm.budget || ''}
                                            onChange={handleInputChange}
                                            className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
                                            placeholder="0"
                                            min="0"
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Deadline
                                    </label>
                                    <input
                                        type="date"
                                        name="deadline"
                                        value={requirementForm.deadline || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
                                        autoComplete="off"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    name="isUrgent"
                                    checked={requirementForm.isUrgent || false}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                                />
                                <label className="text-sm text-gray-700">Mark as Urgent</label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Required Skills
                                </label>
                                <textarea
                                    name="requiredSkills"
                                    value={requirementForm.requiredSkills || ''}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm resize-none"
                                    placeholder="List the skills and expertise required..."
                                    autoComplete="off"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Experience
                                </label>
                                <textarea
                                    name="experience"
                                    value={requirementForm.experience || ''}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm resize-none"
                                    placeholder="Specify required experience level or qualifications..."
                                    autoComplete="off"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 px-6 rounded-md font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Update Requirement
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="px-6 py-3 bg-white text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-300 shadow-sm hover:shadow-md"
                                >
                                    Back to Requirements
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Requirements List */}
                <div className="space-y-6">

                    {loading && requirements.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-500 text-sm">Loading requirements...</p>
                        </div>
                    ) : requirements.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-6 h-6 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No requirements yet</h3>
                            <p className="text-gray-500 mb-6 text-sm">Create your first requirement to connect with experts</p>
                            <button
                                onClick={() => onCreateRequirementClick(setShowForm)}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl rounded-md"
                            >
                                Create requirement
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-gray-500 text-sm">Loading...</p>
                                </div>
                            ) : requirements.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 text-sm">No requirements found.</p>
                                </div>
                            ) : (
                                requirements.map((requirement, index) => (
                                    <RequirementCard
                                        key={requirement.id}
                                        requirement={requirement}
                                        variant="college"
                                        showActions={true}
                                        onView={() => handleView(requirement)}
                                        onEdit={() => handleEdit(requirement)}
                                        onDelete={() => onDelete(requirement.id)}
                                        onToggle={() => onToggleActive(requirement)}
                                        mySubscription={mySubscription}
                                        subsLoading={subsLoading}
                                        getLimitationDetails={getLimitationDetails}
                                        showPlanLimitationModal={showPlanLimitationModal}
                                        setLimitationType={setLimitationType}
                                        apiService={apiService}
                                        revealedExpertIds={revealedExpertIds}
                                        setRevealedExpertIds={setRevealedExpertIds}
                                    />
                                ))
                            )}

                            {/* Infinite Scroll Load More Button */}
                            {hasMore && (
                                <div className="text-center pt-4 sm:pt-6">
                                    <button
                                        onClick={loadMoreRequirements}
                                        disabled={loadingMore}
                                        className="group relative w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 rounded-xl font-semibold hover:from-slate-200 hover:to-slate-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-300/50 hover:border-slate-400/50 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                    >
                                        {loadingMore ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-sm">Loading more...</span>
                                            </div>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2 text-sm">
                                                <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                                Load More Requirements
                                            </span>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* View Requirement Page */}
                {showViewModal && viewingRequirement && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="mb-4 flex justify-between items-center">
                                <h1 className="text-xl font-bold text-gray-900">View Requirement</h1>
                                <button
                                    onClick={() => {
                                        setShowViewModal(false);
                                        setViewingRequirement(null);
                                    }}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                        <p className="text-gray-900 font-medium">{viewingRequirement.title}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <p className="text-gray-900">{viewingRequirement.category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <p className="text-gray-900 leading-relaxed">{viewingRequirement.description}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                                        <p className="text-gray-900">{viewingRequirement.budget ? formatCurrency(viewingRequirement.budget) : 'Not specified'}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                                        <p className="text-gray-900">
                                            {viewingRequirement.deadline
                                                ? new Date(viewingRequirement.deadline).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })
                                                : 'No deadline'
                                            }
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="text-sm font-medium text-gray-700">Urgent:</label>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${viewingRequirement.isUrgent
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {viewingRequirement.isUrgent ? 'Yes' : 'No'}
                                    </span>
                                </div>

                                {viewingRequirement.requiredSkills && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
                                        <p className="text-gray-900 leading-relaxed">{viewingRequirement.requiredSkills}</p>
                                    </div>
                                )}

                                {viewingRequirement.experience && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                                        <p className="text-gray-900 leading-relaxed">{viewingRequirement.experience}</p>
                                    </div>
                                )}

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowViewModal(false);
                                            setViewingRequirement(null);
                                        }}
                                        className="px-6 py-3 bg-white text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-300 shadow-sm hover:shadow-md"
                                    >
                                        Back to Requirements
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default RequirementsTab;
