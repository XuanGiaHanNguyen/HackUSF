import React from "react";
import { motion } from "framer-motion"
import char from "../assets/char.png";

const Surland = () => {
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
        className=" bg-[#dbd3c8] rounded-2xl shadow-lg min-w-xl w-1/2 max-w-4xl relative"
      >
        <div className="p-8 flex flex-col">
          <div className="flex flex-row justify-end pr-3 ">
            <div className="flex-3 flex flex-col text-center align-start justify-center">
              <p className="font-bold text-3xl text-[#523c00]">Hello! My name is <span className="text-[#ab7d00]">Puffer</span></p>
            </div>
            <img src={char} width={100} className="flex-1"/>
          </div>
           
              <form className="flex items-start gap-3">
              <input
                type="text"
                placeholder="Choose your name..."
                className=" w-full py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400 text-center"
              />
              </form>

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => window.location.href = '/loading'}
              className="px-6 py-2 bg-[#543a27] hover:bg-[#4f3c2e] text-gray-100 font-medium rounded-lg transition-all duration-200"
            >
              Continue
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Surland

