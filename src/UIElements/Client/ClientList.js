import React, { useState, useEffect } from 'react';
import AddClient from './AddClient';
import './ClientList.css'
import { useCustomContext } from '../CustomComponents/CustomComponents';
import ClientDS from '../../DataServices/ClientDS';
import { LiaEditSolid } from "react-icons/lia";
import { IoRefreshCircleOutline } from "react-icons/io5";
import { MdPhotoSizeSelectActual, MdOutlinePhotoSizeSelectActual } from 'react-icons/md';
import AddPhotolibrary from './AddPhotolibrary';

function ClientList({ showIconsOnly }) {
  const [clientList, setClientList] = useState([]);
  const [isAddModal, setIsAddModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [clientName, setClientName] = useState(null);
  const [rotateIcon, setRotateIcon] = useState(true)
  const [photolibraryModal, setPhotolibraryModal] = useState(false);
  const loggedEmail = localStorage.getItem('email');
  const { showAlert, hud, stopHudRotation } = useCustomContext();
  const [tableHeight, setTableHeight] = useState("600px");

  useEffect(() => {

    fetchClients();
  }, []);

  useEffect(() => {
    const updateHeight = () => {
      const screenHeight = window.innerHeight;
  
      // Keep 100px difference from screen height
      const newHeight = screenHeight - 320;
  
      setTableHeight(newHeight + "px");
    };
  
    updateHeight(); // set on load
    window.addEventListener("resize", updateHeight);
  
    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, []);


  const fetchClients = async () => {
    hud("Please Wait...");
    try {
      const clientDS = new ClientDS(ClientDataSuccessResponse.bind(this), ClientDataFailureResponse.bind(this));
      clientDS.fetchClients();
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    }
  };

  function ClientDataSuccessResponse(response) {
    stopHudRotation();
    if (response) {
      setRotateIcon(false)
      try {
        const data = response;
        console.log('Parsed Data:', data);
        setClientList(data);
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

  const handleToggleStatus = async (user) => {
    const newStatus = !user.isClientEnable;
    const requestData = {
      clientID: user._id,
      isClientEnable: newStatus,
      clientUpdatedTimeStamp: new Date().toISOString(),
      clientAddedBy: loggedEmail,
    };



    // console.log('Sending request to update client status:', requestData);

    hud("Please Wait...");

    try {
      const clientDS = new ClientDS(clientUpdateSuccessResponse.bind(this), clientUpdateFailureResponse.bind(this));
      clientDS.editClient(requestData);
    } catch (error) {
      console.error("Failed to update client status:", error);
    }
  };

  function clientUpdateSuccessResponse(response) {
    stopHudRotation();

    if (response && response.message === "Client updated successfully.") {
      fetchClients();
    } else {
      console.error('Failed to update status:', response ? response.message : 'No message');
      showAlert('Failed to update client status', [
        { label: 'Ok', onClick: () => { }, color: 'var(--buttonColor)' },
      ]);
    }
  }

  function clientUpdateFailureResponse(error) {
    stopHudRotation();

    showAlert(error, [
      { label: 'Ok', onClick: () => { }, color: 'var(--buttonColor)' },
    ]);
  }


  const fetchClientsDelete = async (clientID) => {
    hud("Please Wait...");
    const requestData = {
      clientID: clientID,
      isClientDeleted: true,
      clientDeletedTimeStamp: new Date().toISOString(),
      clientAddedBy: loggedEmail
    };
    try {
      const clientAddDS = new ClientDS(clientDeleteSuccessResponse.bind(this), clientDeleteFailureResponse.bind(this));
      clientAddDS.deleteClient(requestData);
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    }
  };

  function clientDeleteSuccessResponse(response) {
    stopHudRotation();
    hud("Please Wait...");
    fetchClients();
  }

  function clientDeleteFailureResponse(error) {
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


  const handleOpenAddModal = () => {
    setCurrentUser(null);
    setModalTitle('Add Client');
    setIsAddModal(true);
  };

  const handleOpenEditModal = (user) => {
    setCurrentUser(user);
    setModalTitle('Edit Client');
    setIsAddModal(true);
  };
  const handleopenlibraryModal = (user) => {
    setPhotolibraryModal(true);
    setCurrentUser(user._id); // Pass the client ID to the modal
    setClientName(user.clientName); // Set the client name for the modal
    console.log('ClientId', user._id);
  };

  const handleCloselibraryModal = () => {
    setPhotolibraryModal(false);
    setCurrentUser(null);
    setClientName(null); // Reset the client name
  };


  const handleCloseModal = () => {
    setIsAddModal(false);
    setCurrentUser(null);
  };

  const handleSaveUser = () => {
    hud("Please Wait...");
    fetchClients();
  };

  const handleDeleteUser = (userid) => {
    showAlert('you sure you want to Delete?', [
      {
        label: 'OK',
        onClick: () => {
          fetchClientsDelete(userid);
        },
        color: 'var(--buttonColor)', // Set button color
      },
      {
        label: 'Cancel',
        onClick: () => {
          // console.log('User Deleted');
        },
        color: 'var( --error)', // Set button color
      }
    ]);

  };

  const handleRefresh = () => {
    setRotateIcon(true)
    fetchClients();
  }
  return (
    <div className={`main-content ${showIconsOnly ? 'icons-only' : ''}`}>
      <div className="p-3 mb-0 mt-1 custom-bg-white rounded">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <span className="m-0 title">Clients ({clientList.length})</span>
          </div>
          <div className="search-div">
            <IoRefreshCircleOutline
              className={`refresh-icon ${!rotateIcon ? 'rotate' : 'infinite'}`}
              onClick={handleRefresh}
            />
            <button className="add-client-btn" onClick={handleOpenAddModal}>Add Client</button>
          </div>
        </div>
      </div>
      <div className='mt-4'>
        <div className='table-content-env-list'>
          <div className='table-content-client'>
            <table className="table table-bordered table-scrollable">
              <thead className="thead-dark">
                <tr>
                  <th>ID</th>
                  <th>Client Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody style={{maxHeight: tableHeight}}>
                {Array.isArray(clientList) && clientList.length > 0 ? (
                  clientList.map((user, index) => (
                    <tr key={index}>
                      <td>{user._id}</td>
                      <td className='table-rows'>{user.clientName}</td>

                      <td className='status'>
                        <span><MdOutlinePhotoSizeSelectActual className='edit-icon-client' size={20} onClick={() => handleopenlibraryModal(user)} /></span>
                        <span><LiaEditSolid className='edit-icon-client' size={20} onClick={() => handleOpenEditModal(user)} /></span>

                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={user.isClientEnable}
                            onChange={() => handleToggleStatus(user)}
                          />
                          <span className="slider"></span>
                        </label>

                      </td>

                      {/* <td className='align-action'>
                    <div className='action d-flex'>
                      <span><LiaEditSolid className='edit-icon' onClick={() => handleOpenEditModal(user)} /></span>
                      <span><RiDeleteBin6Line className='delete-icon' onClick={() => handleDeleteUser(user._id)} /></span>
                    </div>
                  </td> */}

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3">No clients available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isAddModal &&
        <AddClient
          onClose={handleCloseModal}
          onSave={handleSaveUser}
          currentClient={currentUser}
          title={modalTitle} // Pass the modal title
          clients={clientList}
        />
      }
      {photolibraryModal && (
        <AddPhotolibrary
          onClose={handleCloselibraryModal}
          clientId={currentUser} // Pass client ID to modal
          clientName={clientName} // Pass client name to modal
        />
      )}
    </div>

  );
}

export default ClientList;
