import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom" // Import if using React Router

export default function LoadingMainPage() {
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
      navigate('/main') 
      
      // If not using React Router, use window.location instead:
      // window.location.href = '/destination-page'
    }, 5000)
    
    // Clean up the timer if component unmounts
    return () => clearTimeout(navigationTimer)
  }, [navigate]) // include navigate in dependencies if using React Router

  return (
    <div className="bg-gradient-to-b from-neutral-100 to-[rgba(235,228,220,255)] min-h-screen flex flex-col items-center justify-center">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-[rgb(65,112,70)]/10 rounded-full filter blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/3 right-1/3 w-120 h-120 bg-[rgb(65,112,70)]/5 rounded-full filter blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 right-1/4 w-80 h-80 bg-[rgb(65,112,70)]/10 rounded-full filter blur-3xl animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>
        <div className="absolute top-1/4 right-10 w-96 h-96 bg-[rgb(65,112,70)]/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center px-4 text-center mb-10">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-4">
          <div className="text-[rgb(65,112,70)] animate-pulse">
            {/* Simple puzzle icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z" />
            </svg>
          </div>
          <h1 className="text-6xl font-bold text-[rgb(65,112,70)]">PuzzlePath</h1>
        </div>
          
    
        {/* Loading dots animation */}
        <div className="flex gap-2 mt-6">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-[rgb(65,112,70)] rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s`, animationDuration: "1s" }}
            ></div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-6 text-gray-500 text-sm">© {year} PuzzlePath. All rights reserved.</div>
    </div>
  )
}