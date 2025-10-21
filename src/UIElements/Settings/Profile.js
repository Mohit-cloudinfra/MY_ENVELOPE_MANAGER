import React from 'react';
import { useEffect, useState } from 'react';
import { FaStarOfLife } from "react-icons/fa";
import { Form, Button } from 'react-bootstrap';
import { Spin } from 'antd';
import { Amplify } from 'aws-amplify';
import './Settings.css'
import ProfileDs from '../../DataServices/ProfileDS';
import { useCustomContext } from '../CustomComponents/CustomComponents';
import '../../Variable.css';

function Profile() {
    useEffect(() => {
        Amplify.configure({
            Auth: {
                // Your Cognito User Pool configuration 
                region: process.env.REACT_APP_COGNITO_REGION,
                userPoolId: process.env.REACT_APP_COGNITO_USERPOOLID,
                userPoolWebClientId: process.env.REACT_APP_COGNITO_CLIENTID,
            },
        });
    }, []); // Run this effect only once when the component mounts

    const [isLoading, setLoading] = useState(false);
    const { showAlert,  stopHudRotation, showToast, hud } = useCustomContext();
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');

    const handleSubmit = (event) => {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const values = Object.fromEntries(formData.entries());

        const trimmedName = values.name.trim();
        if (trimmedName === username) {
            showAlert('Name cannot be the same', [{ label: 'OK', onClick: (() => { }), color: 'var(--buttonColor)' }]);
            return;
        }
        if (trimmedName === '') {
            showAlert('Name cannot be empty', [{ label: 'OK', onClick: (() => { }), color: 'var(--buttonColor)' }]);
            return;
        }
        handleUpdate(trimmedName);
    };

    const handleUpdate = async (name) => {
        setLoading(true);
        try {
            const params = {
                name: name
            };
            const profileupdate = new ProfileDs(onProfileUpdateSuccessFromApi.bind(this), onProfileUpdateFailureFromApi.bind())
            profileupdate.ProfileNameUpdate(params);
        } catch (error) {
            console.error('Error updating attribute name:', error);
            setLoading(false);
            stopHudRotation();
        }
    };
    function onProfileUpdateSuccessFromApi(responsedata, name) {
        if (responsedata) {
            localStorage.setItem('username', name);
            setLoading(false);
            stopHudRotation();
            showToast({ message: 'Profile Name Updated Successfully!' });
        }
        else {
            showToast({ message: 'Failed to update profile' });
            setLoading(false);
            stopHudRotation();
        }
        // console.log(responsedata);
    }

    function onProfileUpdateFailureFromApi(responsedata) {
        showToast('Error in updating Profile', 'warning');
        setLoading(false);
        // console.log(responsedata);
    }

    return (
        <div className="card1 mx-auto ">
            <div className="card1-header text-right  rounded" >
                <h1 >Edit Profile</h1>
                <span>Set Up Your Personal Information</span>
            </div>
            <hr></hr>
            <div className="card1-body">
                <div className="row justify-content-center">
                    <div className="col-xl-12 col-lg-16 col-xs-24">
                        {isLoading ? (
                            <div style={{ textAlign: 'center', color: 'black', height: '600px', paddingTop: '300px', }}>
                            <>{hud('Please Wait...')}</>
                        </div>
                        ) : (
                            <Form onSubmit={handleSubmit} className="mx-auto d-block w-100">
                                <Form.Group controlId="formName" className="mx-auto w-50 text-left">
                                    <Form.Label className="d-block bold-label">
                                        <FaStarOfLife className="text-danger" style={{ width: '8px' }} /> Name :
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        defaultValue={username}
                                        maxLength={50}
                                        required
                                        className="text-black mb-3 input-form"
                                    />
                                </Form.Group>
                                <Form.Group controlId="formEmail" className="mx-auto w-50 text-left">
                                    <Form.Label className='bold-label'>Email Id :</Form.Label>
                                    <br />
                                    <Form.Text className="text-muted">
                                        {email}
                                    </Form.Text>
                                    <br />
                                    <Button type="submit" className=" btn1 mx-auto  mt-4 border-0">
                                        Update Profile
                                    </Button>
                                </Form.Group>
                            </Form>
                        )}
                    </div>
                </div>
            </div>
        </div>

    )
}

export default Profile;
