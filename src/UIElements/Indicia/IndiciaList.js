import React from 'react'
import AddIndicia from './AddIndicia'
import { useState, useEffect } from 'react';
import { IoRefreshCircleOutline } from "react-icons/io5";
import { useCustomContext } from '../CustomComponents/CustomComponents';
import IndiciaDS from '../../DataServices/IndiciaDS';
import { LiaEditSolid } from "react-icons/lia";

import './Indicia.css';
function IndiciaList({ showIconsOnly }) {
  const [openAddIndiciaModal, setOpenAddIndiciaModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [indiciaList, setIndiciaList] = useState([]);
  const [rotateIcon, setRotateIcon] = useState(true);
  const [currentIndicia, setCurrentIndicia] = useState(null);
  const { showAlert, hud, stopHudRotation } = useCustomContext();
  const loggedEmail = localStorage.getItem('email');
  const [tableHeight, setTableHeight] = useState("600px");

  useEffect(() => {

    fetchIndicias();
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


  const fetchIndicias = async () => {
    hud("Please Wait...");
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
      setRotateIcon(false)
      try {
        const data = response;
        // console.log('Parsed Data:', data);
        setIndiciaList(data);
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
  function IndiciaDataFailureResponse(error) {
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


  const handleSaveIndicia = () => {
    hud("Please Wait...");
    fetchIndicias();
  };
  const onclickOpenAddIndiciaModal = () => {
    setModalTitle('Add Indicia');
    setOpenAddIndiciaModal(true);
    setCurrentIndicia(null);
  };

  const handleOpenEditIndiciaModal = (user) => {
    setCurrentIndicia(user);
    setModalTitle('Edit Indicia');
    setOpenAddIndiciaModal(true);
  };

  const handleCloseEditIndiciaModal = () => {
    setOpenAddIndiciaModal(false);
    setCurrentIndicia(null);
  };

  const handleRefresh = () => {
    setRotateIcon(true);
    fetchIndicias();
  }

  return (
    <div className={`main-content ${showIconsOnly ? 'icons-only' : ''}`}>
      <div className="p-3 mb-0 mt-1 custom-bg-white rounded">
        <div className=" justify-content-between align-items-center indicia-header">
          <div>
            <span className="m-0 title">Indicia</span>
          </div>
          <div className="search-div">
            <IoRefreshCircleOutline className={`refresh-icon ${!rotateIcon ? 'rotate' : 'infinite'}`} onClick={handleRefresh} />
            <button className="add-client-btn" onClick={onclickOpenAddIndiciaModal}>
              Add Indicia
            </button>
            {/* <button className="refresh-btn" onClick={handleRefresh}>Refresh</button> */}
          </div>
        </div>
      </div>
      <div className='mt-4'>
        <div className='table-content-env-indicia' >
          <table className="table table-bordered table-scrollable" style={{ width: '75%' }}>
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

            <tbody style={{ height: tableHeight}}>
              {Array.isArray(indiciaList) && indiciaList.length > 0 ? (
                indiciaList.map((indicia, index) => (
                  <tr key={index}>
                    <td>{indicia.line1}</td>
                    <td className='table-rows'>{indicia.line2}</td>
                    <td className='table-rows'>{indicia.line3}</td>
                    <td className='table-rows'>{indicia.line4}</td>
                    <td className='table-rows'>{indicia.line5}</td>
                    <td className='align-action'>
                      <div className='action'>
                        <LiaEditSolid className='edit-icon' size={20} onClick={() => handleOpenEditIndiciaModal(indicia)} />
                      </div>
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
      {openAddIndiciaModal &&
        <AddIndicia
          onClose={handleCloseEditIndiciaModal}
          onSave={handleSaveIndicia}
          title={modalTitle}
          Indicias={indiciaList}
          currentIndicia={currentIndicia}
        />
      }
    </div>
  )
}

export default IndiciaList
