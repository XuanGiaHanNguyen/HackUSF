import { Link } from "react-router-dom";
import React, { useState } from 'react';
import { Upload, ChevronRight } from "lucide-react";
import { Icon2Icon, InfoIcon } from "../assets/icon";

export default function UploadPic() {
  const [image, setImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetImage = () => {
    setImage(null);
  };

  // Define cn function since it wasn't imported
  const cn = (...classes) => {
    return classes.filter(Boolean).join(' ');
  };

  return (
    <div className="bg-gradient-to-b flex flex-col border-black from-neutral-100 to-[rgba(235,228,220,255)] min-h-screen">
      <div className="w-full">
        <div className="flex flex-row justify-between align-between w-full pb-2 pt-6 px-14">
          <div className="flex flex-row gap-2 text-lg font-bold">
            {Icon2Icon}
            <h2 className="font-bold text-3xl text-[#7c5b00]">SkinIntel</h2>
          </div>
          <div className="flex flex-row gap-5">
            <div className="bg-[#7c5b00] rounded-lg px-6 py-2 text-sm text-white font-semibold transition-transform duration-300 shadow-smtransition-transform duration-200 hover:scale-105 shadow-sm cursor-pointer">
              <Link to="/">Home</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full px-14 pb-14 flex-grow">
        <div className="mx-auto w-full flex flex-col gap-5 flex-grow mt-6">
          <div className=" rounded-lg bg-amber-50 border border-amber-200 flex flex-row gap-1 p-3">
            {InfoIcon}
            <p className="text-lg text-[#4a3600]">
              <span className="font-bold">Medical Disclaimer:</span> This tool is for educational purpose only and is not a substitute for professional medical advice. Always consult with qualified healthcare provider for any health concerns.
            </p>
          </div>

          {!image ? (
            <div
              className={cn(
                "border-dashed border-2 border-[#7c5b00] transition-colors cursor-pointer rounded-lg bg-white flex-grow flex items-center justify-center min-h-[60vh]",
                isDragging ? "bg-[rgba(235,228,220,0.9)]" : "",
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 rounded-full bg-[rgba(235,228,220,0.8)] flex items-center justify-center mb-4">
                  <Upload className="h-10 w-10 text-[#7c5b00]" />
                </div>
                <h3 className="text-xl font-semibold text-[#7c5b00] mb-2">Upload Image Of Your Skin</h3>
                <p className="text-center text-[#4a3600] mb-6 max-w-md">
                  Drag and drop your image here, or click to browse
                </p>
                <button
                  className="bg-[#7c5b00] hover:bg-[#4a3600] text-white px-4 py-2 rounded-md"
                  onClick={() => document.getElementById("image-upload")?.click()}
                >
                  Select Image
                </button>
                <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 w-full flex-grow">
              {/* Left side - Image Preview */}
              <div className="w-full md:w-1/2 border-dashed border-2 border-[#7c5b00] rounded-lg overflow-hidden bg-white shadow-sm flex flex-col">

                <div className="p-6 flex items-center justify-center flex-grow">
                  <div className="relative w-full max-w-md aspect-square rounded-md overflow-hidden">
                    <img src={image || "/placeholder.svg"} alt="Uploaded skin image" className="object-cover w-full h-full" />
                  </div>
                </div>
              </div>

              {/* Right side - Requirements & Next Button */}
              <div className="w-full md:w-1/2 border-dashed border-2 border-[#7c5b00] rounded-lg overflow-hidden bg-white shadow-sm flex flex-col">
                <div className="p-6 flex-grow">
                  <div className=" space-y-4">
                    <h2 className="text-xl font-bold text-[#7c5b00]">Image Requirements</h2>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#f2ebe4] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[#7c5b00] font-medium">1</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-[#4a3600]">Lesion Borders Visibility</h3>
                        <p className="text-gray-600 text-sm">Ensure the entire lesion and its borders are clearly visible to assess irregularities.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#f2ebe4] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[#7c5b00] font-medium">2</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-[#4a3600]">Color Accuracy</h3>
                        <p className="text-gray-600 text-sm">Use natural lighting or white-balanced artificial lighting</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#f2ebe4] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[#7c5b00] font-medium">3</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-[#4a3600]">No Obstructions</h3>
                        <p className="text-gray-600 text-sm">Ensure no hair, clothing, or accessories block the lesion.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#f2ebe4] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[#7c5b00] font-medium">4</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-[#4a3600]">High Resolution</h3>
                        <p className="text-gray-600 text-sm">Use a camera with sufficient resolution to capture fine details of the lesion.</p>
                      </div>
                    </div>
                  </div>

                </div>
                <div className="p-6 border-t-2 border-dashed border-[#7c5b00] flex flex-col gap-3 mt-auto">
                  <button
                    className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-md w-full"
                    onClick={resetImage}
                  >
                    Upload Different Image
                  </button>
                  <Link to="/loadingtoresult">
                    <button
                      className="bg-[#7c5b00] hover:bg-[#4a3600] text-white px-4 py-2 rounded-md w-full flex items-center justify-center gap-2"
                    >
                      Proceed to Analysis
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}