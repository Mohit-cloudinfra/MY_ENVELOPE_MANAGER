import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import './Settings.css'
import NavPage from './NavPages';


function Settings({ showIconsOnly }) {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(getActiveTab(location.pathname));

    function getActiveTab(pathname) {
        if (pathname.includes('UpdatePassword')) {
            return 'UpdatePassword';
        }
        else {
            return 'profile'; // Default to 'profile'
        }
    }

    const navigate = useNavigate();

    // Add logic here to handle default navigation to Profile when /Settings is accessed
    useEffect(() => {
        // Redirect to Profile page if accessing /Settings without a nested path
        if (window.location.pathname === "/Settings") {
            navigate("/Settings/Profile");
        }
    }, [navigate]);

    useEffect(() => {
        setActiveTab(getActiveTab(location.pathname));
    }, [location.pathname]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className={`main-content ${showIconsOnly ? 'icons-only' : ''}`}>
            <div className="p-3 mb-1 mt-2 custom-bg-white rounded">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <span className="m-0 title">Settings</span>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-md-3">
                    <NavPage activeTab={activeTab} handleTabChange={handleTabChange} />
                </div>
                <div className="col-md-9">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default Settings;
