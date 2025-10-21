import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Authentication.css';
import UserPool from '../../UserPool';
import { CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";
import { useCustomContext } from '../CustomComponents/CustomComponents';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6';

function SignIn({ onLogin }) {
    const [email, setEmail] = useState(localStorage.getItem('rememberedEmail') || '');
    const [password, setPassword] = useState(localStorage.getItem('rememberedPassword') || '');
    const [isChecked, setIsChecked] = useState(localStorage.getItem('rememberMe') === 'true');
    const [emailErrorMessage, setEmailErrorMessage] = useState('');
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { showAlert, hud, stopHudRotation } = useCustomContext();

    useEffect(() => {
        window.history.forward();
        const handlebackbutton = () => {
            window.history.forward();
        };
        window.history.pushState(null, null, window.location.pathname);
        window.addEventListener('popstate', handlebackbutton);
        return () => {
            window.removeEventListener('popstate', handlebackbutton);
        };
    });

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        validateEmail(value);
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        validatePassword(value);
    };

    const validateEmail = (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValidEmail = emailRegex.test(value);
        if (!isValidEmail) {
            setEmailErrorMessage('Enter a valid email address.');
        } else {
            setEmailErrorMessage('');
        }
    };

    const validatePassword = (value) => {
        const lengthRegex = /.{8,}/;
        const numberRegex = /\d+/;
        const symbolRegex = /[\W_]+/;
        const uppercaseRegex = /[A-Z]+/;
        const lowercaseRegex = /[a-z]+/;

        const isValidPassword =
            lengthRegex.test(value) &&
            numberRegex.test(value) &&
            symbolRegex.test(value) &&
            uppercaseRegex.test(value) &&
            lowercaseRegex.test(value);

        if (!isValidPassword) {
            setPasswordErrorMessage('Password must contain at least 8 characters including numbers, symbols, uppercase, and lowercase letters.');
        } else {
            setPasswordErrorMessage('');
        }
    };
    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };
    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clear previous error messages
        setEmailErrorMessage('');
        setPasswordErrorMessage('');

        // Validate fields
        validateEmail(email);
        validatePassword(password);

        // Check for any errors
        if (!email || !password || emailErrorMessage || passwordErrorMessage) {
            return;
        }

        // Proceed with sign-in logic if valid
        const user = new CognitoUser({
            Username: email,
            Pool: UserPool,
        });
        hud("Please Wait...")
        try {
            const authDetails = new AuthenticationDetails({
                Username: email,
                Password: password,
            });

            await new Promise((resolve, reject) => {
                user.authenticateUser(authDetails, {
                    onSuccess: (data) => {
                        user.getUserAttributes((err, attributes) => {
                            if (err) {
                                stopHudRotation();
                                console.error('Error fetching user attributes:', err);
                                handleFailure('Error fetching user attributes');
                            } else {
                                stopHudRotation();
                                const nameAttribute = attributes.find(attr => attr.Name === 'name');
                                const username = nameAttribute ? nameAttribute.Value : '';
                                const subAttribute = attributes.find(attr => attr.Name === 'sub');
                                const userID = subAttribute ? subAttribute.Value : '';
                                localStorage.setItem('isUserLoggedIn', true);
                                localStorage.setItem('email', email);
                                localStorage.setItem('attributes', JSON.stringify(attributes));
                                localStorage.setItem('username', username);
                                localStorage.setItem('userID', userID);
                                // console.log('attributes', attributes)
                                if (isChecked) {
                                    localStorage.setItem('rememberMe', 'true');
                                    localStorage.setItem('rememberedEmail', email);
                                    localStorage.setItem('rememberedPassword', password);
                                } else {
                                    localStorage.removeItem('rememberMe');
                                    localStorage.removeItem('rememberedEmail');
                                    localStorage.removeItem('rememberedPassword');
                                }
                                // onLogin(email);
                                // navigate('/EnvelopeGroups');

                                const storedAttributes = JSON.parse(localStorage.getItem('attributes') || '[]');
                                const isUserApprovedAttribute = storedAttributes.find(attr => attr.Name === 'custom:isUserApproved');
                                const isUserApproved = isUserApprovedAttribute ? isUserApprovedAttribute.Value === '1' : false;
                                if (isUserApproved) {
                                    navigate('/EnvelopeGroups');
                                    onLogin(email);
                                } else {
                                    showAlert('Your account is not yet approved, pls contact support team...', [
                                        { label: 'Ok', color: 'var(--buttonColor)', onClick: () => { } }
                                    ]);
                                }
                            }
                        });
                        resolve();
                    },
                    onFailure: (err) => {
                        console.error('Authentication failure:', err);
                        handleFailure(err.message);
                        reject(err);
                        stopHudRotation();
                    },
                });
            });
        } catch (error) {
            handleCatchError(error);
            stopHudRotation();
            showAlert(error.message, [
                { label: 'Ok', color: 'var(--buttonColor)', onClick: () => { } }
            ]);
        }
    };

    const handleFailure = (message) => {
        stopHudRotation();
        showAlert(message, [
            { label: 'Ok', color: 'var(--buttonColor)', onClick: () => { } }
        ]);
        localStorage.setItem('isUserLoggedIn', false);
    };

    const handleCatchError = (error) => {
        if (error.response) {
            console.error('Response Error:', error.response.data);
        } else if (error.request) {
            console.error('Request Error:', error.request);
        } else {
            console.error('Error:', error.message);
        }
        stopHudRotation();
    };

    return (
        <div className='container d-flex flex-column align-items-center login-hub'>
            <span className="heading-span mb-2">Envelope Manager</span>
            <span className='font-weight-bold mb-3 logo'>
                Welcome to Envelope Manager Platform. Please sign in to your account.
            </span>
            <div className='input-container mb-3 w-100'>
                <div className='d-flex justify-content-center w-100'>
                    <form onSubmit={handleSubmit} className='form-container'>
                        <div className='form-group mb-3'>
                            <input
                                className={`form-control ${emailErrorMessage ? 'is-invalid' : email ? 'is-valid' : ''} inputs`}
                                type='text'
                                placeholder='Email'
                                value={email}
                                onChange={handleEmailChange}
                            />
                            {emailErrorMessage && <div className='invalid-feedback error-message'>{emailErrorMessage}</div>}
                        </div>
                        <div className='form-group'>
                            <div className='password-container'>
                                <input
                                    className={`form-control ${passwordErrorMessage ? 'is-invalid' : password ? 'is-valid' : ''} inputs`}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder='Password'
                                    value={password}
                                    onChange={handlePasswordChange}
                                />
                                <span
                                    className='password-toggle-icon'
                                    onClick={toggleShowPassword}
                                    style={{ right: passwordErrorMessage ? '40px' : '10px' }}
                                >
                                    {showPassword ? <FaRegEye className='pass-eye' /> : <FaRegEyeSlash />}
                                </span>
                                {passwordErrorMessage && <div className='invalid-feedback error-message'>{passwordErrorMessage}</div>}
                            </div>
                        </div>
                        <div className='d-flex justify-content-between align-items-center mb-3'>
                           
                            <div className='form-check'>
                                <input
                                    className='form-check-input'
                                    type='checkbox'
                                    id='checkbox-text'
                                    checked={isChecked}
                                    onChange={handleCheckboxChange}
                                    style={{cursor:'pointer'}}
                                />
                                <label className='form-check-label' htmlFor='checkbox-text'>
                                    Remember Me
                                </label>
                            </div>

                            {/* Forgot Password link */}
                            <Link to="/ForgotPassword" className="text-decoration-underline customs-link">
                                Forgot Password?
                            </Link>
                        </div>


                        <button className='btn btn-primary submit btn-block mt-1 submit-button' type='submit'>
                            Sign In
                        </button>
                    </form>

                </div>

            </div>
            <div className='form-group mb-3 text-center'>
                <p>
                    Don't have an account?{' '}
                    <Link
                        to="/SignUp"
                        className="text-decoration-underline custom-link2"
                    >
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default SignIn;