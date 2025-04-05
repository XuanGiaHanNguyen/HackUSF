import React from "react";
import { motion } from "framer-motion"

const AboutUs = () => {
  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(235, 228, 220, 0.4)", // Matching the beige/cream from LoadingPage
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    zIndex: 50,
    backdropFilter: "blur(5px)",
  }

  return (
    <div style={overlayStyle} className="transition-all duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-[rgb(65,112,70)] rounded-xl shadow-lg min-w-xl w-3/4 max-w-2xl relative"
      >
        {/* Decorative elements to match LoadingPage */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[rgb(65,112,70)]/10 rounded-full filter blur-3xl"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[rgb(65,112,70)]/10 rounded-full filter blur-3xl"></div>

        <div className="px-8 py-5 space-y-6 relative z-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white border-b border-[rgba(255,255,255,0.3)] pb-2 mb-3">
              Overview
            </h2>
            <p className="text-gray-100 leading-relaxed">
              Sign Connect is a web-based application designed to bridge communication gaps by translating sign language
              into English in real-time. Using a user's camera, the application detects hand gestures and converts them
              into readable text, making it an accessible tool for individuals who use sign language and those who wish
              to understand it.
            </p>
          </div>

          <div className="bg-neutral-100 rounded-lg p-5 pb-8">
            <h2 className="text-2xl font-bold text-[rgb(65,112,70)] mb-4 border-b border-[rgb(65,112,70)]/20 pb-2">
              How It Works
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-[rgb(65,112,70)]/20 rounded-full w-8 h-8 flex items-center justify-center text-[rgb(65,112,70)] font-medium shrink-0">
                  1
                </div>
                <p className="text-gray-600">
                  <span className="font-semibold text-gray-800">Camera Activation:</span> The user grants permission for
                  the web app to access their camera.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-[rgb(65,112,70)]/20 rounded-full w-8 h-8 flex items-center justify-center text-[rgb(65,112,70)] font-medium shrink-0">
                  2
                </div>
                <p className="text-gray-600">
                  <span className="font-semibold text-gray-800">Gesture Detection:</span> The app analyzes hand
                  movements and positions using advanced detection algorithms.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <motion.button
              onClick={() => window.history.back()}
              className="px-5 py-2 bg-[rgb(65,112,70)] hover:bg-[rgb(65,112,70)]/80 text-white border-2 border-white font-medium rounded-lg transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Close
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AboutUs

