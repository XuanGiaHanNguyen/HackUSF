import React from "react";
import { motion } from "framer-motion"
import { RocketIcon } from "../assets/icon";

const WorkDone = () => {
  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.1)", // Lighter overlay to match the light background
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    zIndex: 50,
    backdropFilter: "blur(5px)", // Keeping the modern blur effect
  }

  return (
    <div style={overlayStyle} className="transition-all duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-[#dbe0d1] rounded-xl shadow-lg min-w-xl w-4/5 max-w-4xl relative"
      >
        <div className="p-8 space-y-6">
          <div className="mb-6">
            <div className="flex flex-col justify-center align-center items-center gap-2 mb-3 pb-1 w-full">
              <div className="rounded-full p-4 bg-neutral-100">
                {RocketIcon}
              </div>
              <h2 className="text-3xl font-bold text-[rgb(65,112,70)]">
                Test Completed
              </h2>
            </div>

          </div>

          <div className="bg-neutral-100 rounded-lg p-5 pb-8">
            <h2 className="text-2xl font-bold text-[rgb(75,122,80)] mb-4">
              Score Board : 
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-[#c6c9bd] rounded-full w-8 h-8 flex items-center justify-center text-neutral-100 font-medium shrink-0">
                  1
                </div>
                <p className="text-gray-600">
                  <span className="font-semibold text-gray-800">Camera Activation:</span> The user grants permission for
                  the web app to access their camera.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-[#c6c9bd] rounded-full w-8 h-8 flex items-center justify-center text-neutral-100 font-medium shrink-0">
                  2
                </div>
                <p className="text-gray-600">
                  <span className="font-semibold text-gray-800">Gesture Detection:</span> The app analyzes hand
                  movements and positions using advanced detection algorithms.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-2 bg-lime-800 hover:bg-lime-700 text-gray-100 font-medium rounded-lg transition-all duration-200"
            >
              What does this means? 
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default WorkDone

