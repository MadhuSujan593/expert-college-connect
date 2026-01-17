import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Edit3, Plus, Trash2, Save, Download,
    CheckCircle, Briefcase, MapPin, Mail, Phone,
    X, Globe, Award, Shield, FileText
} from 'lucide-react';
import FileUpload from '../../../components/common/FileUpload';
import CountrySelector from '../../../components/common/CountrySelector';
import api from '../../../utils/api';
import { extractPhoneDigits, detectCountryFromPhone, isValidPhoneNumber, extractPhoneWithoutCountryCode } from '../../../utils/verificationUtils';

const ExpertProfileTab = ({ profile, user, onProfileUpdate, showToast }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState({});
    const [selectedCountry, setSelectedCountry] = useState(null);

    // Skills State
    const [isAddingSkill, setIsAddingSkill] = useState(false);
    const [newSkill, setNewSkill] = useState({ skillName: '', skillLevel: 'BEGINNER' });

    // Work Experience State
    const [workExperiences, setWorkExperiences] = useState([]);
    const [isAddingExperience, setIsAddingExperience] = useState(false);
    const [newExperience, setNewExperience] = useState({
        jobTitle: '',
        company: '',
        startDate: '',
        endDate: '',
        description: '',
        isCurrent: false
    });

    // Initialize state from props
    useEffect(() => {
        if (profile && user) {
            // ... (existing initialization)
            const phoneDigits = user.phone ? extractPhoneWithoutCountryCode(user.phone) : '';

            setEditedProfile({
                fullName: user.fullName || '',
                phone: phoneDigits,
                email: user.email || '',
                jobTitle: profile.jobTitle || '',
                primaryExpertise: profile.primaryExpertise || '',
                experience: profile.experience || '',
                location: profile.location || '',
                bio: profile.bio || '',
                hourlyRate: profile.hourlyRate || '',
                resumeUrl: profile.resumeUrl || '',
                profilePicture: profile.profilePicture || ''
            });

            // Init Country
            if (user.phone) {
                const country = detectCountryFromPhone(user.phone);
                if (country) setSelectedCountry(country);
            } else {
                setSelectedCountry({ code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' });
            }
        }
    }, [profile, user]);

    // Fetch work experiences on mount
    useEffect(() => {
        if (user) {
            fetchWorkExperiences();
        }
    }, [user]);

    const fetchWorkExperiences = async () => {
        try {
            const data = await api.getWorkExperiences();
            setWorkExperiences(data || []);
        } catch (error) {
            console.error("Failed to fetch work experiences", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            // Construct payload
            const payload = {
                ...editedProfile,
                // Add country code to phone if needed
                phone: selectedCountry ? `${selectedCountry.dialCode}${editedProfile.phone}` : editedProfile.phone
            };

            // Call parent handler
            await onProfileUpdate(payload);
            setIsEditing(false);
            showToast('success', 'Profile updated successfully!');
        } catch (error) {
            console.error("Profile update failed", error);
            showToast('error', 'Failed to update profile');
        }
    };

    // --- Profile Picture Handler ---
    const handleProfilePictureUpload = async (file) => {
        try {
            await api.uploadProfilePicture(file);
            await onProfileUpdate(); // Refresh profile to get new URL
            showToast('success', 'Profile picture updated');
        } catch (error) {
            console.error('Profile picture upload failed:', error);
            showToast('error', 'Failed to upload profile picture');
        }
    };

    // --- Skills Handlers ---
    const handleAddSkill = async () => {
        if (!newSkill.skillName.trim()) return;
        try {
            await api.addExpertSkill(newSkill);
            await onProfileUpdate(); // Refresh profile
            setNewSkill({ skillName: '', skillLevel: 'BEGINNER' });
            setIsAddingSkill(false);
            showToast('success', 'Skill added successfully!');
        } catch (error) {
            showToast('error', 'Failed to add skill');
        }
    };

    const handleRemoveSkill = async (skillId) => {
        try {
            await api.removeExpertSkill(skillId);
            await onProfileUpdate();
            showToast('success', 'Skill removed');
        } catch (error) {
            showToast('error', 'Failed to remove skill');
        }
    };

    // --- Work Experience Handlers ---
    const handleAddExperience = async () => {
        if (!newExperience.jobTitle || !newExperience.company) {
            showToast('error', 'Job title and company are required');
            return;
        }
        try {
            await api.addWorkExperience(newExperience);
            await fetchWorkExperiences();
            setNewExperience({
                jobTitle: '',
                company: '',
                startDate: '',
                endDate: '',
                description: '',
                isCurrent: false
            });
            setIsAddingExperience(false);
            showToast('success', 'Work experience added');
        } catch (error) {
            showToast('error', 'Failed to add experience');
        }
    };

    const handleRemoveExperience = async (id) => {
        try {
            await api.removeWorkExperience(id);
            await fetchWorkExperiences();
            showToast('success', 'Experience removed');
        } catch (error) {
            showToast('error', 'Failed to remove experience');
        }
    };


    // Render Helpers
    const renderField = (label, name, placeholder, type = "text", fullWidth = false) => (
        <div className={fullWidth ? "md:col-span-2" : ""}>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">{label}</label>
            {type === 'textarea' ? (
                <textarea
                    name={name}
                    value={isEditing ? editedProfile[name] : (profile?.[name] || '')}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-[3px] focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 text-sm transition-colors resize-none font-medium text-slate-800"
                    placeholder={placeholder}
                />
            ) : (
                <input
                    type={type}
                    name={name}
                    value={isEditing ? editedProfile[name] : (name === 'fullName' ? (profile?.user?.fullName || '') : name === 'email' ? (user?.email || '') : (profile?.[name] || ''))}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-[3px] focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 text-sm transition-colors font-medium text-slate-800"
                    placeholder={placeholder}
                />
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">


                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        {/* Profile Picture Upload */}
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full border-4 border-indigo-50 shadow-sm overflow-hidden bg-slate-100 flex-shrink-0">
                                {profile?.profilePicture ? (
                                    <img
                                        src={profile.profilePicture.startsWith('http') ? profile.profilePicture : `${import.meta.env.VITE_BASE_URL}/${profile.profilePicture}`}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <User className="w-10 h-10" />
                                    </div>
                                )}
                            </div>

                            {/* Overlay for upload */}
                            <label className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Edit3 className="w-6 h-6 text-white" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) handleProfilePictureUpload(e.target.files[0]);
                                    }}
                                />
                            </label>
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{profile?.user?.fullName || 'Expert'}</h1>
                            <p className="text-slate-500 font-medium">{profile?.jobTitle || 'No Job Title'}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                {profile?.location && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5" /> {profile.location}
                                    </span>
                                )}
                                {user?.email && (
                                    <span className="flex items-center gap-1">
                                        <Mail className="w-3.5 h-3.5" /> {user.email}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-[3px] font-bold text-sm transition-all ${isEditing
                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                                }`}
                        >
                            {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Form Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Personal Details & Work Experience */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-indigo-600" />
                            Personal Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {renderField("Full Name", "fullName", "Enter full name")}
                            {renderField("Job Title", "jobTitle", "e.g. Senior Lecturer")}

                            {/* Custom Phone Input */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Phone Number</label>
                                <div className="flex">
                                    <CountrySelector
                                        selectedCountry={selectedCountry}
                                        onCountryChange={setSelectedCountry}
                                        disabled={!isEditing}
                                        className="flex-shrink-0"
                                    />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={isEditing ? editedProfile.phone : (user?.phone ? extractPhoneWithoutCountryCode(user.phone) : '')}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2.5 border border-slate-200 border-l-0 rounded-r-[3px] focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 text-sm font-medium text-slate-800"
                                        placeholder="9876543210"
                                    />
                                </div>
                            </div>

                            {renderField("Email", "email", "email@example.com", "email")}
                            {renderField("Location", "location", "City, Country")}
                            {renderField("Hourly Rate (₹)", "hourlyRate", "2000", "number")}
                            {renderField("Bio", "bio", "Tell us about your experience...", "textarea", true)}
                        </div>

                        {isEditing && (
                            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-[3px] font-bold text-sm hover:bg-indigo-700 transition-all shadow-sm"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Work Experience Section */}
                    {/* Work Experience Section */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-indigo-600" />
                                Work Experience
                            </h3>
                            <button
                                onClick={() => setIsAddingExperience(!isAddingExperience)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-[3px] text-xs font-bold transition-all ${isAddingExperience ? 'bg-slate-100 text-slate-600' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                            >
                                <Plus className={`w-3.5 h-3.5 transition-transform ${isAddingExperience ? 'rotate-45' : ''}`} />
                                {isAddingExperience ? 'Cancel' : 'Add Experience'}
                            </button>
                        </div>

                        <AnimatePresence>
                            {isAddingExperience && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Add New Position</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div className="md:col-span-2">
                                                <input
                                                    type="text"
                                                    placeholder="Job Title"
                                                    value={newExperience.jobTitle}
                                                    onChange={e => setNewExperience({ ...newExperience, jobTitle: e.target.value })}
                                                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-[3px] focus:ring-1 focus:ring-indigo-500 font-medium"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <input
                                                    type="text"
                                                    placeholder="Company Name"
                                                    value={newExperience.company}
                                                    onChange={e => setNewExperience({ ...newExperience, company: e.target.value })}
                                                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-[3px] focus:ring-1 focus:ring-indigo-500 font-medium"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 mb-1">Start Date</label>
                                                <input
                                                    type="date"
                                                    value={newExperience.startDate}
                                                    onChange={e => setNewExperience({ ...newExperience, startDate: e.target.value })}
                                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-[3px] focus:ring-1 focus:ring-indigo-500 text-slate-600"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 mb-1">End Date</label>
                                                <div className="flex flex-col gap-2">
                                                    <input
                                                        type="date"
                                                        disabled={newExperience.isCurrent}
                                                        value={newExperience.endDate}
                                                        onChange={e => setNewExperience({ ...newExperience, endDate: e.target.value })}
                                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-[3px] focus:ring-1 focus:ring-indigo-500 text-slate-600 disabled:bg-slate-100 disabled:text-slate-400"
                                                    />
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={newExperience.isCurrent}
                                                            onChange={e => setNewExperience({ ...newExperience, isCurrent: e.target.checked })}
                                                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                        <span className="text-xs font-bold text-slate-600">I currently work here</span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="md:col-span-2">
                                                <textarea
                                                    placeholder="Description (Optional)"
                                                    value={newExperience.description}
                                                    onChange={e => setNewExperience({ ...newExperience, description: e.target.value })}
                                                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-[3px] focus:ring-1 focus:ring-indigo-500 min-h-[80px] resize-y"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-3 pt-2 border-t border-slate-200/50">
                                            <button
                                                onClick={() => setIsAddingExperience(false)}
                                                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-[3px] transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleAddExperience}
                                                className="px-6 py-2 bg-indigo-600 text-white text-xs font-bold rounded-[3px] hover:bg-indigo-700 shadow-sm transition-all"
                                            >
                                                Save Position
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-0 relative">
                            {workExperiences.length > 0 && (
                                <div className="absolute left-[7px] top-2 bottom-4 w-0.5 bg-indigo-100 rounded-full" />
                            )}

                            {workExperiences.length > 0 ? (
                                workExperiences.map((exp) => (
                                    <div key={exp.id} className="group relative pl-8 pb-8 last:pb-0">
                                        {/* Timeline Dot */}
                                        <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-white border-2 border-indigo-500 shadow-sm z-10 group-hover:scale-110 transition-transform duration-200" />

                                        <div className="flex justify-between items-start -mt-0.5">
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-base">{exp.jobTitle}</h4>
                                                <p className="text-sm font-semibold text-indigo-600 mb-1">{exp.company}</p>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-2">
                                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">
                                                        {new Date(exp.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} - {exp.isCurrent ? 'Present' : new Date(exp.endDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveExperience(exp.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-all"
                                                title="Remove experience"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        {exp.description && (
                                            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100/50 mt-1">{exp.description}</p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                    <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-900 font-semibold mb-1">No experience added</p>
                                    <p className="text-sm text-slate-500 max-w-xs mx-auto mb-4">Add your work history to build credibility with colleges.</p>
                                    <button
                                        onClick={() => setIsAddingExperience(true)}
                                        className="text-sm font-bold text-indigo-600 hover:text-indigo-700"
                                    >
                                        + Add Experience
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Right Column - Skills & Resume */}
                <div className="space-y-6">
                    {/* Resume Card */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden group">

                        <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2 relative z-10">
                            <FileText className="w-5 h-5 text-indigo-600" />
                            Resume / CV
                        </h3>
                        <FileUpload
                            type="document"
                            currentFile={profile?.resumeUrl}
                            isEditing={true}
                            onFileSelect={async (file) => {
                                try {
                                    await api.uploadResume(file);
                                    onProfileUpdate();
                                    showToast('success', 'Resume uploaded');
                                } catch (e) { showToast('error', 'Upload failed'); }
                            }}
                            onRemove={async () => {
                                try {
                                    await api.removeResume();
                                    onProfileUpdate();
                                    showToast('success', 'Resume removed');
                                } catch (e) { showToast('error', 'Remove failed'); }
                            }}
                            accept=".pdf,.doc,.docx"
                            maxSize={10}
                        />
                    </div>

                    {/* Skills Card */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                <Award className="w-5 h-5 text-indigo-600" />
                                Skills & Expertise
                            </h3>
                            <button
                                onClick={() => setIsAddingSkill(!isAddingSkill)}
                                className={`p-2 rounded-lg transition-all duration-200 ${isAddingSkill ? 'bg-slate-100 text-slate-600 rotate-45' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        <AnimatePresence>
                            {isAddingSkill && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                                    animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
                                    exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Add New Skill</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <input
                                                    type="text"
                                                    placeholder="Skill Name (e.g. React, Python)"
                                                    value={newSkill.skillName}
                                                    onChange={e => setNewSkill({ ...newSkill, skillName: e.target.value })}
                                                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-[3px] focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <select
                                                    value={newSkill.skillLevel}
                                                    onChange={e => setNewSkill({ ...newSkill, skillLevel: e.target.value })}
                                                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-[3px] focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                                >
                                                    <option value="BEGINNER">Beginner</option>
                                                    <option value="INTERMEDIATE">Intermediate</option>
                                                    <option value="ADVANCED">Advanced</option>
                                                    <option value="EXPERT">Expert</option>
                                                </select>
                                                <button
                                                    onClick={handleAddSkill}
                                                    disabled={!newSkill.skillName.trim()}
                                                    className="w-full py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-[3px] hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    Add Skill
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex flex-wrap gap-3">
                            {profile?.expertskill?.map((skill) => (
                                <div
                                    key={skill.id}
                                    className="group flex flex-col items-start gap-1 p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-indigo-300 hover:shadow-md transition-all duration-200 min-w-[120px]"
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <span className={`w-2 h-2 rounded-full ${skill.skillLevel === 'EXPERT' ? 'bg-emerald-500' :
                                            skill.skillLevel === 'ADVANCED' ? 'bg-indigo-500' :
                                                skill.skillLevel === 'INTERMEDIATE' ? 'bg-blue-400' : 'bg-slate-400'
                                            }`} />
                                        <button
                                            onClick={() => handleRemoveSkill(skill.id)}
                                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-all p-0.5"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <span className="font-bold text-slate-800 text-sm">{skill.skillName || skill.name}</span>
                                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{skill.skillLevel}</span>
                                </div>
                            ))}
                            {(!profile?.expertskill || profile.expertskill.length === 0) && (
                                <div className="w-full py-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                    <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-sm text-slate-500 font-medium">No skills added yet</p>
                                    <button
                                        onClick={() => setIsAddingSkill(true)}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 mt-1"
                                    >
                                        Add your first skill
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpertProfileTab;
