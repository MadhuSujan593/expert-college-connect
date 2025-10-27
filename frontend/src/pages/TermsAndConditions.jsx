import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft, Shield, AlertCircle, Link as LinkIcon } from 'lucide-react';

const TermsAndConditions = () => {
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
              <FileText className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Terms & Conditions</h1>
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

            {/* Definitions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-10">
              <div className="flex items-start space-x-3">
                <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Definitions</h3>
                  <p className="text-gray-700 leading-relaxed">
                    For the purpose of these Terms and Conditions, The term <strong>"we"</strong>, <strong>"us"</strong>, <strong>"our"</strong> used anywhere on this page shall mean <strong>VMS CONSULTIX PRIVATE LIMITED</strong>, whose registered/operational office is No-3, 1st Crs Rd, Dwaraka L/O, Kithaganu, Virgonagar Bangalore Bangalore North Karnataka India 560049 Virgonagar KARNATAKA 560049.
                  </p>
                  <p className="text-gray-700 leading-relaxed mt-3">
                    <strong>"you"</strong>, <strong>"your"</strong>, <strong>"user"</strong>, <strong>"visitor"</strong> shall mean any natural or legal person who is visiting our website and/or agreed to purchase from us.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed mb-10">
              Your use of the website and/or purchase from us are governed by following Terms and Conditions:
            </p>

            {/* Terms List */}
            <div className="space-y-8">
              {/* Term 1 */}
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
                      The content of the pages of this website is subject to change without notice.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Term 2 */}
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
                      Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials found or offered on this website for any particular purpose. You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Term 3 */}
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
                      Your use of any information or materials on our website and/or product pages is entirely at your own risk, for which we shall not be liable. It shall be your own responsibility to ensure that any products, services or information available through our website and/or product pages meet your specific requirements.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Term 4 */}
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
                      Our website contains material which is owned by or licensed to us. This material includes, but are not limited to, the design, layout, look, appearance and graphics. Reproduction is prohibited other than in accordance with the copyright notice, which forms part of these terms and conditions.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Term 5 */}
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
                      All trademarks reproduced in our website which are not the property of, or licensed to, the operator are acknowledged on the website.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Term 6 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-red-50 border border-red-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-gray-700 leading-relaxed">
                      Unauthorized use of information provided by us shall give rise to a claim for damages and/or be a criminal offense.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Term 7 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold">7</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 leading-relaxed">
                      From time to time our website may also include links to other websites. These links are provided for your convenience to provide further information.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Term 8 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-3">
                  <LinkIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-gray-700 leading-relaxed">
                      You may not create a link to our website from another website or document without <strong>VMS CONSULTIX PRIVATE LIMITED's</strong> prior written consent.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Term 9 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold">9</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 leading-relaxed">
                      Any dispute arising out of use of our website and/or purchase with us and/or any engagement with us is subject to the laws of <strong>India</strong>.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Term 10 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="bg-amber-50 border border-amber-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-gray-700 leading-relaxed">
                      We, shall be under no liability whatsoever in respect of any loss or damage arising directly or indirectly out of the decline of authorization for any Transaction, on Account of the Cardholder having exceeded the preset limit mutually agreed by us with our acquiring bank from time to time.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Contact Information */}
            <div className="mt-12 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-8 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms and Conditions, please contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Company:</strong> VMS CONSULTIX PRIVATE LIMITED</p>
                <p><strong>Address:</strong> No-3, 1st Crs Rd, Dwaraka L/O, Kithaganu, Virgonagar</p>
                <p><strong>City:</strong> Bangalore North Karnataka</p>
                <p><strong>State:</strong> KARNATAKA</p>
                <p><strong>Pin Code:</strong> 560049</p>
                <p><strong>Country:</strong> India</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default TermsAndConditions;

