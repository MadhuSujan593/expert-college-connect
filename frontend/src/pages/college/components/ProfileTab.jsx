import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    X,
    Edit3,
    CheckCircle,
    Upload
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
    // isValidPhoneNumber, // Imported from utils now
    apiService // Added as prop
}) => {
    console.log('🔄 ProfileTab rendered with props:', {
        editingProfile,
        onUpdate: !!onUpdate,
        onCancel: !!onCancel,
        profile: !!profile,
        user: !!user
    });
    const [logoPreview, setLogoPreview] = useState(profile?.logoUrl || null);
    const [logoUploading, setLogoUploading] = useState(false);

    // Update logo preview when profile changes
    useEffect(() => {
        setLogoPreview(profile?.logoUrl || null);
    }, [profile?.logoUrl]);

    // Sync profileForm with profile data and user data when they change
    useEffect(() => {
        if (profile && user) {
            console.log('🔄 ProfileTab: Syncing profileForm with profile and user data');

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

    const handleInputChange = (e) => {
        // Use the parent's input change handler for verification tracking
        handleProfileInputChange(e);
    };

    const handleLogoRemove = async () => {
        console.log('=== LOGO REMOVAL STARTED ===');

        try {
            // Remove logo from backend
            console.log('Calling removeCollegeLogo API...');
            const response = await apiService.removeCollegeLogo();

            // Always update local state when API succeeds
            setLogoPreview(null);
            setLogoFile(null);
            setProfileForm(prev => ({ ...prev, logoUrl: null }));
            setProfile(prev => ({ ...prev, logoUrl: null }));

            console.log('Local state updated, logo removed');
            showToast('success', 'Logo removed successfully!');

        } catch (error) {
            console.error('❌ Logo removal error:', error);
            showToast('error', `Failed to remove logo: ${error.message}`);
        }
    };

    const handleSave = async () => {
        // Call the parent's update function
        if (onUpdate) {
            onUpdate();
        } else {
            console.error('onUpdate prop not provided to ProfileTab');
        }
    };

    return (
        <div className="space-y-8">
            {/* Basic Information */}
            <div className="mb-8">
                {/* Profile Completion Note */}
                <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                                <TrendingUp className="h-3 w-3 text-white" />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-900">Complete Your Profile</h4>
                                <div className="flex items-center space-x-2 mt-1">
                                    <div className="w-16 bg-gray-200 rounded-full h-1">
                                        <div
                                            className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                                            style={{ width: `${stats.profileCompleteness || 0}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs text-gray-600">
                                        {stats.profileCompleteness || 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                        {stats.profileCompleteness < 100 && (() => {
                            // Count missing fields
                            const missingFields = [];
                            if (!profile?.logoUrl) missingFields.push("Upload institution logo");
                            if (!profile?.institutionName || profile?.institutionName === 'Not specified') missingFields.push("Add institution name");
                            if (!profile?.contactPersonName || profile?.contactPersonName === 'Not specified') missingFields.push("Add contact person name");
                            if (!profile?.institutionType || profile?.institutionType === 'Not specified') missingFields.push("Select institution type");
                            if (!profile?.description || profile?.description === 'Not specified') missingFields.push("Add institution description");
                            if (!profile?.accreditation || profile?.accreditation === 'Not specified') missingFields.push("Add accreditation details");
                            if (!profile?.website || profile?.website === 'Not specified') missingFields.push("Add website URL");
                            if (!profile?.address || profile?.address === 'Not specified') missingFields.push("Add institution address");
                            if (!profile?.city || profile?.city === 'Not specified') missingFields.push("Add city");
                            if (!profile?.state || profile?.state === 'Not specified') missingFields.push("Add state");
                            if (!profile?.country || profile?.country === 'Not specified') missingFields.push("Add country");
                            if (!profile?.postalCode || profile?.postalCode === 'Not specified') missingFields.push("Add postal code");

                            // Show specific fields when 2-3 are missing, otherwise show count
                            if (missingFields.length >= 2 && missingFields.length <= 3) {
                                return (
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 mb-1">
                                            Missing:
                                        </p>
                                        <div className="space-y-0.5">
                                            {missingFields.slice(0, 3).map((field, index) => (
                                                <p key={index} className="text-xs text-gray-600">
                                                    • {field}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                );
                            } else {
                                return (
                                    <p className="text-xs text-gray-500">
                                        {missingFields.length} field{missingFields.length > 1 ? 's' : ''} remaining
                                    </p>
                                );
                            }
                        })()}
                    </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <div></div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            if (editingProfile) {
                                onCancel();
                            } else {
                                setEditingProfile(true);
                            }
                        }}
                        className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 w-auto min-w-fit shadow-lg ${editingProfile
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-blue-600/25'
                            }`}
                    >
                        {editingProfile ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                        <span className="whitespace-nowrap">{editingProfile ? 'Cancel' : 'Edit Profile'}</span>
                    </motion.button>
                </div>

                {/* Logo Upload Section */}
                <div className="mb-6 sm:mb-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3 sm:mb-4">Institution Logo</label>
                        <FileUpload
                            isEditing={editingProfile}
                            onFileSelect={async (file) => {
                                console.log('=== LOGO UPLOAD STARTED ===');

                                // Automatically upload the logo immediately (like expert profile)
                                try {
                                    setLogoUploading(true);
                                    console.log('Calling uploadCollegeLogo API...');
                                    const response = await apiService.uploadCollegeLogo(file);

                                    if (response && response.logoUrl) {
                                        console.log('✅ Logo URL received:', response.logoUrl);

                                        // Update the profile form with the new logo URL
                                        setProfileForm(prev => {
                                            const updated = { ...prev, logoUrl: response.logoUrl };
                                            return updated;
                                        });

                                        setLogoPreview(response.logoUrl);
                                        setLogoFile(null);

                                        // Update the main profile state
                                        setProfile(prev => {
                                            const updated = { ...prev, logoUrl: response.logoUrl };
                                            return updated;
                                        });

                                        showToast('success', 'Logo uploaded successfully!');
                                    } else {
                                        console.error('❌ No logoUrl in response:', response);
                                        showToast('error', 'Logo upload failed - no URL received');
                                    }
                                } catch (error) {
                                    console.error('❌ Logo upload error:', error);
                                    showToast('error', 'Failed to upload logo');

                                    // Reset on error
                                    setLogoFile(null);
                                    setLogoPreview(profile?.logoUrl || null);
                                } finally {
                                    setLogoUploading(false);
                                }
                            }}
                            onRemove={() => {
                                console.log('FileUpload onRemove callback triggered');
                                handleLogoRemove();
                            }}
                            accept="image/*"
                            maxSize={5}
                            type="image"
                            currentFile={getFullLogoUrl(profile?.logoUrl)}
                        />
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name</label>
                            {editingProfile ? (
                                <input
                                    type="text"
                                    name="institutionName"
                                    value={profileForm.institutionName || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={profile?.institutionName || 'Not specified'}
                                    disabled={true}
                                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-md border border-gray-300 disabled:bg-gray-50 disabled:text-gray-500 transition-colors text-sm"
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                            {editingProfile ? (
                                <input
                                    type="text"
                                    name="contactPersonName"
                                    value={profileForm.contactPersonName || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={profile?.contactPersonName || 'Not specified'}
                                    disabled={true}
                                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-md border border-gray-300 disabled:bg-gray-50 disabled:text-gray-500 transition-colors text-sm"
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <div className="relative">
                                {editingProfile ? (
                                    <div className="space-y-2">
                                        <div className="flex flex-col md:flex-row gap-2">
                                            <input
                                                type="email"
                                                name="email"
                                                value={profileForm.email || ''}
                                                disabled={true}
                                                className="flex-1 px-4 py-2.5 pr-12 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 bg-gray-50 disabled:bg-gray-50 disabled:text-gray-500 transition-colors text-sm"
                                                placeholder="Enter email address"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <input
                                        type="email"
                                        value={user?.email || profile?.email || 'Not specified'}
                                        disabled={true}
                                        className="w-full px-2 py-2 pr-12 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                                    />
                                )}
                                {currentEmailVerified && profileForm.email && !emailChanged && user?.isEmailVerified && (
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Institution Type field - Next to Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Institution Type</label>
                            {editingProfile ? (
                                <select
                                    name="institutionType"
                                    value={profileForm.institutionType || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
                                >
                                    <option value="">Select Type</option>
                                    <option value="UNIVERSITY">University</option>
                                    <option value="COLLEGE">College</option>
                                    <option value="INSTITUTE">Institute</option>
                                    <option value="SCHOOL">School</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={profile?.institutionType ? profile.institutionType.toLowerCase() : 'Not specified'}
                                    disabled={true}
                                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-md border border-gray-300 disabled:bg-gray-50 disabled:text-gray-500 transition-colors text-sm"
                                />
                            )}
                        </div>

                        {/* Description field - Full width, after Institution Name */}
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            {editingProfile ? (
                                <textarea
                                    name="description"
                                    value={profileForm.description || ''}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="Brief description of your institution..."
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm resize-none"
                                />
                            ) : (
                                <textarea
                                    value={profile?.description || 'Not specified'}
                                    disabled={true}
                                    rows={3}
                                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-md border border-gray-300 disabled:bg-gray-50 disabled:text-gray-500 transition-colors text-sm resize-none"
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Accreditation</label>
                            {editingProfile ? (
                                <input
                                    type="text"
                                    name="accreditation"
                                    value={profileForm.accreditation || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={profile?.accreditation || 'Not specified'}
                                    disabled={true}
                                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-md border border-gray-300 disabled:bg-gray-50 disabled:text-gray-500 transition-colors text-sm"
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                            {editingProfile ? (
                                <input
                                    type="url"
                                    name="website"
                                    value={profileForm.website || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={profile?.website || 'Not specified'}
                                    disabled={true}
                                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-md border border-gray-300 disabled:bg-gray-50 disabled:text-gray-500 transition-colors text-sm"
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <div className="relative">
                                {editingProfile ? (
                                    <div className="space-y-2">
                                        <div className="flex flex-col md:flex-row gap-2">
                                            <div className="flex flex-1">
                                                <CountrySelector
                                                    selectedCountry={selectedCountry}
                                                    onCountryChange={setSelectedCountry}
                                                    className="flex-shrink-0"
                                                />
                                                <div className="relative flex-1">
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        value={profileForm.phone ? extractPhoneWithoutCountryCode(profileForm.phone) : ''}
                                                        onChange={handleProfileInputChange}
                                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-r-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm border-l-0"
                                                        placeholder="1234567890"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        {profileForm.phone && !isValidPhoneNumber(profileForm.phone) && (
                                            <span className="text-xs text-red-600">
                                                {selectedCountry?.code === 'IN' || !selectedCountry
                                                    ? 'Please enter a valid 10-digit phone number'
                                                    : 'Please enter a valid phone number (7-15 digits)'}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-1">
                                        {(() => {
                                            const displayPhone = profile?.phone || user?.phone || 'Not specified';
                                            const phoneDigits = displayPhone !== 'Not specified'
                                                ? extractPhoneWithoutCountryCode(displayPhone)
                                                : displayPhone;
                                            const detectedCountry = displayPhone !== 'Not specified'
                                                ? detectCountryFromPhone(displayPhone)
                                                : null;

                                            return (
                                                <>
                                                    {detectedCountry && (
                                                        <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-l-lg border-r-0">
                                                            <span className="text-sm font-medium text-gray-700">{detectedCountry.dialCode}</span>
                                                        </div>
                                                    )}
                                                    <input
                                                        type="text"
                                                        value={phoneDigits}
                                                        disabled={true}
                                                        className="w-full px-3 py-2 pr-12 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 transition-colors border-l-0"
                                                    />
                                                </>
                                            );
                                        })()}
                                    </div>
                                )}
                                {currentPhoneVerified && profileForm.phone && !phoneChanged && user?.isPhoneVerified && (
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            {editingProfile ? (
                                <textarea
                                    name="address"
                                    value={profileForm.address || ''}
                                    onChange={handleInputChange}
                                    rows={2}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm resize-none"
                                />
                            ) : (
                                <textarea
                                    value={profile?.address || 'Not specified'}
                                    disabled={true}
                                    rows={2}
                                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-md border border-gray-300 disabled:bg-gray-50 disabled:text-gray-500 transition-colors text-sm resize-none"
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            {editingProfile ? (
                                <input
                                    type="text"
                                    name="city"
                                    value={profileForm.city || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={profile?.city || 'Not specified'}
                                    disabled={true}
                                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-md border border-gray-300 disabled:bg-gray-50 disabled:text-gray-500 transition-colors text-sm"
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                            {editingProfile ? (
                                <input
                                    type="text"
                                    name="state"
                                    value={profileForm.state || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={profile?.state || 'Not specified'}
                                    disabled={true}
                                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-md border border-gray-300 disabled:bg-gray-50 disabled:text-gray-500 transition-colors text-sm"
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                            {editingProfile ? (
                                <input
                                    type="text"
                                    name="country"
                                    value={profileForm.country || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={profile?.country || 'Not specified'}
                                    disabled={true}
                                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-md border border-gray-300 disabled:bg-gray-50 disabled:text-gray-500 transition-colors text-sm"
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                            {editingProfile ? (
                                <input
                                    type="text"
                                    name="postalCode"
                                    value={profileForm.postalCode || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={profile?.postalCode || 'Not specified'}
                                    disabled={true}
                                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-md border border-gray-300 disabled:bg-gray-50 disabled:text-gray-500 transition-colors text-sm"
                                />
                            )}
                        </div>
                    </div>

                    {editingProfile && (
                        <div className="mt-6">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingProfile(false);
                                        setLogoFile(null);
                                        setLogoPreview(profile?.logoUrl || null);
                                    }}
                                    className="px-6 py-3 bg-white text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-300 shadow-sm hover:shadow-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 px-6 rounded-md font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileTab;
