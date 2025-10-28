import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Target,
  Users,
  Award,
  TrendingUp,
  Heart,
  Lightbulb,
  Globe,
  Shield,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Star,
  Handshake,
  Award as AwardIcon,
  GraduationCap
} from 'lucide-react';

const AboutUs = () => {
  const values = [
    {
      icon: <Heart className="w-7 h-7" />,
      title: "Empowerment",
      description: "We believe in empowering every expert and institution to reach their full potential through meaningful connections.",
      gradient: "from-pink-500 to-rose-500",
      bgGradient: "from-pink-50 to-rose-50"
    },
    {
      icon: <Lightbulb className="w-7 h-7" />,
      title: "Innovation",
      description: "We continuously innovate to provide cutting-edge solutions that bridge the gap between industry and academia.",
      gradient: "from-yellow-500 to-orange-500",
      bgGradient: "from-yellow-50 to-orange-50"
    },
    {
      icon: <Handshake className="w-7 h-7" />,
      title: "Collaboration",
      description: "We foster a collaborative ecosystem where knowledge sharing and partnership drive collective success.",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50"
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: "Integrity",
      description: "We maintain the highest standards of integrity, transparency, and trust in everything we do.",
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50"
    }
  ];

  const teamPrinciples = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Our Mission",
      description: "To bridge the gap between industry expertise and educational institutions, fostering innovation and growth in the global education ecosystem."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Our Vision",
      description: "To become the world's most trusted platform connecting industry leaders with academic institutions, driving transformative learning experiences."
    }
  ];

  const stats = [
    { 
      number: "2,500+", 
      label: "Expert Professionals",
      icon: <Users className="w-6 h-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    { 
      number: "850+", 
      label: "Partner Institutions",
      icon: <GraduationCap className="w-6 h-6" />,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    { 
      number: "15,000+", 
      label: "Successful Connections",
      icon: <Handshake className="w-6 h-6" />,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    { 
      number: "4.9★", 
      label: "Platform Rating",
      icon: <Star className="w-6 h-6" />,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    }
  ];

  const achievements = [
    {
      icon: <AwardIcon className="w-7 h-7" />,
      title: "Best EdTech Platform 2023",
      description: "Recognized by the Global Education Awards for innovation in connecting industry with academia.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <TrendingUp className="w-7 h-7" />,
      title: "Fastest Growing Network",
      description: "Achieved 300% growth in user base within the first year of operation.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <Star className="w-7 h-7" />,
      title: "Highest Satisfaction Rate",
      description: "Maintained 98% user satisfaction rate with our verified expert network.",
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">About Us</h1>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-sm font-semibold mb-8 shadow-xl">
              <Star className="w-5 h-5 mr-2" />
              Our Story
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight">
              Building the Future of
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Education Collaboration
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              VMS Tech Hub was founded with a simple yet powerful vision: to break down barriers 
              between industry expertise and educational institutions, creating meaningful partnerships 
              that drive innovation and excellence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 sm:py-28 lg:py-36 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-br from-blue-400/15 to-cyan-400/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Purpose Driven
              <span className="block bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Values & Goals
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {teamPrinciples.map((principle, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 text-white shadow-lg">
                  {principle.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{principle.title}</h3>
                <p className="text-gray-600 leading-relaxed">{principle.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 sm:py-28 lg:py-36 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-cyan-400/15 to-blue-400/15 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Our Core
              <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent">
                Values
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do and every decision we make.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className={`h-full relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 transition-all duration-500 hover:-translate-y-2 flex flex-col`}>
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${value.bgGradient} opacity-0 group-hover:opacity-50 transition-all duration-500`}></div>
                  
                  <div className="relative z-10">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-6 flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <div className="text-white text-lg">
                        {value.icon}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex-shrink-0">
                      {value.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed flex-grow">
                      {value.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 sm:py-28 lg:py-36 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-blue-400/15 to-cyan-400/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-teal-400/15 to-blue-400/15 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              By the Numbers
              <span className="block bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Our Impact
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className={`w-16 h-16 ${stat.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <span className={stat.color}>
                    {stat.icon}
                  </span>
                </div>
                <div className={`text-3xl sm:text-4xl font-bold mb-2 ${stat.color} group-hover:scale-105 transition-transform duration-300`}>
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
ByName              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 sm:py-28 lg:py-36 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-indigo-400/15 to-blue-400/15 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Recognition &
              <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Achievements
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our commitment to excellence has been recognized across the industry.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="group"
              >
                <div className="h-full relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 transition-all duration-500 hover:-translate-y-2">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${achievement.gradient} flex items-center justify-center mb-6 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {achievement.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{achievement.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{achievement.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 lg:py-36 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-br from-blue-400/15 to-cyan-400/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className战役="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-sm font-semibold mb-8 shadow-xl">
              <CheckCircle className="w-5 h-5 mr-2" />
              Join Our Mission
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight">
              Ready to be part of
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                something bigger?
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of experts and institutions who are transforming education through meaningful collaboration.
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

            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-700 font-medium">Free to join</span>
              <div className="h-4 w-px bg-gray-300 mx-2"></div>
              <Star className="w-5 h-5 text-yellow-600 fill-current" />
              <span className="text-gray-700 font-medium">4.9/5 rating</span>
              <div className="h-4 w-px bg-gray-300 mx-2"></div>
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-gray-700 font-medium">15K+ members</span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;

