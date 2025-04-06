import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'

import Landing from './pages/Landing'
import AboutUs from './components/AboutUs'
import Step1 from './pages/Step1'
import Instructions from './components/Instructions'
import LoadingPage from './pages/loading/Loading'
import CancerCareFinder from './pages/map/FindCenter'
// import ToMain from './components/ToMain'
import LoadingMainPage from './pages/loading/LoadingToMain'
import DoneMain from './components/DoneMain'

function App () {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Landing />}>
          <Route path="/aboutus" element={<AboutUs />} />
        </Route>

        <Route path="/step1" element={<Step1 />}></Route>
        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/findcenter" element={<CancerCareFinder />}></Route>
        <Route path="/loadingtomain" element={<LoadingMainPage />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
