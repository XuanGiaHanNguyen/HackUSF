import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'

import Landing from './pages/Landing'
import AboutUs from './components/AboutUs'
import Main from './pages/Main'
import Instructions from './components/Instructions'
import LoadingPage from './pages/loading/Loading'
// import Survey from './pages/ParentSurvey'
import Surland from './components/SurveyLanding'
// import ToMain from './components/ToMain'
import LoadingMainPage from './pages/loading/LoadingToMain'
import DoneMain from './components/DoneMain'
import HospitalFinder from './pages/map/Map'

function App () {

  const googleMapsApiKey = "AIzaSyAX7CTE0wrxlIVAUUPIvFbGuvSy3PuJXvc";
  
  console.log("Google Maps API Key:", googleMapsApiKey); 

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/map' element={<HospitalFinder/>}/>
        <Route path="/" element={<Landing />}>
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/parent" element={<Surland />} />
        </Route>

        <Route path="/main" element={<Main />}>
          <Route path="/main/instructions" element={<Instructions />} />
          <Route path="/main/workdone" element={<DoneMain />} />
        </Route>

        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/loadingtomain" element={<LoadingMainPage />} />

        {/* <Route path="/survey" element={<Survey />}>
          <Route path="/survey/ToMain" element={<ToMain />} />
        </Route>
         */} 

      </Routes>
    </BrowserRouter>
  )
}

export default App
