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
  MessageCircle
} from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: <Search className="w-8 h-8 md:w-10 md:h-10" />,
      title: "Smart Discovery",
      description: "Advanced search and filtering to find the perfect match between experts and colleges."
    },
    {
      icon: <Shield className="w-8 h-8 md:w-10 md:h-10" />,
      title: "Trust & Verification",
      description: "Verified profiles with ratings and reviews to ensure quality connections."
    },
    {
      icon: <TrendingUp className="w-8 h-8 md:w-10 md:h-10" />,
      title: "Growth Opportunities",
      description: "Expand your network and discover new opportunities in academia and industry."
    },
    {
      icon: <MessageCircle className="w-8 h-8 md:w-10 md:h-10" />,
      title: "Direct Communication",
      description: "Connect directly with experts and colleges through our secure platform."
    }
  ];

  const stats = [
    { number: "500+", label: "Expert Professionals" },
    { number: "200+", label: "Colleges & Universities" },
    { number: "1000+", label: "Successful Connections" },
    { number: "4.8★", label: "Average Rating" }
  ];

  const benefits = [
    "Connect with industry experts and academic professionals",
    "Post and discover academic requirements easily",
    "Verified profiles with trust badges",
    "Direct communication and contact information",
    "Advanced search and filtering options",
    "Secure and reliable platform"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold font-heading leading-tight">
                  Connect Experts with
                  <span className="block text-yellow-300">Colleges</span>
                </h1>
                <p className="text-xl text-primary-100 max-w-2xl">
                  The premier B2B platform connecting domain experts with colleges and universities
                  for webinars, workshops, guest lectures, and teaching opportunities.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register/expert"
                  className="btn-primary btn-lg group"
                >
                  Join as Expert
                  <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/register/college"
                  className="btn-outline btn-lg text-white border-white hover:bg-white hover:text-primary-700"
                >
                  Join as College
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20 shadow-xl flex flex-col items-center">
                  <div className="flex items-center space-x-6 mb-6">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                      <GraduationCap className="w-10 h-10 md:w-12 md:h-12 text-primary-800" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-2xl md:text-3xl">Dr. Sarah Johnson</h3>
                      <p className="text-primary-200 text-lg">AI & Machine Learning Expert</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-6 h-6 fill-current" />
                      ))}
                    </div>
                    <span className="text-base text-primary-100">4.9 (127 reviews)</span>
                  </div>
                  <p className="text-primary-100 text-center text-lg">
                    "Connected with 15+ colleges for AI workshops. The platform made it incredibly easy to showcase my expertise and find relevant opportunities."
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-secondary-600 text-lg">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-secondary-900 mb-4">
              Why Choose Expert College Connect?
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Our platform provides the perfect bridge between domain experts and educational institutions,
              facilitating meaningful connections and opportunities.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card p-8 text-center hover:shadow-2xl transition-shadow rounded-2xl"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-md">
                  <div className="text-primary-600">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-secondary-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-secondary-600 text-lg">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-secondary-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-secondary-600">
              Simple steps to connect and grow your network
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-2xl font-semibold text-secondary-900 mb-4">
                Create Your Profile
              </h3>
              <p className="text-secondary-600 text-lg">
                Sign up as an expert or college and create your detailed profile with all relevant information.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-2xl font-semibold text-secondary-900 mb-4">
                Search & Connect
              </h3>
              <p className="text-secondary-600 text-lg">
                Use our advanced search to find experts or requirements that match your needs.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-2xl font-semibold text-secondary-900 mb-4">
                Collaborate & Grow
              </h3>
              <p className="text-secondary-600 text-lg">
                Connect directly, share contact information, and build lasting professional relationships.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-secondary-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-secondary-900 mb-6">
                Benefits for Everyone
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <CheckCircle className="w-7 h-7 text-success-600 flex-shrink-0" />
                    <span className="text-secondary-700 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              <div className="card p-8 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-semibold text-secondary-900 mb-4">
                  For Experts
                </h3>
                <ul className="space-y-2 text-secondary-600 text-lg">
                  <li>• Showcase your expertise to colleges</li>
                  <li>• Get discovered for teaching opportunities</li>
                  <li>• Build your professional network</li>
                  <li>• Earn additional income</li>
                </ul>
              </div>

              <div className="card p-8 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-semibold text-secondary-900 mb-4">
                  For Colleges
                </h3>
                <ul className="space-y-2 text-secondary-600 text-lg">
                  <li>• Find qualified experts easily</li>
                  <li>• Post requirements and get responses</li>
                  <li>• Verify expert credentials</li>
                  <li>• Enhance student learning</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h2 className="text-4xl font-bold">
              Ready to Connect?
            </h2>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Join thousands of experts and colleges who are already using our platform
              to create meaningful connections and opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register/expert"
                className="btn-secondary btn-lg"
              >
                Join as Expert
              </Link>
              <Link
                to="/register/college"
                className="btn-outline btn-lg text-white border-white hover:bg-white hover:text-primary-700"
              >
                Join as College
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 