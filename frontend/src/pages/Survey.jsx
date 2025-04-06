<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon2Icon } from '../assets/icon';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

=======
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
>>>>>>> e05b2d5d9fecad2f7da327a1c6177a2bc4a7d1bc
const questions = [
  {
    id: "q1",
    question: "I spend long hours outdoors without sun protection",
    options: ["Never", "Sometimes", "Often", "Usually", "Always"],
  },
  {
    id: "q2",
    question: "I use sunscreen with SPF 30 or higher.",
    options: ["Never", "Sometimes", "Often", "Usually", "Always"],
  },
  {
    id: "q3",
    question: "I have used tanning beds or sunlamps.",
    options: ["Never", "Sometimes", "Often", "Usually", "Always"],
  },
  {
    id: "q4",
    question: "I get sunburns during summer.",
    options: ["Never", "Sometimes", "Often", "Usually", "Always"],
  },
  {
    id: "q5",
    question: "I wear long-sleeve shirts and hats when under the sun.",
    options: ["Never", "Sometimes", "Often", "Usually", "Always"],
  },
  {
    id: "q6",
    question: "I reapply sunscreen every 2 hours when outdoors.",
    options: ["Never", "Sometimes", "Often", "Usually", "Always"],
  },
  {
    id: "q7",
    question: "I have had severe sunburns with peeling or blisters.",
    options: ["Never", "Sometimes", "Often", "Usually", "Always"],
  },
  {
    id: "q8",
    question: "I examine my skin for new or changing moles or spots.",
    options: ["Never", "Sometimes", "Often", "Usually", "Always"],
  },
  {
    id: "q9",
    question: "I avoid being in the sun between 10 a.m. and 4 p.m.",
    options: ["Never", "Sometimes", "Often", "Usually", "Always"],
  },
  {
    id: "q10",
    question: "I frequently forget to apply sunscreen before going out.",
    options: ["Never", "Sometimes", "Often", "Usually", "Always"],
  },
  {
    id: "q11",
    question: "I have experienced a mole that has changed in size, shape, or color.",
    options: ["Never", "Sometimes", "Often", "Usually", "Always"],
  },
  {
    id: "q12",
    question: "I have more than 50 moles or freckles on my body.",
    options: ["Never", "Sometimes", "Often", "Usually", "Always"],
  },
  {
    id: "q13",
    question: "I have noticed a sore that doesn't heal for several weeks.",
    options: ["Never", "Sometimes", "Often", "Usually", "Always"],
  },
  {
    id: "q14",
    question: "I have experienced itching, bleeding, or crusting on a mole.",
    options: ["Never", "Sometimes", "Often", "Usually", "Always"],
  },
  {
    id: "q15",
    question: "I have a family history of skin cancer.",
    options: ["Never", "Sometimes", "Often", "Usually", "Always"],
  },
  {
    id: "q16",
    question: "I have fair skin that burns easily in the sun.",
    options: ["Never", "Sometimes", "Often", "Usually", "Always"],
  },
  {
    id: "q17",
    question: "I tan instead of burn.",
    options: ["Never", "Sometimes", "Often", "Usually", "Always"],
  },
  {
    id: "q18",
    question: "I live or have lived in a high UV index area (e.g., near the equator or at high altitude).",
    options: ["Never", "Sometimes", "Often", "Usually", "Always"],
  },
  {
    id: "q19",
    question: "I avoid using protective sunglasses outdoors.",
    options: ["Never", "Sometimes", "Often", "Usually", "Always"],
  },
  {
    id: "q20",
    question: "I have never had my skin checked by a dermatologist.",
    options: ["Never", "Sometimes", "Often", "Usually", "Always"],
  }
];

const COLORS = ['#34D399', '#FBBF24', '#FB923C', '#EF4444'];

