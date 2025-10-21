import React, { useEffect, useState } from 'react';
import { MdCancel } from 'react-icons/md';
import DocxPreviewer from './DocxPreview'
import EnvelopeDS from '../../DataServices/EnvelopeDS';
import { useCustomContext } from '../CustomComponents/CustomComponents';
import EnvelopeGroupListDS from '../../DataServices/EnvelopeGroupListDS';
import ClientDS from '../../DataServices/ClientDS';

import AWS from 'aws-sdk';


const s3 = new AWS.S3({
  region: process.env.REACT_APP_AWS_REGION,
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
});


function ImportEnvelope({ onClose, title }) {
  const [envelopeName, setEnvelopeName] = useState('');
  const [importedFile, setImportedFile] = useState(null);
  const [envelopeId, setEnvelopeId] = useState();
  const [errorMessages, setErrorMessages] = useState({
    envelopeName: '',
    envelopeFile: ''
  });
  const loggedEmail = localStorage.getItem('email')
  const { showAlert, hud, stopHudRotation } = useCustomContext();
  const [openConverter, setOpenConverter] = useState(false);
  const [elements, setElements] = useState([]);
  const [clients, setClients] = useState([]);
  const [groups, setGroups] = useState([]);
  const [envelopeData, setEnvelopeData] = useState({
    envelopeName: '',
    envelopeID: '',
    clientID: '',
    clientName: '',
    pageType: 1,
    envelopeGroupID: '',
    envelopeGroupName: '',
  });

  useEffect(() => {
    console.log('elements1234:', elements);
  }, [elements])

  useEffect(() => {
    fetchClients();
    fetchEnvelopeGroupList();
  }, []);


  async function fetchBlobFromBlobUrl(blobUrl) {
    const response = await fetch(blobUrl);
    return await response.blob();
  }

  async function uploadToS3(blob, keyName) {
    const params = {
      Bucket: process.env.REACT_APP_S3_BUCKET_NAME,
      Key: keyName,
      Body: blob,
      ContentType: blob.type,
    };

    const { Location } = await s3.upload(params).promise();
    return Location;
  }


  const handleImageContentUpdate = async (clientId, pageType) => {
    console.log("pageType:", pageType);
    const pagesToUpdate = pageType === 2 
    ? elements.filter(page => page.pageNumber === 1)
    : elements;
    const updatedElements = await Promise.all(
      pagesToUpdate.map(async (page) => {
        const key = `customelements${page.pageNumber}`;
        if (page[key] && Array.isArray(page[key].elements)) {
          const updatedPageElements = await Promise.all(
            page[key].elements.map(async (el) => {
              if (!el || el.type !== 'image' || !el.content) return el;

              let newContent = el.content;
              const blobUrls = [...newContent.matchAll(/src="(blob:[^"]+)"/g)].map(match => match[1]);

              for (const blobUrl of blobUrls) {
                const now = new Date();
                const randomSuffix = Math.random().toString(36).substring(2, 8); // 6-char random string

                const timestamp = `${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${now.getFullYear()}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}${String(now.getMilliseconds()).padStart(3, '0')}`;
                const newFileName = `Importedimage_${timestamp}_${randomSuffix}`;
                const keyName = `Clients/${clientId}/photoLibrary/${newFileName}.png`;

                try {
                  const blob = await fetchBlobFromBlobUrl(blobUrl);
                  const s3Url = await uploadToS3(blob, keyName);
                  newContent = keyName;
                  console.log("✅ Uploaded to S3:", s3Url);
                } catch (err) {
                  console.error(`❌ Failed to upload image for URL ${blobUrl}:`, err);
                }
              }

              return {
                ...el,
                content: newContent
              };
            })
          );

          return {
            ...page,
            [key]: {
              ...page[key],
              elements: updatedPageElements
            }
          };
        }

        return page;
      })
    );

    return updatedElements;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedValue = name === 'pageType' ? parseInt(value) : value;
    setEnvelopeData(prevData => {
     
      let updatedData = { ...prevData, [name]: value, [name]: updatedValue };

      if (name === 'clientID') {
        const selectedClient = clients.find(client => client._id === value);
        updatedData.clientName = selectedClient?.clientName || '';
      } else if (name === 'envelopeGroupID') {
        const selectedGroup = groups.find(group => group._id === value);
        updatedData.envelopeGroupName = selectedGroup?.envelopeGroupName || '';
      }

      return updatedData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};

    if (!envelopeName.trim()) {
      errors.envelopeName = 'Please enter envelope name';
    }

    if (!importedFile) {
      errors.envelopeFile = 'Please upload the docx file';
    }

    if (!envelopeData.clientID) {
      errors.envelopeClient = 'Please select a client';
    }

    if (!envelopeData.envelopeGroupID) {
      errors.envelopeGroup = 'Please select a group';
    }

    setErrorMessages(errors);
    if (Object.keys(errors).length > 0) return;

    const updatedElements = await handleImageContentUpdate(envelopeData.clientID, envelopeData.pageType);
    setElements(updatedElements);

    fetchEnvelopesAdd(envelopeData.clientID, envelopeData.envelopeGroupID, updatedElements);
  };


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

  const fetchEnvelopesAdd = async (clientID, groupID, updatedElements) => {
    const currentTimestamp = new Date().toISOString();
    hud("Please Wait...");

    const requestData = {
      envelopeName: envelopeName,
      envelopeGroupID: groupID,
      clientID: clientID,
      s3FilePath: '',
      isColor: false,
      pageType: envelopeData.pageType,
      envelopeAddedBy: loggedEmail,
      isEnvelopeDeleted: false,
      isEnvelopeEnable: true,
      envelopeAddedTimeStamp: currentTimestamp,
      envelopeUpdatedTimeStamp: currentTimestamp,
    };

    try {
      const EnvelopeAddDS = new EnvelopeDS(
        (response) => {
          const envelopeId = response.envelopeID;
          if (envelopeId) {
            EnvelopeCustomAdd(envelopeId, updatedElements);
          } else {
            stopHudRotation();
            console.error("❌ No envelope ID returned from envelope creation.");
          }
        },
        EnvelopeAddDataFailureResponse.bind(this)
      );
      EnvelopeAddDS.addEnvelope(requestData);
    } catch (error) {
      stopHudRotation();
      console.error("Failed to add envelope:", error);
    }
  };


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
  const EnvelopeCustomAdd = async (envelopeId, updatedElements) => {
    const customSectionId = localStorage.getItem('email');

    const requestData = {
      envelopeId: envelopeId,
      customSectionUpdatedTimeStamp: new Date().toISOString(),
      customSectionAddedBy: customSectionId,
      customElements: updatedElements, // 👈 Using updated elements
      pdfCustomElements: '',
    };

    console.log("req-master", requestData);

    try {
      const envelopeGroupDS = new EnvelopeGroupListDS(
        (response) => handleSuccess(response),
        handleFailure
      );
      envelopeGroupDS.envelopeElementsADD(requestData);
    } catch (error) {
      console.error("Failed to add custom envelope elements:", error);
    }
  };


  const handleSuccess = (response) => {
    stopHudRotation();
    console.log(response);
    onClose();

  };

  const handleFailure = (error) => {
    stopHudRotation();
    showAlert(error, [{ label: 'Ok', color: "#09c", onClick: () => { } }]);
  };

  const handleNameChange = (e) => {
    setEnvelopeName(e.target.value);
    setErrorMessages(prev => ({ ...prev, envelopeName: '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImportedFile(file);
      setErrorMessages(prev => ({ ...prev, envelopeFile: '' }));
      setOpenConverter(true); // Show DocxPreviewer
    }
  };

  const closeEditor = () => {
    setOpenConverter(false)
  }



  return (
    <div className="modal-overlay">0
      <div className="modal-content-envelope">
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <MdCancel className="close-modal" size={24} onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} className="envelope-form">
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
          </div>
          <div>
            <label>Envelope Name</label>
            <input
              type="text"
              name="envelopeName"
              className="form-control"
              value={envelopeName}
              onChange={handleNameChange}
            />

          </div>
          {errorMessages.envelopeName && (
            <small className="importErrorMessage">{errorMessages.envelopeName}</small>
          )}

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
          <div>
            <label>Upload Envelope</label>
            <input
              type="file"
              accept=".doc,.docx"
              name="importedFile"
              className="form-control"
              onChange={handleFileChange}
            />

          </div>
          {errorMessages.envelopeFile && (
            <small className="importErrorMessage">{errorMessages.envelopeFile}</small>
          )}
          <div className="button-group-btn">
            <button type="submit">Submit</button>
          </div>
        </form>
      </div>

      {openConverter && importedFile && (
        <DocxPreviewer file={importedFile} getElements={setElements} onClose={closeEditor} />
      )}

    </div>
  );
}

export default ImportEnvelope;