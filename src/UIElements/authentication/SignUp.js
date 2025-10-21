import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import './Authentication.css';
import { useCustomContext } from '../CustomComponents/CustomComponents';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6';
import UserPool from '../../UserPool';

function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailErrorMessage, setEmailErrorMessage] = useState('');
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
    const [fullName, setFullName] = useState('');
    const [fullNameErrorMessage, setFullNameErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const isUserApproved = false;

    const { showAlert, hud, stopHudRotation } = useCustomContext();

    const navigate = useNavigate();

    const handleFullNameChange = (e) => {
        const value = e.target.value;
        setFullName(value);
        validateFullName(value);
    };

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

    const validateFullName = (value) => {
        const isValidLength = value.length > 0;
        if (!isValidLength) {
            setFullNameErrorMessage('Enter your full name.');
        } else {
            setFullNameErrorMessage('');
        }
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

    const handleSubmit = (e) => {
        e.preventDefault();

        // Clear previous error messages
        setEmailErrorMessage('');
        setPasswordErrorMessage('');
        setFullNameErrorMessage('');

        // Validate fields
        validateFullName(fullName);
        validateEmail(email);
        validatePassword(password);

        // Check for empty fields
        if (!fullName) {
            setFullNameErrorMessage('Enter your full name.');
        }
        if (!email) {
            setEmailErrorMessage('Enter your email address.');
        }
        if (!password) {
            setPasswordErrorMessage('Enter your password.');
        }

        // Exit early if any field is empty or has errors
        if (!fullName || !email || !password || fullNameErrorMessage || emailErrorMessage || passwordErrorMessage) {
            return;
        }
        hud("Please Wait...")
        const attributes = [
            { Name: 'name', Value: fullName },
            { Name: 'email', Value: email },
            { Name: 'custom:isUserApproved', Value: isUserApproved ? '1' : '0' }
        ];

        UserPool.signUp(email, password, attributes, null, (err, data) => {
            if (err) {
                stopHudRotation();
                // console.log(err);
                showAlert(err.message, [
                    {
                        label: 'Ok',
                        onClick: () => { },
                        color: 'var(--buttonColor)', // Set button color
                    },
                ]);
            } else {
                // console.log(data);
                stopHudRotation();
                showAlert('verification code send to your registered email address', [
                    {
                        label: 'Ok',
                        onClick: () => {
                            setEmail('');
                            setPassword('');
                            setFullName('');
                            navigate('/VerifyEmail', { state: { email } }); // Navigate to VerifyEmail
                        },
                        color: 'var(--buttonColor)', // Set button color
                    },
                ]);
            }
        });
    };

    return (
        <div className='container d-flex flex-column align-items-center login-hub'>
            <span className="heading-span mb-2">Envelope Manager</span>
            <span className='font-weight-bold mb-3 logo'>
                Welcome to the Envelope Manager Platform. Please sign up for your account.
            </span>
            <div className='input-container mb-3 w-100'>
                <div className='d-flex justify-content-center w-100'>
                    <form onSubmit={handleSubmit} className='form-container'>
                        <div className='form-group mb-3'>
                            <input
                                className={`form-control ${fullNameErrorMessage ? 'is-invalid' : fullName ? 'is-valid' : ''} inputs`}
                                type='text'
                                placeholder='Full Name'
                                value={fullName}
                                onChange={handleFullNameChange}
                            />
                            {fullNameErrorMessage && <div className='invalid-feedback error-message'>{fullNameErrorMessage}</div>}
                        </div>
                        <div className='form-group mb-3'>
                            <input
                                className={`form-control ${emailErrorMessage ? 'is-invalid' : email ? 'is-valid' : ''} inputs`}
                                type='email'
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
                                /><span
                                    className='password-toggle-icon'
                                    onClick={toggleShowPassword}
                                    style={{ right: passwordErrorMessage ? '40px' : '10px' }}
                                >
                                    {showPassword ? <FaRegEye className='pass-eye' /> : <FaRegEyeSlash />}
                                </span>

                                {passwordErrorMessage && <div className='invalid-feedback error-message'>{passwordErrorMessage}</div>}
                            </div>
                        </div>
                        <button className='btn btn-primary submit btn-block mt-4 submit-button' type='submit'>
                            Create Account
                        </button>
                    </form>
                </div>
                <div className="form-group mb-3 text-center" style={{ paddingTop: '10px' }}>
                    <p>
                        Already have an account?{' '}
                        <Link
                            to="/"
                            className="text-decoration-underline custom-link2"
                        >
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignUp;