import { Icon2Icon } from "../assets/icon"
import { Outlet, Link } from "react-router-dom"
import React, { useState } from 'react';


export default function Main() {
  
  return (
    <div className="bg-gradient-to-b from-neutral-50 to-[rgba(235,228,220,255)] min-h-screen">
      
      
      <Outlet />
    </div>
  )
}

