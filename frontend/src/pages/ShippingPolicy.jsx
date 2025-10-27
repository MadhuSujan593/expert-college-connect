import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Truck, ArrowLeft, Package, Clock, Mail, Phone, AlertCircle } from 'lucide-react';

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
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
            <div className="flex items-center space-x-3">
              <Truck className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Shipping & Delivery Policy</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Last Updated */}
            <div className="text-right text-sm text-gray-500 mb-8">
              Last updated on Oct 26 2025
            </div>

            {/* International Shipping */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">International Shipping</h3>
                  <p className="text-gray-700 leading-relaxed">
                    For International buyers, orders are shipped and delivered through registered international courier companies and/or International speed post only.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Domestic Shipping */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Domestic Shipping</h3>
                  <p className="text-gray-700 leading-relaxed">
                    For domestic buyers, orders are shipped through registered domestic courier companies and /or speed post only.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Delivery Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-3">
                <Clock className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Delivery Timeline</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Orders are shipped within 0-7 days or as per the delivery date agreed at the time of order confirmation and delivering of the shipment subject to Courier Company / post office norms.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Liability Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6"
            >
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Important Notice</h3>
                  <p className="text-gray-700 leading-relaxed">
                    <strong>VMS CONSULTIX PRIVATE LIMITED</strong> is not liable for any delay in delivery by the courier company / postal authorities and only guarantees to hand over the consignment to the courier company or postal authorities within 0-7 days from the date of the order and payment or as per the delivery date agreed at the time of order confirmation.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Delivery Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
            >
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Delivery Address & Services</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Delivery of all orders will be to the address provided by the buyer. Delivery of our services will be confirmed on your mail ID as specified during registration.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Contact Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-8 border border-blue-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                For any issues in utilizing our services, you may contact our helpdesk:
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-700">
                  <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-lg font-semibold">9000621876</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-lg">contact@vmsconsultix.com</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-blue-200">
                <div className="space-y-2 text-gray-700 text-sm">
                  <p><strong>Company:</strong> VMS CONSULTIX PRIVATE LIMITED</p>
                  <p><strong>Address:</strong> No-3, 1st Crs Rd, Dwaraka L/O, Kithaganu, Virgonagar</p>
                  <p><strong>City:</strong> Bangalore North Karnataka</p>
                  <p><strong>State:</strong> KARNATAKA</p>
                  <p><strong>Pin Code:</strong> 560049</p>
                  <p><strong>Country:</strong> India</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ShippingPolicy;

