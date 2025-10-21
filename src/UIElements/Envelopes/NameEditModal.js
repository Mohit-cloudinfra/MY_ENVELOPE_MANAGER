import React, { useState } from 'react';
import { MdCancel } from 'react-icons/md';
import EnvelopeDS from '../../DataServices/EnvelopeDS';
import { useCustomContext } from '../CustomComponents/CustomComponents';

function NameEditModal({ title, envelope, onClose, onUpdate, EnvelopeList}) {
  const { showAlert, hud, stopHudRotation } = useCustomContext();
  const [newName, setNewName] = useState(envelope.envelopeName || "");
 

  console.log("EnvelopeList",EnvelopeList)

  const UpdateEnvelopeName = async (e) => {
    e.preventDefault(); // prevent form reload
    const nameExists = EnvelopeList.some(
      (env) =>
        env.envelopeName.trim().toLowerCase() === newName.trim().toLowerCase() &&
        env._id !== envelope._id // exclude current envelope
    );

    if (nameExists) {
      onClose();
      showAlert('Name already exists in list', [
        {
          label: 'Ok',
          onClick: () => {},
          color: 'var(--buttonColor)',
        },
      ]);
      return; // stop here
    }
    hud('Please Wait...');
    
    const currentTimestamp = new Date().toISOString();
    const requestData = {
      envelopeID: envelope._id,
      newEnvelopeName: newName,
      envelopeUpdatedTimeStamp: currentTimestamp,
    };

    console.log("Request Data", requestData, envelope)

    try {
      const envelopeDS = new EnvelopeDS(
        EnvelopeDataSuccessResponse.bind(this),
        EnvelopeDataFailureResponse.bind(this)
      );
      envelopeDS.updateEnvelopeName(requestData);
    } catch (error) {
      stopHudRotation();
      console.error("Failed to fetch envelopes:", error);
      showAlert('Error updating envelope', [
        {
          label: 'Ok',
          onClick: () => { },
          color: 'var(--buttonColor)',
        },
      ]);
    }
  };

  function EnvelopeDataSuccessResponse(response) {
    stopHudRotation();
    if (response) {
      onClose();
      console.log('Parsed Data:', response);
      showAlert('Envelope name updated successfully', [
        {
          label: 'Ok',
          onClick: onUpdate,
          color: 'var(--buttonColor)',
        },
      ]);

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

  function EnvelopeDataFailureResponse(error) {
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

  return (
    <div className="modal-overlay">
      <div className="modal-content-envelope">
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <MdCancel className="close-modal" size={24} onClick={onClose} />
        </div>

        <form className="envelope-form" onSubmit={UpdateEnvelopeName}>
          <div>
            <label>Envelope Name</label>
            <input
              type="text"
              name="envelopeName"
              className="form-control"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </div>
          <div className="button-group-btn">
            <button
              type="submit"
              disabled={newName.trim() === "" || newName === envelope.envelopeName}
              style={{
                opacity: newName.trim() === "" || newName === envelope.envelopeName ? 0.5 : 1,
                cursor: newName.trim() === "" || newName === envelope.envelopeName ? "not-allowed" : "pointer",
              }}
            >
              Update
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}

export default NameEditModal;
