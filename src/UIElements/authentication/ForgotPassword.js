import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Authentication.css';
import UserPool from '../../UserPool';
import { CognitoUser } from "amazon-cognito-identity-js";
import { useCustomContext } from '../CustomComponents/CustomComponents';

const ForgotPassword = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const navigate = useNavigate();

  const { showAlert, hud, stopHudRotation } = useCustomContext();

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Clear previous error messages
    setEmailErrorMessage('');

    // Validate fields
    validateEmail(email);

    if (!email) {
      setEmailErrorMessage('Enter an email address.');
      return;
    }
    // Check for any errors
    if (emailErrorMessage) {
      return; // Exit early if there are errors
    }
    hud('Please Wait...')
    const userData = {
      Username: email,
      Pool: UserPool,
    };
    const cognitoUser = new CognitoUser(userData);

    cognitoUser.forgotPassword({
      onSuccess: (data) => {
        // console.log("Password reset initiated successfully", data);
        stopHudRotation();
        showAlert('verification code send to your registered email address', [
          {
            label: 'Ok',
            onClick: () => {
              navigate('/ValidateCode', { state: { email } });
            },
            color: 'var(--buttonColor)', // Set button color
          },
        ]);

      },
      onFailure: (err) => {
        stopHudRotation();
        console.error("Error initiating password reset", err);
        showAlert(err.message, [
          {
            label: 'Ok',
            onClick: () => { },
            color: 'var(--buttonColor)', // Set button color
          },
        ]);
        console.error("Error initiating password reset", err);

      },
    });
  };
  return (
    <div className='full-page-container'>
      <div className='centered-content'>
        <span className="heading-span mb-1" style={{ marginTop: '-5%' }}>Envelope Manager</span>
        <span className='font-weight-bold mb-4 logo'>
          Enter the email address you used when you joined and we’ll send you a code to reset your password.
        </span>
        <form onSubmit={handleSubmit}>
          <div className='form-group mb-3 mt-3'>
            <input
              className={`form-control custom-form-control ${emailErrorMessage ? 'is-invalid' : email ? 'is-valid' : ''} inputs`}
              type='text'
              placeholder='Email'
              value={email}
              onChange={handleEmailChange}
            // style={{ marginLeft: '-55px' }}
            />
            {emailErrorMessage && <div className='invalid-feedback error-message text-start'>{emailErrorMessage}</div>}
          </div>
          {/* <div className='form-group mb-3'>
            <button
              className='btn btn-primary btn-block custom-button'
              type='submit'
            >
              Send Reset Code
            </button>

            
          </div> */}
          <button className='btn btn-primary submit btn-block mt-1 mb-3 submit-button' type='submit'>
            Send Reset Code
          </button>
          <div className='form-group d-flex justify-content-start'>
            <Link to="#" onClick={() => navigate(-1)} className="custom-link">
              Back
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
