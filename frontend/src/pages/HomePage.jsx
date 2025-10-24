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
  Bell,
  Play,
  ChevronRight,
  BarChart3,
  Lightbulb,
  Heart,
  ThumbsUp,
  Eye,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ExternalLink
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Premium Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Sophisticated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-indigo-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8 text-left"
            >
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight">
                  Connect Industry
                  <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                    Experts & Institutions
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                  Bridge the gap between industry expertise and educational excellence. 
                  Build meaningful partnerships that drive innovation and learning.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register/expert"
                  className="group relative bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl text-base font-semibold hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10">Join as Expert</span>
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300 relative z-10" />
                </Link>
                <Link
                  to="/register/college"
                  className="group relative bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl text-base font-semibold hover:border-gray-300 hover:bg-white hover:shadow-xl transition-all duration-300 flex items-center justify-center"
                >
                  <span>Join as Institution</span>
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>

              {/* Premium Stats */}
              <div className="flex items-center space-x-8 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">2.5K+</div>
                  <div className="text-sm text-gray-600 font-medium">Experts</div>
                </div>
                <div className="w-px h-8 bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">850+</div>
                  <div className="text-sm text-gray-600 font-medium">Institutions</div>
                </div>
                <div className="w-px h-8 bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">15K+</div>
                  <div className="text-sm text-gray-600 font-medium">Connections</div>
                </div>
              </div>
            </motion.div>

            {/* Professional Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="hidden lg:block"
            >
              <div className="relative">
                {/* Main Image Container */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&crop=faces"
                    alt="Professional team collaboration"
                    className="w-full h-[500px] object-cover"
                  />
                  
                  {/* Subtle Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 via-transparent to-transparent"></div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl opacity-20 blur-xl"></div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl opacity-20 blur-xl"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Premium Stats Section */}
      <section className="py-20 sm:py-28 lg:py-36 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
        {/* Sophisticated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-blue-400/15 to-cyan-400/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-teal-400/15 to-blue-400/15 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-slate-200/10 to-blue-300/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16 sm:mb-20 lg:mb-24"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Trusted by <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">Industry Leaders</span>
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>Worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Our professional community continues to grow with distinguished experts 
              and prestigious institutions creating meaningful partnerships.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                className="group h-full"
              >
                <div className={`h-full relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl border ${
                  index === 0 ? 'border-blue-200/50 hover:border-blue-300' :
                  index === 1 ? 'border-green-200/50 hover:border-green-300' :
                  index === 2 ? 'border-purple-200/50 hover:border-purple-300' :
                  'border-orange-200/50 hover:border-orange-300'
                } transition-all duration-500 hover:-translate-y-2 flex flex-col justify-center group`}>
                  
                  {/* Premium Background Glow */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${
                    index === 0 ? 'from-blue-50/0 to-cyan-50/0 group-hover:from-blue-50/50 group-hover:to-cyan-50/50' :
                    index === 1 ? 'from-green-50/0 to-emerald-50/0 group-hover:from-green-50/50 group-hover:to-emerald-50/50' :
                    index === 2 ? 'from-purple-50/0 to-pink-50/0 group-hover:from-purple-50/50 group-hover:to-pink-50/50' :
                    'from-orange-50/0 to-yellow-50/0 group-hover:from-orange-50/50 group-hover:to-yellow-50/50'
                  } transition-all duration-500`}></div>
                  
                  <div className="relative z-10 text-center">
                    <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br ${
                      index === 0 ? 'from-blue-500 to-cyan-500' :
                      index === 1 ? 'from-green-500 to-emerald-500' :
                      index === 2 ? 'from-purple-500 to-pink-500' :
                      'from-orange-500 to-yellow-500'
                    } flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-white text-lg">
                        {stat.icon}
                      </span>
                    </div>
                    <div className={`text-3xl sm:text-4xl font-bold mb-2 ${
                      index === 0 ? 'text-blue-600' :
                      index === 1 ? 'text-green-600' :
                      index === 2 ? 'text-purple-600' :
                      'text-orange-600'
                    } group-hover:scale-105 transition-transform duration-300`}>
                      {stat.number}
                    </div>
                    <div className="text-gray-600 font-semibold text-sm">{stat.label}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* Premium Features Section */}
      <section className="py-20 sm:py-28 lg:py-36 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
        {/* Sophisticated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-br from-blue-400/15 to-cyan-400/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-yellow-200/10 to-orange-300/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16 sm:mb-20 lg:mb-24"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Why Choose
              <span className="block bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                ExpertConnect?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Discover amazing features designed to make your professional journey 
              engaging and successful.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                className="group h-full"
              >
                <div className={`h-full relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl border ${
                  index === 0 ? 'border-blue-200/50 hover:border-blue-300' :
                  index === 1 ? 'border-green-200/50 hover:border-green-300' :
                  index === 2 ? 'border-orange-200/50 hover:border-orange-300' :
                  'border-purple-200/50 hover:border-purple-300'
                 } transition-all duration-500 hover:-translate-y-2 flex flex-col group`}>
                  
                  {/* Premium Background Glow */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${
                    index === 0 ? 'from-blue-50/0 to-cyan-50/0 group-hover:from-blue-50/50 group-hover:to-cyan-50/50' :
                    index === 1 ? 'from-green-50/0 to-emerald-50/0 group-hover:from-green-50/50 group-hover:to-emerald-50/50' :
                    index === 2 ? 'from-orange-50/0 to-yellow-50/0 group-hover:from-orange-50/50 group-hover:to-yellow-50/50' :
                    'from-purple-50/0 to-pink-50/0 group-hover:from-purple-50/50 group-hover:to-pink-50/50'
                  } transition-all duration-500`}></div>
                  
                  <div className="relative z-10">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <div className="text-white text-lg">
                        {feature.icon}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex-shrink-0 group-hover:text-gray-800 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed flex-grow group-hover:text-gray-700 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* Premium Testimonials Section */}
      <section className="py-20 sm:py-28 lg:py-36 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
        {/* Sophisticated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-br from-pink-400/15 to-purple-400/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-cyan-400/15 to-blue-400/15 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-yellow-200/10 to-orange-300/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16 sm:mb-20 lg:mb-24"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              What Our
              <span className="block bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Community Says
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Listen to success stories from professionals who found their 
              perfect matches and created meaningful opportunities.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                className="group h-full"
              >
                <div className={`h-full relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl border ${
                  index === 0 ? 'border-pink-200/50 hover:border-pink-300' :
                  index === 1 ? 'border-purple-200/50 hover:border-purple-300' :
                  'border-cyan-200/50 hover:border-cyan-300'
                 } transition-all duration-500 hover:-translate-y-2 flex flex-col group`}>
                  
                  {/* Premium Background Glow */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${
                    index === 0 ? 'from-pink-50/0 to-purple-50/0 group-hover:from-pink-50/50 group-hover:to-purple-50/50' :
                    index === 1 ? 'from-purple-50/0 to-cyan-50/0 group-hover:from-purple-50/50 group-hover:to-cyan-50/50' :
                    'from-cyan-50/0 to-blue-50/0 group-hover:from-cyan-50/50 group-hover:to-blue-50/50'
                  } transition-all duration-500`}></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center space-x-1 mb-6 flex-shrink-0">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current text-yellow-500" />
                      ))}
                    </div>
                    
                    <blockquote className="text-gray-700 text-base leading-relaxed mb-6 flex-grow group-hover:text-gray-800 transition-colors duration-300">
                      "{testimonial.content}"
                    </blockquote>
                    
                    <div className="flex items-center space-x-4 pt-6 border-t border-gray-100 flex-shrink-0">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                        index === 0 ? 'from-pink-500 to-purple-500' :
                        index === 1 ? 'from-purple-500 to-cyan-500' :
                        'from-cyan-500 to-blue-500'
                       } flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-base mb-1">{testimonial.name}</h4>
                        <p className="text-gray-600 text-sm font-medium">{testimonial.role}</p>
                        <p className={`text-sm font-semibold ${
                          index === 0 ? 'text-pink-600' :
                          index === 1 ? 'text-purple-600' :
                          'text-cyan-600'
                        }`}>{testimonial.company}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* Contact Us Section */}
      <section className="py-20 sm:py-28 lg:py-36 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
        {/* Sophisticated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-br from-blue-400/15 to-cyan-400/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-200/10 to-blue-300/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-semibold mb-8 shadow-xl">
              <MessageCircle className="w-5 h-5 mr-2" />
              Need Help?
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight">
              Have Questions?
              <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent">
                We're Here to Help
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Our support team is ready to assist you with any questions or concerns. 
              Get in touch and we'll respond within 24 hours.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link
                to="/contact-us"
                className="group relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl text-base font-semibold hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 flex items-center justify-center overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">Contact Us</span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300 relative z-10" />
              </Link>
              <a
                href="mailto:support@expertcollegeconnect.com"
                className="group relative bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl text-base font-semibold hover:border-gray-300 hover:bg-white hover:shadow-xl transition-all duration-300 flex items-center justify-center"
              >
                <Mail className="mr-2 w-5 h-5" />
                <span>Email Support</span>
              </a>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-3 p-4 bg-white/50 backdrop-blur-sm rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-xs text-gray-600">support@expertcollegeconnect.com</p>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-3 p-4 bg-white/50 backdrop-blur-sm rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Phone</p>
                  <p className="text-xs text-gray-600">+1 (234) 567-890</p>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-3 p-4 bg-white/50 backdrop-blur-sm rounded-lg">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Response Time</p>
                  <p className="text-xs text-gray-600">Within 24 hours</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="py-20 sm:py-28 lg:py-36 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
        {/* Sophisticated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-br from-blue-400/15 to-cyan-400/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-200/10 to-blue-300/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-sm font-semibold mb-8 shadow-xl">
              <CheckCircle className="w-5 h-5 mr-2" />
              Start Your Journey Today
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight">
              Ready to connect with
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                amazing professionals?
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of experts and institutions building the future of education together.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link
                to="/register/expert"
                className="group relative bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl text-base font-semibold hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">Join as Expert</span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300 relative z-10" />
              </Link>
              <Link
                to="/register/college"
                className="group relative bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl text-base font-semibold hover:border-gray-300 hover:bg-white hover:shadow-xl transition-all duration-300 flex items-center justify-center"
              >
                <span>Join as Institution</span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>

            {/* Premium Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-12">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-gray-700 font-semibold text-base">Free to join</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-600 fill-current" />
                </div>
                <span className="text-gray-700 font-semibold text-base">4.9/5 rating</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-gray-700 font-semibold text-base">15K+ members</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 