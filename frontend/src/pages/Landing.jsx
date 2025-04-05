import { useState } from "react";
import bg from "../assets/bg.gif"

import { Outlet, Link } from "react-router-dom"
import { Icon2Icon, BarIcon} from "../assets/icon";

export default function Landing() {
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
  <div>
    <div className="relative h-screen w-full flex justify-center overflow-hidden absolute inset-0 w-full h-full object-cover object-top" style={{ backgroundColor: "#111" }}>
      {/* Background GIF */}
      {!hasError && (
        <img
          src={bg}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover object-bottom"
          onLoad={() => {
            console.log("Image loaded successfully");
            setIsLoaded(true);
          }}
          onError={() => {
            console.error("Failed to load image");
            setHasError(true);
          }}
        />
      )}
 
      {/* Content */}
      <div className="flex flex-col w-full">
        <div className="relative z-10 flex flex-col items-center text-center justify-center w-full text-white">
            <div className="flex flex-row justify-between align-between w-full py-4 pt-6 px-14">
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

          <div className="w-full h-screen flex flex-col items-start justify-start mt-14 px-16">
          
          <h1 className="text-7xl font-bold text-[#4a3600] flex">
            Early Detection 
          </h1>
          <h1 className="text-7xl font-bold text-[#4a3600] flex">
            Saves Lives
          </h1>
          <div className="mt-6 mb-5 w-full max-w-2xl text-gray-500 text-lg text-left pr-24 py-2">
            Detect the early signs of skin cancer with confidence and complete privacy—empowering you to take control of your health from the comfort of your home.
          </div>


            <div className="flex flex-row gap-4 items-center justify-center align-center">
            <div 
                className="inline-block"
                style={{
                  transition: "transform 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <div className="bg-[#7c5b00] rounded-lg px-8 py-3 text-sm text-white font-semibold transition-colors duration-300 shadow-sm">
                  <Link to="/parent">Start Assessment</Link>
                </div>
              </div>
              <div className="border border-[#7c5b00] rounded-lg px-8 py-3 text-sm text-[#7c5b00] font-semibold transition-colors duration-300 shadow-sm">
              <Link to="/aboutus">Learn More</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  </div>
  );
}