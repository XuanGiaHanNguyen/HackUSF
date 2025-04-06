import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import char from "../assets/char.png";
import { useNavigate } from "react-router-dom";

const Surland = ({ setShowSurvey, setUserName }) => {
  const [inputValue, setInputValue] = useState("");

  const navigate = useNavigate()

  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    zIndex: 50,
    backdropFilter: "blur(5px)",
  };

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    if (storedName) {
      setInputValue(storedName);
    }
  }, []);

  const handleContinue = () => {
    if (inputValue.trim()) {
      setUserName(inputValue);
    }
    setShowSurvey(false);
    navigate("/loading")
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    localStorage.setItem("name", value);
  };

  const handleClose = () => {
    setShowSurvey(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    handleContinue();
  };

  return (
    <div style={overlayStyle} className="transition-all duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-[#efe8e0] rounded-3xl shadow-lg min-w-lg w-1/3 max-w-4xl relative"
      >
       
        <div className="px-8 py-10 flex flex-col">
          <div className="flex flex-row justify-end pr-3">
            <div className="flex-3 flex flex-col text-center align-start justify-center">
              <p className="font-bold text-2xl text-[#523c00]">
                Hello! My name is <span className="text-[#ab7d00]">Puffer</span>
              </p>
            </div>

            <img src={char} width={100} className="flex-1" />
          </div>

          <form className="flex items-start gap-3" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Choose your name..."
              value={inputValue}
              onChange={handleInputChange}
              className="w-full py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400 text-center"
            />
          </form>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => window.location.href = '/loading'}
              className="px-6 py-2 bg-[#543a27] hover:bg-[#4f3c2e] text-gray-100 font-medium rounded-lg transition-all duration-200"
            >
              Close
            </button>
            <button
              onClick={handleContinue}
              className="px-4 py-2 bg-[#543a27] hover:bg-[#3f2615] text-gray-100 font-medium rounded-lg transition-all duration-200"
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