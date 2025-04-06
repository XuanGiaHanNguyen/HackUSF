import { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Icon2Icon } from "../../assets/icon"

export default function LoadingPage() {
  const navigate = useNavigate()

  // Navigate to results page after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/results")
    }, 3000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="bg-gradient-to-b flex flex-col border-black from-neutral-100 to-[rgba(235,228,220,0.9)] min-h-screen">
      {/* Semi-transparent overlay to dim the entire page */}
      <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>

      <div className="w-full relative z-10">
        <div className="flex flex-row justify-between align-between w-full pb-2 pt-4 px-14">
          <div className="flex flex-row gap-2 text-lg font-bold">
            {Icon2Icon}
            <h2 className="font-bold text-3xl text-[#7c5b00]">SkinIntel</h2>
          </div>
          <div className="flex flex-row gap-5">
            <div className="bg-[#7c5b00] rounded-lg px-6 py-2 text-sm text-white font-semibold transition-colors duration-300 shadow-sm">
              <Link to="/aboutus">Reference</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full px-14 pb-14 flex-grow relative z-10">
        <div className="mx-auto w-full flex flex-col gap-5 flex-grow">
          {/* Title skeleton - darker */}
          <div className="h-12 w-60 bg-gray-300/70 animate-pulse rounded-lg"></div>

          {/* Disclaimer skeleton - darker */}
          <div className="h-20 bg-gray-300/70 animate-pulse rounded-lg w-full"></div>

          <div className="flex flex-col md:flex-row gap-6 w-full flex-grow">
            {/* Left side - Image Preview skeleton */}
            <div className="w-full md:w-1/2  rounded-lg overflow-hidden bg-white/90 shadow-sm flex flex-col backdrop-blur-sm">
              <div className="p-6 flex items-center justify-center flex-grow">
                <div className="relative w-full max-w-md aspect-square rounded-md overflow-hidden bg-gray-300/70 animate-pulse">
                  {/* Loading spinner overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full animate-spin"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Analysis results skeleton */}
            <div className="w-full md:w-1/2 rounded-lg overflow-hidden bg-white/90 shadow-sm flex flex-col backdrop-blur-sm">
              <div className="p-6 flex-grow space-y-6">
                {/* Heading skeleton - darker */}
                <div className="h-8 w-48 bg-gray-300/70 animate-pulse rounded-lg"></div>

                {/* Analysis items skeletons - darker */}
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-gray-300/70 animate-pulse flex-shrink-0"></div>
                      <div className="space-y-2 w-full">
                        <div className="h-5 w-36 bg-gray-300/70 animate-pulse rounded"></div>
                        <div className="h-4 w-full bg-gray-300/70 animate-pulse rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom buttons skeleton - darker */}
              <div className="p-6 flex flex-col gap-3 mt-auto">
                <div className="h-10 w-full bg-gray-300/70 animate-pulse rounded-md"></div>
                <div className="h-10 w-full bg-gray-300/70 animate-pulse rounded-md"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

