import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Phone,
  Building2,
  Briefcase,
  MapPin,
  Globe,
  Award,
  BookOpen,
  Users,
  Star,
  GraduationCap,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  X
} from 'lucide-react';
import apiService from '../../utils/api';
import toast from 'react-hot-toast';

const AccountCreation = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [accountType, setAccountType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    // Basic Information
    fullName: '',
    email: '',
    phone: '',
    password: '',
    
    // Expert-specific fields (matching signup form)
    jobTitle: '',
    company: '',
    experience: '',
    location: '',
    website: '',
    primaryExpertise: '',
    skills: '',
    bio: '',
    availableFor: '',
    preferredMode: '',
    hourlyRate: '',
    
    // College-specific fields
    institutionName: '',
    contactPersonName: '',
    institutionType: 'UNIVERSITY',
    institutionWebsite: '',
    institutionAddress: '',
    institutionDescription: '',
    studentCount: '',
    foundedYear: '',
    accreditation: '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAccountTypeSelect = (type) => {
    setAccountType(type);
    setCurrentStep(2);
  };

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateForm = () => {
    const requiredFields = ['fullName', 'email', 'password'];
    
    if (accountType === 'EXPERT') {
      requiredFields.push('jobTitle', 'company');
    } else if (accountType === 'COLLEGE_ADMIN') {
      requiredFields.push('institutionName', 'contactPersonName');
    }

    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const accountData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password,
        role: accountType,
        ...(accountType === 'EXPERT' && {
          jobTitle: formData.jobTitle,
          company: formData.company,
          experience: formData.experience || undefined,
          location: formData.location || undefined,
          website: formData.website || undefined,
          primaryExpertise: formData.primaryExpertise || undefined,
          skills: formData.skills || undefined,
          bio: formData.bio || undefined,
          availableFor: formData.availableFor || undefined,
          preferredMode: formData.preferredMode || undefined,
          hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
        }),
        ...(accountType === 'COLLEGE_ADMIN' && {
          institutionName: formData.institutionName,
          contactPersonName: formData.contactPersonName,
          institutionType: formData.institutionType,
          institutionWebsite: formData.institutionWebsite || undefined,
          institutionAddress: formData.institutionAddress || undefined,
          institutionDescription: formData.institutionDescription || undefined,
          studentCount: formData.studentCount || undefined,
          foundedYear: formData.foundedYear || undefined,
          accreditation: formData.accreditation || undefined,
        }),
        sendWelcomeEmail: true
      };

      const response = await apiService.createAccount(accountData);
      
      toast.success(response.message);
      onClose();
      
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        jobTitle: '',
        company: '',
        experience: '',
        location: '',
        website: '',
        primaryExpertise: '',
        skills: '',
        bio: '',
        availableFor: '',
        preferredMode: '',
        hourlyRate: '',
        institutionName: '',
        contactPersonName: '',
        institutionType: 'UNIVERSITY',
        institutionWebsite: '',
        institutionAddress: '',
        institutionDescription: '',
        studentCount: '',
        foundedYear: '',
        accreditation: '',
      });
      setCurrentStep(1);
      setAccountType('');
      
    } catch (error) {
      console.error('Account creation error:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderAccountTypeSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Account</h2>
        <p className="text-gray-600">Select the type of account you want to create</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleAccountTypeSelect('EXPERT')}
          className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
              <Briefcase className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Expert Account</h3>
            <p className="text-gray-600 text-sm">
              Create an account for industry experts who can provide guidance and mentorship
            </p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleAccountTypeSelect('COLLEGE_ADMIN')}
          className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 group"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
              <GraduationCap className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">College Admin Account</h3>
            <p className="text-gray-600 text-sm">
              Create an account for college administrators to manage their institution
            </p>
          </div>
        </motion.button>
      </div>
    </div>
  );

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
        <p className="text-gray-600">Enter the details for the account</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter full name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter email address"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter phone number"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {accountType === 'EXPERT' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., Senior Data Scientist"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., Google"
                />
              </div>
            </div>
          </>
        )}

        {accountType === 'COLLEGE_ADMIN' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institution Name *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.institutionName}
                  onChange={(e) => handleInputChange('institutionName', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., Harvard University"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.contactPersonName}
                  onChange={(e) => handleInputChange('contactPersonName', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., Dr. Jane Smith"
                />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 inline mr-2" />
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>
      </div>
    </div>
  );

  const renderExpertDetails = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Expert Details</h2>
        <p className="text-gray-600">Enter the professional information for the expert</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Title *
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={formData.jobTitle}
              onChange={(e) => handleInputChange('jobTitle', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g., Senior Data Scientist"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company *
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g., Google"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 inline mr-2" />
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>
      </div>
    </div>
  );

  const renderCollegeDetails = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">College Details</h2>
        <p className="text-gray-600">Enter the institution information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Institution Name *
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={formData.institutionName}
              onChange={(e) => handleInputChange('institutionName', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g., Harvard University"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Person Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={formData.contactPersonName}
              onChange={(e) => handleInputChange('contactPersonName', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g., Dr. Jane Smith"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Institution Type
          </label>
          <select
            value={formData.institutionType}
            onChange={(e) => handleInputChange('institutionType', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="UNIVERSITY">University</option>
            <option value="COLLEGE">College</option>
            <option value="INSTITUTE">Institute</option>
            <option value="SCHOOL">School</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Institution Website
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="url"
              value={formData.institutionWebsite}
              onChange={(e) => handleInputChange('institutionWebsite', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="https://example.edu"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Institution Address
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <textarea
              value={formData.institutionAddress}
              onChange={(e) => handleInputChange('institutionAddress', e.target.value)}
              rows={2}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter institution address"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Institution Description
          </label>
          <textarea
            value={formData.institutionDescription}
            onChange={(e) => handleInputChange('institutionDescription', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Brief description of the institution..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Student Count
          </label>
          <input
            type="text"
            value={formData.studentCount}
            onChange={(e) => handleInputChange('studentCount', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="e.g., 50000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Founded Year
          </label>
          <input
            type="text"
            value={formData.foundedYear}
            onChange={(e) => handleInputChange('foundedYear', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="e.g., 1636"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Accreditation
          </label>
          <input
            type="text"
            value={formData.accreditation}
            onChange={(e) => handleInputChange('accreditation', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="e.g., Accredited by AACSB"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 inline mr-2" />
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-center space-x-4">
              {[1, 2].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 2 && (
                    <div
                      className={`w-12 h-1 mx-2 ${
                        currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Account Type</span>
              <span>Details</span>
            </div>
          </div>

          {currentStep === 1 && renderAccountTypeSelection()}
          {currentStep === 2 && renderBasicInfo()}
        </div>
      </motion.div>
    </div>
  );
};

export default AccountCreation;
