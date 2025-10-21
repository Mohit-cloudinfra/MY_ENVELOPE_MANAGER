import React, { useState, useEffect } from 'react';
import { IoEyeOutline } from "react-icons/io5"
import './EnvelopGroupsList.css';
import EnvelopeGroupListDS from '../../DataServices/EnvelopeGroupListDS';
import { useCustomContext } from '../CustomComponents/CustomComponents';
import { IoRefreshCircleOutline } from "react-icons/io5";
import { IoIosSearch } from 'react-icons/io';
import EnvelopeEditor from '../Envelopes/EnvelopeEditor';
import AddEnvelopeGroup from './AddEnvelopeGroup';

function EnvelopeGroupsList({ showIconsOnly }) {
  const [groupList, setGroupList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editorModal, setEditorModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [rotateIcon, setRotateIcon] = useState(true);
  const { showAlert, hud, stopHudRotation } = useCustomContext();
  const [selectedEnvelopeGroupID, setSelectedEnvelopeGroupID] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tableHeight, setTableHeight] = useState("600px");
  useEffect(() => {

    fetchEnvelopeGroupList();
  }, []);

  useEffect(() => {
    const updateHeight = () => {
      const screenHeight = window.innerHeight;
  
      // Keep 100px difference from screen height
      const newHeight = screenHeight - 310;
  
      setTableHeight(newHeight + "px");
    };
  
    updateHeight(); // set on load
    window.addEventListener("resize", updateHeight);
  
    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  const fetchEnvelopeGroupList = () => {
    hud("Please Wait...");
    try {
      const envelopeGroupDS = new EnvelopeGroupListDS(EnvelopeGroupListDataSuccessResponse.bind(this), EnvelopeGroupListDataFailureResponse.bind(this));
      envelopeGroupDS.fetchEnvelopeGroupListsGet();
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    }

  };

  function EnvelopeGroupListDataSuccessResponse(response) {
    stopHudRotation();
    if (response) {
      setRotateIcon(false)
      try {
        const data = response;
        // console.log('Parsed Data:', data);
        setGroupList(data);

      } catch (parseError) {
        showAlert('Error parsing data', [
          { label: 'Ok', onClick: () => { }, color: 'var(--buttonColor)' }
        ]);
      }
    } else {
      showAlert('No Data', [
        { label: 'Ok', onClick: () => { }, color: 'var(--buttonColor)' }
      ]);
      stopHudRotation();
    }
  }

  function EnvelopeGroupListDataFailureResponse(error) {
    stopHudRotation();
    console.error('Something went wrong:', error);
    showAlert(error, [
      { label: 'Ok', onClick: () => { }, color: 'var(--buttonColor)' }
    ]);
    stopHudRotation();
  }

  const handleOpenAddModal = () => {
    setOpenModal(true);

  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditorModal(false)
    setModalTitle('');

  };



  const handleIconClick = (user) => {
    setEditorModal(true);
    setSelectedEnvelopeGroupID(user._id);
    setModalTitle(user.envelopeGroupName);

  };

  const handleSaveUser = () => {
    hud("Please Wait...");
    fetchEnvelopeGroupList();
  };
  const filteredEnvelopeGroups = groupList.filter(envelope =>
    envelope.envelopeGroupName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    envelope.envelopeGroupName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    window.history.forward();
    const handlebackbutton = () => {
      window.history.forward();
    };
    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener('popstate', handlebackbutton);
    return () => {
      window.removeEventListener('popstate', handlebackbutton);
    };
  });

  const handleRefresh = () => {
    setRotateIcon(true)
    fetchEnvelopeGroupList();
  }

  return (
    <div className={`main-content ${showIconsOnly ? 'icons-only' : ''}`}>
      <div className="p-3 mb-0 mt-1 custom-bg-white rounded">
        {/* <div className="d-flex justify-content-between align-items-center envelope-header"> */}
        <div className="justify-content-between align-items-center envelope-header">
          <div>
            <span className="m-0 title">Envelope Groups({groupList.length})</span>
          </div>
          <div className="search-div-envelop">
            <div className="input-container-envelop">
              <input
                type="text"
                placeholder="Envelope Group Name"
                className="form-control"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <IoIosSearch className="search-icon" />
            </div>
            <IoRefreshCircleOutline onClick={handleRefresh} className={`refresh-icon ${!rotateIcon ? 'rotate' : 'infinite'}`} />
            <button className="add-envelope-group-btn" onClick={handleOpenAddModal}>
              Add Envelope Group
            </button>
            {/* <button className="refresh-btn" onClick={handleRefresh}>Refresh</button> */}
          </div>

        </div>
      </div>
      <div className='mt-4'>
        <div className='table-content-1' >
          {/* <div className='table-content-env'> */}
          <table className="table table-bordered table-scrollable">
            <thead className="thead-dark">
              <tr>
                <th>Envelope Group Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody  style={{ height: tableHeight}}>
              {Array.isArray(filteredEnvelopeGroups) && filteredEnvelopeGroups.length > 0 ? (
                filteredEnvelopeGroups.map((user, index) => (
                  <tr key={index}>
                    <td className='table-rows'>{user.envelopeGroupName}</td>
                    <td className='align-action'>
                      <div className='action d-flex'>
                        <span>
                          <IoEyeOutline size={20} className='edit-icon' onClick={() => handleIconClick(user)} />
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td style={{ color: 'black' }} colSpan="2">No envelope groups available</td>
                </tr>
              )}
            </tbody>
          </table>
          {/* </div> */}
        </div>
      </div>

      {openModal && (
        <AddEnvelopeGroup
          handleClose={handleCloseModal}
          onSave={handleSaveUser}
          EnvelopGropList={groupList}
        />
      )}

      {editorModal &&
        <EnvelopeEditor
          groupID={selectedEnvelopeGroupID}
          onClose={handleCloseModal}
          title={modalTitle}
          isPreview={true}
        />

      }
    </div>
  );
}

export default EnvelopeGroupsList;
