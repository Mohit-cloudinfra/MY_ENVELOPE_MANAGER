import React, { useState, useEffect, useRef } from 'react';
import AddEnvelope from './AddEnvelope';
import ImportEnvelope from './ImportEnvelope';
import { IoIosSearch } from "react-icons/io";
import { IoRefreshCircleOutline } from "react-icons/io5";
import { MdEdit } from "react-icons/md";
import './Envelope.css';
import EnvelopeDS from '../../DataServices/EnvelopeDS';
import { useCustomContext } from '../CustomComponents/CustomComponents';
import EnvelopeEditor from './EnvelopeEditor';
import DownloadOptionsModal from './DownloadModal';
import EnvelopeGroupListDS from '../../DataServices/EnvelopeGroupListDS';
import { LiaDownloadSolid, LiaEditSolid } from "react-icons/lia";
import { IoEyeOutline } from "react-icons/io5";
import AWS from 'aws-sdk';
import { FaRegClone } from 'react-icons/fa';
import CloneEnvelope from './CloneEnvelope';
import NameEditModal from './NameEditModal';
import PdfPreviewModal from './EnvelopePreview';
import { PDFDocument, rgb } from 'pdf-lib';
import { Modal } from 'antd';



function EnvelopesList({ showIconsOnly }) {
  const [customElements, setCustomElements] = useState([]);
  const [EnvelopeGroups, setEnvelopeGroups] = useState([]);
  const [envelopeList, setEnvelopesList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editorModal, setEditorModal] = useState(false);
  const [selectedEnvelopeGroupID, setSelectedEnvelopeGroupID] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const { showAlert, hud, stopHudRotation, showToast } = useCustomContext();
  const [envelopeId, setEnvelopeID] = useState(null)
  const [isEnvelopePreview, setIsEnvelopePreview] = useState(false);
  const [isEnvelopeDownload, setIsEnvelopeDownlaod] = useState(false);
  const [downloadFunction, setDownloadFunction] = useState(null);
  const [indiciaData, setIndiciaData] = useState({});
  const [showDownloadOptions, setShowDownloadOptions] = useState(false); // New state
  const [selectedEnvelope, setSelectedEnvelope] = useState(null); // State to store selected envelope
  const [selectedIndicia, setSelectedIndicia] = useState(null);
  const [ImageUrls, setImageUrls] = useState(null);
  const [isContentUpdated, setIsContentUpdated] = useState(false);
  const [iscloneModal, setIsCloneModal] = useState(false);
  const [isnameModal, setIsNameModal] = useState(false);
  const [updateName, setUpdateName] = useState('');
  const [filteredEnvelopes, setFilteredEnvelopes] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [ClientId, setClientId] = useState(null);
  const [MasterElements, setMasterElements] = useState([]);
  const [PageType, setPageType] = useState(null);
  const [rotateIcon, setRotateIcon] = useState(true)
  const [pdfUrl, setPdfUrl] = useState(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const [filteredMasterChild, setFilteredMasterChild] = useState([]);
  const [importModalopen, setImportModalOpen] = useState(false);
  const tabRefs = useRef([]);
  const [tableHeight, setTableHeight] = useState("600px");

  useEffect(() => {
    hud("Please Wait...");
    fetchEnvelopes();
  }, []);

  useEffect(() => {
  }, [indiciaData])

  useEffect(() => {
    if (Array.isArray(customElements) && customElements.length > 0) {
      // console.log("Passing updated customElements to EnvelopeEditor:", customElements);
    }
  }, [customElements]);

  useEffect(() => {
    if (selectedIndicia && downloadUrl) {
      handleDownloadWithIndicia(selectedIndicia);
    }
  }, [selectedIndicia, downloadUrl]);


  useEffect(() => {
    if (Array.isArray(ImageUrls) && ImageUrls.length > 0) {
    }
  }, [ImageUrls]);

  const updateIndicatorPosition = () => {
    const activeIndex = ["All", "Simple", "Master", "Child", "Master-Child"].indexOf(activeTab);
    if (tabRefs.current[activeIndex]) {
      const tab = tabRefs.current[activeIndex];
      setIndicatorStyle({
        width: `${tab.offsetWidth}px`,
        left: `${tab.offsetLeft}px`,
        top: `${tab.offsetTop + tab.offsetHeight - 40}px`,
      });
    }
  };

  useEffect(() => {
    updateIndicatorPosition();
    const handleResize = () => {
      updateIndicatorPosition();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [activeTab]);

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


  const fetchEnvelopes = async () => {
    hud('Please Wait...')
    try {
      const envelopeDS = new EnvelopeDS(EnvelopeDataSuccessResponse.bind(this), EnvelopeDataFailureResponse.bind(this));
      envelopeDS.fetchEnvelopes();
    } catch (error) {
      console.error("Failed to fetch envelopes:", error);
    }
  };

  function EnvelopeDataSuccessResponse(response) {
    stopHudRotation();
    if (response) {
      setRotateIcon(false)
      try {
        const data = response;
        console.log('Parsed Data:', data);
        setEnvelopesList(data);

        // console.log('envelopeId', );
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

  const inchesToPixels = (inches) => {
    return inches * 96;  // 96 pixels per inch
  };

  const getCustomElements = async (selectedEnvelopeGroupID, id, isSelectedEnvelope) => {
    hud('Please Wait...');

    try {
      const requestData = {
        envelopeID: id,
        envelopeGroupID: selectedEnvelopeGroupID,
      };

      return new Promise((resolve, reject) => {
        const envelopeGroupDS = new EnvelopeGroupListDS(
          (response) => {
            const elements = customElementsSuccessResponse(response, isSelectedEnvelope);
            resolve(elements || []); // Ensure it always returns an array
          },
          (error) => {
            console.error("Failed to fetch elements:", error);
            reject([]);
          }
        );

        envelopeGroupDS.envelopeCustomElementsGet(requestData);
      });
    } catch (error) {
      console.error("Failed to fetch envelopes:", error);
      return [];
    }
  };

  function customElementsSuccessResponse(response, isSelectedEnvelope) {
    if (isSelectedEnvelope) {
      setEnvelopeGroups(response.envelopeGroup); // optional
    }

    const allPages = response?.customElements || [];
    console.log(" allPages at list:", response)
    const allElements = allPages.map((pageData) => {
      const pageNumber = pageData.pageNumber;
      const s3keyinfo = pageData.s3keyinfo;

      // Find the custom elements key dynamically (customelements1, customelements2, etc.)
      const customElementsKey = Object.keys(pageData).find(key =>
        key.startsWith("customelements")
      );

      const elements = pageData[customElementsKey]?.elements || [];

      const convertedElements = elements.map(el => ({
        ...el,
        x: inchesToPixels(parseFloat(el.x)),
        y: inchesToPixels(parseFloat(el.y)),
        width: inchesToPixels(parseFloat(el.width)),
        height: inchesToPixels(parseFloat(el.height)),
        pageNumber
      }));

      return {
        pageNumber,
        [customElementsKey]: {
          elements: convertedElements
        },
        s3keyinfo
      };
    });
    console.log(" elements at list:", allElements)
    return fetchImagesFromS3Structured(allElements); // pass this structured result
  }


  const s3 = new AWS.S3({
    region: process.env.REACT_APP_AWS_REGION,
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  });

  async function fetchImagesFromS3Structured(pages) {
    const imageUrlCache = new Map();

    const updatedPages = await Promise.all(
      pages.map(async (page) => {
        const customElementsKey = Object.keys(page).find(key =>
          key.startsWith("customelements")
        );

        const updatedElements = await Promise.all(
          page[customElementsKey].elements.map(async (el) => {
            if (el.type === 'image' && el.content) {
              let baseKey = el.content;


              if (baseKey.startsWith('https://envelope-manager-test.s3.amazonaws.com/')) {
                const baseUrl = baseKey.split('?')[0]; // Remove query string
                const urlParts = baseUrl.split('/');
                const clientIDIndex = urlParts.indexOf('Clients') + 1;

                if (clientIDIndex > 0 && clientIDIndex < urlParts.length - 1) {
                  const clientID = urlParts[clientIDIndex];
                  const imagePathIndex = urlParts.indexOf('photoLibrary');
                  const imagePath = imagePathIndex !== -1 ? urlParts.slice(imagePathIndex).join('/') : '';
                  baseKey = `Clients/${clientID}/${imagePath}`;
                }
              }


              if (imageUrlCache.has(baseKey)) {
                return { ...el, content: imageUrlCache.get(baseKey) };
              }

              const params = {
                Bucket: process.env.REACT_APP_S3_BUCKET_NAME,
                Prefix: baseKey,
              };

              try {
                const data = await s3.listObjectsV2(params).promise();

                if (data.Contents.length > 0) {
                  const key = data.Contents[0].Key;

                  const imageUrl = s3.getSignedUrl('getObject', {
                    Bucket: process.env.REACT_APP_S3_BUCKET_NAME,
                    Key: key,
                    Expires: 60 * 60, // 1 hour
                  });

                  imageUrlCache.set(baseKey, imageUrl);
                  return { ...el, content: imageUrl };
                } else {
                  console.warn(`No images found for ${baseKey}`);
                }
              } catch (error) {
                console.error(`S3 fetch error for key "${baseKey}":`, error);
              }
            }

            return el;
          })
        );


        return {
          ...page,
          [customElementsKey]: {
            elements: updatedElements
          }
        };
      })
    );

    setIsContentUpdated(true);
    return updatedPages;
  }


  const handleOpenAddModal = () => {
    setModalTitle('Add Envelope');
    setOpenModal(true);
    setSelectedEnvelope(null);
  };

  const handleImportModal = () => {
    setModalTitle('Import Envelope');
    setImportModalOpen(true);
  }



  const handleCloseModal = () => {
    setOpenModal(false);
    setIsCloneModal(false);
    setModalTitle('');
    setSelectedEnvelope(null);
    setImportModalOpen(false);
    fetchEnvelopes();
  };



  const handleSaveEnvelope = (newEnvelope) => {
    setEnvelopesList([...envelopeList, newEnvelope]);
    handleCloseModal();
    fetchEnvelopes();
  };

  // When Edit icon is Clicked EnvelopeEditor.js is calling here.
  const handleOpenEditorModal = async (envelope) => {
    hud('Please Wait...');
    setSelectedEnvelopeGroupID(envelope.envelopeGroupID);
    setEnvelopeID(envelope._id);
    setModalTitle(envelope.envelopeName);
    setEditorModal(false);
    setIsEnvelopePreview(false);
    setClientId(envelope.clientID);
    setCustomElements([]);
    setPageType(envelope.pageType);

    try {
      const selectedElements = await getCustomElements(envelope.envelopeGroupID, envelope._id, true) || [];


      // ✅ Define masterElements here
      let masterElements = [];

      if (envelope.pageType === 3 && envelope.masterPageID) {
        const masterEnvelope = envelopeList.find(env => env._id === envelope.masterPageID);
        if (masterEnvelope) {
          masterElements = await getCustomElements(masterEnvelope.envelopeGroupID, masterEnvelope._id, false) || [];
          const masterPage = masterElements.find(item => item.pageNumber === 1);
          const masterElems = masterPage?.customelements1?.elements || [];
          setMasterElements(masterElems);
        }
      }

      // ✅ Wrap both in { customElements: [...] } as expected by the merge function
      const mergedResult = mergeMasterIntoChild(
        { customElements: masterElements },
        { customElements: selectedElements }
      );

      console.log("✅ Final merged result:", mergedResult);

      setCustomElements(mergedResult.customElements);
      setEditorModal(true);
    } catch (error) {
      console.error("Error merging custom elements:", error);
    } finally {
      stopHudRotation();
    }
  };


  function mergeMasterIntoChild(master, child) {
    // If child has no customElements, just copy from master
    if (!child.customElements || child.customElements.length === 0) {
      return {
        customElements: [...master.customElements]
      };
    }

    const childPages = [...child.customElements];

    // Collect all master elements from all master pages
    let allMasterElements = [];

    for (const masterPage of master.customElements) {
      const masterKey = Object.keys(masterPage).find(k => k.startsWith("customelements"));
      const masterElements = masterPage[masterKey]?.elements || [];
      allMasterElements = [...allMasterElements, ...masterElements];
    }

    // Add master elements to each child page
    const updatedPages = childPages.map(childPage => {
      const childKey = Object.keys(childPage).find(k => k.startsWith("customelements"));
      const childElements = childPage[childKey]?.elements || [];

      // Avoid adding duplicate elements (based on id)
      const existingIds = new Set(childElements.map(el => el.id));
      const filteredMasterElements = allMasterElements.filter(el => !existingIds.has(el.id));

      return {
        ...childPage,
        [childKey]: {
          elements: [...filteredMasterElements, ...childElements]
        }
      };
    });

    return {
      customElements: updatedPages
    };
  }

  const getPreviewEnvelope = (envelopeId) => {
    hud("Please Wait...");
    try {
      const requestData = {
        env_id: envelopeId,
      };
      console.log("Request:", requestData)
      const envelopePreviewDS = new EnvelopeGroupListDS(
        EnvelopePreviewSuccessResponse.bind(this),
        EnvelopePreviewFailureResponse.bind(this)
      );
      envelopePreviewDS.envelopePreview(requestData);
    } catch (error) {
      console.error("Failed to fetch envelope preview:", error);
      stopHudRotation();
    }
  };

  const EnvelopePreviewSuccessResponse = (response) => {
    stopHudRotation();

    const s3PdfPath = response?.s3FilePath;
    console.log("Preview Response:", response);

    if (s3PdfPath) {
      setPdfUrl(s3PdfPath);
      setOpenPreview(true);
    } else if (s3PdfPath === '') {
      showAlert(response?.message || "No preview available.", [
        {
          label: 'Close',
          color: "Red",
          onClick: () => {
            setOpenPreview(false);
          }
        },
      ]);
    } else {
      console.error("PDF path not found in the response.");
    }
  };


  const EnvelopePreviewFailureResponse = (error) => {
    stopHudRotation();
    console.error("Envelope preview failed:", error);
  };


  const getDownloadEnvelope = (envelopeId) => {
    hud("Please Wait...");
    try {
      const requestData = {
        env_id: envelopeId,
      };
      console.log("Request:", requestData)
      const envelopePreviewDS = new EnvelopeGroupListDS(
        EnvelopeDownloadSuccessResponse.bind(this),
        EnvelopeDownloadFailureResponse.bind(this)
      );
      envelopePreviewDS.envelopePreview(requestData);
    } catch (error) {
      console.error("Failed to fetch envelope preview:", error);
      stopHudRotation();
    }
  };

  const EnvelopeDownloadSuccessResponse = (response) => {
    stopHudRotation();

    const s3PdfPath = response?.s3FilePath;

    if (s3PdfPath) {
      setDownloadUrl(s3PdfPath);
      setShowDownloadOptions(true);

    } else if (s3PdfPath === '') {
      showAlert(response?.message || "No preview available.", [
        {
          label: 'Close',
          color: "Red",
          onClick: () => {
            setDownloadUrl(null);
            setShowDownloadOptions(false);
          }
        },
      ]);
    } else {
      console.error("PDF path not found in the response.");
    }
  };

  const EnvelopeDownloadFailureResponse = (error) => {
    stopHudRotation();
    console.error("Envelope preview failed:", error);
  };



  const handlePreviewIconClick = async (envelope) => {
    hud('Please Wait...');
    setSelectedEnvelopeGroupID(envelope.envelopeGroupID);
    setEnvelopeID(envelope._id);
    setModalTitle(envelope.envelopeName);

    try {
      getPreviewEnvelope(envelope._id);
    } catch (error) {
      console.error("Error opening preview modal:", error);
    }
  };

  const handleDownloadIconClick = async (envelope) => {
    hud('Please Wait...');
    setSelectedEnvelopeGroupID(envelope.envelopeGroupID);
    setEnvelopeID(envelope._id);
    setModalTitle(envelope.envelopeName);

    try {

      getDownloadEnvelope(envelope._id);

    } catch (error) {
      console.error("Error opening preview modal:", error);
    }
  };



  const handlepreviewClose = () => {
    setOpenPreview(false);
    setPdfUrl(null);
  }
  const handleNameEditModalClose = () => {
    setIsNameModal(false);
    setUpdateName('');
  }


  const handleDownloadOptionSelected = (indicia) => {
    setSelectedIndicia(indicia);
  };


  const generateSignedUrl = () => {
    const params = {
      Bucket: process.env.REACT_APP_S3_BUCKET_NAME,
      Key: downloadUrl,
      Expires: 60 * 5,
    };
    return s3.getSignedUrl('getObject', params);
  };

  const handleDownloadWithIndicia = async (indicia) => {
    try {
      const signedUrl = generateSignedUrl();
      const response = await fetch(signedUrl);
      const arrayBuffer = await response.arrayBuffer();

      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const page = pdfDoc.getPage(0);

      const fontSize = 7;
      const color = rgb(0, 0, 0);

      const marginInches = 0.5;
      const offsetInches = 1.5;
      const pageWidth = page.getWidth();
      const marginInPoints = marginInches * 72;
      const xPosition = pageWidth - (offsetInches * 72) - marginInPoints;

      let yPosition = page.getHeight() - 50;

      // Check if indicia is null
      if (indicia) {
        const indiciaLines = [
          indicia.line1,
          indicia.line2,
          indicia.line3,
          indicia.line4,
          indicia.line5,
        ].filter(Boolean);

        indiciaLines.forEach((line) => {
          page.drawText(line, {
            x: xPosition,
            y: yPosition,
            size: fontSize,
            color,
          });
          yPosition -= fontSize + 3;
        });
      } else {
        // If indicia is null, add default text or handle accordingly
        const defaultText = ""; // Example default text
        page.drawText(defaultText, {
          x: xPosition,
          y: yPosition,
          size: fontSize,
          color,
        });
      }

      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${modalTitle}-with-indicia.pdf`; // Use template literals correctly
      link.click();

      // Optional reset
      setSelectedIndicia(null);
      setDownloadUrl(null);
      setShowDownloadOptions(false);
      stopHudRotation();
    } catch (error) {
      console.error('Error generating PDF with indicia:', error);
      stopHudRotation();
    }
  };

  const handleCloseEditorModal = () => {
    setEditorModal(false);
    setSelectedEnvelopeGroupID(null);
    setModalTitle('');
    fetchEnvelopes();
    setCustomElements([]);
    setMasterElements([]);

  };

  const handleSaveEditor = () => {
    handleCloseEditorModal();
  }

  const handleCloneEnvelope = (envelope) => {
    setModalTitle('Clone Envelope');
    setSelectedEnvelope(envelope); // Pass the envelope data for cloning
    setIsCloneModal(true);
  };

  const handleNameEditUpdate = (envelope) => {
    setIsNameModal(true);
    setModalTitle('Name Update');
    setUpdateName(envelope);
  }

  const handleNameupdated = () => {
    handleNameEditModalClose();
    fetchEnvelopes();

  }

  useEffect(() => {
    const filterEnvelopes = () => {
      let filtered = [...envelopeList];

      const masters = filtered.filter((master) => master.pageType === 2);
      const children = filtered.filter((child) => child.pageType === 3);

      let flitermasterchid = masters.map((master) => ({
        master,
        children: children.filter((child) => child.masterPageID === master._id),
      }));

      // Apply search term filter
      if (searchTerm) {
        filtered = filtered.filter(
          (envelope) =>
            envelope.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            envelope.envelopeGroupName?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        flitermasterchid = flitermasterchid.filter(({ master, children }) =>
          master.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          master.envelopeGroupName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          children.some(
            (child) =>
              child.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              child.envelopeGroupName?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      }

      // Apply pageType filter based on activeTab
      if (activeTab !== 'All') {
        const type = pageTypeFilter(activeTab);
        filtered = filtered.filter((envelope) => envelope.pageType === type);
      }

      if (activeTab === "Master-Child") {
        setFilteredMasterChild(flitermasterchid);
        return;
      }

      setFilteredEnvelopes(filtered);
    };

    filterEnvelopes();
  }, [searchTerm, envelopeList, activeTab]);

  const pageTypeFilter = (tab) => {
    switch (tab) {
      case 'Master':
        return 2;
      case 'Simple':
        return 1;
      case 'Child':
        return 3;
      default:
        return null; // For 'All' tab, no filter is applied
    }
  };

  const handleRefresh = () => {
    setRotateIcon(true)
    fetchEnvelopes();
  }

  return (
    <div className={`main-content ${showIconsOnly ? 'icons-only' : ''}`}>
      <div className="p-3  mb-0 mt-1 custom-bg-white rounded header-div">
        <div className="justify-content-between align-items-center envelope-header">
          <div className="tabs-container">
            <ul className="nav nav-tabs env-tabs" role="tablist">
              {["All", "Simple", "Master", "Child", "Master-Child"].map((tab, index) => (
                <li className="nav-item" key={tab}>
                  <a
                    ref={(el) => (tabRefs.current[index] = el)}
                    className={`nav-link ${activeTab === tab ? "active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                    href="#"
                  >
                    {tab}
                  </a>
                </li>
              ))}
            </ul>
            <div className="tab-indicator" style={indicatorStyle}></div>
          </div>
          <div className="search-div">

            <div className="input-container-envelop">
              <input
                type="text"
                placeholder="Client or Group Name"
                className="form-control"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <IoIosSearch className="search-icon" />
            </div>
            <IoRefreshCircleOutline className={`refresh-icon ${!rotateIcon ? 'rotate' : 'infinite'}`} onClick={handleRefresh} />
            <button className="add-envelope-btn" onClick={handleOpenAddModal}>
              Add Envelope
            </button>
            <button className="add-envelope-btn" onClick={handleImportModal}>
              Import Envelope
            </button>
            {/* <button className="refresh-btn" onClick={handleRefresh}>Refresh</button> */}
          </div>
        </div>
      </div>
      <div className='mt-4'>
        <div className='table-content-env-list'>
          <table className={`table table-bordered table-scrollable ${activeTab === "Master-Child" ? 'master-envelope-table' : ''}`}  >
            <thead className="thead-dark">
              <tr>
                <th>ID</th>
                <th>Envelope Name</th>
                {activeTab === 'All' && <th>Type</th>}
                <th>Client Name</th>
                <th>Group Name</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody style={{ maxHeight: tableHeight }}>
              {activeTab !== "Master-Child" ? (
                filteredEnvelopes.length > 0 ? (
                  filteredEnvelopes.map((envelope, index) => (
                    <tr key={index}>
                      <td className='table-rows'>{envelope.clientID}</td>
                      <td className="table-rows">
                        {envelope.envelopeName.split("_").map((part, i, arr) => (
                          <span key={i}>
                            {part}
                            {i < arr.length - 1 && "_"}<wbr />
                          </span>
                        ))}
                        &ensp;
                        <MdEdit onClick={() => handleNameEditUpdate(envelope)} style={{ color: '#09c', cursor: 'pointer' }} />
                      </td>

                      {activeTab === 'All' && (<td className="table-rows"> {envelope.pageType === 1 ? "Simple Page" : envelope.pageType === 2 ? "Master Page" : envelope.pageType === 3 ? "Child Page" : "Unknown"}
                      </td>
                      )}
                      <td className='table-rows'>{envelope.clientName}</td>
                      <td className='table-rows'>{envelope.envelopeGroupName.split("_").map((part, i, arr) => (
                        <span key={i}>
                          {part}
                          {i < arr.length - 1 && "_"}<wbr />
                        </span>
                      ))}</td>
                      <td className='align-action'>
                        <div className='action d-flex'>
                          <FaRegClone size={15} className='edit-icon' onClick={() => handleCloneEnvelope(envelope)} />
                          <LiaEditSolid size={20} className='edit-icon' onClick={() => handleOpenEditorModal(envelope)} />
                          <LiaDownloadSolid size={20} className='edit-icon' onClick={() => handleDownloadIconClick(envelope)} />
                          <IoEyeOutline size={20} className='edit-icon' onClick={() => handlePreviewIconClick(envelope)} />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No Envelopes Available</td>
                  </tr>
                )
              ) :
                (
                  filteredMasterChild.length > 0 ? (
                    filteredMasterChild.map(({ master, children }) => (
                      <>
                        <tr key={master.id} >
                          <td className='table-rows' style={{ fontWeight: '600', fontSize: '14px', color: '#09c', paddingLeft: '15px' }}>
                            {master.envelopeName}
                          </td>
                          <td className='table-rows' style={{ fontWeight: '600', fontSize: '14px', color: '#09c' }}>{master.clientName}</td>
                          <td className='table-rows' style={{ fontWeight: '600', fontSize: '14px', color: '#09c' }}>{master.envelopeGroupName}</td>
                          <td className='align-action' >
                            <div className='action d-flex' >
                              <FaRegClone size={15} className='edit-icon' onClick={() => handleCloneEnvelope(master)} />
                              <LiaEditSolid size={20} className='edit-icon' onClick={() => handleOpenEditorModal(master)} />
                              <LiaDownloadSolid size={20} className='edit-icon' onClick={() => handleDownloadIconClick(master)} />
                              <IoEyeOutline size={20} className='edit-icon' onClick={() => handlePreviewIconClick(master)} />
                            </div>
                          </td>
                        </tr>

                        {children.map((child) => (
                          <tr key={child.id}>
                            <td className='table-rows' style={{ paddingLeft: '28px' }}>{child.envelopeName}</td>
                            <td className='table-rows'>{child.clientName}</td>
                            <td className='table-rows'>{child.envelopeGroupName}</td>
                            <td className='align-action'>
                              <div className='action d-flex'>
                                <FaRegClone size={15} className='edit-icon' onClick={() => handleCloneEnvelope(child)} />
                                <LiaEditSolid size={20} className='edit-icon' onClick={() => handleOpenEditorModal(child)} />
                                <LiaDownloadSolid size={20} className='edit-icon' onClick={() => handleDownloadIconClick(child)} />
                                <IoEyeOutline size={20} className='edit-icon' onClick={() => handlePreviewIconClick(child)} />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center' }}>No Envelopes Available</td>
                    </tr>
                  )
                )}
            </tbody>

          </table>
        </div>
      </div>


      {openModal &&
        <AddEnvelope
          onClose={handleCloseModal}
          onSave={handleSaveEnvelope}
          title={modalTitle}
          envelopesList={envelopeList}
          activeTab={activeTab}
        />
      }

      {importModalopen &&
        <ImportEnvelope
          onClose={handleCloseModal}

          title={modalTitle}
        />
      }

      {iscloneModal &&
        <CloneEnvelope
          onClose={handleCloseModal}
          onSave={handleSaveEnvelope}
          title={modalTitle}
          envelopesList={envelopeList}
          selectedEnvelope={selectedEnvelope}
        />
      }
      {(editorModal && isContentUpdated) &&
        <EnvelopeEditor
          groupID={selectedEnvelopeGroupID}
          envelopeId={envelopeId}
          onClose={handleCloseEditorModal}
          onSave={handleSaveEditor}
          title={modalTitle}
          isPreview={isEnvelopePreview}
          customElements={customElements}
          EnvelopeGroups={EnvelopeGroups}
          ImageData={ImageUrls}
          ClientId={ClientId}
          MasterElements={MasterElements}
          page={PageType}
        />

      }
      {showDownloadOptions &&
        <DownloadOptionsModal
          onClose={() => setShowDownloadOptions(false)}
          onDownloadOptionSelected={handleDownloadOptionSelected}
          title={modalTitle}
        />
      }
      {isnameModal && <NameEditModal title={modalTitle} envelope={updateName} onClose={handleNameEditModalClose} onUpdate={handleNameupdated} EnvelopeList={envelopeList} />}
      {openPreview && <PdfPreviewModal title={modalTitle} pdfUrl={pdfUrl} onClose={handlepreviewClose} />}

    </div>
  );
}

export default EnvelopesList;
