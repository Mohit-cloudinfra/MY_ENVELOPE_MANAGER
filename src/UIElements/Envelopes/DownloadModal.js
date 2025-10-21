import React, { useState, useEffect } from 'react';
import { MdCancel } from 'react-icons/md';
import { LiaDownloadSolid } from "react-icons/lia";
import './EnvelopeEditor.css';
import { useCustomContext } from '../CustomComponents/CustomComponents';

import IndiciaDS from '../../DataServices/IndiciaDS';

const DownloadOptionsModal = ({ onClose, onDownloadOptionSelected, title }) => {
    const [IndiciaList, setIndiciaList] = useState([]);
    const { showAlert, hud, stopHudRotation } = useCustomContext();

    useEffect(() => {
        hud("Please Wait...");
        fetchIndicias();
    }, []);

    const fetchIndicias = async () => {
        try {
            const indiciaDS = new IndiciaDS(IndiciaDataSuccessResponse.bind(this), IndiciaDataFailureResponse.bind(this));
            indiciaDS.fetchIndicias();
        } catch (error) {
            console.error("Failed to fetch:", error);
        }
    };

    function IndiciaDataSuccessResponse(response) {
        stopHudRotation();
        if (response) {
            try {
                const data = response;
                setIndiciaList(data);
                
            } catch (parseError) {
                showAlert('Error parsing data', [
                    { label: 'Ok', onClick: () => { }, color: 'var(--buttonColor)' },
                ]);
            }
        } else {
            showAlert('No Data', [
                { label: 'Ok', onClick: () => { }, color: 'var(--buttonColor)' },
            ]);
        }
    }

    function IndiciaDataFailureResponse(error) {
        stopHudRotation();
        console.error('Something went wrong:', error);
        showAlert(error, [
            { label: 'Ok', onClick: () => { }, color: 'var(--buttonColor)' },
        ]);
    }

    const handleIndiciaSelection = (indicia) => {
        console.log("selected indicia:",indicia);
        if(indicia === null){
            onDownloadOptionSelected("No Data Available");  
        }else{
            onDownloadOptionSelected(indicia);
        }
        
        onClose(); 
        hud('Please Wait...');
    };

    return (
        <div className="modal-overlay">
            <div className="modal-contents">
                <div className="modal-header">
                    <span className="modal-title">Download {title} Envelope</span>
                    <MdCancel className="close-modal" size={24} onClick={onClose} />
                </div>
                <div className=" mt-3 border-container shadow">
                    <span>Without Indicia</span>
                    <LiaDownloadSolid size={20} className='edit-icon' style={{ marginRight:'18px' }} onClick={() => handleIndiciaSelection(null)} />
                </div>
                <span style={{marginLeft:'20px',fontWeight:500}}>Indicias</span>
                <div className="table-content-envs">                  
                    <table className="table table-bordered">
                        <thead className="thead-dark">
                            <tr>
                                <th>Line 1</th>
                                <th>Line 2</th>
                                <th>Line 3</th>
                                <th>Line 4</th>
                                <th>Line 5</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(IndiciaList) && IndiciaList.length > 0 ? (
                                IndiciaList.map((indicia, index) => (
                                    <tr key={index}>
                                        <td>{indicia.line1}</td>
                                        <td className="table-rows">{indicia.line2}</td>
                                        <td className="table-rows">{indicia.line3}</td>
                                        <td className="table-rows">{indicia.line4}</td>
                                        <td className="table-rows">{indicia.line5}</td>
                                        <td className="align-action">
                                        <LiaDownloadSolid size={20} className='edit-icon'
                                                onClick={() => handleIndiciaSelection(indicia)}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6">No Indicias available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DownloadOptionsModal;
