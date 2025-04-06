import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import notcancerbg from '../assets/notcancerbg.jpg';
import { Icon2Icon } from '../assets/icon';

const NotCancerNoti = () => {
    const [name, setName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedName = localStorage.getItem("name");
        if (storedName) {
            setName(storedName);
        }
    }, []);

    const handleTakeQuiz = () => {
        navigate('/survey');
    };

    return (
        <div
            className="w-full h-screen bg-cover bg-center"
            style={{ backgroundImage: `url(${notcancerbg})` }}
        >
            {/* Header Navigation */}
            <div className="flex flex-row justify-between items-center w-full py-4 pt-6 px-14">
                {/* Logo */}
                <div className="flex flex-row gap-2 items-center">
                    {Icon2Icon}
                    <h2 className="font-bold text-3xl text-[#7c5b00]">SkinIntel</h2>
                </div>

                {/* Navigation */}
                <div>
                    <Link
                        to="/"
                        className="bg-[#7c5b00] rounded-lg px-6 py-2 text-sm text-white font-semibold 
                      transition-all duration-300 hover:scale-105 hover:brightness-110 
                      shadow-md inline-block"
                    >
                        Home
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex items-center justify-center w-full h-full">
                <div className="flex flex-col gap-8 justify-center items-center text-center w-4/5 md:w-3/5 mx-auto mb-70">
                    {/* Title with Emoji and Name */}
                    <h1 className="text-[#4a3600] text-4xl md:text-5xl font-bold flex items-center gap-4">
                        <span className="animate-bounce inline-block">🎉</span>
                        Great News, <span className="text-[#ab7d00] font-extrabold">{name}</span>!
                    </h1>

                    {/* Main Message */}
                    <p className="text-lg text-center px-20 text-[#4a3600] max-w-3xl">
                        Our AI model predicts that your skin condition is
                        <span className="font-bold text-green-700"> benign</span>.
                        Still, it's best to consult a doctor to be sure.
                    </p>


                    {/* CTA Button */}
                    <div className='flex flex-col jutify-center items-center gap-4'>
                        <button
                            onClick={handleTakeQuiz}
                            className="mt-4 bg-gradient-to-r from-[#7c5b00] to-[#4a3600] text-white 
                      font-semibold py-2 px-8 rounded-lg text-lg shadow-lg
                      transition-all duration-300 hover:scale-105 hover:shadow-xl
                      active:translate-y-1 flex items-center"
                        >
                            Take Risk Survey
                        </button>
                        <div className='text-gray-500 hover:text-gray-800 underline text-sm cursor-pointer'
                            onClick={() => navigate("/")}>Not now</div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotCancerNoti;