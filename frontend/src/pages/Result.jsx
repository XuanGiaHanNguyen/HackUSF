import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Printer,
  Download,
  Share2,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";
import { Icon2Icon } from "../assets/icon";
import { Link } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SkinAnalysisResults = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  // Sample results - in production this would come from your ML model
  const results = {
    classification: "Benign", // "Benign" or "Malignant"
    confidenceLevel: 95, // percentage
    // probability: 82,

    abcdeAnalysis: {
      asymmetry: {
        score: 4,
        maxScore: 5,
      },
      border: {
        score: 3,
        maxScore: 5,
      },
      color: {
        score: 4,
        maxScore: 5,
      },
      diameter: {
        score: 3,
        maxScore: 5,
      },
      evolution: {
        score: 2,
        maxScore: 5,
      },
    },
  };

  useEffect(() => {
    // Simulate loading time for animations
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  // Function to determine progress bar color based on score
  const getProgressColor = (score, maxScore) => {
    const ratio = score / maxScore;
    if (ratio <= 0.3) return "bg-green-800";
    if (ratio <= 0.6) return "bg-yellow-600";
    return "bg-red-700";
  };

  // Function to render progress bar
  const ProgressBar = ({ score, maxScore }) => {
    const width = (score / maxScore) * 100;
    const color = getProgressColor(score, maxScore);

    return (
      <div className="w-full bg-gradient-to-b from-neutral-100 to-[rgba(235,228,220,255)] rounded-full h-2.5 my-2">
        <motion.div
          className={`h-2.5 rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-b from-neutral-50 to-amber-50 min-h-screen  py-4 pt-6 px-14">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-row justify-between align-between w-full pb-4">
          <div className="flex flex-row gap-2 text-lg font-bold">
            {Icon2Icon}
            <h2 className="font-bold text-3xl text-[#7c5b00]">SkinIntel</h2>
          </div>
          <div className="flex flex-row gap-5">
            <div className="bg-[#7c5b00] rounded-lg px-6 py-2 text-sm text-white font-semibold transition-transform duration-200 hover:scale-105 shadow-sm">
              Reference
            </div>
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2"
        >
          {/* Classification */}
          <motion.div
            variants={itemVariants}
            className="bg-white border-dashed border-2 border-[#7c5b00] rounded-lg shadow-sm overflow-hidden my-4 mr-4"
          >
            <div className="p-4 border-b-2 border-dashed border-[#7c5b00]">
              <h2 className="font-semibold font-semibold text-yellow-800">
                Classification
              </h2>
            </div>
            <div className="p-6">
              <div className="flex gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-4 w-4 rounded-full ${
                      results.classification === "Benign"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                  <span
                    className={`font-medium ${
                      results.classification === "Benign"
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {results.classification}
                  </span>
                </div>
                <div className="flex items-center gap-2 opacity-30">
                  <div className="h-4 w-4 rounded-full bg-gray-400"></div>
                  <span className="font-medium text-gray-400">
                    {results.classification === "Benign"
                      ? "Malignant"
                      : "Benign"}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">
                    Confidence Level
                  </span>
                  <span className="text-sm font-medium">
                    {results.confidenceLevel}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-green-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${results.confidenceLevel}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Probability Assessment */}
          <motion.div
            variants={itemVariants}
            className="bg-white  border-dashed border-2 border-[#7c5b00] rounded-lg shadow-sm overflow-hidden my-4 ml-4"
          >
            <div className="p-4 border-b-2 border-dashed border-[#7c5b00]">
              <h2 className="font-semibold text-yellow-800">
                Confidence Level
              </h2>
            </div>
            <div className="p-6 flex justify-center items-center">
              <div className="relative">
                <motion.div
                  className="w-32 h-32"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="#E5E7EB"
                      strokeWidth="10"
                      fill="none"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="#975B00"
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray="283"
                      initial={{ strokeDashoffset: 283 }}
                      animate={{
                        strokeDashoffset:
                          283 - (283 * results.probability) / 100,
                      }}
                      transition={{ duration: 1.5, delay: 1 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                      className="text-2xl font-bold text-amber-800"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.5 }}
                    >
                      {results.confidenceLevel}%
                    </motion.span>
                    <motion.span
                      className="text-xs text-gray-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.7 }}
                    >
                      Probability
                    </motion.span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* ABCDE Criteria Analysis */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-lg  border-dashed border-2 border-[#7c5b00] shadow-sm overflow-hidden col-span-1 md:col-span-3"
          >
            <div className="p-4 border-b-2 border-dashed border-[#7c5b00] flex justify-between items-center">
              <h2 className="font-semibold  text-yellow-800">
                ABCDE Criteria Analysis
              </h2>
              <div className="text-xs  text-yellow-800">
                Assessment based on the standard dermatological criteria
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Asymmetry */}
              <div>
                <div className="flex justify-between">
                  <span className="font-medium">Asymmetry</span>
                  <span className="text-sm">
                    {results.abcdeAnalysis.asymmetry.score}/
                    {results.abcdeAnalysis.asymmetry.maxScore}
                  </span>
                </div>
                <ProgressBar
                  score={results.abcdeAnalysis.asymmetry.score}
                  maxScore={results.abcdeAnalysis.asymmetry.maxScore}
                />
              </div>

              {/* Border */}
              <div>
                <div className="flex justify-between">
                  <span className="font-medium">Border</span>
                  <span className="text-sm">
                    {results.abcdeAnalysis.border.score}/
                    {results.abcdeAnalysis.border.maxScore}
                  </span>
                </div>
                <ProgressBar
                  score={results.abcdeAnalysis.border.score}
                  maxScore={results.abcdeAnalysis.border.maxScore}
                />
              </div>

              {/* Color */}
              <div>
                <div className="flex justify-between">
                  <span className="font-medium">Color</span>
                  <span className="text-sm">
                    {results.abcdeAnalysis.color.score}/
                    {results.abcdeAnalysis.color.maxScore}
                  </span>
                </div>
                <ProgressBar
                  score={results.abcdeAnalysis.color.score}
                  maxScore={results.abcdeAnalysis.color.maxScore}
                />
              </div>

              {/* Diameter */}
              <div>
                <div className="flex justify-between">
                  <span className="font-medium">Diameter</span>
                  <span className="text-sm">
                    {results.abcdeAnalysis.diameter.score}/
                    {results.abcdeAnalysis.diameter.maxScore}
                  </span>
                </div>
                <ProgressBar
                  score={results.abcdeAnalysis.diameter.score}
                  maxScore={results.abcdeAnalysis.diameter.maxScore}
                />
              </div>

              {/* Evolution */}
              <div className="md:col-span-2">
                <div className="flex justify-between">
                  <span className="font-medium">Evolution</span>
                  <span className="text-sm">
                    {results.abcdeAnalysis.evolution.score}/
                    {results.abcdeAnalysis.evolution.maxScore}
                  </span>
                </div>
                <ProgressBar
                  score={results.abcdeAnalysis.evolution.score}
                  maxScore={results.abcdeAnalysis.evolution.maxScore}
                />
              </div>
            </div>
          </motion.div>

          {/* Medical Disclaimer */}
          <motion.div
            variants={itemVariants}
            className="col-span-1 md:col-span-3 my-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3"
          >
            <AlertCircle className="h-5 w-5 text-amber-800 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800">
                Medical Disclaimer
              </h3>
              <p className="text-sm text-amber-800">
                This analysis is for educational purposes only. Always consult
                with a qualified healthcare professional for proper diagnosis
                and treatment.
              </p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="col-span-1 md:col-span-3 flex flex-wrap gap-4 justify-center md:justify-start"
          >
            <button
              onClick={() => navigate("/address")}
              className="px-6 py-3 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition-colors shadow-sm"
            >
              Find Healthcare Providers Near You
            </button>
            <button
              onClick={() => navigate("/survey")}
              className="px-6 py-3 border border-amber-800 text-amber-800 rounded-lg hover:bg-amber-50 transition-colors"
            >
              Try Survey
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default SkinAnalysisResults;
