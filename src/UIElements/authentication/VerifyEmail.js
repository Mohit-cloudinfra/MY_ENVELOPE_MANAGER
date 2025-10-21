import React, { useState } from 'react';
import { useNavigate, useLocation,Link } from 'react-router-dom';
import UserPool from '../../UserPool';
import { CognitoUser } from 'amazon-cognito-identity-js';
import './Authentication.css';
import { useCustomContext } from '../CustomComponents/CustomComponents';


function VerifyEmail() {
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationErrorMessage, setVerificationErrorMessage] = useState('');

    const { showAlert,hud, stopHudRotation } = useCustomContext();
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email || ''; // Get the email from navigation state

    const handleCodeChange = (e) => {
        setVerificationCode(e.target.value);
    };

    const handleVerify = (e) => {
        e.preventDefault();
        setVerificationErrorMessage('');
        hud("Please Wait...")
        const userData = {
            Username: email,
            Pool: UserPool,
        };

        const cognitoUser = new CognitoUser(userData);

        cognitoUser.confirmRegistration(verificationCode, true, (err, result) => {
            if (err) {
                stopHudRotation();
                // console.log(err);
                setVerificationErrorMessage(err.message);
            
            } else {
                // console.log(result);
                stopHudRotation();
                showAlert('Verification successful', [
                    {
                        label: 'Ok',
                        onClick: () => {
                            navigate('/'); // Navigate to the desired page after verification
                        },
                        color: 'var(--buttonColor)',
                    },
                ]);
            }
        });
    };

    return (
        <div className='container d-flex flex-column align-items-center login-hub'>
           <span className="heading-span mb-1">Envelope Manager</span>
            <span className='font-weight-bold mb-3 logo'>
                Enter the verification code sent to your email.
            </span>
            <div className='input-container mb-3 w-100'>
                <div className='d-flex justify-content-center w-100'>
                    <form onSubmit={handleVerify} className='form-container'>
                        <div className='form-group mb-3'>
                            <input
                                className={`form-control ${verificationErrorMessage ? 'is-invalid' : verificationCode ? 'is-valid' : ''}`}
                                type='text'
                                style={{ height: '45px' }}
                                placeholder='Verification Code'
                                value={verificationCode}
                                onChange={handleCodeChange}
                                required
                            />
                            {verificationErrorMessage && <div className='invalid-feedback error-message'>{verificationErrorMessage}</div>}
                        </div>
                        <button className='btn btn-primary submit btn-block mt-1 mb-3 submit-button' type='submit'>
                            Verify
                        </button>
                        <Link
                            to="/"
                            className="text-decoration-underline custom-link3"
                        >
                            Sign In
                        </Link>
                    </form>
                    
                </div>
            </div>
            
        </div>
    );
}

export default VerifyEmail;
