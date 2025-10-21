import React, { useState, useRef, useEffect } from 'react';
import { MdCancel } from 'react-icons/md';
import { GrFormPrevious, GrFormNext } from 'react-icons/gr';
import { useCustomContext } from '../CustomComponents/CustomComponents';
import usePhotoLibraryLogic from '../Client/usePhotoLibraryLogic'; // Import the logic
import { CiImageOn } from 'react-icons/ci';
import '../Client/AddPhotolibrary.css';

const AddPhotolibrary = ({ onClose, clientId, clientName, isEditorOpen, S3Elements }) => {
  const { showAlert, hud, stopHudRotation } = useCustomContext();
  const {
    images,
    popupImage,
    handleFileChange: handleFileChangeLogic,
    handleUpload,
    isUploading,
    handlePreviousImage,
    handleNextImage,
    setPopupImage,
  } = usePhotoLibraryLogic(clientId, hud, stopHudRotation, showAlert);

  // Instead of initializing all as false, start with an empty array
  const [imageLoaded, setImageLoaded] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const fileInputRef = useRef(null);
  console.log('Images:', images);
  useEffect(() => {
    if (isEditorOpen) {
      const selectedImageUrls = selectedImages.map((index) => images[index]);
      S3Elements(selectedImageUrls);
    }

  }, [selectedImages]);

  const handleImageLoad = (index) => {
    setImageLoaded((prev) => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    handleFileChangeLogic(e);
  };

  const handleImageClick = (index) => setPopupImage(index);

  const handleClosePopup = () => setPopupImage(null);

  const handleUploadWithClear = async () => {
    if (!selectedFile) {
      showAlert(`Please choose the file ?`, [
        {
          label: 'Ok',
          color: "#09c",
          onClick: () => { }
        },
      ]);
      return;
    }
    setImageLoaded((prev) => [false, ...prev]);
    await handleUpload();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    const newImageIndex = images.length - 1;
    setImageLoaded((prev) => [...prev, false]);
    handleImageLoad(newImageIndex);
  };

  const handleCheckboxChange = (index) => {
    setSelectedImages((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const handleSubmit = () => {
    const selectedImageUrls = selectedImages.map((index) => images[index]);
    if (selectedImageUrls.length > 0) {
      S3Elements(selectedImageUrls);
      onClose();
      console.log('Selected Images:', selectedImageUrls);
    } else {
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content-photolibrary">
        <div className="modal-header">
          {isEditorOpen ? (<>
            <div className="left-content">
              <MdCancel className="close-modal" size={24} onClick={onClose} />
            </div>
            <div className="center-text">{clientName} Photo Library</div>
            <div className="right-content">
              <button className="s3-button" onClick={handleSubmit}>Done</button>
            </div>
          </>) : (<>
            <div className="center-text">{clientName} Photo Library</div>
            <div className="right-content">
              <MdCancel className="close-modal" size={24} onClick={onClose} />
            </div>
          </>)}
        </div>

        <div className="photo-div">
          <div className="combine">
            <div className="photolibrary-div-content">
              <div className="photolibrary-div-content-2">
                <div className="form-group-envelop">
                  <div className="input-group">
                    <input
                      type="file"
                      id="file-upload"
                      ref={fileInputRef}
                      className="form-control form-control-envelop"
                      accept=".jpg, .jpeg, .png"
                      onChange={handleFileChange}
                      required
                    />
                  </div>
                  <button
                    className="photo-uplode-button"
                    onClick={handleUploadWithClear}
                    disabled={isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className='photolibrary-gallery'>
            <div className="image-div">
              {Array.isArray(images) && images.length > 0 ? (
                images.map((url, index) => (
                  <div
                    key={index}
                    className='images-baground-div'
                    style={{
                      width: images.length <= 4 ? '160px' : 'calc(16.66% - 20px)', // Set width to 130px if there are 1 to 4 images
                      height: isEditorOpen ? '130px' : '120px',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                      padding: '10px 10px 10px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    {!imageLoaded[index] && <CiImageOn />}
                    <img
                      src={url}
                      alt={`Image ${index + 1}`}
                      onClick={() => handleImageClick(index)}
                      onLoad={() => handleImageLoad(index)}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: imageLoaded[index] ? 'block' : 'none',
                      }}
                    />
                    {isEditorOpen && (
                      <label
                        style={{
                          position: 'absolute',
                          bottom: '5px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          right: '10px',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedImages.includes(index)}
                          onChange={() => handleCheckboxChange(index)}
                        />
                      </label>
                    )}
                  </div>
                ))
              ) : (
                <p className="images-notfound">No images found.</p>
              )}
            </div>
          </div>


        </div>
      </div>
      {popupImage !== null && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="modal-header">
              <div className="modal-title"></div>
              <MdCancel className="close-modal" size={24} onClick={handleClosePopup} />
            </div>
            <div className="popup-image-container">
              <button
                onClick={handlePreviousImage}
                className={`popup-nav-button Previous ${popupImage <= 0 ? 'disabled' : ''}`}
                disabled={popupImage <= 0}
              >
                <GrFormPrevious />
              </button>
              <img src={images[popupImage]} alt={`Image ${popupImage + 1}`} className="popup-image" />
              <button
                onClick={handleNextImage}
                className={`popup-nav-button Next ${popupImage >= images.length - 1 ? 'disabled' : ''}`}
                disabled={popupImage >= images.length - 1}
              >
                <GrFormNext />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddPhotolibrary;
