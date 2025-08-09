import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  GraduationCap,
  Users,
  Search,
  Star,
  Shield,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Globe,
  Award,
  Clock,
  MessageCircle,
  Sparkles,
  Zap,
  Target,
  BookOpen,
  Network,
  UserCheck,
  Bell
} from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: <Search className="w-7 h-7" />,
      title: "AI-Powered Discovery",
      description: "Smart matching algorithms connect you with the perfect experts and opportunities.",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50"
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: "Verified Professionals",
      description: "Every expert is thoroughly verified with credentials and peer reviews.",
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50"
    },
    {
      icon: <Zap className="w-7 h-7" />,
      title: "Instant Connections",
      description: "Connect in real-time with seamless communication tools and notifications.",
      gradient: "from-yellow-500 to-orange-500",
      bgGradient: "from-yellow-50 to-orange-50"
    },
    {
      icon: <Target className="w-7 h-7" />,
      title: "Precision Matching",
      description: "Advanced filters ensure you find exactly what you're looking for.",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50"
    }
  ];

  const stats = [
    { 
      number: "2,500+", 
      label: "Expert Professionals",
      icon: <UserCheck className="w-6 h-6" />,
      color: "text-blue-600"
    },
    { 
      number: "850+", 
      label: "Partner Institutions",
      icon: <GraduationCap className="w-6 h-6" />,
      color: "text-green-600"
    },
    { 
      number: "15,000+", 
      label: "Successful Connections",
      icon: <Network className="w-6 h-6" />,
      color: "text-purple-600"
    },
    { 
      number: "4.9★", 
      label: "Platform Rating",
      icon: <Star className="w-6 h-6" />,
      color: "text-yellow-600"
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Chen",
      role: "AI Research Director",
      company: "Stanford University",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      content: "ExpertConnect transformed how we find industry experts. The quality of connections is outstanding.",
      rating: 5
    },
    {
      name: "Prof. Michael Rodriguez",
      role: "Dean of Engineering",
      company: "MIT",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      content: "The platform's verification process gives us confidence in every expert we connect with.",
      rating: 5
    },
    {
      name: "Dr. Priya Sharma",
      role: "Data Science Expert",
      company: "Google",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      content: "I've conducted 50+ workshops through this platform. It's incredibly well-designed and efficient.",
      rating: 5
    }
  ];

  const benefits = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Expert-Led Workshops",
      description: "Access industry-leading professionals for specialized training sessions"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Network",
      description: "Connect with experts and institutions worldwide, breaking geographical barriers"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Quality Assurance",
      description: "Every interaction is backed by our comprehensive rating and review system"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "24/7 Support",
      description: "Round-the-clock assistance to ensure smooth collaborations"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
             {/* Modern Hero Section - Maxlearn Style */}
       <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-cyan-50 overflow-hidden">
         {/* Clean Background Elements */}
         <div className="absolute inset-0 overflow-hidden">
           <div className="absolute top-10 sm:top-20 right-4 sm:right-20 w-32 sm:w-72 h-32 sm:h-72 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
           <div className="absolute bottom-10 sm:bottom-20 left-4 sm:left-20 w-40 sm:w-96 h-40 sm:h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
         </div>

         <div className="relative max-w-7xl mx-auto">
           <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
             <motion.div
               initial={{ opacity: 0, x: -30 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8 }}
               className="space-y-6 sm:space-y-8 text-center lg:text-left"
             >
               <div className="space-y-4 sm:space-y-6">
                 <motion.div
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ duration: 0.6, delay: 0.2 }}
                   className="inline-flex items-center px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-xs sm:text-sm font-semibold shadow-lg"
                 >
                   <Sparkles className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
                   #1 Professional Network Platform
                 </motion.div>

                 <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                   Connect Industry
                   <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                     Experts & Institutions
                   </span>
                 </h1>
                 
                 <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                   Bridge the gap between industry expertise and educational excellence. 
                   Build meaningful partnerships that drive innovation and learning.
                 </p>
               </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link
                  to="/register/expert"
                  className="group bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl text-base sm:text-lg font-semibold hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 flex items-center justify-center transform hover:-translate-y-1"
                >
                  Join as Expert
                  <ArrowRight className="ml-2 w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/register/college"
                  className="group border-2 border-gray-200 text-gray-700 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl text-base sm:text-lg font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center"
                >
                  Join as Institution
                  <ArrowRight className="ml-2 w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center justify-center lg:justify-start space-x-4 sm:space-x-8 pt-6 sm:pt-8">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">2.5K+</div>
                  <div className="text-xs sm:text-sm text-gray-600">Experts</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">850+</div>
                  <div className="text-xs sm:text-sm text-gray-600">Institutions</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">15K+</div>
                  <div className="text-xs sm:text-sm text-gray-600">Connections</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative mt-8 lg:mt-0"
            >
              {/* Feature Card */}
              <div className="relative">
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/50">
                  <div className="flex items-start space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                    <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <UserCheck className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-1">Dr. Sarah Johnson</h3>
                      <p className="text-slate-600 text-xs sm:text-sm font-medium">AI & Data Science Expert</p>
                      <p className="text-blue-600 text-xs sm:text-sm font-semibold">Stanford University</p>
                    </div>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 sm:w-5 h-4 sm:h-5 fill-current text-yellow-500" />
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
                    <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                      "ExpertConnect transformed my career! I've connected with 50+ colleges and 
                      conducted impactful workshops. The platform delivers exceptional results."
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 sm:px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-xs font-medium">AI</span>
                      <span className="px-2 sm:px-3 py-1 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-full text-xs font-medium">Machine Learning</span>
                    </div>
                    <div className="text-green-600 font-bold text-xs sm:text-sm">✓ Verified Expert</div>
                  </div>
                </div>

                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [-10, 10, -10], rotate: [0, 180, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-xl"
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.div>

                <motion.div
                  animate={{ y: [10, -10, 10], rotate: [360, 180, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-br from-teal-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl"
                >
                  <Network className="w-8 h-8 text-white" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Professional Stats Section */}
      <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
        {/* Professional Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 sm:top-20 left-4 sm:left-20 w-32 sm:w-64 h-32 sm:h-64 bg-gradient-to-br from-blue-300/20 to-cyan-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 sm:bottom-20 right-4 sm:right-20 w-40 sm:w-80 h-40 sm:h-80 bg-gradient-to-br from-teal-300/20 to-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 sm:w-96 h-48 sm:h-96 bg-gradient-to-r from-slate-200/15 to-blue-300/15 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16 lg:mb-20"
          >
            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-slate-800 to-blue-800 text-white rounded-full text-xs sm:text-sm font-bold mb-6 sm:mb-8 shadow-lg">
              <TrendingUp className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
              Platform Excellence
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 font-heading">
              Trusted by <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">Industry Leaders</span>
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>Worldwide
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Our professional community continues to grow with distinguished experts 
              and prestigious institutions creating meaningful partnerships.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative"
              >
                <div className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl hover:shadow-2xl border-2 ${
                  index === 0 ? 'border-blue-200 hover:border-blue-400' :
                  index === 1 ? 'border-green-200 hover:border-green-400' :
                  index === 2 ? 'border-purple-200 hover:border-purple-400' :
                  'border-orange-200 hover:border-orange-400'
                } transition-all duration-500 transform hover:-translate-y-2 sm:hover:-translate-y-4 hover:scale-105`}>
                  <div className="text-center relative">
                    <div className={`w-12 sm:w-16 lg:w-20 h-12 sm:h-16 lg:h-20 mx-auto mb-3 sm:mb-4 lg:mb-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${
                      index === 0 ? 'from-blue-500 to-cyan-500' :
                      index === 1 ? 'from-green-500 to-emerald-500' :
                      index === 2 ? 'from-purple-500 to-pink-500' :
                      'from-orange-500 to-yellow-500'
                    } flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                      <span className="text-white text-lg sm:text-xl lg:text-2xl">
                        {stat.icon}
                      </span>
                    </div>
                    <div className={`text-2xl sm:text-3xl lg:text-5xl font-bold mb-2 sm:mb-3 bg-gradient-to-r ${
                      index === 0 ? 'from-blue-600 to-cyan-600' :
                      index === 1 ? 'from-green-600 to-emerald-600' :
                      index === 2 ? 'from-purple-600 to-pink-600' :
                      'from-orange-600 to-yellow-600'
                    } bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300`}>
                      {stat.number}
                    </div>
                    <div className="text-gray-700 font-bold text-sm sm:text-base lg:text-lg">{stat.label}</div>
                    
                    {/* Animated Background Glow */}
                    <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${
                      index === 0 ? 'from-blue-100/0 to-cyan-100/0 group-hover:from-blue-100/50 group-hover:to-cyan-100/50' :
                      index === 1 ? 'from-green-100/0 to-emerald-100/0 group-hover:from-green-100/50 group-hover:to-emerald-100/50' :
                      index === 2 ? 'from-purple-100/0 to-pink-100/0 group-hover:from-purple-100/50 group-hover:to-pink-100/50' :
                      'from-orange-100/0 to-yellow-100/0 group-hover:from-orange-100/50 group-hover:to-yellow-100/50'
                    } transition-all duration-500 -z-10`}></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Fun Call-to-Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center mt-16"
          >
            <div className="inline-flex items-center space-x-4 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl shadow-xl">
              <Award className="w-6 h-6" />
              <span className="text-lg font-bold">Ready to join our professional network?</span>
              <ArrowRight className="w-6 h-6" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Vibrant Features Section - Maxlearn Style */}
      <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Colorful Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-16 sm:top-32 left-4 sm:left-16 w-32 sm:w-72 h-32 sm:h-72 bg-gradient-to-br from-blue-300/20 to-cyan-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-16 sm:bottom-32 right-4 sm:right-16 w-40 sm:w-80 h-40 sm:h-80 bg-gradient-to-br from-purple-300/20 to-pink-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 sm:w-96 h-48 sm:h-96 bg-gradient-to-r from-yellow-200/15 to-orange-300/15 rounded-full blur-3xl"></div>
          
          {/* Floating shapes */}
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute top-10 sm:top-20 right-10 sm:right-20 w-12 sm:w-20 h-12 sm:h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl sm:rounded-3xl opacity-10"
          ></motion.div>
          <motion.div
            animate={{ rotate: -360, scale: [1, 1.2, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 w-8 sm:w-16 h-8 sm:h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl sm:rounded-2xl opacity-15"
          ></motion.div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16 lg:mb-20"
          >
            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-full text-xs sm:text-sm font-bold mb-6 sm:mb-8 shadow-lg">
              <Zap className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
              ⚡ Super Features
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-6 sm:mb-8 leading-tight text-gray-900">
              Why Choose
              <span className="block bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                ExpertConnect?
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4">
              🎨 Discover amazing features designed to make your professional journey 
              colorful, engaging, and absolutely successful! ✨
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative"
              >
                <div className={`h-full bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl border-2 ${
                  index === 0 ? 'border-blue-200 hover:border-blue-400' :
                  index === 1 ? 'border-green-200 hover:border-green-400' :
                  index === 2 ? 'border-orange-200 hover:border-orange-400' :
                  'border-purple-200 hover:border-purple-400'
                } transition-all duration-500 transform hover:-translate-y-3 sm:hover:-translate-y-6 hover:rotate-1 relative overflow-hidden`}>
                  
                  {/* Animated background gradient */}
                  <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  
                  <div className="relative z-10">
                    <div className={`w-16 sm:w-20 h-16 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 sm:mb-8 shadow-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-300`}>
                      <div className="text-white text-lg sm:text-xl">
                        {feature.icon}
                      </div>
                    </div>
                    
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-gray-800 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300 text-sm sm:text-base">
                      {feature.description}
                    </p>

                    {/* Fun decorative elements */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${
                        index === 0 ? 'from-blue-400 to-cyan-400' :
                        index === 1 ? 'from-green-400 to-emerald-400' :
                        index === 2 ? 'from-orange-400 to-yellow-400' :
                        'from-purple-400 to-pink-400'
                      } animate-pulse`}></div>
                    </div>
                    
                    {/* Bottom colorful accent */}
                    <div className={`absolute bottom-0 left-0 w-0 group-hover:w-full h-1 bg-gradient-to-r ${feature.gradient} transition-all duration-500 rounded-full`}></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Engaging CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center mt-20"
          >
            <div className="inline-flex items-center space-x-4 px-8 py-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 text-white rounded-3xl shadow-2xl hover:shadow-cyan-500/25 transform hover:-translate-y-2 transition-all duration-300">
              <Sparkles className="w-6 h-6 animate-spin" />
              <span className="text-lg font-bold">Excited to try these amazing features? 🎉</span>
              <ArrowRight className="w-6 h-6" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Colorful Testimonials Section - Maxlearn Style */}
      <section className="py-32 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 relative overflow-hidden">
        {/* Vibrant Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-pink-300/30 to-purple-400/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-cyan-300/30 to-blue-400/30 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-yellow-200/20 to-orange-300/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full text-sm font-bold mb-8 shadow-lg">
              <MessageCircle className="w-4 h-4 mr-2" />
              💬 Happy Voices
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold font-heading text-gray-900 mb-8 leading-tight">
              What Our Amazing
              <span className="block bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Community Says!
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              🌈 Listen to incredible success stories from professionals who found their 
              perfect matches and created wonderful opportunities! ✨
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40, rotate: -5 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative"
              >
                <div className={`h-full bg-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl border-2 ${
                  index === 0 ? 'border-pink-200 hover:border-pink-400' :
                  index === 1 ? 'border-purple-200 hover:border-purple-400' :
                  'border-cyan-200 hover:border-cyan-400'
                } transition-all duration-500 transform hover:-translate-y-4 hover:rotate-1 relative overflow-hidden`}>
                  
                  {/* Fun quote decoration */}
                  <div className={`absolute top-6 right-6 text-6xl font-bold opacity-20 ${
                    index === 0 ? 'text-pink-400' :
                    index === 1 ? 'text-purple-400' :
                    'text-cyan-400'
                  }`}>"</div>
                  
                  {/* Colorful background gradient */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${
                    index === 0 ? 'from-pink-50/0 to-purple-50/0 group-hover:from-pink-50/60 group-hover:to-purple-50/60' :
                    index === 1 ? 'from-purple-50/0 to-cyan-50/0 group-hover:from-purple-50/60 group-hover:to-cyan-50/60' :
                    'from-cyan-50/0 to-blue-50/0 group-hover:from-cyan-50/60 group-hover:to-blue-50/60'
                  } transition-all duration-500`}></div>
                  
                  <div className="relative z-10">
                    {/* Colorful rating stars */}
                    <div className="flex items-center space-x-1 mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-6 h-6 fill-current text-yellow-500 hover:scale-125 transition-transform duration-200" />
                      ))}
                    </div>
                    
                    {/* Testimonial content */}
                    <blockquote className="text-gray-700 text-lg leading-relaxed mb-8 font-medium">
                      "{testimonial.content}"
                    </blockquote>
                    
                    {/* Author info with colorful avatar */}
                    <div className="flex items-center space-x-4 pt-6 border-t-2 border-gray-100">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
                        index === 0 ? 'from-pink-500 to-purple-500' :
                        index === 1 ? 'from-purple-500 to-cyan-500' :
                        'from-cyan-500 to-blue-500'
                      } flex items-center justify-center text-white font-bold text-lg shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg mb-1">{testimonial.name}</h4>
                        <p className="text-gray-600 text-sm font-medium">{testimonial.role}</p>
                        <p className={`text-sm font-bold ${
                          index === 0 ? 'text-pink-600' :
                          index === 1 ? 'text-purple-600' :
                          'text-cyan-600'
                        }`}>✨ {testimonial.company}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Colorful testimonial footer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center mt-16"
          >
            <div className="inline-flex items-center space-x-8 px-8 py-6 bg-gradient-to-r from-pink-100 via-purple-100 to-cyan-100 rounded-3xl border-2 border-purple-200 shadow-xl">
              <div className="flex items-center space-x-3">
                <Star className="w-6 h-6 text-yellow-500 fill-current" />
                <span className="text-gray-800 font-bold text-lg">4.9/5 Amazing Rating! ⭐</span>
              </div>
              <div className="w-px h-8 bg-purple-300"></div>
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-purple-600" />
                <span className="text-gray-800 font-bold text-lg">2,500+ Happy Members! 🎉</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Vibrant Benefits Section - Maxlearn Style */}
      <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
        {/* Colorful Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 sm:top-20 right-4 sm:right-20 w-32 sm:w-72 h-32 sm:h-72 bg-gradient-to-br from-green-300/30 to-emerald-400/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 sm:bottom-20 left-4 sm:left-20 w-40 sm:w-80 h-40 sm:h-80 bg-gradient-to-br from-teal-300/30 to-cyan-400/30 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 sm:w-96 h-48 sm:h-96 bg-gradient-to-r from-yellow-200/20 to-green-300/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16 lg:mb-20"
          >
            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full text-xs sm:text-sm font-bold mb-6 sm:mb-8 shadow-lg">
              <Globe className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
              🌍 Global Benefits
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-gray-900 mb-6 sm:mb-8 leading-tight">
              Incredible
              <span className="block bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Advantages
              </span>
              for Everyone! 🎯
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4">
              🚀 Discover amazing benefits that make your professional journey exciting, 
              rewarding, and full of incredible opportunities! ✨
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative"
              >
                <div className={`h-full bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl hover:shadow-3xl border-2 ${
                  index === 0 ? 'border-blue-200 hover:border-blue-400' :
                  index === 1 ? 'border-green-200 hover:border-green-400' :
                  index === 2 ? 'border-purple-200 hover:border-purple-400' :
                  'border-orange-200 hover:border-orange-400'
                } transition-all duration-500 transform hover:-translate-y-3 sm:hover:-translate-y-6 hover:rotate-2 relative overflow-hidden`}>
                  
                  {/* Colorful background gradient */}
                  <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${
                    index === 0 ? 'from-blue-50/0 to-cyan-50/0 group-hover:from-blue-50/60 group-hover:to-cyan-50/60' :
                    index === 1 ? 'from-green-50/0 to-emerald-50/0 group-hover:from-green-50/60 group-hover:to-emerald-50/60' :
                    index === 2 ? 'from-purple-50/0 to-pink-50/0 group-hover:from-purple-50/60 group-hover:to-pink-50/60' :
                    'from-orange-50/0 to-yellow-50/0 group-hover:from-orange-50/60 group-hover:to-yellow-50/60'
                  } transition-all duration-500`}></div>
                  
                  <div className="relative z-10">
                    <div className={`w-16 sm:w-20 h-16 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${
                      index === 0 ? 'from-blue-500 to-cyan-500' :
                      index === 1 ? 'from-green-500 to-emerald-500' :
                      index === 2 ? 'from-purple-500 to-pink-500' :
                      'from-orange-500 to-yellow-500'
                    } flex items-center justify-center mb-6 sm:mb-8 shadow-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-300`}>
                      <div className="text-white text-lg sm:text-xl">
                        {benefit.icon}
                      </div>
                    </div>
                    
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-gray-800 transition-colors duration-300">
                      {benefit.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300 text-sm sm:text-base">
                      {benefit.description}
                    </p>

                    {/* Fun decorative elements */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${
                        index === 0 ? 'from-blue-400 to-cyan-400' :
                        index === 1 ? 'from-green-400 to-emerald-400' :
                        index === 2 ? 'from-purple-400 to-pink-400' :
                        'from-orange-400 to-yellow-400'
                      } animate-bounce`}></div>
                    </div>
                    
                    {/* Bottom colorful accent - same as features section */}
                    <div className={`absolute bottom-0 left-0 w-0 group-hover:w-full h-1 bg-gradient-to-r ${
                      index === 0 ? 'from-blue-500 to-cyan-500' :
                      index === 1 ? 'from-green-500 to-emerald-500' :
                      index === 2 ? 'from-purple-500 to-pink-500' :
                      'from-orange-500 to-yellow-500'
                    } transition-all duration-500 rounded-full`}></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

             {/* Clean Modern CTA Section */}
       <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
         {/* Subtle Background Elements */}
         <div className="absolute inset-0">
           <div className="absolute top-10 sm:top-20 left-4 sm:left-20 w-32 sm:w-72 h-32 sm:h-72 bg-gradient-to-br from-blue-400/5 to-cyan-400/5 rounded-full blur-3xl"></div>
           <div className="absolute bottom-10 sm:bottom-20 right-4 sm:right-20 w-48 sm:w-96 h-48 sm:h-96 bg-gradient-to-br from-purple-400/5 to-pink-400/5 rounded-full blur-3xl"></div>
         </div>

         <div className="relative max-w-4xl mx-auto text-center">
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
             viewport={{ once: true }}
           >
             <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-xs sm:text-sm font-semibold mb-6 sm:mb-8 shadow-lg">
               <CheckCircle className="w-4 h-4 mr-2" />
               Start Your Journey Today
             </div>
             
             <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight">
               Ready to connect with
               <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                 amazing professionals?
               </span>
             </h2>
             
             <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
               Join thousands of experts and institutions building the future of education together.
             </p>

             <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
               <Link
                 to="/register/expert"
                 className="group bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl text-base sm:text-lg font-semibold hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 flex items-center justify-center transform hover:-translate-y-1"
               >
                 Join as Expert
                 <ArrowRight className="ml-2 w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
               </Link>
               <Link
                 to="/register/college"
                 className="group border-2 border-gray-200 text-gray-700 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl text-base sm:text-lg font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center"
               >
                 Join as Institution
                 <ArrowRight className="ml-2 w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
               </Link>
             </div>

             {/* Clean Trust Indicators */}
             <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 pt-8 sm:pt-12">
               <div className="flex items-center space-x-2">
                 <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" />
                 <span className="text-gray-600 font-medium text-sm sm:text-base">Free to join</span>
               </div>
               <div className="flex items-center space-x-2">
                 <Star className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-500 fill-current" />
                 <span className="text-gray-600 font-medium text-sm sm:text-base">4.9/5 rating</span>
               </div>
               <div className="flex items-center space-x-2">
                 <Users className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500" />
                 <span className="text-gray-600 font-medium text-sm sm:text-base">15K+ members</span>
               </div>
             </div>
           </motion.div>
         </div>
       </section>
    </div>
  );
};

export default HomePage; 