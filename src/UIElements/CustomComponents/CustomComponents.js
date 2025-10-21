import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Spin } from 'antd';

const CustomContext = createContext();

export const useCustomContext = () => useContext(CustomContext);

export const CustomProvider = ({ children }) => {
    const [toast, setToast] = useState(null);
    const [alert, setAlert] = useState({ show: false, message: '', buttons: [] });
    const [hudMessage, setHudMessage] = useState(null);
    const [isHudRotating, setIsHudRotating] = useState(false);
    const [backgncol, setBackgncol] = useState('');
    const [textcol, setTextcol] = useState('');
    const [boxShadow, setBoxShadow] = useState('');
    const toastRemainingTimeRef = useRef(null);
    const toastStartRef = useRef(null);
    const toastProgressRef = useRef(null);

    const hud = (message, textcolor = '', color = '', shadow = '') => {
        setHudMessage(message);
        setIsHudRotating(true);
        setBackgncol(color);
        setTextcol(textcolor);
        setBoxShadow(shadow);
    };

    const stopHudRotation = () => {
        setIsHudRotating(false);
        setHudMessage('');
        setBackgncol('');
        setBoxShadow('');
    };



    const showAlert = (message, buttons = []) => {
        setAlert({ show: true, message, buttons });
    };

    const hideAlert = () => {
        setAlert({ show: false, message: '', buttons: [] });
    };

    const showToast = ({ title, message, duration = 3000, position = 'top-right', color = '#09c' }) => {
        clearTimeout(toastTimeoutRef.current); // Clear any existing timeout
        const startTime = Date.now();
        toastStartRef.current = startTime;
        toastRemainingTimeRef.current = duration;

        setToast({ title, message, duration, position, color });
        toastTimeoutRef.current = setTimeout(() => {
            setToast(null);
        }, duration);
    };

    const handleMouseEnter = () => {
        clearTimeout(toastTimeoutRef.current);
        const elapsedTime = Date.now() - toastStartRef.current;
        toastRemainingTimeRef.current -= elapsedTime;

        if (toastProgressRef.current) {
            toastProgressRef.current.style.animationPlayState = 'paused';
        }
    };

    const handleMouseLeave = () => {
        toastStartRef.current = Date.now();
        toastTimeoutRef.current = setTimeout(() => {
            setToast(null);
        }, toastRemainingTimeRef.current);

        if (toastProgressRef.current) {
            toastProgressRef.current.style.animationPlayState = 'running';
        }
    };


    useEffect(() => {
        return () => {
            clearTimeout(toastTimeoutRef.current); // Cleanup timeout on unmount
        };
    }, []);

    const hideToast = () => {
        clearTimeout(toastTimeoutRef.current); // Clear timeout on manual close
        setToast(null);
    };

    const toastTimeoutRef = useRef(null);

    return (
        <CustomContext.Provider value={{ showAlert, showToast, hud, stopHudRotation, hideToast }}>
            {children}
            {alert.show && (
                <div className="custom-alert">
                    <div className="custom-alert-content">
                        <p>{alert.message}</p>
                        <div className="alert-buttons">
                            {alert.buttons.map((button, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        button.onClick();
                                        hideAlert();
                                    }}
                                    style={{ backgroundColor: button.color || 'defaultColor' }}
                                >
                                    {button.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {/* {toast && (
                <div className={`custom-toast toast-${toast.position}`} style={{ backgroundColor: toast.color }}>
                    {toast.title && <strong>{toast.title}</strong>}
                    <p>{toast.message}</p>
                    <div className="toast-progress" style={{ animationDuration: `${toast.duration}ms` }}></div>
                </div>
            )} */}

            {toast && (
                <div
                    className={`custom-toast toast-${toast.position}`}
                    style={{ backgroundColor: toast.color || '#09c' }}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}>

                    {toast.title && <strong>{toast.title}</strong>}
                    <p>{toast.message}</p>
                    <button className="close-toast" onClick={hideToast}>X</button>
                    <div className="toast-progress" ref={toastProgressRef} style={{ animationDuration: `${toast.duration}ms` }}></div>
                </div>
            )
            }
          
            {hudMessage && (
                    <div>
                        <div className="overlay" style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'transparent',
                            pointerEvents: 'auto',
                            zIndex: 2000,
                        }}>
                        </div>
                        <div className="custom-hud-container" style={{
                            backgroundColor: backgncol,
                            color: textcol,
                            boxShadow: boxShadow,
                            zIndex: 2000,
                            pointerEvents: 'none',
                        }}>
                            <div className="custom-hud">
                                <Spin className="custom-spin" spinning={isHudRotating} size="large" />
                                <span>{hudMessage}</span>
                            </div>
                        </div>
                    </div>

                )}
        </CustomContext.Provider >
    );
};