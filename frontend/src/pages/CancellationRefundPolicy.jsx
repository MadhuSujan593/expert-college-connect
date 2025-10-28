import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RefreshCcw, ArrowLeft, Clock, AlertTriangle, Shield, CheckCircle } from 'lucide-react';

const CancellationRefundPolicy = () => {
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
              <RefreshCcw className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Cancellation & Refund Policy</h1>
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

            {/* Introduction */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-10">
              <div className="flex items-start space-x-3">
                <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Our Policy</h3>
                  <p className="text-gray-700 leading-relaxed">
                    <strong>VMS CONSULTIX PRIVATE LIMITED</strong> believes in helping its customers as far as possible, and has therefore a liberal cancellation policy. Under this policy:
                  </p>
                </div>
              </div>
            </div>

            {/* Policy Points */}
            <div className="space-y-6">
              {/* Point 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 leading-relaxed">
                      Cancellations will be considered only if the request is made within <strong>7 days</strong> of placing the order. However, the cancellation request may not be entertained if the orders have been communicated to the vendors/merchants and they have initiated the process of shipping them.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Point 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 leading-relaxed">
                      <strong>VMS CONSULTIX PRIVATE LIMITED</strong> does not accept cancellation requests for perishable items like flowers, eatables etc. However, refund/replacement can be made if the customer establishes that the quality of product delivered is not good.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Point 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold">3</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 leading-relaxed">
                      In case of receipt of damaged or defective items please report the same to our Customer Service team. The request will, however, be entertained once the merchant has checked and determined the same at his own end. This should be reported within <strong>7 days</strong> of receipt of the products.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Point 4 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold">4</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 leading-relaxed">
                      In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within <strong>7 days</strong> of receiving the product. The Customer Service Team after looking into your complaint will take an appropriate decision.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Point 5 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold">5</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 leading-relaxed">
                      In case of complaints regarding products that come with a warranty from manufacturers, please refer the issue to them.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Refund Timeline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-green-50 border border-green-200 rounded-lg p-6"
              >
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Refund Processing</h3>
                    <p className="text-gray-700 leading-relaxed">
                      In case of any Refunds approved by the <strong>VMS CONSULTIX PRIVATE LIMITED</strong>, it'll take <strong>6-8 days</strong> for the refund to be processed to the end customer.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Important Notice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="bg-amber-50 border border-amber-200 rounded-lg p-6"
              >
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Important Notice</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Please note that all cancellation and refund requests are subject to verification and approval by our Customer Service team. We reserve the right to reject any request that does not comply with our policy terms.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Contact Information */}
            <div className="mt-12 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-8 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                If you have any questions about our Cancellation & Refund Policy, please contact us:
              </p>
              
              <div className="space-y-2 text-gray-700">
                <p><strong>Company:</strong> VMS CONSULTIX PRIVATE LIMITED</p>
                <p><strong>Address:</strong> No-3, 1st Crs Rd, Dwaraka L/O, Kithaganu, Virgonagar</p>
                <p><strong>City:</strong> Bangalore North Karnataka</p>
                <p><strong>State:</strong> KARNATAKA</p>
                <p><strong>Pin Code:</strong> 560049</p>
                <p><strong>Country:</strong> India</p>
                <p className="mt-4"><strong>Phone:</strong> 9000621876</p>
                <p><strong>Email:</strong> contact@vmstechhub.com</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default CancellationRefundPolicy;

