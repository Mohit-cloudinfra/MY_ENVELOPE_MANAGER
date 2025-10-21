import React, { useState } from 'react';
import { MdCancel } from 'react-icons/md';
import './AddEnvelopeGroup.css';
import { useCustomContext } from '../CustomComponents/CustomComponents';

import EnvelopeGroupListDS from '../../DataServices/EnvelopeGroupListDS';


const AddEnvelopeGroup = ({ handleClose, onSave, EnvelopGropList }) => {

    const { showAlert, hud, stopHudRotation } = useCustomContext();
    const [envelopeName, setEnvelopeName] = useState('');
    const [envelopWidth, SetEnvelopWidth] = useState('');
    const [envelopHeight, SetEnvelopHeight] = useState('');
    const [envelopMarginTop, setEnvelopMarginTop] = useState('');
    const [envelopMarginBottom, setEnvelopMarginBottom] = useState('');
    const [envelopMarginLeft, setEnvelopMarginLeft] = useState('');
    const [envelopMarginRight, setEnvelopMarginRight] = useState('');
    const [previewImage, setPreviewImage] = useState('');
    const [envelopColor, setEnvelopColor] = useState("#FFFFFF");
    const loggedEmail = localStorage.getItem('email');
    const [isEnvelope, setIsEnvelope] = useState(true);
    const [isLetter, setIsLetter] = useState(false);
    const [isSticker, setIsSticker] = useState(false);
    const [isWindow, setIsWindow] = useState(false);


    const [sections, setSections] = useState([
        {
            SectionWidth: '',
            SectionX: '',
            SectionHeight: '',
            SectionY: '',
            SectionColor: '#000000',
            transparency: '50',
            SectionTittle: '',
            SectionDetailText: '',
            Sectiontype: '',
        }
    ]);

    const handleTypeChange = (type) => {
        setIsEnvelope(type === "Envelope");
        setIsLetter(type === "Letter");
        setIsSticker(type === "Sticker");

        // Reset window checkbox if not envelope
        if (type !== "Envelope") {
            setIsWindow(false);
        }
    };


    const isValidValue = (value) => !isNaN(value) && value > 0;

    const fetchEnvelopeGroupAdd = () => {
        const currentTimestamp = new Date().toISOString();
        hud('Please Wait...');
        const requestData = {
            envelopeGroupName: envelopeName,
            envelopeWidth: envelopWidth,
            envelopeHeight: envelopHeight,
            envelopeColorText: envelopColor || "#ffffff",
            isEnvelope:isEnvelope,
            isLetter:isLetter,
            isSticker:isSticker,
            isWindow: isWindow,
            printMarginTop: envelopMarginTop || '0',
            printMarginBottom: envelopMarginBottom || '0',
            printMarginLeft: envelopMarginLeft || '0',
            printMarginRight: envelopMarginRight || '0',
            previewImageS3: previewImage,
            Sections: sections.map(section => ({
                sectionWidth: section.SectionWidth.toString(),
                sectionHeight: section.SectionHeight.toString(),
                sectionX: section.SectionX.toString(),
                sectionY: section.SectionY.toString(),
                sectionColor: section.SectionColor || '#000000',
                sectionTransparency: (parseFloat(section.transparency) / 100).toString(),
                sectionTitle: section.SectionTittle,
                sectionDetailText: section.SectionDetailText,
                sectionType: section.Sectiontype
            })),
            isEvnelopeGroupDeleted: false,
            isEnvelopeGroupEnabled: true,
            envelopeGroupAddedBy: loggedEmail,
            envelopeGroupAddedTimeStamp: currentTimestamp,
            envelopeGroupUpdatedTimeStamp: currentTimestamp
        };
        // console.log("requestBody:",requestData);
        try {
            const envelopeGroupDS = new EnvelopeGroupListDS(
                EnvelopeGroupDataSuccessResponse.bind(this),
                EnvelopeGroupDataFailureResponse.bind(this)
            );
            envelopeGroupDS.addEnvelopGroupList(requestData);
        } catch (error) {
            console.error("Failed to fetch:", error);
        }
    };
    const handleModalClose = () => {
        showAlert('Are you sure you want to close?', [
            {
                label: 'Yes',
                onClick: () => {
                    handleClose();
                },
                color: '#09c',
            },
            {
                label: 'No',
                onClick: () => {
                },
                color: 'red',
            },
        ]);
    }

    function EnvelopeGroupDataSuccessResponse(response) {
        stopHudRotation();
        if (response) {
            try {
                const data = response;
                console.log('Parsed Data:', data);
                onSave();
                handleClose();

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
            console.log('Failed to fetch. Response:', response);
            showAlert('No Data', [
                {
                    label: 'Ok',
                    onClick: () => { },
                    color: 'var(--buttonColor)',
                },
            ]);
        }
    }
    function EnvelopeGroupDataFailureResponse(error) {
        stopHudRotation();
        console.error('Something went wrong:', error);

        // Extract a human-readable error message from the error object

        showAlert(error, [
            {
                label: 'Ok',
                onClick: () => { },
                color: 'var(--buttonColor)',
            },
        ]);
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!envelopeName.trim() || !envelopWidth || !envelopHeight) {
            showAlert('Please fill in the name, width, and height.', [
                {
                    label: 'Ok',
                    onClick: () => { },
                    color: 'var(--buttonColor)',
                },
            ]);
            return;
        }


        const newGroupName = envelopeName.trim().toUpperCase();
        const EnvelopGroupExists = EnvelopGropList.some(group => {
            const existingGroupName = group.envelopeGroupName.trim().toUpperCase();
            console.log(`Comparing '${newGroupName}' with existing group '${existingGroupName}'`);
            return existingGroupName === newGroupName;
        });

        if (EnvelopGroupExists) {
            showAlert('Envelope Group already exists.', [
                {
                    label: 'Ok',
                    onClick: () => { },
                    color: 'var(--buttonColor)',
                },
            ]);
            return;
        }
        else {
            fetchEnvelopeGroupAdd();
        }


    };





    const handleaddSection = () => {
        setSections([
            ...sections,
            {
                SectionWidth: '',
                SectionX: '',
                SectionHeight: '',
                SectionY: '',
                SectionColor: '#000000',
                transparency: '50',
                SectionTittle: '',
                SectionDetailText: '',
                Sectiontype: '',
            }
        ]);
    };

    const handleSectionChange = (index, field, value) => {
        const newSections = [...sections];
        newSections[index] = { ...newSections[index], [field]: value };
        setSections(newSections);
    };

    const handlecolourChange = (e) => {
        setEnvelopColor(e.target.value)
    }

    const handleUpload = (event) => {
        const selectedFile = event.target.files[0];
        const inputElement = event.target; // Capture the input element

        if (selectedFile) {
            const fileType = selectedFile.type;

            // Check if the file type is either jpg, jpeg, or png
            const validFileTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!validFileTypes.includes(fileType)) {
                showAlert('Only JPG, JPEG, and PNG files are allowed.', [
                    {
                        label: 'Ok',
                        onClick: () => { },
                        color: 'var(--buttonColor)', // Set button color

                    }
                ]);

                // Clear the file input if the selected file type is invalid
                inputElement.value = ''; // This resets the file input

                return; // Exit the function if the file type is invalid
            }

            const reader = new FileReader();
            reader.readAsDataURL(selectedFile);

            reader.onloadend = () => {
                setPreviewImage(reader.result); // Set the base64-encoded string as the previewImage
            };

            reader.onerror = (error) => {
                console.error('Error reading file:', error);
            };
        }
    };
    const handleDelete = (index) => {
        showAlert('Are you sure you want to delete this section?', [
            {
                label: 'Yes',
                onClick: () => {
                    const updatedSections = sections.filter((_, i) => i !== index);
                    setSections(updatedSections);
                },
                color: '#09c',
            },
            {
                label: 'No',
                onClick: () => {
                },
                color: 'red',
            },
        ]);
    };
    const handleWidthChange = (e) => {
        const value = e.target.value;
        if (!isNaN(value) && value >= 0 && value <= 15) {
            SetEnvelopWidth(value);
        }
    };

    const handleHeightChange = (e) => {
        const value = e.target.value;
        if (!isNaN(value) && value >= 0 && value <= 15) {
            SetEnvelopHeight(value);
        }
    };

    const handleKeyDown = (e) => {

        const allowedKeys = [
            'Backspace',
            'ArrowLeft',
            'ArrowRight',
            'Delete',
            'Tab',
            '.'
        ];

        if (!allowedKeys.includes(e.key) && !e.key.match(/[0-9]/)) {
            e.preventDefault();
        }
        if (e.key === '.' && e.target.value.includes('.')) {
            e.preventDefault();
        }
    };

    const inchToPx = (inch) => inch * 19.2;//96;



    return (
        <div className="file-upload-modal-new-1">
            <div className="file-modal-content-new-1">

                <div className="modal-header-group">
                    <button type="button" className="close" onClick={handleModalClose}>
                        <MdCancel size={24} />
                    </button>
                    <span className="modal-title">Add Envelope Group</span>
                    <button type="button" className="add-section-btn" onClick={handleSubmit}>
                        Submit
                    </button>

                </div>
                <div className='container-section'>
                    <div className="custom-div-container">
                        <div className="custom-div custom-div-left">

                            <div className="form-group-envelop">
                                <label htmlFor="envelope-name" className="form-label-inputs">Envelope Name</label>
                                <input
                                    type="text"
                                    id="envelope-name"
                                    className="form-control form-control-envelop"
                                    placeholder="Enter Name"
                                    value={envelopeName}
                                    required
                                    onChange={(e) => setEnvelopeName(e.target.value)}
                                />

                            </div>
                            <div className="form-group-envelop">
                                <label htmlFor="additional-info" className="form-label-inputs">Envelope Color Text</label>

                                <input
                                    type="text"
                                    maxLength={7}
                                    className="form-control form-control-envelop"
                                    value={envelopColor}
                                    onChange={(e) => setEnvelopColor(e.target.value)}
                                    required
                                />
                                <input
                                    type="color"
                                    className="color-picker-enevelop"
                                    value={envelopColor.length === 7 ? envelopColor : '#ffffff'}
                                    onInput={handlecolourChange}
                                    onChange={handlecolourChange}
                                    required
                                />
                            </div>
                            <div className="form-group-envelop">
                                <label htmlFor="file-upload" className="form-label-inputs">Upload Image</label>
                                <div className="input-group">
                                    <input
                                        type="file"
                                        id="file-upload"
                                        className="form-control form-control-envelop"
                                        accept=".jpg, .jpeg, .png"
                                        onChange={handleUpload} // Handle the file selection
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="custom-div custom-div-middle">

                            <div className="form-group-envelop">
                                <label htmlFor="envelope-width" className="form-label-inputs">
                                    Envelope Width
                                </label>
                                <input
                                    type="number"
                                    id="envelope-width"
                                    className="form-control form-control-envelop mini-input"
                                    placeholder="Width"
                                    value={envelopWidth}
                                    min="0"
                                    max="15"
                                    required
                                    onChange={handleWidthChange}
                                    onKeyDown={handleKeyDown}  // Restrict invalid keys
                                />

                                <label htmlFor="envelope-height" className="form-label-inputs" style={{ marginLeft: '18px' }}>
                                    Envelope Height
                                </label>
                                <input
                                    type="number"
                                    id="envelope-height"
                                    className="form-control form-control-envelop mini-input-1"
                                    placeholder="Height"
                                    value={envelopHeight}
                                    min="0"
                                    max="15"
                                    required
                                    onChange={handleHeightChange}
                                    onKeyDown={handleKeyDown}  // Restrict invalid keys
                                />
                            </div>
                            <div className="form-group-envelop">
                                <label className="form-label-inputs">Envelop Margin</label>
                                <div className="margin-inputs">
                                    <input type="text"
                                        id="margin-top"
                                        className="form-control form-control-envelop mini-input"
                                        value={envelopMarginTop}
                                        required
                                        placeholder="Top"
                                        onChange={(e) => setEnvelopMarginTop(e.target.value)}
                                    />
                                    <input type="text" required id="margin-left" className="form-control form-control-envelop mini-input" placeholder="Left" value={envelopMarginLeft} onChange={(e) => setEnvelopMarginLeft(e.target.value)} />
                                    <input type="text" required id="margin-bottom" className="form-control form-control-envelop mini-input" placeholder="Bottom" value={envelopMarginBottom} onChange={(e) => setEnvelopMarginBottom(e.target.value)} />
                                    <input type="text" required id="margin-right" className="form-control form-control-envelop mini-input" placeholder="Right" value={envelopMarginRight} onChange={(e) => setEnvelopMarginRight(e.target.value)} />
                                </div>
                            </div>

                            <div>
                                {/* Radio buttons */}
                                <div className="form-radio-group">
                                    <label>
                                        <input
                                            type="radio"
                                            name="docType"
                                            checked={isEnvelope}
                                            onChange={() => handleTypeChange("Envelope")}
                                        />
                                        Envelope
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="docType"
                                            checked={isLetter}
                                            onChange={() => handleTypeChange("Letter")}
                                        />
                                        Letter
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="docType"
                                            checked={isSticker}
                                            onChange={() => handleTypeChange("Sticker")}
                                        />
                                        Sticker
                                    </label>
                                </div>

                                {/* Window checkbox (only when Envelope) */}
                                {isEnvelope && (
                                    <div className="form-checkbox">
                                        <label htmlFor="envelope-checkbox">
                                            <input
                                                type="checkbox"
                                                id="envelope-checkbox"
                                                checked={isWindow}
                                                onChange={(e) => setIsWindow(e.target.checked)}
                                            />Is Window</label>

                                    </div>
                                )}
                            </div>

                        </div>


                        <div className="envelope-preview-wrapper">
                            <span className='envelope-preview-wrapper-title'>Preview</span>
                            <div
                                className="envelope-preview"
                                style={{
                                    width: inchToPx(envelopWidth),
                                    height: inchToPx(envelopHeight),
                                    backgroundColor: envelopColor,
                                    position: "relative",
                                    border: "0px solid #f8f9fa",
                                    boxSizing: "border-box",
                                }}
                            >
                                {/* Top Margin */}
                                {isValidValue(envelopMarginTop) && (
                                    <div
                                        className="envelope-margin"
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            width: "100%",
                                            height: inchToPx(envelopMarginTop),
                                            backgroundColor: "rgba(255, 0, 0, 0.2)", // Red, with transparency
                                            boxSizing: "border-box",
                                            borderBottom: "1px dashed red",
                                            zIndex: 1,
                                            display: "flex", // Use Flexbox
                                            alignItems: "center", // Vertically center align
                                            justifyContent: "center" // Horizontally center align
                                        }}
                                    >
                                        <span className="margin-label">Top Margin</span>
                                    </div>
                                )}


                                {/* Bottom Margin */}
                                {isValidValue(envelopMarginBottom) && (
                                    <div
                                        className="envelope-margin"
                                        style={{
                                            position: "absolute",
                                            bottom: 0,
                                            left: 0,
                                            width: "100%",
                                            height: inchToPx(envelopMarginBottom),
                                            backgroundColor: "rgba(0, 255, 0, 0.2)", // Green, with transparency
                                            boxSizing: "border-box",
                                            borderTop: "1px dashed green",
                                            zIndex: 1,
                                            display: "flex", // Use Flexbox
                                            alignItems: "center", // Vertically center align
                                            justifyContent: "center" // Horizontally center align
                                        }}
                                    >
                                        <span className="margin-label">Bottom Margin</span>
                                    </div>
                                )}

                                {isValidValue(envelopMarginLeft) && (
                                    <div
                                        className="envelope-margin"
                                        style={{
                                            position: "absolute",
                                            top: inchToPx(envelopMarginTop),
                                            bottom: inchToPx(envelopMarginBottom),
                                            left: 0,
                                            width: inchToPx(envelopMarginLeft),
                                            backgroundColor: "rgba(0, 0, 255, 0.2)", // Blue, with transparency
                                            boxSizing: "border-box",
                                            borderRight: "1px dashed blue",
                                            zIndex: 1,
                                        }}
                                    >
                                        <span className="margin-label">L M</span>
                                    </div>
                                )}

                                {isValidValue(envelopMarginRight) && (
                                    <div
                                        className="envelope-margin"
                                        style={{
                                            position: "absolute",
                                            top: inchToPx(envelopMarginTop),
                                            bottom: inchToPx(envelopMarginBottom),
                                            right: 0,
                                            width: inchToPx(envelopMarginRight),
                                            backgroundColor: "rgba(255, 255, 0, 0.2)", // Yellow, with transparency
                                            boxSizing: "border-box",
                                            borderLeft: "1px dashed yellow",
                                            zIndex: 1,
                                        }}
                                    >
                                        <span className="margin-label">R M</span>
                                    </div>
                                )}
                                {/* {isValidValue(section.SectionWidth) && isValidValue(section.SectionHeight) && ( */}
                                <div
                                    className="envelope-content-area"
                                    style={{
                                        position: "absolute",
                                        top: inchToPx(envelopMarginTop),
                                        left: inchToPx(envelopMarginLeft),
                                        right: inchToPx(envelopMarginRight),
                                        bottom: inchToPx(envelopMarginBottom),
                                        backgroundColor: envelopColor,
                                        zIndex: 0,
                                    }}
                                >
                                    {/* Render Sections */}
                                    {sections.map((section, index) => {
                                        // Determine corner radius based on SectionType
                                        const cornerRadius = section.Sectiontype === 'window' ? '2px' : '0px';

                                        return (
                                            isValidValue(section.SectionWidth) && isValidValue(section.SectionHeight) && (

                                                <div
                                                    key={index}
                                                    className="envelope-section"
                                                    style={{
                                                        position: "absolute",
                                                        top: inchToPx(section.SectionY) - inchToPx(envelopMarginTop),
                                                        left: inchToPx(section.SectionX) - inchToPx(envelopMarginLeft),
                                                        width: inchToPx(section.SectionWidth),
                                                        height: inchToPx(section.SectionHeight),
                                                        backgroundColor: section.SectionColor,
                                                        opacity: section.transparency / 100,
                                                        boxSizing: "border-box",
                                                        zIndex: 2,
                                                        borderRadius: cornerRadius,
                                                    }}
                                                >
                                                    <span>{section.SectionTittle}</span>
                                                </div>
                                            )
                                        );

                                    })}

                                </div>
                                {/* )} */}
                            </div>
                        </div>


                    </div>


                    <div className="section-div">
                        <span className='section-div-span'>Sections : </span>

                        <button type="button" className="button-group-section" onClick={handleaddSection}>
                            Add Section
                        </button>
                    </div>


                    <div className="container-drop">
                        {sections.map((section, index) => (
                            <div key={index} className="section-box">
                                <div className="section-content">
                                    <div className="row">
                                        <div className="col-md-4 ">
                                            <div className="form-group-envelop-1">
                                                <label htmlFor={`section-type-${index}`} className="form-label-inputs">Section Type</label>
                                                <select
                                                    id={`section-type-${index}`}
                                                    className="form-select form-control-inputs"
                                                    value={section.Sectiontype}
                                                    onChange={(e) => handleSectionChange(index, 'Sectiontype', e.target.value)}
                                                >
                                                    <option value="">Select</option>

                                                    {isWindow ? (
                                                        <>
                                                            <option value="window">Window</option>
                                                            <option value="non-printable">Non-Printable</option>
                                                        </>
                                                    ) : (
                                                        <option value="non-printable">Non-Printable</option>
                                                    )}
                                                </select>

                                            </div>

                                            <div className="form-group-envelop-1">
                                                <label htmlFor={`section-x-${index}`} className="form-label-inputs">Section X</label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    id={`section-x-${index}`}
                                                    onKeyDown={handleKeyDown}  // Restrict invalid keys
                                                    className="form-control form-control-inputs"
                                                    value={section.SectionX}
                                                    onChange={(e) => handleSectionChange(index, 'SectionX', e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className="form-group-envelop-1">
                                                <label htmlFor={`section-detail-${index}`} className="form-label-inputs">Section Detail</label>
                                                <input
                                                    type="text"
                                                    id={`section-detail-${index}`}
                                                    className="form-control form-control-inputs"
                                                    value={section.SectionDetailText}
                                                    onChange={(e) => handleSectionChange(index, 'SectionDetailText', e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="col-md-4 ">
                                            <div className="form-group-envelop-1">
                                                <label htmlFor={`section-width-${index}`} className="form-label-inputs">Section Width</label>
                                                <input

                                                    type="number"
                                                    min={0}
                                                    id={`section-width-${index}`}
                                                    onKeyDown={handleKeyDown}  // Restrict invalid keys
                                                    className="form-control form-control-inputs"
                                                    placeholder='Enter width in inches'
                                                    required

                                                    value={section.SectionWidth}
                                                    onChange={(e) => handleSectionChange(index, 'SectionWidth', e.target.value)}

                                                />

                                            </div>

                                            <div className="form-group-envelop-1">
                                                <label htmlFor={`section-y-${index}`} className="form-label-inputs">Section Y</label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    id={`section-y-${index}`}
                                                    onKeyDown={handleKeyDown}  // Restrict invalid keys
                                                    className="form-control form-control-inputs"
                                                    value={section.SectionY}
                                                    onChange={(e) => handleSectionChange(index, 'SectionY', e.target.value)}
                                                    required
                                                />
                                            </div>


                                            <div className="form-group-envelop-1">
                                                <label htmlFor={`section-color-${index}`} className="form-label-inputs">Section Colour</label>
                                                <input
                                                    type="text"
                                                    id={`section-color-${index}`}
                                                    className="form-control form-control-inputs"
                                                    value={section.SectionColor}
                                                    onChange={(e) => handleSectionChange(index, 'SectionColor', e.target.value)}
                                                    required
                                                />
                                                <input
                                                    type="color"
                                                    id={`color-picker-${index}`}
                                                    className="color-picker-1"
                                                    value={section.SectionColor}
                                                    onChange={(e) => handleSectionChange(index, 'SectionColor',
                                                        e.target.value)}
                                                    required

                                                />

                                            </div>

                                        </div>

                                        <div className="col-md-4">
                                            <div className="form-group-envelop-1">
                                                <label htmlFor={`section-height-${index}`} className="form-label-inputs">Section Height</label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    id={`section-height-${index}`}
                                                    className="form-control form-control-inputs"
                                                    value={section.SectionHeight} ection-div
                                                    placeholder='Enter height in inches'
                                                    onKeyDown={handleKeyDown}  // Restrict invalid keys
                                                    onChange={(e) => handleSectionChange(index, 'SectionHeight', e.target.value)}
                                                />
                                            </div>

                                            <div className="form-group-envelop-1">
                                                <label htmlFor={`section-title-${index}`} className="form-label-inputs">Section Title</label>
                                                <input
                                                    type="text"
                                                    id={`section-title-${index}`}
                                                    className="form-control form-control-inputs"
                                                    value={section.SectionTittle}
                                                    onChange={(e) => handleSectionChange(index, 'SectionTittle', e.target.value)}
                                                />
                                            </div>

                                            <div className="form-group-envelop-1">
                                                <label htmlFor={`section-transparency-${index}`} className="form-label-inputs">Transparency</label>
                                                <input
                                                    type="range"
                                                    id={`section-transparency-${index}`}
                                                    value={section.transparency || 0.5}
                                                    onChange={(e) => handleSectionChange(index, 'transparency', e.target.value)}
                                                    min="0"
                                                    max="100"
                                                    step="1"
                                                    style={{ width: '100%' }}

                                                />
                                                <span style={{ marginLeft: '15px' }}>
                                                    {section.transparency !== undefined && section.transparency !== null
                                                        ? `${section.transparency}%`
                                                        : '50%'}
                                                </span>
                                            </div>



                                        </div>

                                    </div>

                                    <span className="delete-button" onClick={() => handleDelete(index)}>
                                        <MdCancel size={24} />
                                    </span>

                                </div>

                            </div>

                        ))}
                    </div>





                </div>

            </div>
        </div >
    );
};

export default AddEnvelopeGroup;