import React, { useState, useRef } from 'react';
import {
    FileText,
    X,
    Search,
    Plus,
    Filter,
    ChevronDown,
    Briefcase,
    Globe,
    AlertCircle
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

    const handleInputChange = (e) => {
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

    // Reusable Form Input Component within Tab
    const FormInput = ({ label, type = "text", name, value, onChange, placeholder, required = false, ...props }) => (
        <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-[3px] text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all placeholder:text-slate-400"
                {...props}
            />
        </div>
    );

    const FormTextarea = ({ label, name, value, onChange, placeholder, required = false, rows = 4 }) => (
        <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                rows={rows}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-[3px] text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all placeholder:text-slate-400 resize-none"
            />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            {/* Header / Actions Section */}
            {!showForm && !showEditForm && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Requirement Management</h2>
                        <p className="text-slate-500 text-sm mt-1">Create and manage your expert requirements</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full sm:w-80 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                value={requirementsSearch}
                                onChange={(e) => (onRequirementsSearchChange ? onRequirementsSearchChange(e.target.value) : setRequirementsSearch(e.target.value))}
                                placeholder="Search requirements..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                            />
                        </div>
                        <button
                            onClick={() => onCreateRequirementClick(setShowForm)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-[3px] text-sm font-bold hover:bg-slate-800 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <Plus className="w-4 h-4" />
                            New Requirement
                        </button>
                    </div>
                </div>
            )}

            {/* Edit / Create Forms */}
            {(showForm || showEditForm) && (
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 sm:p-8" ref={editFormRef}>
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    {showEditForm ? 'Edit Requirement' : 'Create New Requirement'}
                                </h2>
                                <p className="text-slate-500 text-sm mt-1">
                                    Fill in the details below to find the perfect expert.
                                </p>
                            </div>
                            <button
                                onClick={showEditForm ? handleCancelEdit : () => setShowForm(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={showEditForm ? handleUpdate : handleSubmit} className="space-y-6">
                            <div className="space-y-6">
                                <FormInput
                                    label="Requirement Title"
                                    name="title"
                                    value={requirementForm.title || ''}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Guest Lecture on AI Trends"
                                    required
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                                            Category <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="category"
                                                value={requirementForm.category}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-[3px] text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all appearance-none cursor-pointer"
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
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    {showCustomCategoryInput && (
                                        <FormInput
                                            label="Custom Category"
                                            name="customCategory"
                                            value={customCategory}
                                            onChange={handleCustomCategoryChange}
                                            placeholder="Enter category name"
                                            required
                                        />
                                    )}
                                </div>

                                <FormTextarea
                                    label="Description"
                                    name="description"
                                    value={requirementForm.description || ''}
                                    onChange={handleInputChange}
                                    placeholder="Describe your requirement in detail..."
                                    required
                                    rows={5}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                                            Budget (₹)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                                            <input
                                                type="number"
                                                name="budget"
                                                value={requirementForm.budget}
                                                onChange={handleInputChange}
                                                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-[3px] text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all placeholder:text-slate-400"
                                                placeholder="0"
                                                min="0"
                                            />
                                        </div>
                                    </div>

                                    <FormInput
                                        label="Deadline"
                                        type="date"
                                        name="deadline"
                                        value={requirementForm.deadline || ''}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormTextarea
                                        label="Required Skills"
                                        name="requiredSkills"
                                        value={requirementForm.requiredSkills || ''}
                                        onChange={handleInputChange}
                                        placeholder="E.g. Python, Machine Learning, Public Speaking"
                                        rows={3}
                                    />
                                    <FormTextarea
                                        label="Experience Required"
                                        name="experience"
                                        value={requirementForm.experience || ''}
                                        onChange={handleInputChange}
                                        placeholder="E.g. 5+ years in Industry, PhD preferred"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex items-center gap-2 p-4 bg-slate-50 rounded border border-slate-100">
                                    <input
                                        type="checkbox"
                                        id="isUrgent"
                                        name="isUrgent"
                                        checked={requirementForm.isUrgent}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-slate-900 focus:ring-slate-900 border-slate-300 rounded cursor-pointer"
                                    />
                                    <label htmlFor="isUrgent" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                                        Mark this requirement as Urgent
                                    </label>
                                    <span className="text-xs text-slate-400 ml-auto">Prioritizes visibility</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
                                <button
                                    type="button"
                                    onClick={showEditForm ? handleCancelEdit : () => setShowForm(false)}
                                    className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-[3px] text-sm font-bold hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-slate-900 text-white rounded-[3px] text-sm font-bold hover:bg-slate-800 transition-all shadow-sm hover:shadow-md"
                                >
                                    {showEditForm ? 'Update Requirement' : 'Create Requirement'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* List View */}
            {!showForm && !showEditForm && (
                <div className="space-y-6">
                    {loading && requirements.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent mb-4"></div>
                            <p className="text-slate-500 font-medium">Loading your requirements...</p>
                        </div>
                    ) : requirements.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-xl border border-slate-200/60 shadow-sm">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <Briefcase className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">No requirements yet</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mb-6 text-sm">
                                Create your first requirement to start connecting with top industry experts.
                            </p>
                            <button
                                onClick={() => onCreateRequirementClick(setShowForm)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-[3px] text-sm font-bold hover:bg-slate-800 transition-all shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Create Requirement
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {requirements.map((req) => (
                                <RequirementCard
                                    key={req.id}
                                    requirement={req}
                                    variant="college"
                                    showActions={true}
                                    onView={() => handleView(req)}
                                    onEdit={() => handleEdit(req)}
                                    onDelete={onDelete}
                                    onToggle={onToggleActive}
                                    onClick={() => handleView(req)}
                                    mySubscription={mySubscription}
                                    subsLoading={subsLoading}
                                    getLimitationDetails={getLimitationDetails}
                                    showPlanLimitationModal={showPlanLimitationModal}
                                    setLimitationType={setLimitationType}
                                    apiService={apiService}
                                    revealedExpertIds={revealedExpertIds}
                                    setRevealedExpertIds={setRevealedExpertIds}
                                />
                            ))}

                            {/* Load More Trigger */}
                            {hasMore && (
                                <div className="text-center pt-6 pb-2">
                                    <button
                                        onClick={loadMoreRequirements}
                                        disabled={loadingMore}
                                        className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-[3px] text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
                                    >
                                        {loadingMore ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-3 h-3 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                                                Loading...
                                            </span>
                                        ) : 'Load More Requirements'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RequirementsTab;
