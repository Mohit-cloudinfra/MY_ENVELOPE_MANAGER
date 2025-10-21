import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './Authentication.css';
import { CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";
import UserPool from '../../UserPool';
import { useCustomContext } from '../CustomComponents/CustomComponents';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6';

function ValidateCode({ onLogin }) {
    const [newPassword, setNewPassword] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
    const [verificationCodeErrorMessage, setVerificationCodeErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';
    const { showAlert, hud, stopHudRotation } = useCustomContext();

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setNewPassword(value);
        validatePassword(value);
    };

    const handleVerificationCodeChange = (e) => {
        const value = e.target.value;
        setVerificationCode(value);
        validateVerificationCode(value);
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

    const validateVerificationCode = (value) => {
        // Add validation logic for verification code if needed
        if (!value) {
            setVerificationCodeErrorMessage('Enter the verification code.');
        } else {
            setVerificationCodeErrorMessage('');
        }
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Clear previous error messages
        setPasswordErrorMessage('');
        setVerificationCodeErrorMessage('');

        // Validate fields
        validatePassword(newPassword);
        validateVerificationCode(verificationCode);

        // Check for any errors
        if (!newPassword || !verificationCode || passwordErrorMessage || verificationCodeErrorMessage) {
            return;
        }
        hud('Please Wait...');

        const userData = {
            Username: email,
            Pool: UserPool,
        };


        const cognitoUser = new CognitoUser(userData);

        cognitoUser.confirmPassword(verificationCode, newPassword, {
            onSuccess: () => {
                // alert("Successfully changed password!");
                stopHudRotation();
                showAlert("Successfully changed password!", [
                    {
                        label: 'Ok',
                        onClick: () => {
                            setVerificationCode('');
                            setNewPassword('');
                            navigate('/');

                        },
                        color: 'var(--buttonColor)',
                    },

                ]);
            },
            onFailure: (err) => {
                // alert(err.message);
                stopHudRotation();
                showAlert(err.message, [
                    {
                        label: 'Ok',
                        onClick: () => { },
                        color: 'var(--buttonColor)', // Set button color
                    },
                ]);
            },
        });

    };

    return (
        <div className='container d-flex flex-column align-items-center login-hub'>
            <span className="heading-span mb-1">Envelope Manager</span>
            <span className='font-weight-bold mb-3 logo'>
                Check your email for the verification code and enter it here
            </span>
            <div className='input-container mb-3 w-100'>
                <div className='d-flex justify-content-center w-100'>
                    <form onSubmit={handleSubmit} className='form-container'>
                        <div className='form-group mb-3'>
                            <input
                                className={`form-control ${verificationCodeErrorMessage ? 'is-invalid' : verificationCode ? 'is-valid' : ''} inputs`}
                                type='text'
                                placeholder='Verification Code'
                                value={verificationCode}
                                onChange={handleVerificationCodeChange}

                            />
                            {verificationCodeErrorMessage && <div className='invalid-feedback error-message'>{verificationCodeErrorMessage}</div>}
                        </div>
                        <div className='form-group password-container'>
                            <input
                                className={`form-control ${passwordErrorMessage ? 'is-invalid' : newPassword ? 'is-valid' : ''} inputs`}
                                type={showPassword ? 'text' : 'password'}
                                placeholder='New Password'
                                value={newPassword}
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
                        

                        <button className='btn btn-primary submit btn-block mt-4 submit-button' type='submit'>
                            Submit
                        </button>
                        <div className='form-group mb-3 p-1 mt-2'>
                            <Link to="#" onClick={() => navigate(-1)} className="link-back">
                                Back
                            </Link>
                        </div>
                    </form>

                </div>

            </div>
        </div>
    );
}

export default ValidateCode;