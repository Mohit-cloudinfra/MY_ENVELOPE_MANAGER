import React, { useState } from 'react';
import { FaStarOfLife } from 'react-icons/fa';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6';
import { Form, Button } from 'react-bootstrap';
import { useCustomContext } from '../CustomComponents/CustomComponents';
import { AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js';
import UserPool from '../../UserPool';
import './Settings.css'

function UpdatePassword() {
    const [isLoading, setLoading] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessages, setErrorMessages] = useState({});
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { showToast, hud, stopHudRotation } = useCustomContext();

    // Regex patterns for password validation
    const lengthRegex = /^.{8,}$/;
    const numberRegex = /\d/;
    const symbolRegex = /[!@#$%^&*(),.?":{}|<>]/;
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;

    // Validate old password function
    const validateOldPassword = () => {
        let errors = {};
        if (!oldPassword || oldPassword.length < 8 ||
            !lengthRegex.test(oldPassword) ||
            !numberRegex.test(oldPassword) ||
            !symbolRegex.test(oldPassword) ||
            !uppercaseRegex.test(oldPassword) ||
            !lowercaseRegex.test(oldPassword)
        ) {
            errors.oldPassword = 'Password must contain at least 8 characters including numbers, symbols, uppercase, and lowercase letters.';
        }
        return errors;
    };

    // Validate new password function
    const validateNewPassword = () => {
        let errors = {};
        if (!newPassword) {
            errors.newPassword = 'New password is required.';
        } else {
            if (
                !lengthRegex.test(newPassword) ||
                !numberRegex.test(newPassword) ||
                !symbolRegex.test(newPassword) ||
                !uppercaseRegex.test(newPassword) ||
                !lowercaseRegex.test(newPassword)
            ) {
                errors.newPassword = 'Password must contain at least 8 characters including numbers, symbols, uppercase, and lowercase letters.';
            }
            if (newPassword === oldPassword) {
                errors.newPassword = 'New password must be different from old password.';
            }
        }

        if (newPassword !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match.';
        }

        return errors;
    };

    // Authenticate user
    const authenticateUser = (username, password, callback) => {
        if (typeof callback !== 'function') {
            throw new TypeError('callback must be a function');
        }

        const userData = {
            Username: username,
            Pool: UserPool,
        };

        const cognitoUser = new CognitoUser(userData);
        const authenticationDetails = new AuthenticationDetails({
            Username: username,
            Password: password,
        });

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: (result) => {
                callback(null, cognitoUser, result);
            },
            onFailure: (err) => {
                callback(err, null);
            },
        });
    };

    // Change user password
    const changeUserPassword = (oldPassword, newPassword, callback) => {
        if (typeof callback !== 'function') {
            throw new TypeError('callback must be a function');
        }

        const username = localStorage.getItem('email');
        if (!username) {
            callback(new Error("Username not found in local storage"));
            return;
        }

        authenticateUser(username, oldPassword, (authErr, cognitoUser, authResult) => {
            if (authErr) {
                callback(authErr);
                return;
            }

            cognitoUser.changePassword(oldPassword, newPassword, (changeErr, result) => {
                if (changeErr) {
                    callback(changeErr);
                } else {
                    callback(null, result);
                }
            });
        });
    };

    // Handle form submission
    const handleSubmit = (event) => {
        event.preventDefault();

    
        // Validate passwords
        const oldPasswordErrors = validateOldPassword();
        const newPasswordErrors = validateNewPassword();
        const errors = { ...oldPasswordErrors, ...newPasswordErrors };

        if (Object.keys(errors).length > 0) {
            setErrorMessages(errors);
            stopHudRotation();
            return;
        }

        setLoading(true);

        changeUserPassword(oldPassword, newPassword, (err, result) => {
            setLoading(false);
            stopHudRotation();

            if (err) {
                setErrorMessages({ ...errorMessages, oldPassword: err.message });
                return;
            }

            showToast({ message: 'Password changed successfully!' });
            // localStorage.setItem('password', newPassword);
            localStorage.removeItem('rememberedPassword');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setErrorMessages({});
        });
    };

    const handleCancel = () => {
        setNewPassword('');
        setOldPassword('');
        setConfirmPassword('');
        setErrorMessages({});
    };

    return (
        <div className="card1 mx-auto">
            <div className="card1-header text-right rounded">
                <h1 style={{ fontWeight: 500, fontSize: '18px' }}>Password Settings</h1>
                <span>Change or reset your account password</span>
            </div>
            <hr />
            <div className="card1-body">
                <div className="row justify-content-center">
                    <div className="col-xl-12 col-lg-16 col-xs-24">
                        {isLoading ? (
                           <div style={{ textAlign: 'center', color: 'black', height: '600px', paddingTop: '300px', }}>
                           <>{hud('Please Wait...')}</>
                       </div>
                        ) : (
                            <Form onSubmit={handleSubmit} className="mx-auto d-block w-100">
                                <Form.Group controlId="formOldPassword" className="mx-auto w-50 text-left">
                                    {/* Old Password */}
                                    <Form.Label className="d-block bold-label">
                                        <FaStarOfLife className="text-danger" style={{ width: '8px' }} /> Old Password:
                                    </Form.Label>
                                    <div className="password-input-container">
                                        <Form.Control
                                            type={showOldPassword ? 'text' : 'password'}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            value={oldPassword}
                                            required
                                            className="text-black mb-3 input-form"
                                        />
                                        <span
                                            className="toggle-password-icon"
                                            onClick={() => setShowOldPassword(!showOldPassword)}
                                        >
                                            {showOldPassword ? <FaRegEye className='pass-eye-1' /> : <FaRegEyeSlash /> }
                                        </span>
                                    </div>
                                    {errorMessages.oldPassword && <div className="text-danger">{errorMessages.oldPassword}</div>}

                                    {/* New Password */}
                                    <Form.Label className="d-block bold-label">
                                        <FaStarOfLife className="text-danger" style={{ width: '8px' }} /> New Password:
                                    </Form.Label>
                                    <div className="password-input-container">
                                        <Form.Control
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            
                                            required
                                            className="text-black mb-3 input-form"
                                        />
                                        <span
                                            className="toggle-password-icon"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? <FaRegEye className='pass-eye-1' /> : <FaRegEyeSlash />}
                                        </span>
                                    </div>
                                    {errorMessages.newPassword && <div className="text-danger">{errorMessages.newPassword}</div>}

                                    {/* Confirm Password */}
                                    <Form.Label className="d-block bold-label">
                                        <FaStarOfLife className="text-danger" style={{ width: '8px' }} /> Confirm Password:
                                    </Form.Label>
                                    <div className="password-input-container">
                                        <Form.Control
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                           
                                            required
                                            className="text-black mb-3 input-form"
                                        />
                                        <span
                                            className="toggle-password-icon"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <FaRegEye className='pass-eye-1' /> : <FaRegEyeSlash />}
                                        </span>
                                    </div>
                                    {errorMessages.confirmPassword && <div className="text-danger">{errorMessages.confirmPassword}</div>}

                                    <div className="d-flex mt-4">
                                        <Button type="submit" className="btn1 border-0">
                                            Change Password
                                        </Button>
                                        <Button
                                            type="button"
                                            className="btn-cancel border-0 mx-4"
                                            style={{ backgroundColor: 'gray', color: 'white' }}
                                            onClick={handleCancel}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </Form.Group>
                            </Form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UpdatePassword;
