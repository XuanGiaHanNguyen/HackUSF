import React from "react";
import { motion } from "framer-motion"

const Instructions = () => {
  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)", // Darker overlay for more contrast
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    zIndex: 50,
    backdropFilter: "blur(5px)", // Modern blur effect
  }

  return (
    <div style={overlayStyle} className="transition-all duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-cyan-950 to-black rounded-xl shadow-2xl min-w-xl w-3/4 max-w-2xl relative border border-gray-900"
      >
        <div className="p-6">
          <div >
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-gray-700 pb-2">How It Works</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center text-white font-medium shrink-0">
                  1
                </div>
                <p className="text-gray-300">
                  <span className="font-semibold text-white">Camera Activation:</span> The user grants permission for
                  the web app to access their camera.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center text-white font-medium shrink-0">
                  2
                </div>
                <p className="text-gray-300">
                  <span className="font-semibold text-white">Gesture Detection:</span> The app analyzes hand movements
                  and positions using advanced detection algorithms.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center text-white font-medium shrink-0">
                  3
                </div>
                <p className="text-gray-300">
                  <span className="font-semibold text-white">Translation:</span> Recognized signs are mapped to their
                  English equivalents and displayed on-screen.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8 flex justify-end">
            <button
              onClick={() => window.history.back()}
              className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Instructions

