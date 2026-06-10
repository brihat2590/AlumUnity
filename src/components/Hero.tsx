"use client";

import React, { useState, useEffect } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Users, Calendar, Video, ChevronDown } from 'lucide-react';
import { Button } from "./ui/button";

export const Hero: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter(); // ✅ Added router

  const images = [
    {
      url: "https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg",
      alt: "Excited graduate throwing cap in the air"
    },
    {
      url: "https://images.pexels.com/photos/4145153/pexels-photo-4145153.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      alt: "Student and mentor having a discussion"
    },
    {
      url: "https://images.pexels.com/photos/6325984/pexels-photo-6325984.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      alt: "Students celebrating graduation success"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const statsVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.2 },
    },
  };

  const statItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const floatingCircleVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const handleJoinClick = () => {
    router.push("/sign-in"); // ✅ This will handle both buttons
  };

  return (
    <section className="min-h-screen pt-28 pb-16 md:pt-32 md:pb-24 bg-gradient-to-b from-primary-50 to-white overflow-hidden relative">
      {/* Animated Background */}
      <motion.div
        className="absolute top-20 right-10 w-64 h-64 rounded-full bg-primary-100/30 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-secondary-100/30 blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="inline-block px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium mb-2"
            >
              Connect • Learn • Grow
            </motion.div>

            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-primary-900 leading-tight"
              >
                Connect Students with{' '}
                <span className="text-primary-600">Alumni</span> for Success
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="text-lg text-gray-600 md:pr-12"
              >
                AlumUnity bridges the gap between students and alumni,
                creating opportunities for mentorship, networking, and
                career guidance all in one platform.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              {/* Join as Student */}
              <Button
                size="lg"
                className="group"
                onClick={handleJoinClick} // ✅ Added click handler
              >
                <span>Join as Student</span>
                <motion.span
                  className="inline-block ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  →
                </motion.span>
              </Button>

              {/* Join as Alumni */}
              <Button
                variant="outline"
                size="lg"
                className="group"
                onClick={handleJoinClick} // ✅ Same handler
              >
                <span>Join as Alumni</span>
                <motion.span
                  className="inline-block ml-2 opacity-0 group-hover:opacity-100"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  →
                </motion.span>
              </Button>
            </motion.div>

            <motion.div
              variants={statsVariants}
              initial="hidden"
              animate="visible"
              className="flex items-center space-x-6 text-sm text-gray-600"
            >
              <motion.div variants={statItemVariants} className="flex items-center">
                <Users className="w-5 h-5 text-primary-600 mr-2" />
                <span>200+ Mentors</span>
              </motion.div>
              <motion.div variants={statItemVariants} className="flex items-center">
                <Calendar className="w-5 h-5 text-primary-600 mr-2" />
                <span>1K Sessions</span>
              </motion.div>
              <motion.div variants={statItemVariants} className="flex items-center">
                <Video className="w-5 h-5 text-primary-600 mr-2" />
                <span>100+ Livestreams</span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 rounded-2xl shadow-raised overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={images[currentImageIndex].url}
                  alt={images[currentImageIndex].alt}
                  className="w-full h-[600px] object-cover rounded-2xl"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                />
              </AnimatePresence>
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-primary-900/20 to-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              />
            </div>

            <motion.div
              // variants={floatingCircleVariants}
              animate="animate"
              className="absolute -bottom-6 -right-6 w-72 h-72 bg-secondary-100 rounded-full -z-10"
            />
            <motion.div
              // variants={floatingCircleVariants}
              animate="animate"
              transition={{ delay: 1 }}
              className="absolute -top-6 -left-6 w-48 h-48 bg-primary-100 rounded-full -z-10"
            />

            {/* Image Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                    }`}
                />
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ delay: 2, duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
        >
          <ChevronDown className="w-6 h-6 text-primary-600" />
        </motion.div>
      </div>
    </section>
  );
};