function Survey() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const calculateScore = () => {
    let totalScore = 0;
    const positiveQuestions = ['q2', 'q5', 'q6', 'q8', 'q9', 'q17'];

    Object.entries(answers).forEach(([questionId, answer]) => {
      const optionIndex = questions.find(q => q.id === questionId)?.options.indexOf(answer);
      if (optionIndex === -1) return;

      if (positiveQuestions.includes(questionId)) {
        totalScore += 4 - optionIndex;
      } else {
        totalScore += optionIndex;
      }
    });

    return totalScore;
  };

  const getRecommendations = (score) => {
    if (score <= 19) {
      return {
        level: "Low Risk",
        icon: "🟢",
        title: "Great habits!",
        description: "You're doing an excellent job protecting your skin from UV damage. Keep up the great work.",
        recommendations: [
          "Continue using broad-spectrum SPF 30+ sunscreen daily",
          "Wear protective clothing, hats, and sunglasses when outdoors",
          "Avoid tanning beds and sunburns",
          "Perform regular skin self-exams to catch early signs of trouble",
          "Stay consistent and encourage others around you to do the same"
        ],
        footer: "✅ Prevention and consistency are key to keeping your skin healthy for years to come."
      };
    }
    if (score <= 39) {
      return {
        level: "Moderate Risk",
        icon: "🟡",
        title: "Some risky behaviors detected.",
        description: "You're on the right track but could improve your sun safety habits.",
        recommendations: [
          "Apply broad-spectrum SPF 30+ sunscreen daily, even on cloudy days",
          "Wear protective clothing, wide-brimmed hats, and sunglasses when outdoors",
          "Seek shade during peak sun hours (10 a.m. – 4 p.m.)",
          "Perform regular skin self-examinations and note any changes",
          "Visit a dermatologist annually for professional skin checks",
          "Avoid tanning beds and try not to get sunburned",
          "Stay hydrated and eat antioxidant-rich foods to support skin health"
        ],
      };
    }
    if (score <= 59) {
      return {
        level: "High Risk",
        icon: "🟠",
        title: "Frequent exposure to risk factors.",
        description: "Your habits suggest significant sun exposure and potential risk for skin damage or cancer.",
        recommendations: [
          "Use SPF 30+ sunscreen consistently and reapply every 2 hours when outdoors",
          "Cover up with long sleeves, hats, and UV-blocking sunglasses",
          "Avoid sun exposure during mid-day hours (10 a.m. – 4 p.m.)",
          "Avoid tanning beds and sunlamps completely",
          "Perform monthly skin self-checks for new or changing moles",
          "Schedule an appointment with a dermatologist for a full skin exam",
          "Maintain a skin-healthy lifestyle with hydration, sleep, and good nutrition"
        ],
        footer: "You're in the high-risk zone—taking action now is crucial."
      };
    }
    return {
      level: "Very High Risk",
      icon: "🔴",
      title: "Strong signs of risky or unhealthy sun behaviors and/or symptoms.",
      description: "This score suggests urgent attention is needed. Please act now to protect your health.",
      recommendations: [
        "Consult a dermatologist immediately for a full-body skin examination",
        "Be vigilant about any unusual moles, sores, or skin changes",
        "Stop using tanning beds or sunlamps completely",
        "Avoid all sun exposure during peak hours—opt for early morning or late afternoon if going outside",
        "Use SPF 50+ sunscreen and reapply often",
        "Wear sun-protective clothing and accessories",
        "Perform weekly skin self-exams",
        "Boost your skin health with a balanced diet, hydration, and rest"
      ],
      footer: "Early detection can save lives—don't delay."
    };
  };

  const handleAnswer = (answer) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestion].id]: answer
    }));
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  if (!showResults) {
    return (
<<<<<<< HEAD
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-[rgba(235,228,220,255)] flex flex-col items-center justify-center">
        {/* Header with increased padding-x and reduced padding-y */}
        <div className="flex flex-row justify-between align-between w-full py-3 px-6 md:px-10 max-w-screen-lg mx-auto">
          <div className="flex flex-row gap-2 text-lg font-bold">
            {Icon2Icon}
            <h2 className="font-bold text-2xl md:text-3xl text-[#7c5b00]">SkinIntel</h2>
          </div>
          <div className="flex flex-row gap-5">
            <div className="bg-[#7c5b00] rounded-lg px-4 md:px-6 py-2 text-sm text-white font-semibold transition-transform duration-300 shadow-sm hover:scale-105 cursor-pointer">
              <Link to="/">Home</Link>
            </div>
          </div>
        </div>
        
        <motion.h1
=======
      
      <div className="min-h-screen bg-gradient-to-b from-neutral-100 to-[rgba(235,228,220,255)] p-4 md:p-8 flex flex-col items-center justify-center">
        <motion.h1 
>>>>>>> e05b2d5d9fecad2f7da327a1c6177a2bc4a7d1bc
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold my-4 text-center text-[#4a3600] tracking-tight px-4"
        >
          Skin Cancer Risk Assessment
        </motion.h1>

        {/* Center card - Adjusted max width and padding */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg mx-auto bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-4 md:p-5 m-4"
        >
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-[#7c5b00] to-[#4a3600] rounded-full"
              />
            </div>
            <div className="mt-1 text-center text-xs text-[#7c5b00]">
              Question {currentQuestion + 1} of {questions.length}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-4"
            >
              <h2 className="text-lg md:text-xl font-medium text-[#4a3600] mb-4 text-center leading-tight">
                {questions[currentQuestion].question}
              </h2>

              <div className="space-y-2">
                {questions[currentQuestion].options.map((option) => (
                  <motion.button
                    key={option}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(option)}
                    className={`w-full text-left p-4 rounded-lg border transition-all duration-300 ${answers[questions[currentQuestion].id] === option
                      ? 'border-[#7c5b00] bg-gradient-to-r from-[#7c5b00]/10 to-[#4a3600]/5'
                      : 'border-neutral-200 hover:border-[#7c5b00]/50 hover:bg-[#7c5b00]/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${answers[questions[currentQuestion].id] === option
                        ? 'border-[#7c5b00] bg-[#7c5b00]'
                        : 'border-neutral-300'
                      }`}>
                        {answers[questions[currentQuestion].id] === option && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-1.5 h-1.5 rounded-full bg-white"
                          />
                        )}
                      </div>
                      <span className="text-sm md:text-base text-[#4a3600]">{option}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between items-center mt-4 pt-3 border-t border-neutral-200">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`px-3 md:px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-300 ${currentQuestion === 0
                ? 'border-neutral-200 text-neutral-400 cursor-not-allowed'
                : 'border-[#7c5b00] text-[#7c5b00] hover:bg-[#7c5b00]/5'
              }`}
            >
              ← Previous
            </motion.button>

            {currentQuestion === questions.length - 1 ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowResults(true)}
                className="px-3 md:px-4 py-2 rounded-lg bg-gradient-to-r from-[#7c5b00] to-[#4a3600] text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                View Results →
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentQuestion(prev => prev + 1)}
                disabled={!answers[questions[currentQuestion].id]}
                className={`px-3 md:px-4 py-2 rounded-lg bg-gradient-to-r from-[#7c5b00] to-[#4a3600] text-white text-sm font-medium hover:opacity-90 transition-opacity ${!answers[questions[currentQuestion].id] ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Next →
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  const score = calculateScore();
  const result = getRecommendations(score);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-[rgba(235,228,220,255)] flex flex-col items-center pb-8">
      {/* Header (reused) */}
      <div className="flex flex-row justify-between align-between w-full py-3 px-6 md:px-10 max-w-screen-lg mx-auto">
        <div className="flex flex-row gap-2 text-lg font-bold">
          {Icon2Icon}
          <h2 className="font-bold text-2xl md:text-3xl text-[#7c5b00]">SkinIntel</h2>
        </div>
        <div className="flex flex-row gap-5">
          <div className="bg-[#7c5b00] rounded-lg px-4 md:px-6 py-2 text-sm text-white font-semibold transition-transform duration-300 shadow-sm hover:scale-105 cursor-pointer">
            <Link to="/">Home</Link>
          </div>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl px-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-[#4a3600] flex items-center justify-center gap-3 mb-3">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              {result.icon}
            </motion.span>
            <span>{result.level}</span>
          </h2>
          <p className="text-lg text-[#7c5b00]">
            Your score: {score} out of 80 points
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/90 backdrop-blur-md p-4 md:p-5 rounded-xl shadow-xl mb-6 mx-2"
        >
          <p className="text-base text-[#7c5b00] text-center leading-relaxed">
            {result.description}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6 mx-2"
        >
          <h3 className="text-xl font-semibold text-[#4a3600] mb-4 text-center">
            Recommendations:
          </h3>
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-4 md:p-5">
            <ul className="space-y-3">
              {result.recommendations.map((rec, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-3 text-[#7c5b00]"
                >
                  <span className="text-[#4a3600] text-sm mt-0.5">•</span>
                  <span className="text-sm leading-relaxed">{rec}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>

        {result.footer && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-base text-[#7c5b00] text-center mb-6 font-medium mx-2"
          >
            {result.footer}
          </motion.p>
        )}

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setShowResults(false);
            setCurrentQuestion(0);
            setAnswers({});
          }}
          className="w-full py-3 mt-4 bg-gradient-to-r from-[#7c5b00] to-[#4a3600] text-white rounded-lg font-semibold duration-300 shadow-sm transition-transform hover:scale-105 text-sm shadow-lg"
        >
          Take Survey Again
        </motion.button>
      </motion.div>
    </div>
  );
}

export default Survey;