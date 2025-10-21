import React, { useState, useEffect } from 'react';
import './AddClient.css';
import { MdCancel } from 'react-icons/md';
import ClientDS from '../../DataServices/ClientDS';

import { useCustomContext } from '../CustomComponents/CustomComponents';

function AddClient({ onClose, onSave, currentClient, title, clients }) {
    const [clientData, setClientData] = useState({ ID: '', name: '' });
    const { showAlert,showToast, hud, stopHudRotation } = useCustomContext();
    const loggedEmail = localStorage.getItem('email');

    useEffect(() => {
        if (currentClient) {
            setClientData({
                ID: currentClient.LPDITHR || '',
                name: currentClient.clientName || '',
            });
        } else {
            setClientData({ ID: '', name: '' });
        }
    }, [currentClient]);


    const fetchClientsAdd = async () => {
        const currentTimestamp = new Date().toISOString();
        hud('Please Wait...');
        const requestData = {
            // clientID: clientData.ID,
            clientName: clientData.name,
            clientAddedBy: loggedEmail,
            isClientDeleted: false,
            isClientEnable: true,
            clientAddedTimeStamp: currentTimestamp,
            clientUpdatedTimeStamp: currentTimestamp
        };

        try {
            const clientAddDS = new ClientDS(clientAddDataSuccessResponse.bind(this), clientAddDataFailureResponse.bind(this));
            clientAddDS.addClient(requestData);
        } catch (error) {
            stopHudRotation();
            console.error("Failed to add client:", error);
        }
    };


    function clientAddDataSuccessResponse(response) {
        stopHudRotation();
        if (response) {
            try {
                const data = response;
                // console.log('Parsed Data:', data);
                onSave();
                onClose();

            } catch (parseError) {
                showAlert('Error parsing data', [
                    {
                        label: 'Ok',
                        onClick: () => { },
                        color: 'var(--buttonColor)',
                    },
                ]);
            }
        } else {
            // console.log('Failed to fetch. Response:', response);
            showAlert('No Data', [
                {
                    label: 'Ok',
                    onClick: () => { },
                    color: 'var(--buttonColor)',
                },
            ]);
        }
    }
    function clientAddDataFailureResponse(error) {
        stopHudRotation();
        console.error('Something went wrong:', error);
        showAlert(error, [
            {
                label: 'Ok',
                onClick: () => { },
                color: 'var(--buttonColor)',
            },
        ]);
    }
    
    const fetchClientsIdUpdate = async () => {
        const currentTimestamp = new Date().toISOString();
        hud('Please Wait...');
        const requestData = {
            _id: currentClient._id,
            clientName:clientData.name ,
            clientUpdatedTimeStamp: currentTimestamp,
        };
        try {
            const clientUpdateDS = new ClientDS(clientIdUpdateDataSuccessResponse.bind(this), clientIdUpdateDataFailureResponse.bind(this));
            clientUpdateDS.updateClient(requestData);
        } catch (error) {
            stopHudRotation();
            console.error("Failed to update client:", error);
        }
    };

    function clientIdUpdateDataSuccessResponse(response) {
        stopHudRotation();
        if (response) {
            try {
                onSave();
                onClose();
            } catch (parseError) {
                showAlert('Error parsing data', [
                    {
                        label: 'Ok',
                        onClick: () => { },
                        color: 'var(--buttonColor)',
                    },
                ]);
            }
        } else {
            showAlert('No Data', [
                {
                    label: 'Ok',
                    onClick: () => { },
                    color: 'var(--buttonColor)',
                },
            ]);
        }
    }

    function clientIdUpdateDataFailureResponse(error) {
        stopHudRotation();
        console.error('Something went wrong:', error);
        showAlert(error, [
            {
                label: 'Ok',
                onClick: () => { },
                color: 'var(--buttonColor)',
            },
        ]);
    }


    const handleChange = (e) => {
        const { name, value } = e.target;
        setClientData({ ...clientData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newClientName = (clientData.name || '').trim();
        const clientExists = clients.some(client => (client.clientName || '').trim() === newClientName);
        if (!newClientName.trim() ) {
            showAlert('Please fill in the Client name.', [
                {
                    label: 'Ok',
                    onClick: () => { },
                    color: 'var(--buttonColor)',
                },
            ]);
            return;
        }

        if (currentClient) {
            
            if (!clientExists || currentClient.clientName.trim() === newClientName) {
             
                const isChanged = currentClient.clientName.trim() !== newClientName;
    
                if (isChanged) {
                    // fetchClientsUpdate(); // Proceed with update if client name is changed
                    fetchClientsIdUpdate();
                    // showToast({ message: 'Client name successfully updated' });
                } else {
                    showAlert('No changes detected', [
                        {
                            label: 'Ok',
                            onClick: () => { },
                            color: 'var(--buttonColor)',
                        },
                    ]);
                }
            } else {
                showAlert('Client with this name already exists', [
                    {
                        label: 'Ok',
                        onClick: () => { },
                        color: 'var(--buttonColor)',
                    },
                ]);
            }
        } else {
          
            if (!clientExists) {
                fetchClientsAdd();
            } else {
                showAlert('Client already exists', [
                    {
                        label: 'Ok',
                        onClick: () => { },
                        color: 'var(--buttonColor)',
                    },
                ]);
            }
        }
    };
    



    const handleCloseModal = () => {
        onClose();
    }


    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <span className="modal-title">{title}</span>
                    {/* <button className='close-modal' onClick={handleCloseModal}> */}
                    <MdCancel className='close-modal' size={24} onClick={handleCloseModal} />
                    {/* </button> */}
                </div>

                <form onSubmit={handleSubmit} className='add-client'>
                    {/* <div>
                        <label>Client ID</label>
                        <input
                            type="text"
                            name="ID"
                            className="form-control"
                            value={clientData.ID}
                            onChange={handleChange}
                            required
                        />
                    </div> */}
                    <div>
                        <label>Client Name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-control"
                            value={clientData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="button-group-btn">
                        <button type="submit">{currentClient ? 'Update' : 'Submit'}</button>
                    </div>
                </form>

            </div>
        </div>
    );
}

export default AddClient;
