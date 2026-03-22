import React from 'react'
import logo from '../assets/veylo-logo.png'
import '../styles/SplashScreen.css'

const SplashScreen = () => (
  <div className="splash-screen">
    <div className="splash-content">
      <img src={logo} alt="Veylo" className="splash-logo" />
      <div className="splash-loader">
        <div className="splash-loader-bar" />
      </div>
    </div>
  </div>
)

export default SplashScreen
