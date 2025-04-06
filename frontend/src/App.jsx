import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'

import Landing from './pages/Landing'
import AboutUs from './components/AboutUs'
import UploadPic from './pages/Upload'
import Instructions from './components/Instructions'
import LoadingPage from './pages/loading/Loading'
import Step1 from './pages/Step1'
import Surland from './components/SurveyLanding'

import LoadingMainPage from './pages/loading/LoadingToMain'
import HospitalFinder from './pages/map/LocationFinder'
import SearchLocation from './pages/map/SearchLocation'
import Survey from './pages/Survey'

import SkinAnalysisResults from './pages/Result'

function App () {

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  console.log("Google Maps API Key:", googleMapsApiKey); 

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Landing />}>
          <Route path="aboutus" element={<AboutUs />} />
          <Route path="/parent" element={<Surland />} />
        </Route>

        <Route path="/Upload" element={<UploadPic />}>
          <Route path="/Upload/instructions" element={<Instructions />} />
        </Route>

        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/loadingtomain" element={<LoadingMainPage />} />

        <Route path='/address' element={<HospitalFinder googleMapsApiKey={googleMapsApiKey}/>}/>
        <Route path='/map' element={<SearchLocation googleMapsApiKey={googleMapsApiKey}/>}/>

        <Route path="/step1" element={<Step1 />}></Route>
        <Route path="/survey" element={<Survey />}></Route>

        <Route path="/result" element={<SkinAnalysisResults />}></Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App
