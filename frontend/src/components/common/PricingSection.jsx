import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, ArrowRight, Users, Building2, Zap, Shield, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiService from '../../utils/api';

const PricingSection = () => {
  const [activeTab, setActiveTab] = useState('college');
  const [collegePlans, setCollegePlans] = useState([]);
  const [expertPlans, setExpertPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pricing plans from API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        
        // Fetch college plans
        const collegeResponse = await apiService.listActivePlans('COLLEGE');
        if (collegeResponse && collegeResponse.length > 0) {
          setCollegePlans(collegeResponse.map(plan => ({
            ...plan,
            features: getPlanFeatures(plan, 'college'),
            limitations: getPlanLimitations(plan, 'college'),
            popular: plan.name.toLowerCase().includes('premium') || plan.name.toLowerCase().includes('pro')
          })));
        } else {
          // Fallback to mock data if API fails
          setCollegePlans(getMockCollegePlans());
        }

        // Fetch expert plans
        const expertResponse = await apiService.listActivePlans('EXPERT');
        if (expertResponse && expertResponse.length > 0) {
          setExpertPlans(expertResponse.map(plan => ({
            ...plan,
            features: getPlanFeatures(plan, 'expert'),
            limitations: getPlanLimitations(plan, 'expert'),
            popular: plan.name.toLowerCase().includes('premium') || plan.name.toLowerCase().includes('pro')
          })));
        } else {
          // Fallback to mock data if API fails
          setExpertPlans(getMockExpertPlans());
        }
      } catch (error) {
        console.error('Failed to fetch plans:', error);
        // Use mock data as fallback
        setCollegePlans(getMockCollegePlans());
        setExpertPlans(getMockExpertPlans());
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Helper functions for generating plan features
  const getPlanFeatures = (plan, audience) => {
    const baseFeatures = {
      college: {
        basic: [
          'Create institution profile',
          'Post requirements',
          'Basic expert matching',
          'Email support'
        ],
        premium: [
          'Unlimited requirements',
          'Advanced AI matching',
          'Priority support',
          'Full expert contact access',
          'Advanced analytics',
          'Custom branding',
          'API access'
        ]
      },
      expert: {
        basic: [
          'Create expert profile',
          'Apply to opportunities',
          'Basic skill matching',
          'Email support'
        ],
        premium: [
          'Unlimited applications',
          'Priority in search results',
          'Advanced profile features',
          'Direct client contact',
          'Premium analytics',
          'Priority support',
          'Featured profile badge'
        ]
      }
    };

    const planType = plan.name.toLowerCase().includes('premium') || plan.name.toLowerCase().includes('pro') ? 'premium' : 'basic';
    return baseFeatures[audience][planType] || baseFeatures[audience].basic;
  };

  const getPlanLimitations = (plan, audience) => {
    const limitations = {
      college: {
        basic: [
          'Limited expert contact reveals',
          'Basic analytics'
        ],
        premium: []
      },
      expert: {
        basic: [
          'Limited application submissions',
          'Basic profile visibility'
        ],
        premium: []
      }
    };

    const planType = plan.name.toLowerCase().includes('premium') || plan.name.toLowerCase().includes('pro') ? 'premium' : 'basic';
    return limitations[audience][planType] || limitations[audience].basic;
  };

  // Mock data fallback functions
  const getMockCollegePlans = () => [
    {
      id: 'college-basic',
      name: 'Basic',
      description: 'Perfect for small institutions getting started',
      priceCents: 0,
      currency: 'INR',
      planType: 'FREE',
      billingPeriod: 'MONTHLY',
      features: getPlanFeatures({ name: 'Basic' }, 'college'),
      limitations: getPlanLimitations({ name: 'Basic' }, 'college'),
      popular: false
    },
    {
      id: 'college-premium',
      name: 'Premium',
      description: 'Advanced features for growing institutions',
      priceCents: 49900,
      currency: 'INR',
      planType: 'PAID',
      billingPeriod: 'MONTHLY',
      features: getPlanFeatures({ name: 'Premium' }, 'college'),
      limitations: getPlanLimitations({ name: 'Premium' }, 'college'),
      popular: true
    }
  ];

  const getMockExpertPlans = () => [
    {
      id: 'expert-basic',
      name: 'Basic',
      description: 'Start your expert journey',
      priceCents: 0,
      currency: 'INR',
      planType: 'FREE',
      billingPeriod: 'MONTHLY',
      features: getPlanFeatures({ name: 'Basic' }, 'expert'),
      limitations: getPlanLimitations({ name: 'Basic' }, 'expert'),
      popular: false
    },
    {
      id: 'expert-premium',
      name: 'Premium',
      description: 'Maximize your opportunities',
      priceCents: 14900,
      currency: 'INR',
      planType: 'PAID',
      billingPeriod: 'MONTHLY',
      features: getPlanFeatures({ name: 'Premium' }, 'expert'),
      limitations: getPlanLimitations({ name: 'Premium' }, 'expert'),
      popular: true
    }
  ];

  const formatPrice = (priceCents) => {
    if (priceCents === 0) return 'Free';
    return `₹${(priceCents / 100).toLocaleString()}`;
  };

  const getCurrentPlans = () => {
    return activeTab === 'college' ? collegePlans : expertPlans;
  };

  const getTabIcon = (tab) => {
    return tab === 'college' ? <Building2 className="w-5 h-5" /> : <Users className="w-5 h-5" />;
  };

  const getTabTitle = (tab) => {
    return tab === 'college' ? 'For Institutions' : 'For Experts';
  };

  const getTabDescription = (tab) => {
    return tab === 'college' 
      ? 'Connect with verified experts for your academic needs'
      : 'Find opportunities and showcase your expertise';
  };

  return (
    <section className="py-20 sm:py-28 lg:py-36 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-sm font-semibold mb-8 shadow-xl">
            <Star className="w-5 h-5 mr-2" />
            Choose Your Plan
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight">
            Simple, transparent
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              pricing for everyone
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Start free and upgrade as you grow. No hidden fees, no surprises.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="flex justify-center mb-12"
        >
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-2 shadow-lg">
            <div className="flex">
              {['college', 'expert'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {getTabIcon(tab)}
                  {getTabTitle(tab)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tab Description */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {getTabDescription(activeTab)}
          </p>
        </motion.div>

        {/* Pricing Cards */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
          >
            {getCurrentPlans().map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative bg-white rounded-3xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                  plan.popular 
                    ? 'border-blue-500 ring-4 ring-blue-500/20' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                      <Star className="w-4 h-4 inline mr-1" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-6">{plan.description}</p>
                    
                    {/* Price */}
                    <div className="mb-6">
                      <div className="text-4xl font-bold text-gray-900 mb-2">
                        {formatPrice(plan.priceCents)}
                        {plan.priceCents > 0 && (
                          <span className="text-lg font-normal text-gray-500">/month</span>
                        )}
                      </div>
                      {plan.priceCents > 0 && (
                        <div className="text-sm text-gray-500">
                          Billed {plan.billingPeriod.toLowerCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                    
                    {plan.limitations.map((limitation, limitationIndex) => (
                      <div key={limitationIndex} className="flex items-start gap-3 opacity-60">
                        <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        </div>
                        <span className="text-gray-500 text-sm">{limitation}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Link
                    to={`/register/${activeTab}`}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-center transition-all duration-300 flex items-center justify-center gap-2 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-blue-500/30'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {plan.priceCents === 0 ? 'Get Started Free' : 'Choose Plan'}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900">Secure & Reliable</h4>
                  <p className="text-sm text-gray-600">Enterprise-grade security</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900">Cancel Anytime</h4>
                  <p className="text-sm text-gray-600">No long-term commitments</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900">24/7 Support</h4>
                  <p className="text-sm text-gray-600">Always here to help</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
