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
        className="bg-[#7c5b00] rounded-2xl shadow-lg min-w-xl w-3/5 max-w-2xl relative"
      >
        {/* Decorative elements to match LoadingPage */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#7c5b00]/10 rounded-full filter blur-3xl"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#7c5b00]/10 rounded-full filter blur-3xl"></div>

        <div className="px-8 py-5 space-y-6 relative z-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white border-b border-[#7c5b00rgba(255,255,255,0.3)] pb-2 mb-3">
              Overview
            </h2>
            <p className="text-gray-100 leading-relaxed">
              SkinScan AI is a web app that uses an AI model and the ABCDE method to assess skin cancer risk. Users upload a lesion image and provide lifestyle info, and the app returns a cancer probability with personalized advice.
            </p>
          </div>

          <div className="bg-neutral-100 rounded-lg p-5 pb-8">
            <h2 className="text-2xl font-bold text-[#543a27] mb-4 border-b border-[rgb(65,112,70)]/20 pb-2">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-1">
                  <div className="bg-[#7c5b00]/20 rounded-full w-8 h-8 flex items-center justify-center text-[#543a27] font-medium shrink-0">
                    1
                  </div>
                  <span className="font-semibold text-gray-800">Photo Capture</span>
                </div>
                <p className="text-gray-600 pl-11">
                  Take or upload a clear image of your skin lesion.
                </p>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-1">
                  <div className="bg-[#7c5b00]/20 rounded-full w-8 h-8 flex items-center justify-center text-[#543a27] font-medium shrink-0">
                    2
                  </div>
                  <span className="font-semibold text-gray-800">Health Profile</span>
                </div>
                <p className="text-gray-600 pl-11">
                  Answer brief questions about sun exposure and skincare habits.
                </p>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-1">
                  <div className="bg-[#7c5b00]/20 rounded-full w-8 h-8 flex items-center justify-center text-[#543a27] font-medium shrink-0">
                    3
                  </div>
                  <span className="font-semibold text-gray-800">ABCDE Analysis</span>
                </div>
                <p className="text-gray-600 pl-11">
                  AI examines lesion characteristics using the ABCDE method.
                </p>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-1">
                  <div className="bg-[#7c5b00]/20 rounded-full w-8 h-8 flex items-center justify-center text-[#543a27] font-medium shrink-0">
                    4
                  </div>
                  <span className="font-semibold text-gray-800">Personalized Report</span>
                </div>
                <p className="text-gray-600 pl-11">
                  Receive risk assessment and recommended next steps.
                </p>
              </div>
            </div>

          </div>

          <div className="flex justify-end">
            <motion.button
              onClick={() => window.history.back()}
              className="px-4 py-1 bg-white text-[#543a27] font-medium rounded-xl transition-all duration-200 hover:bg-zinc-200 transition-all duration-200"
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