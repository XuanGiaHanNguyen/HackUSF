import React, { useEffect, useState } from 'react';
import step1bg from '../assets/step1.png';
import { NextIcon, Icon2Icon } from '../assets/icon';
import { useNavigate, Link } from 'react-router-dom';

const Step1 = () => {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    if (storedName) {
      setName(storedName);
    }
  }, []);

  return (
    <div 
      className="w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${step1bg})` }}
    >
      {/* Header with brand and home button */}
      <div className="flex flex-row justify-between align-between w-full py-4 pt-6 px-14">
        <div className="flex flex-row gap-2 text-lg font-bold">
          {Icon2Icon}
          <h2 className="font-bold text-3xl text-[#7c5b00]">SkinIntel</h2>
        </div>
        <div className="flex flex-row gap-5">
          <div className="bg-[#7c5b00] rounded-lg px-6 py-2 text-sm text-white font-semibold duration-300 shadow-sm transition-transform hover:scale-105 cursor-pointer">
            <Link to="/">Home</Link>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center w-full h-full pl-42">
        <div className='flex flex-col gap-6 justify-center w-3/5 mb-42'>
          <h1 className="text-[#4a3600] text-5xl font-bold">Hey <span className="text-[#ab7d00]">{name}</span>! This is Step 1</h1>
          <div className='text-2xl'>Take or upload a clear image of your skin lesion so we can analyze it properly. Make sure it's well-lit and in focus!</div>
        </div>
      </div>

      <div 
        className='absolute rounded-full p-3 animate-bounce hover:bg-zinc-200 transition-all duration-300 right-6 top-1/2 transform -translate-y-1/2 cursor-pointer'
        onClick={() => navigate('/Upload')}
      >
        {NextIcon}
      </div>

      <div className='w-full absolute bottom-6 text-gray-500 text-sm text-center'>© All images are encrypted and securely stored.</div>
    </div>
  );
};

export default Step1;