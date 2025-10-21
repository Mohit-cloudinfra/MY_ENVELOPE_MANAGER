import React, { useState, useEffect } from 'react';
import {Routes, Route,useLocation,Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import SignUp from './UIElements/authentication/SignUp'
import ForgotPassword from './UIElements/authentication/ForgotPassword';
import ValidateCode from './UIElements/authentication/ValidateCode';
import SignIn from './UIElements/authentication/SignIn';
import EnvelopeGroupsList from './UIElements/Envelopgroup/EnvelopeGroupsList';
import VerifyEmail from './UIElements/authentication/VerifyEmail';
import EnvelopesList from './UIElements/Envelopes/EnvelopesList';
import ClientList from './UIElements/Client/ClientList';
import UpdatePassword from './UIElements/Settings/UpdatePassword';
import Profile from './UIElements/Settings/Profile';
import Settings from './UIElements/Settings/Setting';
import IndiciaList from './UIElements/Indicia/IndiciaList';
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [username, setUsername] = useState('');
  const [showIconsOnly, setShowIconsOnly] = useState(false);
  const location = useLocation();

  
 
  useEffect(() => {
    const noSelectElements = document.querySelectorAll('.App');
    noSelectElements.forEach((element) => {
      element.style.webkitUserSelect = 'none';
      element.style.mozUserSelect = 'none';
      element.style.msUserSelect = 'none';
      element.style.userSelect = 'none';
    });

    // Check remembered login status but don't reset isLoggedIn automatically
    if (!isLoggedIn && localStorage.getItem('rememberMe') === 'true') {
      const rememberedEmail = localStorage.getItem('rememberedEmail');
      const rememberedPassword = localStorage.getItem('rememberedPassword');
      
      if (rememberedEmail && rememberedPassword) {
        setUsername(rememberedEmail);
      }
    }
  }, [location.pathname, isLoggedIn]);

  const InspectView = process.env.REACT_APP_INSPECT_VIEW === "false";
  console.log("inspect", InspectView);
  
  // useEffect(() => {
  //   if (InspectView) {
  //     const handleContextMenu = (e) => {
  //       e.preventDefault();
  //     };
  
  //     const ctrlShiftKey = (e, keyCode) => {
  //       return e.ctrlKey && e.shiftKey && e.keyCode === keyCode.charCodeAt(0);
  //     };
  
  //     const cmdOptionKey = (e, keyCode) => {
  //       return e.metaKey && e.altKey && e.keyCode === keyCode.charCodeAt(0);
  //     };
  
  //     const handleKeyDown = (e) => {
  //       if (
  //         e.keyCode === 123 ||
  //         ctrlShiftKey(e, "I") ||
  //         ctrlShiftKey(e, "J") ||
  //         ctrlShiftKey(e, "C") ||
  //         (e.ctrlKey && e.keyCode === "U".charCodeAt(0)) ||
  //         cmdOptionKey(e, "I") ||
  //         cmdOptionKey(e, "C")||
  //         e.keyCode === 'Escape' ||
  //         e.keyCode === 122
  //       ) {
  //         e.preventDefault();
  //         return false;
  //       }
  //     };
  
  //     document.addEventListener("contextmenu", handleContextMenu);
  //     document.addEventListener("keydown", handleKeyDown);
  
  //     return () => {
  //       document.removeEventListener("contextmenu", handleContextMenu);
  //       document.removeEventListener("keydown", handleKeyDown);
  //     };
  //   }
  // }, [InspectView]);
  
  const handleLogin = (username) => {
    setIsLoggedIn(true);
    setShowIconsOnly(false);
    setUsername(username);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const handleSignout = () => {
    setIsLoggedIn(false);
    setUsername('');

    if (localStorage.getItem('rememberMe') !== 'true') {
      localStorage.clear();
    } else {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('accessLevel');
    }
  };

  

  return (
    <div className={`App ${isLoggedIn ? 'logged-in' : ''}`}>
      {isLoggedIn && <Navbar username={username} showIconsOnly={showIconsOnly} setShowIconsOnly={setShowIconsOnly} onSignout={handleSignout} />}

      <Routes>

        {/* <Route path="/" element={<SignIn onLogin={handleLogin} />} /> */}
        <Route path="/" element={isLoggedIn ? <Navigate to="/EnvelopeGroups" /> :<SignIn onLogin={handleLogin} />} />
        <Route path="/SignUp" element={isLoggedIn ? <Navigate to="/EnvelopeGroups" /> : <SignUp />} />
        <Route path="/ForgotPassword" element={isLoggedIn ? <Navigate to="/EnvelopeGroups" /> : <ForgotPassword />} />
        <Route path="/ValidateCode" element={isLoggedIn ? <Navigate to="/EnvelopeGroups" /> : <ValidateCode />} />
        <Route path="/VerifyEmail" element={isLoggedIn ? <Navigate to="/EnvelopeGroups" /> : <VerifyEmail />} />
      
        
        {isLoggedIn && <Route path="/Envelopes" element={<EnvelopesList showIconsOnly={showIconsOnly} />} />}
        {isLoggedIn && <Route path="/EnvelopeGroups" element={<EnvelopeGroupsList showIconsOnly={showIconsOnly} />} />}
        {isLoggedIn && <Route path="/Client" element={<ClientList showIconsOnly={showIconsOnly} />} />}
        {isLoggedIn && <Route path="/Indicia" element={<IndiciaList showIconsOnly={showIconsOnly} />} />}
        {isLoggedIn && (
          <Route path="/Settings" element={<Settings showIconsOnly={showIconsOnly} />}>
            <Route path="Profile" element={<Profile showIconsOnly={showIconsOnly} />} />
            <Route path="UpdatePassword" element={<UpdatePassword showIconsOnly={showIconsOnly} />} />
          </Route>
        )}
        <Route
          path="*"
          element={isLoggedIn ? <Navigate to="/EnvelopeGroups" /> : <Navigate to="/" />}
        />
      </Routes>

    </div>
  );
}

export default App;
