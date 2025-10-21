import React, { useState, useEffect } from 'react';
import './Indicia.css';
import { MdCancel } from 'react-icons/md';
import IndiciaDS from '../../DataServices/IndiciaDS';

import { useCustomContext } from '../CustomComponents/CustomComponents';

function AddIndicia({ onClose, onSave, currentIndicia, title }) {
    const [indiciaData, setIndiciaData] = useState({ line1: '', line2: '', line3: '', line4: '',line5:'', description: '' });
    const { showAlert, hud, stopHudRotation } = useCustomContext();
    const loggedEmail = localStorage.getItem('email');

    useEffect(() => {
        if (currentIndicia) {
            setIndiciaData({
                line1: currentIndicia.line1 || '',
                line2: currentIndicia.line2 || '',
                line3: currentIndicia.line3 || '',
                line4: currentIndicia.line4 || '',
                line5: currentIndicia.line5 || '',
                description: currentIndicia.indiciaDescription || '',
            });
        } else {
            setIndiciaData({ line1: '', line2: '', line3: '', line4: '',line5:'', description: '' });
        }
    }, [currentIndicia]);


    const fetchIndiciasAdd = async () => {
        hud("Please Wait...")
        const currentTimestamp = new Date().toISOString();
        const requestData = {
            line1: indiciaData.line1,
            line2: indiciaData.line2,
            line3: indiciaData.line3,
            line4: indiciaData.line4,
            line5: indiciaData.line5,
            indiciaAddedBy: loggedEmail,
            indiciaAddedTimeStamp: currentTimestamp,
            indiciaUpdatedTimeStamp: currentTimestamp,
            indiciaDescription: indiciaData.description
        };
        try {
            const indiciaAddDS = new IndiciaDS(IndiciaAddDataSuccessResponse.bind(this), IndiciaAddDataFailureResponse.bind(this));
            indiciaAddDS.addIndicia(requestData);
        } catch (error) {
            console.error("Failed to add Indicia:", error);
        }
    };


    function IndiciaAddDataSuccessResponse(response) {
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

    function IndiciaAddDataFailureResponse(error) {
        stopHudRotation();
        console.error('Something went wrong:', error);

        // Extract message or show a default error message
        const errorMessage = error.response?.message || error || 'An error occurred while adding indicia';

        showAlert(errorMessage, [
            {
                label: 'Ok',
                onClick: () => { },
                color: 'var(--buttonColor)',
            },
        ]);
    }


    const fetchIndiciasUpdate = async () => {
        hud("Please Wait...")
        const requestData = {
            _id: currentIndicia._id,
            line1: indiciaData.line1,
            line2: indiciaData.line2,
            line3: indiciaData.line3,
            line4: indiciaData.line4,
            line5: indiciaData.line5,
            indiciaAddedBy: loggedEmail,
            indiciaUpdatedTimeStamp: new Date().toISOString(),
            indiciaDescription: indiciaData.description
        };
        try {
            const indiciaUpdateDS = new IndiciaDS(IndiciaUpdateDataSuccessResponse.bind(this), IndiciaUpdateDataFailureResponse.bind(this));
            indiciaUpdateDS.editIndicia(requestData);
        } catch (error) {
            console.error("Failed to update Indicia:", error);
        }
    };

    function IndiciaUpdateDataSuccessResponse(response) {
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

    function IndiciaUpdateDataFailureResponse(error) {
        stopHudRotation();
        console.error('Something went wrong:', error);

        // Extract message or show a default error message
        const errorMessage = error.response?.message || error || 'An error occurred while updating indicia';

        showAlert(errorMessage, [
            {
                label: 'Ok',
                onClick: () => { },
                color: 'var(--buttonColor)',
            },
        ]);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setIndiciaData({ ...indiciaData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (currentIndicia) {
            const isFieldFilled = (
                indiciaData.line1 ||
                indiciaData.line2 ||
                indiciaData.line3 ||
                indiciaData.line4 ||
                indiciaData.line5
            );
        
            if (!isFieldFilled) {
                showAlert('Please fill in at least one of the address lines (Line 1 to Line 5).', [
                    {
                        label: 'Ok',
                        onClick: () => { },
                        color: 'var(--buttonColor)',
                    },
                ]);
                return; // Stop execution if no fields are filled
            }
            const isChanged = (
                indiciaData.line1 !== currentIndicia.line1 ||
                indiciaData.line2 !== currentIndicia.line2 ||
                indiciaData.line3 !== currentIndicia.line3 ||
                indiciaData.line4 !== currentIndicia.line4 ||
                indiciaData.line5 !== currentIndicia.line5 ||
                indiciaData.description !== currentIndicia.indiciaDescription
            );
            if (!isChanged) {
                showAlert('No changes detected', [
                    {
                        label: 'Ok',
                        onClick: () => { },
                        color: 'var(--buttonColor)',
                    },
                ]);
            } else {
                fetchIndiciasUpdate();
            }
        } else {
           const isFieldFilled = (
            indiciaData.line1 ||
            indiciaData.line2 ||
            indiciaData.line3 ||
            indiciaData.line4 ||
            indiciaData.line5 
        );

        if (isFieldFilled) {
            fetchIndiciasAdd();
        } else {
            showAlert('Please fill in at least one of the address lines (Line 1 to Line 5).', [
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
                    <MdCancel className='close-modal' size={24} onClick={handleCloseModal} />
                </div>

                <form onSubmit={handleSubmit} className='add-Indicia'>
                    <div>
                        <label>Line 1</label>
                        <input
                            type="text"
                            name="line1"
                            className="form-control"
                            value={indiciaData.line1}
                            onChange={handleChange}                          
                        />
                    </div>
                    <div>
                        <label>Line 2</label>
                        <input
                            type="text"
                            name="line2"
                            className="form-control"
                            value={indiciaData.line2}
                            onChange={handleChange}                          
                        />
                    </div>
                    <div>
                        <label>Line 3</label>
                        <input
                            type="text"
                            name="line3"
                            className="form-control"
                            value={indiciaData.line3}
                            onChange={handleChange}                          
                        />
                    </div>
                    <div>
                        <label>Line 4</label>
                        <input
                            type="text"
                            name="line4"
                            className="form-control"
                            value={indiciaData.line4}
                            onChange={handleChange}                          
                        />
                    </div>
                    <div>
                        <label>Line 5</label>
                        <input
                            type="text"
                            name="line5"
                            className="form-control"
                            value={indiciaData.line5}
                            onChange={handleChange}                          
                        />
                    </div>
                    <div>
                        <label>Description</label>
                        <input
                            type="text"
                            name="description"
                            className="form-control"
                            value={indiciaData.description}
                            onChange={handleChange}                           
                        />
                    </div>
                    <div className="button-group-btn">
                        <button type="submit">{currentIndicia ? 'Update' : 'Submit'}</button>
                    </div>
                </form>

            </div>
        </div>
    );
}

export default AddIndicia;
