import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Clock, 
  MapPin, 
  TrendingUp, 
  Mail, 
  Phone, 
  Building2, 
  FileText 
} from 'lucide-react';

const ExpertProfileModal = ({ 
  isOpen, 
  expert, 
  onClose, 
  onContactExpert,
  revealedExpertIds = new Set(),
  onRevealContact,
  mySubscription = null,
  getLimitationDetails = null,
  showPlanLimitationModal = null,
  setLimitationType = null,
  apiService = null,
  subsLoading = false
}) => {
  if (!isOpen || !expert) return null;

  // Always show contact information as masked initially
  const [isContactRevealed, setIsContactRevealed] = React.useState(false);

  // Check if expert was already revealed when modal opens
  React.useEffect(() => {
    if (isOpen && expert) {
      // Check if this expert was already revealed in the global state
      const wasAlreadyRevealed = revealedExpertIds.has(expert.id);
      setIsContactRevealed(wasAlreadyRevealed);
    }
  }, [isOpen, expert, revealedExpertIds]);

  const handleRevealContact = async () => {
    if (!apiService) return;
    
    // Debug subscription data
    console.log('ExpertProfileModal - mySubscription:', mySubscription);
    console.log('ExpertProfileModal - mySubscription?.plan:', mySubscription?.plan);
    console.log('ExpertProfileModal - subsLoading:', subsLoading);
    
    // Check if subscription data is still loading
    if (subsLoading) {
      console.log('Subscription data is still loading, please wait...');
      return;
    }
    
    // Use the same logic as requirements - check limitations first
    const limitation = getLimitationDetails?.();
    if (limitation) {
      console.log('Limitation found, showing modal:', limitation);
      setLimitationType?.(limitation.type);
      showPlanLimitationModal?.(true);
      return;
    }
    
    console.log('No limitations found, proceeding with reveal');
    
    try {
      const response = await apiService.revealExpertContact(expert.id);
      if (response.success && response.contactDetails) {
        setIsContactRevealed(true);
        // Also call the parent's onRevealContact to update the global state
        if (onRevealContact) {
          onRevealContact(expert.id);
        }
      }
    } catch (e) {
      console.error('Contact revelation error:', e);
      if (e.message && e.message.includes('Expert contact view limit reached')) {
        if (window.handleExpertContactLimit) {
          window.handleExpertContactLimit();
        }
      } else {
        alert(e.message || 'Unable to reveal contact. Please check your plan limits.');
      }
    }
  };

  const handleContactExpert = () => {
    if (isContactRevealed && expert.user?.email) {
      const subject = `Expert Inquiry - ${expert.user.fullName}`;
      const body = `Dear ${expert.user.fullName},\n\nI hope this email finds you well. I am reaching out regarding your expertise.\n\nBest regards,`;
      const mailtoLink = `mailto:${expert.user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {expert.profilePicture ? (
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                  <img
                    src={expert.profilePicture}
                    alt={`${expert.user?.fullName}'s profile`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log('❌ Profile picture failed to load:', expert.profilePicture);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold text-xl" style={{display: 'none'}}>
                    {expert.user?.fullName?.charAt(0) || 'E'}
                  </div>
                </div>
              ) : (
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                  {expert.user?.fullName?.charAt(0) || 'E'}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {expert.user?.fullName}
                </h2>
                <p className="text-gray-600">{expert.jobTitle}</p>
                {expert.company && (
                  <p className="text-gray-500 text-sm">{expert.company}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Quick Info Row */}
          <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-gray-100">
            {expert.experience && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{expert.experience}</span>
              </div>
            )}
            {expert.location && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{expert.location}</span>
              </div>
            )}
            {expert.hourlyRate && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <TrendingUp className="w-4 h-4" />
                <span className="font-semibold text-green-600">₹{parseFloat(expert.hourlyRate).toFixed(0)}/hr</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          <div className="space-y-6">
            {/* About */}
            {expert.bio && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                <p className="text-gray-700 leading-relaxed">{expert.bio}</p>
              </div>
            )}

            {/* Primary Expertise */}
            {expert.primaryExpertise && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Primary Expertise</h3>
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                  <p className="text-gray-700 font-medium">
                    {expert.primaryExpertise?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                </div>
              </div>
            )}

            {/* Skills */}
            {expert.expertskill && expert.expertskill.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {expert.expertskill.map(skill => (
                    <span
                      key={skill.id}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-sm border border-blue-200"
                    >
                      {skill.skillName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Available For */}
            {expert.availableFor && Array.isArray(expert.availableFor) && expert.availableFor.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Available For</h3>
                <div className="flex flex-wrap gap-2">
                  {expert.availableFor.map((service, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200 font-medium"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Preferred Mode */}
            {expert.preferredMode && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Preferred Mode</h3>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-gray-700">{expert.preferredMode}</p>
                </div>
              </div>
            )}

            {/* Work Experience Details */}
            {expert.workexperience && expert.workexperience.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Work Experience</h3>
                <div className="space-y-4">
                  {expert.workexperience.map((exp, index) => (
                    <div key={exp.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">{exp.jobTitle}</h4>
                          <p className="text-blue-600 font-medium">{exp.company}</p>
                          {exp.location && (
                            <p className="text-gray-600 text-sm">{exp.location}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            {new Date(exp.startDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                            {' - '}
                            {exp.isCurrent 
                              ? 'Present' 
                              : exp.endDate 
                                ? new Date(exp.endDate).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    year: 'numeric' 
                                  })
                                : 'N/A'
                            }
                          </div>
                          {exp.isCurrent && (
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mt-1">
                              Current
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {exp.description && (
                        <p className="text-gray-700 mb-3 leading-relaxed">{exp.description}</p>
                      )}
                      
                      {exp.achievements && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-900 mb-2">Key Achievements:</p>
                          <p className="text-gray-700 text-sm leading-relaxed">{exp.achievements}</p>
                        </div>
                      )}
                      
                      {exp.skills && Array.isArray(exp.skills) && exp.skills.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Skills Used:</p>
                          <div className="flex flex-wrap gap-2">
                            {exp.skills.map((skill, skillIndex) => (
                              <span
                                key={skillIndex}
                                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact & Documents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                  {!isContactRevealed && (
                    <button
                      onClick={handleRevealContact}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1 border border-indigo-300 rounded-md hover:bg-indigo-50 transition-colors"
                    >
                      Reveal
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {isContactRevealed ? expert.user?.email : '••••••••••@•••'}
                    </span>
                  </div>
                  {expert.user?.phone && (
                    <div className="flex items-center space-x-3 p-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        {isContactRevealed ? expert.user?.phone : '••••••••••'}
                      </span>
                    </div>
                  )}
                  {expert.website && (
                    <div className="flex items-center space-x-3 p-2">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <a
                        href={expert.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents */}
              {expert.resumeUrl && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Documents</h3>
                  <div className="space-y-2">
                    <a
                      href={expert.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">View Resume</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-4 flex-shrink-0">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleContactExpert}
              disabled={!revealedExpertIds.has(expert.id)}
              className={`px-4 py-2 rounded-md transition-all duration-300 ${
                revealedExpertIds.has(expert.id)
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Contact Expert
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ExpertProfileModal;



