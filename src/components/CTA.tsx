import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen } from 'lucide-react';

export const Cta: React.FC = () => {
  return (
    <section className="py-24 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* For Students */}
          <motion.div
            id="for-students"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-primary-50 rounded-2xl p-8 md:p-10 relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary-100 z-0"></div>
            <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-primary-100 z-0"></div>
            
            <div className="relative z-10">
              <div className="mb-6 inline-block p-3 bg-primary-600 rounded-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-3xl font-heading font-bold text-primary-900 mb-4">
                For Students
              </h2>
              
              <p className="text-lg text-gray-700 mb-8 max-w-lg">
                Connect with alumni who&apos;ve walked your path. Get personalized mentorship, 
                career guidance, and insights that will help shape your future success.
              </p>
              
              <ul className="space-y-3 mb-8">
                {[
                  'Get career advice from experienced professionals',
                  'Find mentors in your dream industry',
                  'Access exclusive job and internship opportunities',
                  'Build a powerful professional network early',
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-5 h-5 bg-primary-600 rounded-full mr-3 mt-1 flex-shrink-0"></span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              
              
            </div>
          </motion.div>
          
          {/* For Alumni */}
          <motion.div
            id="for-alumni"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-secondary-50 rounded-2xl p-8 md:p-10 relative overflow-hidden"
          >
            <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-secondary-100 z-0"></div>
            <div className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full bg-secondary-100 z-0"></div>
            
            <div className="relative z-10">
              <div className="mb-6 inline-block p-3 bg-secondary-600 rounded-lg">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-3xl font-heading font-bold text-primary-900 mb-4">
                For Alumni
              </h2>
              
              <p className="text-lg text-gray-700 mb-8 max-w-lg">
                Give back to your university community by sharing your experience and wisdom. 
                Connect with promising students and help shape the next generation of professionals.
              </p>
              
              <ul className="space-y-3 mb-8">
                {[
                  'Share your expertise and professional insights',
                  'Build your professional network and reputation',
                  'Discover promising talent for your organization',
                  'Strengthen ties with your university community',
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-5 h-5 bg-secondary-600 rounded-full mr-3 mt-1 flex-shrink-0"></span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              
              
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};