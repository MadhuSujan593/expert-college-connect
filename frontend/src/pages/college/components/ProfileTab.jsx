import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Activity,
    X,
    Edit3,
    CheckCircle,
    Building2,
    Save,
    MapPin,
    Globe,
    Mail,
    Phone,
    Shield
} from 'lucide-react';
import FileUpload from '../../../components/common/FileUpload';
import CountrySelector from '../../../components/common/CountrySelector';
import {
    extractPhoneWithoutCountryCode,
    detectCountryFromPhone,
    isValidPhoneNumber
} from '../../../utils/phoneUtils';

const ProfileTab = ({
    profile,
    editingProfile,
    setEditingProfile,
    profileForm,
    setProfileForm,
    onUpdate,
    onCancel,
    logoFile,
    setLogoFile,
    showToast,
    setProfile,
    getFullLogoUrl,
    user,
    emailChanged,
    phoneChanged,
    originalEmail,
    originalPhone,
    onEmailVerification,
    onPhoneVerification,
    onSendEmailOtp,
    onSendPhoneOtp,
    isEmailSending,
    isPhoneSending,
    isEmailVerifying,
    isPhoneVerifying,
    emailOtpSent,
    phoneOtpSent,
    showEmailVerification,
    showPhoneVerification,
    setShowEmailVerification,
    setShowPhoneVerification,
    handleProfileInputChange,
    currentEmailVerified,
    currentPhoneVerified,
    stats,
    selectedCountry,
    setSelectedCountry,
    isValidEmail,
    isValidPhone,
    apiService
}) => {
    const [logoPreview, setLogoPreview] = useState(profile?.logoUrl || null);
    const [logoUploading, setLogoUploading] = useState(false);

    // Update logo preview when profile changes
    useEffect(() => {
        setLogoPreview(profile?.logoUrl || null);
    }, [profile?.logoUrl]);

    // Sync profileForm with profile data and user data when they change
    useEffect(() => {
        if (profile && user) {
            setProfileForm(prev => {
                const updatedForm = {
                    ...prev,
                    email: user.email || profile.email || prev.email || '',
                    phone: user.phone || profile.phone || prev.phone || '',
                    institutionName: profile.institutionName || prev.institutionName || '',
                    contactPersonName: profile.contactPersonName || prev.contactPersonName || '',
                    institutionType: profile.institutionType || prev.institutionType || 'UNIVERSITY',
                    accreditation: profile.accreditation || prev.accreditation || '',
                    website: profile.website || prev.website || '',
                    address: profile.address || prev.address || '',
                    city: profile.city || prev.city || '',
                    state: profile.state || prev.state || '',
                    country: profile.country || prev.country || '',
                    postalCode: profile.postalCode || prev.postalCode || '',
                    logoUrl: profile.logoUrl || prev.logoUrl || '',
                    description: profile.description || prev.description || '',
                };
                return updatedForm;
            });
        }
    }, [profile, user, setProfileForm]);

    const handleLogoRemove = async () => {
        try {
            const response = await apiService.removeCollegeLogo();
            setLogoPreview(null);
            setLogoFile(null);
            setProfileForm(prev => ({ ...prev, logoUrl: null }));
            setProfile(prev => ({ ...prev, logoUrl: null }));
            showToast('success', 'Logo removed successfully!');
        } catch (error) {
            console.error('❌ Logo removal error:', error);
            showToast('error', `Failed to remove logo: ${error.message}`);
        }
    };

    const handleSave = async () => {
        if (onUpdate) {
            onUpdate();
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: "easeOut" }
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-5xl mx-auto"
        >
            {/* Header / Actions Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Institution Profile</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage your college information and public presence</p>
                </div>

                <div className="flex items-center gap-3">
                    {editingProfile ? (
                        <>
                            <button
                                onClick={onCancel}
                                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-[3px] text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-[3px] text-xs font-bold hover:bg-slate-800 transition-all shadow-sm hover:shadow-md"
                            >
                                <Save className="w-3.5 h-3.5" />
                                Save Changes
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setEditingProfile(true)}
                            className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-[3px] text-xs font-bold hover:bg-slate-800 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Logo & Completion Status */}
                <div className="space-y-6">
                    {/* Profile Completion Card */}
                    <div className="bg-white rounded-sm border border-slate-200/60 shadow-sm overflow-hidden p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-indigo-500" />
                                Profile Strength
                            </h3>
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-sm">
                                {stats.profileCompleteness || 0}%
                            </span>
                        </div>

                        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-indigo-500 to-violet-500 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${stats.profileCompleteness || 0}%` }}
                            />
                        </div>

                        {stats.profileCompleteness < 100 && (
                            <div className="space-y-2">
                                <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">Complete these to reach 100%</p>
                                <ul className="space-y-1.5">
                                    {[
                                        !profile?.logoUrl && "Upload logo",
                                        (!profile?.institutionName || profile?.institutionName === 'Not specified') && "Institution Name",
                                        (!profile?.contactPersonName || profile?.contactPersonName === 'Not specified') && "Contact Person",
                                        (!profile?.institutionType || profile?.institutionType === 'Not specified') && "Institution Type",
                                        (!profile?.description || profile?.description === 'Not specified') && "Description",
                                        (!profile?.address || profile?.address === 'Not specified') && "Address",
                                    ].filter(Boolean).slice(0, 3).map((missing, i) => (
                                        <li key={i} className="text-xs text-slate-600 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                            {missing}
                                        </li>
                                    ))}
                                    {/* Show count if more than 3 */}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Logo Upload Card */}
                    <div className="bg-white rounded-sm border border-slate-200/60 shadow-sm p-5">
                        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-slate-400" />
                            Institution Logo
                        </h3>
                        <div className="flex justify-center">
                            <FileUpload
                                isEditing={editingProfile}
                                onFileSelect={async (file) => {
                                    try {
                                        setLogoUploading(true);
                                        const response = await apiService.uploadCollegeLogo(file);
                                        if (response && response.logoUrl) {
                                            setProfileForm(prev => ({ ...prev, logoUrl: response.logoUrl }));
                                            setLogoPreview(response.logoUrl);
                                            setLogoFile(null);
                                            setProfile(prev => ({ ...prev, logoUrl: response.logoUrl }));
                                            showToast('success', 'Logo uploaded successfully!');
                                        }
                                    } catch (error) {
                                        showToast('error', 'Failed to upload logo');
                                        setLogoFile(null);
                                        setLogoPreview(profile?.logoUrl || null);
                                    } finally {
                                        setLogoUploading(false);
                                    }
                                }}
                                onRemove={handleLogoRemove}
                                accept="image/*"
                                maxSize={5}
                                type="image"
                                currentFile={getFullLogoUrl(profile?.logoUrl)}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Profile Details Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-sm border border-slate-200/60 shadow-sm p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

                            {/* Section: Basic Info */}
                            <div className="md:col-span-2 pb-2 mb-2 border-b border-slate-100">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Basic Information</h4>
                            </div>

                            <FormInput
                                label="Institution Name"
                                name="institutionName"
                                value={editingProfile ? profileForm.institutionName : (profile?.institutionName || 'Not specified')}
                                onChange={handleProfileInputChange}
                                isEditing={editingProfile}
                                placeholder="e.g. Stanford University"
                                type="text"
                                icon={<Building2 className="w-3.5 h-3.5" />}
                            />

                            <FormInput
                                label="Institution Type"
                                name="institutionType"
                                value={editingProfile ? profileForm.institutionType : (profile?.institutionType || 'Not specified')}
                                onChange={handleProfileInputChange}
                                isEditing={editingProfile}
                                type="select"
                                options={[
                                    { value: "", label: "Select Type" },
                                    { value: "UNIVERSITY", label: "University" },
                                    { value: "COLLEGE", label: "College" },
                                    { value: "INSTITUTE", label: "Institute" },
                                    { value: "SCHOOL", label: "School" },
                                    { value: "OTHER", label: "Other" },
                                ]}
                            />

                            <div className="md:col-span-2">
                                <FormTextArea
                                    label="Description"
                                    name="description"
                                    value={editingProfile ? profileForm.description : (profile?.description || 'Not specified')}
                                    onChange={handleProfileInputChange}
                                    isEditing={editingProfile}
                                    placeholder="Brief description of your institution..."
                                    rows={3}
                                />
                            </div>

                            {/* Section: Contact Details */}
                            <div className="md:col-span-2 pb-2 mb-2 mt-4 border-b border-slate-100">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Details</h4>
                            </div>

                            <FormInput
                                label="Contact Person"
                                name="contactPersonName"
                                value={editingProfile ? profileForm.contactPersonName : (profile?.contactPersonName || 'Not specified')}
                                onChange={handleProfileInputChange}
                                isEditing={editingProfile}
                                placeholder="Full Name"
                                type="text"
                            />

                            <FormInput
                                label="Website"
                                name="website"
                                value={editingProfile ? profileForm.website : (profile?.website || 'Not specified')}
                                onChange={handleProfileInputChange}
                                isEditing={editingProfile}
                                placeholder="https://..."
                                type="url"
                                icon={<Globe className="w-3.5 h-3.5" />}
                            />

                            <div className="relative">
                                <FormInput
                                    label="Email Address"
                                    name="email"
                                    value={editingProfile ? profileForm.email : (user?.email || profile?.email || 'Not specified')}
                                    onChange={handleProfileInputChange}
                                    isEditing={editingProfile}
                                    disabled={true} // Email typically read-only or requires special flow
                                    placeholder="email@example.com"
                                    type="email"
                                    icon={<Mail className="w-3.5 h-3.5" />}
                                    className="bg-slate-50 text-slate-500"
                                />
                                {user?.isEmailVerified && (
                                    <div className="absolute right-3 top-[34px]">
                                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                {/* Phone Input Logic - Simplified for this layout */}
                                <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                                    Phone
                                </label>
                                {editingProfile ? (
                                    <div className="space-y-1">
                                        <div className="flex">
                                            <CountrySelector
                                                selectedCountry={selectedCountry}
                                                onCountryChange={setSelectedCountry}
                                                className="shrink-0 rounded-r-none border-r-0"
                                            />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={profileForm.phone ? extractPhoneWithoutCountryCode(profileForm.phone) : ''}
                                                onChange={handleProfileInputChange}
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-r-[3px] text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all placeholder:text-slate-300"
                                                placeholder="1234567890"
                                            />
                                        </div>
                                        {profileForm.phone && !isValidPhoneNumber(profileForm.phone) && (
                                            <p className="text-[10px] text-red-500 font-medium">Invalid phone number format</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[3px] text-sm text-slate-600">
                                        {(() => {
                                            const displayPhone = profile?.phone || user?.phone || 'Not specified';
                                            const detectedCountry = displayPhone !== 'Not specified' ? detectCountryFromPhone(displayPhone) : null;

                                            return (
                                                <div className="flex items-center gap-2">
                                                    {detectedCountry && <span>{detectedCountry.dialCode}</span>}
                                                    <span>{displayPhone !== 'Not specified' ? extractPhoneWithoutCountryCode(displayPhone) : displayPhone}</span>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>

                            {/* Section: Location Info */}
                            <div className="md:col-span-2 pb-2 mb-2 mt-4 border-b border-slate-100">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location Details</h4>
                            </div>

                            <div className="md:col-span-2">
                                <FormTextArea
                                    label="Address"
                                    name="address"
                                    value={editingProfile ? profileForm.address : (profile?.address || 'Not specified')}
                                    onChange={handleProfileInputChange}
                                    isEditing={editingProfile}
                                    placeholder="Full street address..."
                                    rows={2}
                                />
                            </div>

                            <FormInput
                                label="City"
                                name="city"
                                value={editingProfile ? profileForm.city : (profile?.city || 'Not specified')}
                                onChange={handleProfileInputChange}
                                isEditing={editingProfile}
                                type="text"
                            />

                            <FormInput
                                label="State"
                                name="state"
                                value={editingProfile ? profileForm.state : (profile?.state || 'Not specified')}
                                onChange={handleProfileInputChange}
                                isEditing={editingProfile}
                                type="text"
                            />

                            <FormInput
                                label="Country"
                                name="country"
                                value={editingProfile ? profileForm.country : (profile?.country || 'Not specified')}
                                onChange={handleProfileInputChange}
                                isEditing={editingProfile}
                                type="text"
                            />

                            <FormInput
                                label="Postal Code"
                                name="postalCode"
                                value={editingProfile ? profileForm.postalCode : (profile?.postalCode || 'Not specified')}
                                onChange={handleProfileInputChange}
                                isEditing={editingProfile}
                                type="text"
                            />

                            <div className="md:col-span-2">
                                <FormInput
                                    label="Accreditation"
                                    name="accreditation"
                                    value={editingProfile ? profileForm.accreditation : (profile?.accreditation || 'Not specified')}
                                    onChange={handleProfileInputChange}
                                    isEditing={editingProfile}
                                    type="text"
                                    icon={<Shield className="w-3.5 h-3.5" />}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Sub-components for cleaner code
const FormInput = ({ label, name, value, onChange, isEditing, type = "text", placeholder, options, icon, disabled, className }) => {
    return (
        <div className="w-full">
            <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1.5">
                {icon && <span className="text-slate-400">{icon}</span>}
                {label}
            </label>
            {isEditing && !disabled ? (
                type === 'select' ? (
                    <div className="relative">
                        <select
                            name={name}
                            value={value}
                            onChange={onChange}
                            className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-[3px] text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all appearance-none ${className}`}
                        >
                            {options.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                    </div>
                ) : (
                    <input
                        type={type}
                        name={name}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-[3px] text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all placeholder:text-slate-300 ${className}`}
                    />
                )
            ) : (
                <div className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[3px] text-sm text-slate-600 truncate ${className}`}>
                    {type === 'select' && options
                        ? (options.find(o => o.value === value)?.label || value)
                        : value}
                </div>
            )}
        </div>
    );
};

const FormTextArea = ({ label, name, value, onChange, isEditing, placeholder, rows = 3 }) => {
    return (
        <div className="w-full">
            <label className="block text-xs font-bold text-slate-600 mb-1.5">{label}</label>
            {isEditing ? (
                <textarea
                    name={name}
                    value={value}
                    onChange={onChange}
                    rows={rows}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-[3px] text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all placeholder:text-slate-300 resize-none"
                />
            ) : (
                <div className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[3px] text-sm text-slate-600 resize-none min-h-[80px whitespace-pre-wrap">
                    {value}
                </div>
            )}
        </div>
    );
};

export default ProfileTab;
