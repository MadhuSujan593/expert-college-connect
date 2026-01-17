import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Clock,
  MapPin,
  TrendingUp,
  Mail,
  Phone,
  Building2,
  FileText,
  Briefcase,
  Award,
  Shield,
  Layers,
  Globe,
  User
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

  if (!isOpen || !expert) return null;

  const handleRevealContact = async () => {
    if (!apiService) return;

    // Check if subscription data is still loading
    if (subsLoading) {
      console.log('Subscription data is still loading, please wait...');
      return;
    }

    // Use the same logic as requirements - check limitations first
    const limitation = getLimitationDetails?.();
    if (limitation) {
      setLimitationType?.(limitation.type);
      showPlanLimitationModal?.(true);
      return;
    }

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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200"
          >
            {/* Header */}
            <div className="bg-white border-b border-slate-100 p-6 flex-shrink-0 sticky top-0 z-10">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-100 shadow-sm shrink-0 bg-slate-50">
                    {expert.profilePicture ? (
                      <img
                        src={expert.profilePicture}
                        alt={`${expert.user?.fullName}'s profile`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-full bg-slate-900 flex items-center justify-center text-white font-bold text-xl"
                      style={{ display: expert.profilePicture ? 'none' : 'flex' }}
                    >
                      {expert.user?.fullName?.charAt(0) || 'E'}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                      {expert.user?.fullName}
                    </h2>
                    <p className="text-slate-600 font-medium">{expert.jobTitle}</p>
                    {expert.company && (
                      <p className="text-slate-500 text-sm">{expert.company}</p>
                    )}

                    {/* Quick Info Row */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3">
                      {expert.experience && (
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                          <Briefcase className="w-4 h-4 text-slate-400" />
                          <span>{expert.experience}</span>
                        </div>
                      )}
                      {expert.location && (
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>{expert.location}</span>
                        </div>
                      )}
                      {expert.hourlyRate && (
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                          <span className="font-semibold text-emerald-600 font-mono">₹{parseFloat(expert.hourlyRate).toFixed(0)}/hr</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-[3px] p-2 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50 space-y-8">
              {(() => {
                const hasMainContent = Boolean(expert.bio || (expert.workexperience && expert.workexperience.length > 0));

                return (
                  <div className={hasMainContent ? "grid grid-cols-1 lg:grid-cols-3 gap-8" : "max-w-3xl mx-auto"}>
                    {/* Main Content Column */}
                    {hasMainContent && (
                      <div className="lg:col-span-2 space-y-8">
                        {/* About */}
                        {expert.bio && (
                          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                              <User className="w-4 h-4 text-indigo-500" />
                              About {expert.user?.fullName?.split(' ')[0]}
                            </h3>
                            <div className="relative z-10">
                              <p className="text-slate-700 leading-relaxed text-base">
                                {expert.bio}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Work Experience */}
                        {expert.workexperience && expert.workexperience.length > 0 && (
                          <section>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-indigo-500" />
                              Work Experience
                            </h3>
                            <div className="relative pl-2 border-l-2 border-slate-200 space-y-8">
                              {expert.workexperience.map((exp, index) => (
                                <div key={exp.id || index} className="relative pl-6">
                                  {/* Timeline dot */}
                                  <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-slate-300"></div>

                                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                    <div>
                                      <h4 className="font-bold text-slate-900 text-base">{exp.jobTitle}</h4>
                                      <p className="text-indigo-600 font-medium text-sm">{exp.company}</p>
                                    </div>
                                    <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                                      {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                      {' - '}
                                      {exp.isCurrent ? 'Present' : new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                    </div>
                                  </div>

                                  {exp.location && (
                                    <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                                      <MapPin className="w-3 h-3" /> {exp.location}
                                    </p>
                                  )}

                                  {exp.description && (
                                    <p className="text-slate-600 text-sm mb-3">{exp.description}</p>
                                  )}

                                  {exp.skills && Array.isArray(exp.skills) && exp.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                      {exp.skills.map((skill, skillIndex) => (
                                        <span key={skillIndex} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] uppercase font-bold rounded border border-slate-200">
                                          {skill}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </section>
                        )}
                      </div>
                    )}

                    {/* Sidebar Column */}
                    <div className="space-y-6">
                      {/* Primary Expertise */}
                      {expert.primaryExpertise && (
                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Primary Expertise</h3>
                          <div className="flex items-center gap-2 text-indigo-700 font-semibold">
                            <Award className="w-5 h-5" />
                            {expert.primaryExpertise?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                        </div>
                      )}

                      {/* Skills */}
                      {expert.expertskill && expert.expertskill.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Skills</h3>
                          <div className="flex flex-wrap gap-2">
                            {expert.expertskill.map(skill => (
                              <span
                                key={skill.id}
                                className="px-2.5 py-1 bg-white text-slate-700 text-xs font-medium rounded border border-slate-200 shadow-sm"
                              >
                                {skill.skillName}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}



                      {/* Preferred Mode */}
                      {expert.preferredMode && (
                        <div>
                          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Preferred Mode</h3>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                            {expert.preferredMode}
                          </span>
                        </div>
                      )}

                      {/* Contact Information Box */}
                      <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-bold text-indigo-900">Contact Details</h3>
                          {!isContactRevealed && (
                            <button
                              onClick={handleRevealContact}
                              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-[3px] transition-all shadow-sm"
                            >
                              Reveal
                            </button>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-500 shadow-sm">
                              <Mail className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-indigo-400 font-medium uppercase">Email</p>
                              <p className="text-sm text-indigo-900 truncate font-medium">
                                {isContactRevealed ? expert.user?.email : '•••••••••@•••'}
                              </p>
                            </div>
                          </div>

                          {expert.user?.phone && (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-500 shadow-sm">
                                <Phone className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-indigo-400 font-medium uppercase">Phone</p>
                                <p className="text-sm text-indigo-900 truncate font-medium">
                                  {isContactRevealed ? expert.user?.phone : '+91 ••••• •••••'}
                                </p>
                              </div>
                            </div>
                          )}

                          {expert.website && (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-500 shadow-sm">
                                <Globe className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-indigo-400 font-medium uppercase">Website</p>
                                <a
                                  href={expert.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-indigo-600 hover:text-indigo-800 truncate font-medium hover:underline cursor-pointer block"
                                >
                                  Visit Website
                                </a>
                              </div>
                            </div>
                          )}
                        </div>

                        {isContactRevealed && (
                          <button
                            onClick={handleContactExpert}
                            className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2.5 rounded-[3px] transition-all shadow-sm hover:shadow-md"
                          >
                            <Mail className="w-4 h-4" />
                            Send Email
                          </button>
                        )}
                      </div>

                      {/* Documents */}
                      {expert.resumeUrl && (
                        <a
                          href={expert.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Resume / CV</p>
                            <p className="text-xs text-slate-500">Click to view document</p>
                          </div>
                        </a>
                      )}

                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-slate-100 p-4 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                onClick={onClose}
                className="px-5 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-[3px] hover:bg-slate-50 transition-colors text-sm"
              >
                Close
              </button>
              {!isContactRevealed && (
                <button
                  onClick={handleRevealContact}
                  className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-[3px] hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg text-sm flex items-center gap-2"
                >
                  Reveal Contact Details
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExpertProfileModal;
