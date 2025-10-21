import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import './App.css';
import { HiMenu } from "react-icons/hi";
import { IoIosMail, IoMdSettings } from "react-icons/io";
import { RiLogoutCircleRLine, RiMailLine } from "react-icons/ri";
import { useCustomContext } from "./UIElements/CustomComponents/CustomComponents";
import { IoPeopleSharp } from "react-icons/io5";
import envelopegroup from './group.png'
import { GiStamper } from "react-icons/gi";


const Navbar = ({ username, showIconsOnly, setShowIconsOnly, onSignout }) => {
    const [expanded, setExpanded] = useState(true);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { showAlert } = useCustomContext();
    const toggleIconsOnly = () => {
        setShowIconsOnly(!showIconsOnly);
        setExpanded(!expanded);
    };

    const Logout = () => {
        // Keys to keep
        const keysToKeep = ['rememberMe', 'rememberedEmail', 'rememberedPassword'];

        showAlert('Are you sure you want to logout?', [
            {
                label: 'Yes',
                onClick: () => {
                    Object.keys(localStorage).forEach((key) => {
                        if (!keysToKeep.includes(key)) {
                            localStorage.removeItem(key);
                        }
                    });
                    // Redirect and sign out
                    navigate('/');
                    onSignout();

                },
                color: 'var(--buttonColor)', // Set button color
            },
            {
                label: 'No',
                onClick: () => {
                    // console.log('User cancelled logout');
                },
                color: 'red', // Set button color
            }
        ]);

    };


    return (
        <div className={expanded ? "container1 expanded" : "container1"}>
            <header>
                <div className="display-menu">
                    <div className="imagehome">
                        {!showIconsOnly && <span className="headertext">Envelope Manager</span>}
                        <p className="toggle-button" onClick={toggleIconsOnly} ><HiMenu style={{ fontSize: '25px', marginRight: '-10px', marginTop: '30px' }} /></p>
                    </div>

                    <NavLink className="menu" to={"/EnvelopeGroups"} activeClassName="active">
                        <img src={envelopegroup} width={20} height={18} alt="envelope group" />
                        &emsp;&emsp;{!showIconsOnly && 'Envelope Groups'}
                    </NavLink>
                    <NavLink className="menu" to={"/Client"} activeClassName="active">
                    <IoPeopleSharp className="icon" />&emsp;&emsp;{!showIconsOnly && 'Clients'}
                    </NavLink>
                    <NavLink className="menu" to={"/Envelopes"} activeClassName="active">
                        <IoIosMail className="icon" />&emsp;&emsp;{!showIconsOnly && 'Envelopes'}
                    </NavLink>
                    <NavLink className="menu" to={"/Indicia"} activeClassName="active">
                    <GiStamper className="icon" />&emsp;&emsp;{!showIconsOnly && 'Indicia'}
                    </NavLink>
                    <NavLink
                        className="menu"
                        to="/Settings"
                        activeClassName="active"
                    >
                        <IoMdSettings className="icon" />&emsp;&emsp;{!showIconsOnly && 'Settings'}
                    </NavLink>
                </div>
            </header>
            <div className={`display-text ${showIconsOnly ? "icons-only" : ""}`}>
                <div className="navbar-text1 ml-auto">

                    <div className="dropdownview" ref={dropdownRef}>
                        <div className="position-fixed" style={{ top: 0, right: 0, padding: '10px' }}>
                            <button
                                className="btn  d-flex align-items-center"
                                onClick={Logout}
                                style={{ cursor: 'pointer' }}
                            >
                                <RiLogoutCircleRLine style={{ fontSize: '24px' }} />
                                <span className="ms-2">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default Navbar;
