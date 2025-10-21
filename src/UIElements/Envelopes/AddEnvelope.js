import React, { useState, useEffect } from 'react';
import { MdCancel } from 'react-icons/md';
import { useCustomContext } from '../CustomComponents/CustomComponents';
import EnvelopeDS from '../../DataServices/EnvelopeDS';
import ClientDS from '../../DataServices/ClientDS';
import EnvelopeGroupListDS from '../../DataServices/EnvelopeGroupListDS';

function AddEnvelope({ onClose, onSave, title, envelopesList, activeTab }) {
    const [envelopeData, setEnvelopeData] = useState({
        envelopeName: '',
        envelopeID: '',
        clientID: '',
        clientName: '',
        envelopeGroupID: '',
        envelopeGroupName: '',
        envelopeColor: true,
        pageType: 1,
        masterPageID: '',
    });
    const [clients, setClients] = useState([]);
    const [groups, setGroups] = useState([]);
    const [masterPages, setMasterPages] = useState([]);
    const [selectedMasterPage, setSelectedMasterPage] = useState(null);
    const loggedEmail = localStorage.getItem('email');
    const { showAlert, hud, stopHudRotation } = useCustomContext();

    useEffect(() => {
        fetchClients();
        fetchEnvelopeGroupList();
    }, []);

    useEffect(() => {
        // Filter master pages based on the selected client and pageType = 2
        if (envelopeData.clientID) {
            const filteredMasterPages = envelopesList.filter(
                envelope =>
                    envelope.clientID === envelopeData.clientID && envelope.pageType === 2
            );
            setMasterPages(filteredMasterPages);
        } else {
            setMasterPages([]); 
        }
    }, [envelopeData.clientID, envelopesList]);

    useEffect(() => {
    
        if (activeTab === "All" || activeTab === "Simple") {
            envelopeData.pageType = 1;
        } else if (activeTab === "Master" || activeTab === "Master-Child") {
            envelopeData.pageType = 2;
        } else if (activeTab === "Child") {
            envelopeData.pageType = 3;
        } else {
            envelopeData.pageType = 1; // Default fallback
        }
    
    }, [activeTab]);

    const fetchClients = async () => {
        hud("Please Wait...");
        try {
            const clientDS = new ClientDS(
                ClientDataSuccessResponse.bind(this),
                ClientDataFailureResponse.bind(this)
            );
            clientDS.fetchClients();
        } catch (error) {
            stopHudRotation();
            console.error("Failed to fetch clients:", error);
            showAlert('Failed to fetch client data. Please try again.', [
                {
                    label: 'Ok',
                    onClick: () => { },
                    color: 'var(--buttonColor)',
                },
            ]);
        }
    };


    function ClientDataSuccessResponse(response) {
        stopHudRotation();
        if (response) {
            try {
                const data = response;
                setClients(data);
            } catch (parseError) {
                showAlert('Error parsing client data', [
                    {
                        label: 'Ok',
                        onClick: () => { },
                        color: 'var(--buttonColor)',
                    },
                ]);
            }
        } else {
            showAlert('No Clients Available', [
                {
                    label: 'Ok',
                    onClick: () => { },
                    color: 'var(--buttonColor)',
                },
            ]);
        }
    }

    function ClientDataFailureResponse(error) {
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



    const fetchEnvelopeGroupList = async () => {
        hud("Please Wait...");
        try {
            const envelopeGroupDS = new EnvelopeGroupListDS(
                EnvelopeGroupListDataSuccessResponse.bind(this),
                EnvelopeGroupListDataFailureResponse.bind(this)
            );
            envelopeGroupDS.fetchEnvelopeGroupListsGet();
        } catch (error) {
            console.error("Failed to fetch envelope groups:", error);
        }
    };

    function EnvelopeGroupListDataSuccessResponse(response) {
        stopHudRotation();
        if (response) {
            try {
                const data = response;
                setGroups(data);
            } catch (parseError) {
                showAlert('Error parsing envelope group data', [
                    {
                        label: 'Ok',
                        onClick: () => { },
                        color: 'var(--buttonColor)',
                    },
                ]);
            }
        } else {
            showAlert('No Envelope Groups Available', [
                {
                    label: 'Ok',
                    onClick: () => { },
                    color: 'var(--buttonColor)',
                },
            ]);
        }
    }

    function EnvelopeGroupListDataFailureResponse(error) {
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

    const fetchEnvelopesAdd = async () => {
        const currentTimestamp = new Date().toISOString();
        hud("Please Wait...");
        console.log("master", masterPages)

        const requestData = {
            envelopeName: envelopeData.envelopeName,
            envelopeGroupID: envelopeData.envelopeGroupID,
            clientID: envelopeData.clientID,
            s3FilePath: '', // You might want to set this or remove if not required
            isColor: envelopeData.envelopeColor,
            pageType: envelopeData.pageType,
            envelopeAddedBy: loggedEmail,
            isEnvelopeDeleted: false,
            isEnvelopeEnable: true,
            envelopeAddedTimeStamp: currentTimestamp,
            envelopeUpdatedTimeStamp: currentTimestamp,
            // masterPageID: selectedMasterPage._id,
            // envelopeGroupID: selectedMasterPage.envelopeGroupID
        };
        if (envelopeData.pageType === 3 && masterPages.length > 0) {
            console.log("masterpages", masterPages);
            requestData.masterPageID = selectedMasterPage._id;
            requestData.envelopeGroupID = selectedMasterPage.envelopeGroupID;
        };
        console.log("req-master", requestData);
        try {
            const EnvelopeAddDS = new EnvelopeDS(EnvelopeAddDataSuccessResponse.bind(this), EnvelopeAddDataFailureResponse.bind(this));
            EnvelopeAddDS.addEnvelope(requestData);
        }
        catch (error) {
            stopHudRotation();
            console.error("Failed to add envelope:", error);
        }

    };

    function EnvelopeAddDataSuccessResponse(response) {
        stopHudRotation();
        console.log("req-envelope", response);
        if (response) {
            const newEnvelope = {
                envelopeID: response.envelopeID,
                envelopeName: envelopeData.envelopeName,
                clientID: envelopeData.clientID,
                clientName: envelopeData.clientName,
                envelopeGroupID: envelopeData.envelopeGroupID,
                envelopeGroupName: envelopeData.envelopeGroupName,
                pageType: envelopeData.pageType,
                isEnvelopeEnable: true,
                s3FilePath: '',
                isColor: envelopeData.envelopeColor
            };
            if (envelopeData.pageType === 3 && masterPages.length > 0) {
                newEnvelope.masterPageID = selectedMasterPage._id;
                newEnvelope.envelopeGroupID = selectedMasterPage.envelopeGroupID;
            };
            console.log("master", masterPages);
            onSave(newEnvelope);
            console.log('newenv', newEnvelope);

            onClose();
        } else {
            showAlert('Failed to add envelope', [
                {
                    label: 'Ok',
                    onClick: () => { },
                    color: 'var(--buttonColor)',
                },
            ]);
        }
    }

    function EnvelopeAddDataFailureResponse(error) {
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
        const updatedValue = name === 'pageType' ? parseInt(value) : value;
        setEnvelopeData(prevData => {
            const updatedData = { [name]: updatedValue };

            if (name === 'clientID') {
                const selectedClient = clients.find(client => client.clientID === value);
                return {
                    ...prevData,
                    ...updatedData,
                    clientName: selectedClient ? selectedClient.clientName : ''
                };
            } else if (name === 'envelopeGroupID') {
                const selectedGroup = groups.find(group => group.envelopeGroupID === value);
                return {
                    ...prevData,
                    ...updatedData,
                    envelopeGroupName: selectedGroup ? selectedGroup.envelopeGroupName : ''
                };
            }

            return {
                ...prevData,
                ...updatedData
            };
        });
    };

    const handleMasterPageSelection = (e) => {
        const selectedMasterPageID = e.target.value;
        const selectedMaster = masterPages.find(page => page._id === selectedMasterPageID);
        setSelectedMasterPage(selectedMaster);
        setEnvelopeData(prevState => ({
            ...prevState,
            masterPageID: selectedMasterPageID,
        }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        const newEnvelopeName = (envelopeData.envelopeName || '').trim().toUpperCase();

        const { clientID, envelopeGroupID } = envelopeData;
        if (!newEnvelopeName.trim() || !clientID || (envelopeData.pageType !== 3 && !envelopeGroupID)) {
            showAlert('Please fill in the Envelope name, Client, and Envelope Group.', [
                { label: 'Ok', onClick: () => { }, color: 'var(--buttonColor)' },
            ]);
            return;
        }

        if (envelopeData.pageType === 3 && !envelopeData.masterPageID) {
            showAlert('Please select a master page for the child page.', [
                { label: 'Ok', onClick: () => { }, color: 'var(--buttonColor)' },
            ]);
            return;
        }

        const envelopeExists = envelopesList.some(envelope =>
            (envelope.envelopeName || '').trim().toUpperCase() === newEnvelopeName
        );

        if (envelopeExists) {
            showAlert('Envelope already exists', [
                {
                    label: 'Ok',
                    onClick: () => { },
                    color: 'var(--buttonColor)',
                },
            ]);
        } else {
            fetchEnvelopesAdd();
            // console.log(' envelopeData.envelopeGroupID', envelopeData.envelopeGroupID,)
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content-envelope">
                <div className="modal-header">
                    <span className="modal-title">{title}</span>
                    <MdCancel className='close-modal' size={24} onClick={onClose} />
                </div>

                <form onSubmit={handleSubmit} className='envelope-form'>

                    <div className="page-type-selection">
                        <label>Page Type</label>
                        <label>
                            <input
                                type="radio"
                                name="pageType"
                                value={1}
                                className='form-radio'
                                checked={envelopeData.pageType === 1}
                                onChange={handleChange}
                            />
                            Simple Page
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="pageType"
                                value={2}
                                className='form-radio'
                                checked={envelopeData.pageType === 2}
                                onChange={handleChange}
                            />
                            Master Page
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="pageType"
                                value={3}
                                className='form-radio'
                                checked={envelopeData.pageType === 3}
                                onChange={handleChange}
                            />
                            Child Page
                        </label>
                    </div>
                    <div>
                        <label>Envelope Name</label>
                        <input
                            type="text"
                            name="envelopeName"
                            className="form-control"
                            value={envelopeData.envelopeName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label>Client Name</label>
                        <select
                            name="clientID"
                            className="form-select"
                            value={envelopeData.clientID}
                            onChange={handleChange}
                            
                            required
                        >
                            <option value="">Select Client</option>
                            {clients && clients.length > 0 ? (
                                clients
                                    .filter(client => client.isClientEnable === true)
                                    .map(client => (
                                        <option key={client._id} value={client._id}>
                                            {client.clientName}
                                        </option>
                                    ))
                            ) : (
                                <option disabled>No Clients Available</option>
                            )}
                        </select>
                    </div>
                    {envelopeData.pageType !== 3 && (
                        <div>
                            <label>Envelope Group Name</label>
                            <select
                                name="envelopeGroupID"
                                className="form-select"
                                value={envelopeData.envelopeGroupID}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Group</option>
                                {groups && groups.length > 0 ? (
                                    groups.map(group => (
                                        <option key={group._id} value={group._id}>
                                            {group.envelopeGroupName}
                                        </option>
                                    ))
                                ) : (
                                    <option disabled>No Groups Available</option>
                                )}
                            </select>
                        </div>
                    )}
                    {envelopeData.pageType === 3 && (
                        <div>
                            <label>Master Page</label>
                            <select
                                name="masterPageID"
                                className="form-select"
                                onChange={handleMasterPageSelection}
                                value={selectedMasterPage ? selectedMasterPage._id : ''}
                                disabled={!envelopeData.clientID}
                            // required
                            >
                                <option value="">Select Master Page</option>
                                {masterPages && masterPages.length > 0 ? (
                                    masterPages.map(masterPage => (
                                        <option key={masterPage._id} value={masterPage._id}>
                                            {masterPage.envelopeName}
                                        </option>
                                    ))
                                ) : (
                                    <option disabled>No Master Pages Available</option>
                                )}
                            </select>
                        </div>


                    )}

                    {/* <div className='radio-div'>
                        <label>Envelope Color</label>
                        <label className='radio-label'>
                            <input
                                type="radio"
                                name="envelopeColor"
                                className='form-radio'
                                value={true}
                                checked={envelopeData.envelopeColor === true}
                                onChange={() => setEnvelopeData(prevData => ({ ...prevData, envelopeColor: true }))}
                            />
                            Color
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="envelopeColor"
                                className='form-radio'
                                value={false}
                                checked={envelopeData.envelopeColor === false}
                                onChange={() => setEnvelopeData(prevData => ({ ...prevData, envelopeColor: false }))}
                            />
                            Black & White
                        </label>
                    </div> */}

                    <div className="button-group-btn">
                        <button type="submit">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddEnvelope;
