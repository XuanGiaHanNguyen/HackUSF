import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom" // Import if using React Router

export default function LoadingPage() {
  const date = new Date()
  const year = date.getFullYear()
  const [loadingProgress, setLoadingProgress] = useState(0)
  
  // If using React Router
  const navigate = useNavigate()
  
  // For progress animation
  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          return 100
        }
        return prev + 5
      })
    }, 150)

    return () => clearInterval(timer)
  }, [])
  
  // For automatic navigation after 5 seconds
  useEffect(() => {
    const navigationTimer = setTimeout(() => {
      // If using React Router:
      navigate('/step1') 
      
      // If not using React Router, use window.location instead:
      // window.location.href = '/destination-page'
    }, 2000)
    
    // Clean up the timer if component unmounts
    return () => clearTimeout(navigationTimer)
  }, [navigate]) // include navigate in dependencies if using React Router

  return (
    <div className="bg-gradient-to-b from-neutral-100 to-[rgba(235,228,220,255)] min-h-screen flex flex-col items-center justify-center">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#7c5b00]/10 rounded-full filter blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/3 right-1/3 w-120 h-120 bg-[#7c5b00]/5 rounded-full filter blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 right-1/4 w-80 h-80 bg-[#7c5b00]/10 rounded-full filter blur-3xl animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>
        <div className="absolute top-1/4 right-10 w-96 h-96 bg-[#7c5b00]/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center px-4 text-center mb-10">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-4">
          <div className="text-[rgb(65,112,70)] animate-pulse">
            {IconIcon}
          </div>
          <h1 className="text-6xl font-bold text-[#7c5b00]">SkinIntel</h1>
        </div>
          
    
        {/* Loading dots animation */}
        <div className="flex gap-2 mt-6">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-[#7c5b00] rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s`, animationDuration: "1s" }}
            ></div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-6 text-gray-500 text-sm">© {year} PuzzlePath. All rights reserved.</div>
    </div>
  )
}