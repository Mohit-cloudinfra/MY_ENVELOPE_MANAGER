
import React, { useState, useEffect, useRef } from 'react';
import './EnvelopeEditor.css'
import { MdCancel } from 'react-icons/md';
import CustomTextField from './CustomTextField';
import { Rnd } from 'react-rnd';
import Select from 'react-select';
import { TbBold, TbItalic, TbRuler2, TbUnderline } from "react-icons/tb";
import { AiOutlineFontColors } from "react-icons/ai";
import { FaRegFileImage } from "react-icons/fa";
import { PiTextTBold } from "react-icons/pi";
import { AiOutlineAlignLeft, AiOutlineAlignCenter, AiOutlineAlignRight } from "react-icons/ai";
import { IoMdUndo, IoMdRedo } from "react-icons/io";
import { ImTextHeight } from "react-icons/im";
import { ImTextWidth } from "react-icons/im";
import { useCustomContext } from '../CustomComponents/CustomComponents';
import EnvelopeGroupListDS from '../../DataServices/EnvelopeGroupListDS';
import { IoCaretBackSharp, IoCaretForwardSharp, IoClose } from "react-icons/io5";
import AWS from 'aws-sdk';
import { FcCopyright } from "react-icons/fc";
import AddPhotolibrary from '../Client/AddPhotolibrary'
import { CiImageOn } from 'react-icons/ci';
import { FaShapes } from 'react-icons/fa';
import { FiAlignJustify } from "react-icons/fi";
import { SketchPicker } from 'react-color';
import { shapeConfigs } from './Shapes';
import { MdFormatIndentIncrease, MdFormatIndentDecrease } from 'react-icons/md';
import { MdFormatListBulleted, MdFormatListNumbered } from 'react-icons/md';




const fontOptions = [
    { value: '"Arial", sans-serif', label: 'Arial' },
    { value: '"Comic Sans MS", cursive, sans-serif', label: 'Comic Sans MS' },
    { value: '"Courier New", Courier, monospace', label: 'Courier New' },
    { value: '"Georgia", serif', label: 'Georgia' },
    { value: '"Garamond", serif', label: 'Garamond' },
    { value: '"Gill Sans", sans-serif', label: 'Gill Sans' },
    { value: '"Lato", sans-serif', label: 'Lato' },
    { value: '"Lucida Sans", sans-serif', label: 'Lucida Sans' },
    { value: '"Montserrat", sans-serif', label: 'Montserrat' },
    { value: '"Nunito", sans-serif', label: 'Nunito' },
    { value: '"Open Sans", sans-serif', label: 'Open Sans' },
    { value: '"Poppins", sans-serif', label: 'Poppins' },
    { value: '"Quicksand", sans-serif', label: 'Quicksand' },
    { value: '"Raleway", sans-serif', label: 'Raleway' },
    { value: '"Roboto", sans-serif', label: 'Roboto' },
    { value: '"Source Sans Pro", sans-serif', label: 'Source Sans Pro' },
    { value: '"Tahoma", sans-serif', label: 'Tahoma' },
    { value: '"Times New Roman", Times, serif', label: 'Times New Roman' },
    { value: '"Trebuchet MS", sans-serif', label: 'Trebuchet MS' },
    { value: '"Ubuntu", sans-serif', label: 'Ubuntu' },
    { value: '"Verdana", sans-serif', label: 'Verdana' },
    { value: 'Noto Sans KR, sans-serif', label: '써니 고딕' },
];

const fontSizeOptions = [7, 8, 9, 10, 11, 12, 14, 15, 16, 18, 20, 22, 24, 25, 28, 30, 32, 34, 36, 40, 42, 48, 50];
const alignmentOptions = [
    { value: 'left', icon: <AiOutlineAlignLeft /> },
    { value: 'center', icon: <AiOutlineAlignCenter /> },
    { value: 'justify', icon: <FiAlignJustify /> },
    { value: 'right', icon: <AiOutlineAlignRight /> },
];

const indentOptions = [
    { value: 'indent', icon: <MdFormatIndentIncrease /> },
    { value: 'outdent', icon: <MdFormatIndentDecrease /> },
];

const listOptions = [
    { value: 'unordered', icon: MdFormatListBulleted },
    { value: 'ordered', icon: MdFormatListNumbered },
];




const EnvelopeEditor = ({ onClose, title, groupID, isPreview, envelopeId, customElements, EnvelopeGroups, ImageData, ClientId, MasterElements, page }) => {


    const [envelopeData, setEnvelopeData] = useState({ sections: [] });
    const [selectedElement, setSelectedElement] = useState(null); // Tracks the currently active element
    const [elements, setElements] = useState([]); // Manages all text and image elements
    const [textFont, settextFont] = useState(fontOptions[0]); // Default font
    const [textSize, settextSize] = useState(12); // Default font size
    const [textColor, settextColor] = useState('#000000'); // Default font color
    const [isBold, setIsBold] = useState(false); // Default bold style
    const [isItalic, setIsItalic] = useState(false); // Default italic style
    const [isUnderline, setIsUnderline] = useState(false); // Default underline style
    const [textAlignment, settextAlignment] = useState('left'); // Default text alignment
    const [indentation, setIndentation] = useState('indent');
    const [listType, setListType] = useState('unordered');
    const { showAlert, hud, stopHudRotation, showToast } = useCustomContext();
    const [loading, setLoading] = useState(false);
    const [colorPickerVisible, setColorPickerVisible] = useState(false);
    const lineSpacingRef = useRef(null);
    const letterSpacingRef = useRef(null);
    const [isAddedElements, setIsAddedElements] = useState(false);
    const [newElementId, setNewElementId] = useState(null); // To store the ID of the newly added element
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [elementsSize, setelementsSize] = useState([]);
    const [ImageElements, setImageElements] = useState([]);
    const [imageLoading, setImageLoading] = useState(true);
    const [selectedRange, setSelectedRange] = useState(null);
    const [dragEnabled, setDragEnabled] = useState(true);
    const elementRefs = useRef({});
    const [isCapturing, setIsCapturing] = useState(false);
    const [s3KeyPath, setS3keypath] = useState(null);
    const [pageDataArray, setPageDataArray] = useState([]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [liveDragPosition, setLiveDragPosition] = useState({});
    const containerRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [prevElements, setPrevElements] = useState([]);
    const [isShapeModalOpen, setIsShapeModalOpen] = useState(false);
    const [isAlignMentOpen, setIsAlignMentOpen] = useState(false);
    const [isListTypeOpen, setListTypeOpen] = useState(false);

    let lastPastedText = null;

    const s3 = new AWS.S3({
        region: process.env.REACT_APP_AWS_REGION,
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    });


    // Function to convert Blob to ArrayBuffer
    const blobToArrayBuffer = (blob) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
    });



    useEffect(() => {
        setLoading(true);
        hud("Please Wait...");
        if (isPreview) {
            getGroupSections();
        }

        const handleClickOutside = (event) => {
            if (lineSpacingRef.current && !lineSpacingRef.current.contains(event.target)) {
                setShowLineSpacingDropdown(false);
            }
            if (letterSpacingRef.current && !letterSpacingRef.current.contains(event.target)) {
                setShowLetterSpacingDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        // document.getElementById('modal-overlay').addEventListener('click', toggleFullscreen);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' || event.key === 'F11') {
                event.preventDefault();
                toggleFullscreen();
            }
        };
        // Add event listener for keydown
        window.addEventListener('keydown', handleKeyDown);
        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };

    }, []);

    useEffect(() => {
        stopHudRotation();
        if (Array.isArray(customElements) && customElements.length > 0) {
            setPageDataArray(customElements)

        }
    }, [customElements]);

    useEffect(() => {
        if (pageDataArray.length > 0) {
            const currentPageData = pageDataArray[currentPageIndex];

            if (currentPageData) {
                const key = `customelements${currentPageData.pageNumber}`;
                const customElements = currentPageData[key]?.elements || [];

                const filteredElements = customElements
                    .filter((element) => {
                        const content = element.content;

                        if (!content || content.trim() === "") return false;

                        const tempDiv = document.createElement("div");
                        tempDiv.innerHTML = content.trim();

                        const imgTags = tempDiv.querySelectorAll("img");
                        for (const img of imgTags) {
                            if (img.src.includes("blob:")) {
                                return false;
                            }
                        }

                        return true;
                    })
                    .map((element) => {
                        const tempDiv = document.createElement("div");
                        tempDiv.innerHTML = element.content?.trim() || "";

                        const target = tempDiv.querySelector("span, p, div");
                        const inlineStyle = target?.getAttribute("style") || "";
                        const match = inlineStyle.match(/text-align\s*:\s*(\w+)/i);
                        const textAlign = match ? match[1] : undefined;

                        return {
                            ...element,
                            textAlign: textAlign || "left", // Default to left if not found
                        };
                    });

                setElements(filteredElements);
                setPrevElements(filteredElements);
                console.log("Elements with textAlign:", filteredElements);
            }
        }
    }, [currentPageIndex, pageDataArray]);



    useEffect(() => {
        if (Array.isArray(ImageData) && ImageData.length > 0) {
        }
    }, [ImageData]);

    useEffect(() => {
        if (EnvelopeGroups) {
            // hud('Please Wait...')
            setLoading(false);
            setEnvelopeData(EnvelopeGroups);


        }
    }, [EnvelopeGroups]);


    useEffect(() => {
    }, [elements, envelopeData]);

    useEffect(() => {
        if (selectedElement) {
            const currentElement = elements.find(el => el.id === selectedElement);
            if (currentElement) {
                setTimeout(() => onMouseUp(), 0);

            }
        }
    }, [selectedElement]);


    useEffect(() => {
    }, [elementsSize]);



    const PrintableareaHide = envelopeData.printMarginBottom && envelopeData.printMarginLeft && envelopeData.printMarginRight && envelopeData.printMarginTop;

    // Fetching the Envelope Group functionality 
    const getGroupSections = async () => {
        const requestData = {
            id: groupID,
        };
        try {
            const envelopeGroupDS = new EnvelopeGroupListDS(groupSectionSuccessResponse.bind(this), groupSectionFailureResponse.bind(this));
            envelopeGroupDS.getEnvelopeSections(requestData);
        } catch (error) {
            console.error("Failed to fetch envelopes:", error);
        }
    }

    function groupSectionSuccessResponse(response) {
        stopHudRotation();
        setLoading(false);
        setEnvelopeData(response.data);
    }

    function groupSectionFailureResponse(response) {
        stopHudRotation();
        setLoading(false);

    }

    // adding New Element type of text with No content 
    console.log('page:', page)
    const addText = () => {
        setDragEnabled(true);
        const newElement = {
            id: Date.now(),
            type: "text",
            content: `<div style="font-size: 16px; font-family: Arial; color: rgb(0,0,0); line-height: 1.15; letter-spacing: 0; text-align: left;white-space: pre-wrap;"></div>`,
            x: 10,
            y: 10,
            width: 200,
            height: 50,
        };

        setElements([...elements, newElement]);
        setSelectedElement(newElement.id);
        elementRefs.current[newElement.id] = React.createRef();
    };



    const addShape = (shapeType) => {
        setDragEnabled(true);
        const config = shapeConfigs[shapeType];
        if (!config) return console.warn(`Unknown shape: ${shapeType}`);

        const newElement = {
            id: Date.now(),
            type: 'shape',
            shapeType,
            content: config.content,
            x: 10,
            y: 10,
            width: config.width,
            height: config.height,
            shapeColor: '#000000',
        };

        // Use functional update to ensure we are working with the latest state
        setElements(prevElements => {
            const updatedElements = [...prevElements, newElement];
            console.log('Updated Elements:', updatedElements); // Log the updated elements
            return updatedElements;
        });

        setSelectedElement(newElement.id);
        elementRefs.current[newElement.id] = React.createRef();
    };



    // selecting the Element

    const handleSelectElement = (id) => {
        setElements((prevElements) => {
            const selectedElement = prevElements.find((el) => el.id === id);

            const otherElements = prevElements.filter((el) => el.id !== id);
            return [...otherElements, selectedElement];
        });
        // setSelectedElement(id);
    };


    // Image Element  Uploading functionality

    const [OpenImagesModal, setOpenImagesModal] = useState(false);
    const triggerFileInput = () => {
        if (isFullscreen) {
            toggleFullscreen();
        }
        setOpenImagesModal(true);
    };

    const handleCloselibraryModal = () => {
        setOpenImagesModal(false);
        handleImageElements(ImageElements);
    };

    const toggleFullscreen = () => {

        setIsFullscreen((prev) => !prev);

        if (!document.fullscreenElement) {
            // Request fullscreen on a specific element, e.g., the document body
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            // Exit fullscreen if already in fullscreen mode
            document.exitFullscreen().catch(err => {
                console.error(`Error attempting to exit full-screen mode: ${err.message} (${err.name})`);
            });
        }
    };


    const handleImageElements = (imageElements) => {
        // Check if imageElements is an array and has elements
        if (!Array.isArray(imageElements) || imageElements.length === 0) {
            return; // Exit if no image elements are provided
        }

        const newElements = imageElements.map((imageContent, Index) => {
            const img = new Image();
            img.src = imageContent; // Assuming imageContent is a valid data URL

            return new Promise((resolve) => {
                img.onload = () => {
                    const maxWidth = 200;
                    const maxHeight = 100;
                    let width = img.width;
                    let height = img.height;

                    // Maintain aspect ratio and limit size
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }

                    // Increase height by 20px if it's smaller than a certain threshold
                    const minHeightThreshold = 20; // Set your desired threshold here
                    if (height < minHeightThreshold) {
                        height += 20; // Increase height by 20px
                    }

                    const newElement = {
                        id: Date.now() + Index,
                        type: 'image',
                        content: imageContent,
                        x: 1,
                        y: 1,
                        width,
                        height,
                    };

                    resolve(newElement);
                };
            });

        });

        // Wait for all images to load and create new elements
        Promise.all(newElements).then((loadedElements) => {
            setElements([...elements, ...loadedElements]);
            setUndoStack([...undoStack, elements]);
            setRedoStack([]);
            setSelectedElement(loadedElements[0]?.id); // Select the first added element
            setIsAddedElements(true);
            setDragEnabled(true);
            setNewElementId(loadedElements[0]?.id); // Set the ID of the first added element
        });
    };

    //selected range storing functionality

    const saveSelection = () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            return selection.getRangeAt(0).cloneRange(); // Clone current selection
        }
        return null;
    };

    const restoreSelection = (range) => {
        if (range) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
    };

    //Inputing the content in the selected element functionality
    //checking it is empty element content or not

    const cleanUpContent = (container) => {
        // Replace spans with data-huuid
        const spansWithHuuid = container.querySelectorAll('span[data-huuid]');

        spansWithHuuid.forEach(span => {
            const newSpan = document.createElement('span');

            // Preserve leading/trailing spaces
            const leadingSpace = /^\s/.test(span.textContent) ? ' ' : '';
            const trailingSpace = /\s$/.test(span.textContent) ? ' ' : '';

            newSpan.textContent = leadingSpace + span.textContent.trim() + trailingSpace;
            span.parentNode.replaceChild(newSpan, span);
        });

        // Allow only specific tags — added UL, OL, LI, DIV here!
        const allowedTags = ['DIV', 'SPAN', 'P', 'B', 'I', 'U', 'BR', 'A', 'UL', 'OL', 'LI'];
        const allElements = container.querySelectorAll('*');

        allElements.forEach(el => {
            if (!allowedTags.includes(el.tagName)) {
                // Replace the element with a text node of its textContent (loses styles if any)
                const textNode = document.createTextNode(el.textContent);
                el.parentNode.replaceChild(textNode, el);
            }
        });
    };



    const onPaste = (e) => {
        e.preventDefault(); // prevent default paste

        const clipboardData = e.clipboardData || window.clipboardData;
        const pastedText = clipboardData.getData('text/plain'); // plain text only

        // Escape HTML entities to prevent injection
        const escapeHtml = (str) => {
            return str
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        };

        const safeText = escapeHtml(pastedText).replace(/\n/g, "<br>"); // preserve line breaks
        const cleanHTML = `<div style="font-size: 16px; font-family: Arial; color: rgb(0,0,0); line-height: 80%; letter-spacing: 0; text-align: left; white-space: pre-wrap;">${safeText}</div>`;

        document.execCommand("insertHTML", false, cleanHTML);
    };

    const removeEmptyListItems = (listContainer) => {
        if (!listContainer) return;

        const listItems = listContainer.querySelectorAll("li");
        listItems.forEach((li) => {
            const hasOnlyBr = li.childNodes.length === 1 && li.firstChild?.tagName === "BR";
            const text = li.textContent.replace(/\u200B/g, "").trim();
            if (hasOnlyBr || text === "") {
                li.remove();
            }
        });
    };

    const onInput = (e, el) => {
        const isMasterElement = pageDataArray.some(page => {
            const elementsKey = `customelements${page.pageNumber}`;
            const elementsArray = page[elementsKey]?.elements || [];
            return elementsArray.some(e =>
                MasterElements.some(masterEl => masterEl.id === e.id && e.id === el.id)
            );
        });

        if (isMasterElement) {
            e.preventDefault();
            e.target.innerHTML = el.content;
            return;
        }

        const savedSelection = saveSelection();
        const contentText = lastPastedText || e.target.textContent.trim();
        const spanWithClass = e.target.querySelector("span.imported-element");
        const isImported = !!spanWithClass;
        // Find the styled div or span
        const styledElement = e.target.querySelector("div[style*='font-size: 16px; font-family: Arial;'], span[style*='font-size: 16px; font-family: Arial;']");
        const containsList = styledElement?.querySelector("ol, ul");
        const isEmpty = !e.target.textContent.trim() || e.target.innerHTML === "<br>";

        if ((!styledElement || styledElement.innerHTML.trim() === "" || isEmpty) && !isImported && !containsList) {
            e.target.innerHTML = `<div style="font-size: 16px; font-family: Arial; color: rgb(0,0,0); line-height: 80%; letter-spacing: 0; text-align: left; white-space: pre-wrap;">${contentText || ""}</div>`;
            el.content = e.target.innerHTML;

            // Clean up content after creating the new element
            // cleanUpContent(e.target);
            cleanUpContent(e.target);
            // Place cursor inside the newly created div/span
            const newElement = e.target.querySelector("div, span");

            if (newElement) {
                const range = document.createRange();
                const selection = window.getSelection();

                // Get the last child node (which might be a text node)
                const lastChild = newElement.lastChild;

                if (lastChild && lastChild.nodeType === 3) { // 3 = Text Node
                    range.setStart(lastChild, lastChild.length);
                } else {
                    range.selectNodeContents(newElement);
                    range.collapse(false);
                }

                selection.removeAllRanges();
                selection.addRange(range);
            }
        } else if (containsList) {
            // Handle text insertion inside <li> instead of overriding
            const li = styledElement.querySelector("li");
            if (li && lastPastedText) {
                li.innerHTML += lastPastedText;
            }
            removeEmptyListItems(containsList);
            cleanUpContent(e.target); // Clean styles *after* cleanup of list
            el.content = e.target.innerHTML.trim(); // Save final content

        }
        else {
            // Otherwise, save the current content
            cleanUpContent(e.target);
            el.content = e.target.innerHTML.trim();
        }

        // Clean up content after pasting text


        // Restore cursor position after updating content
        // setTimeout(() => restoreSelection(savedSelection), 0);
    };

    const onKeyDown = (e, el) => {
        if (!el) return;

        const container = e.currentTarget;
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const styledBlock = container.querySelector("div[style*='font-size: 16px'][style*='font-family: Arial']");
        const spanWithClass = e.target.querySelector("span.imported-element");
        const isImported = !!spanWithClass;
        if (!styledBlock) return;

        // === Handle Shift+Enter for line break ===
        if (e.key === "Enter" && e.shiftKey) {
            e.preventDefault();
            const br = document.createElement("br");
            const zwsp = document.createTextNode("\u200B");

            range.deleteContents();
            range.insertNode(br);
            range.setStartAfter(br);
            range.insertNode(zwsp);
            range.setStartAfter(zwsp);
            range.collapse(true);

            selection.removeAllRanges();
            selection.addRange(range);
            return;
        }

        // === Handle Backspace to exit list if empty ===
        if (e.key === "Backspace") {
            const elementForClosest = range.startContainer.nodeType === Node.TEXT_NODE
                ? range.startContainer.parentElement
                : range.startContainer;

            const listItem = elementForClosest?.closest('li');
            if (listItem && listItem.textContent.trim() === "") {
                e.preventDefault();

                const list = listItem.closest('ul, ol');
                const newDiv = document.createElement("div");
                newDiv.setAttribute("style", "font-size: 16px; font-family: Arial;");
                newDiv.innerHTML = "<br>";

                if (list) {
                    list.parentNode.insertBefore(newDiv, list.nextSibling);
                    listItem.remove();

                    const exitRange = document.createRange();
                    exitRange.setStart(newDiv, 0);
                    exitRange.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(exitRange);
                }
                return;
            }

            // Prevent if the only styled span is empty
            const styledSpans = container.querySelectorAll("span[style*='font-size: 16px'][style*='font-family: Arial']");
            if (styledSpans.length === 1 && styledSpans[0].textContent.trim() === "") {
                e.preventDefault();
                return;
            }
        }

        // === Handle Enter key ===
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();

            const elementForClosest = range.startContainer.nodeType === Node.TEXT_NODE
                ? range.startContainer.parentElement
                : range.startContainer;

            const listItem = elementForClosest?.closest('li');

            if (listItem) {
                const isEmpty = listItem.textContent.trim() === "";

                if (isEmpty) {
                    // === Exit list ===
                    const list = listItem.closest('ul, ol');
                    const newDiv = document.createElement('div');
                    newDiv.setAttribute("style", "font-size: 16px; font-family: Arial;");
                    newDiv.innerHTML = "<br>";

                    if (list) {
                        list.parentNode.insertBefore(newDiv, list.nextSibling);
                        listItem.remove();

                        const exitRange = document.createRange();
                        exitRange.setStart(newDiv, 0);
                        exitRange.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(exitRange);
                    }
                    return;
                }

                // === Continue in list ===
                const newListItem = document.createElement('li');
                const splitRange = range.cloneRange();
                splitRange.setEndAfter(listItem);

                const contentAfterCaret = splitRange.extractContents();
                const cleanedFragment = document.createDocumentFragment();
                Array.from(contentAfterCaret.childNodes).forEach(child => {
                    if (child.tagName === 'LI') {
                        while (child.firstChild) {
                            cleanedFragment.appendChild(child.firstChild);
                        }
                    } else {
                        cleanedFragment.appendChild(child);
                    }
                });

                newListItem.appendChild(cleanedFragment);
                listItem.parentNode.insertBefore(newListItem, listItem.nextSibling);

                const newRange = document.createRange();
                newRange.setStart(newListItem, 0);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
            } else {
                // If not inside a list item
                if (!styledBlock.contains(range.startContainer) && !isImported) {
                    const newRange = document.createRange();
                    if (styledBlock.firstChild) {
                        newRange.setStart(styledBlock, 0);
                    } else {
                        newRange.selectNodeContents(styledBlock);
                        newRange.collapse(true);
                    }
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                }

                const br = document.createElement("br");
                const zwsp = document.createTextNode("\u200B");

                const currentRange = selection.getRangeAt(0);
                currentRange.deleteContents();
                currentRange.insertNode(br);
                currentRange.setStartAfter(br);
                currentRange.insertNode(zwsp);
                currentRange.setStartAfter(zwsp);
                currentRange.collapse(true);

                selection.removeAllRanges();
                selection.addRange(currentRange);
            }
        }

        // Update element content
        el.content = container.innerHTML;
    };




    //updating the toolbar state on mouse click in the content functionality

    const onMouseUp = () => {
        const selection = window.getSelection();
        const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        const selectedNode = range ? range.startContainer.parentNode : null;


        if (selectedNode) {
            setSelectedRange(range.cloneRange());
            const computedStyles = window.getComputedStyle(selectedNode);
            const computedFontFamily = computedStyles.fontFamily.replace(/['"]/g, '').split(',')[0];
            const matchedFont = fontOptions.find(option => option.value.includes(computedFontFamily));

            settextFont(matchedFont ? matchedFont.value : fontOptions[0].value);
            settextSize(Math.round(parseFloat(computedStyles.fontSize)));
            setIsBold(computedStyles.fontWeight === 'bold' || computedStyles.fontWeight >= 700);
            setIsItalic(computedStyles.fontStyle === 'italic');
            setIsUnderline(computedStyles.textDecoration.includes('underline'));
            settextColor(computedStyles.color);
            settextAlignment(computedStyles.textAlign);
            setListType(computedStyles.listStyle)
            setLineSpacing(parseInt(computedStyles.lineHeight, 10) || 'normal');
            setLetterSpacing(parseInt(computedStyles.letterSpacing, 10) || 0);
        }
    };



    // Enable and Disable dragging functionality.

    const toggleDrag = (e) => {
        e.stopPropagation();
        setDragEnabled((prev) => !prev);
        setElements((prevElements) =>
            prevElements.map((el) =>
                el.id === selectedElement ? { ...el } : el
            )
        );
    };

    // Appying Bold ,Italic and underline functionality

    function applyStyleToSelection(command, value = null) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        const range = selection.getRangeAt(0);
        document.execCommand(command, false, value);
        selection.removeAllRanges();
        selection.addRange(range);
    }


    // Applying the fontfamily to the selected range functionality
    const handleFontChange = (font) => {
        const selection = window.getSelection();
        const range = selection?.rangeCount > 0 ? selection.getRangeAt(0) : null;

        if (!range || selection.collapsed) {
            showToast({ message: "No text selected to apply the font." });
            return;
        }

        const selectedText = selection.toString().trim();
        const parentNode = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
            ? range.commonAncestorContainer.parentNode
            : range.commonAncestorContainer;

        const applyFontFamily = (el) => {
            el.style.fontFamily = font.value;
        };

        const applyFontToSpans = (node) => {
            node.childNodes.forEach(child => {
                if (child.nodeType === Node.ELEMENT_NODE && child.tagName === 'SPAN') {
                    child.style.fontFamily = font.value;
                    applyFontToSpans(child);
                }
            });
        };

        const updateUndoState = () => {
            if (selectedElement) {
                saveStateToUndoStack(elements);
                const updatedElements = elements.map(el =>
                    el.id === selectedElement
                        ? { ...el, content: elementRefs.current[el.id]?.innerHTML }
                        : el
                );
                setElements(updatedElements);
            }
        };

        try {
            // Case 1: selected text matches a full <span>
            if (parentNode.tagName === 'SPAN' && parentNode.innerText.trim() === selectedText) {
                applyFontToSpans(parentNode);
                applyFontFamily(parentNode);
                updateUndoState();
                return;
            }

            // Case 2: check for <li> in selected contents
            const contents = range.extractContents();
            let hasLI = false;

            const applyToListItems = (node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.tagName === 'LI') {
                        hasLI = true;
                        applyFontFamily(node);
                    }
                    node.childNodes.forEach(applyToListItems);
                }
            };

            contents.childNodes.forEach(applyToListItems);

            if (hasLI) {
                range.deleteContents();
                range.insertNode(contents);
                selection.removeAllRanges();
                selection.addRange(range);

                const listContainer = parentNode.closest('ul, ol');
                if (listContainer) removeEmptyListItems(listContainer);
            } else {
                // Case 3: wrap selection in styled <span>
                const span = document.createElement("span");
                span.style.fontFamily = font.value;

                const applyFontToChildren = (node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        node.style.fontFamily = font.value;
                        node.childNodes.forEach(applyFontToChildren);
                    }
                };

                contents.childNodes.forEach(applyFontToChildren);
                span.appendChild(contents);
                range.deleteContents();
                range.insertNode(span);
                selection.removeAllRanges();
                const newRange = document.createRange();
                newRange.selectNodeContents(span);
                selection.addRange(newRange);
            }

            updateUndoState();
        } catch (error) {
            console.error("Error applying font:", error);
            showToast({ message: "Error applying the font. Ensure the selection is valid." });
        }
    };


    // Applying the fontsize to the selected range functionality

    const handleFontSizeChange = (size) => {
        const selection = window.getSelection();
        const range = selection?.rangeCount > 0 ? selection.getRangeAt(0) : null;

        if (!range || selection.collapsed) {
            showToast({ message: "No text selected to apply the font size." });
            return;
        }

        const selectedText = selection.toString().trim();
        const parentNode = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
            ? range.commonAncestorContainer.parentNode
            : range.commonAncestorContainer;

        const applyStyles = (el) => {
            el.style.fontSize = `${size}px`;
            if (size > 25) {
                el.style.lineHeight = "1";
            } else {
                el.style.removeProperty("line-height");
            }
        };

        const applyFontSizeToSpans = (node) => {
            node.childNodes.forEach(child => {
                if (child.nodeType === Node.ELEMENT_NODE && child.tagName === 'SPAN') {
                    child.style.fontSize = `${size}px`;
                    applyFontSizeToSpans(child);
                }
            });
        };

        const updateUndoState = () => {
            if (selectedElement) {
                saveStateToUndoStack(elements);
                const updatedElements = elements.map(el =>
                    el.id === selectedElement
                        ? { ...el, content: elementRefs.current[el.id]?.innerHTML }
                        : el
                );
                setElements(updatedElements);
            }
        };

        try {
            // Case 1: Selected text exactly matches a <span>
            if (parentNode.tagName === 'SPAN' && parentNode.innerText.trim() === selectedText) {
                applyFontSizeToSpans(parentNode);
                applyStyles(parentNode);
                updateUndoState();
                return;
            }

            // Case 2: Check for LI elements
            const contents = range.extractContents();
            let hasLI = false;

            const applyToListItems = (node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.tagName === 'LI') {
                        hasLI = true;
                        applyStyles(node);
                    }
                    node.childNodes.forEach(applyToListItems);
                }
            };

            contents.childNodes.forEach(applyToListItems);

            if (hasLI) {
                range.deleteContents();
                range.insertNode(contents);
                selection.removeAllRanges();
                selection.addRange(range);

                const listContainer = parentNode.closest('ul, ol');
                if (listContainer) removeEmptyListItems(listContainer);
            } else {
                // Case 3: No <li>, wrap in styled span
                const span = document.createElement("span");
                span.style.fontSize = `${size}px`;

                const applyFontSizeToChildren = (node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        node.style.fontSize = `${size}px`;
                        node.childNodes.forEach(applyFontSizeToChildren);
                    }
                };

                contents.childNodes.forEach(applyFontSizeToChildren);
                span.appendChild(contents);
                range.deleteContents();
                range.insertNode(span);
                selection.removeAllRanges();
                const newRange = document.createRange();
                newRange.selectNodeContents(span);
                selection.addRange(newRange);
            }

            updateUndoState();
        } catch (error) {
            console.error("Error applying font size to selected text:", error);
            showToast({ message: "Error applying the font size. Ensure the selection is valid." });
        }
    };




    // Applying the Color to the selected range functionality

    const toggleColorPicker = () => {
        setShowLetterSpacingDropdown(false)
        setShowLineSpacingDropdown(false)
        setColorPickerVisible(!colorPickerVisible);
        setIsAlignMentOpen(false);
        setListTypeOpen(false);
    };

    const handleStyleChange = (property, value) => {
        const selection = window.getSelection();
        const range = selection?.rangeCount > 0 ? selection.getRangeAt(0) : null;

        if (!range || range.collapsed) {
            showToast({ message: "No text selected to apply the style." });
            return;
        }

        try {
            const parentNode = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
                ? range.commonAncestorContainer.parentNode
                : range.commonAncestorContainer;

            const selectedText = range.toString().trim();
            const contents = range.extractContents();
            let hasLI = false;

            // Detect <li> tags and apply style directly if found
            const detectAndApplyStyleToLIs = (node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.tagName === 'LI') {
                        hasLI = true;
                        node.style[property] = value;
                    }
                    node.childNodes.forEach(detectAndApplyStyleToLIs);
                }
            };

            contents.childNodes.forEach(detectAndApplyStyleToLIs);

            if (hasLI) {
                // If selection contains <li>, apply styles and reinsert as-is
                range.deleteContents();
                range.insertNode(contents);
                selection.removeAllRanges();
                selection.addRange(range);

                const listContainer = parentNode.closest('ul, ol');
                if (listContainer) removeEmptyListItems(listContainer);
            } else {
                // Otherwise, wrap in a styled <span>
                const focusNode = selection.focusNode;
                const focusOffset = selection.focusOffset;
                const span = document.createElement("span");
                span.style[property] = value;

                // Apply style to all child elements recursively
                const applyStyleRecursively = (node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        node.style[property] = value;
                        node.childNodes.forEach(applyStyleRecursively);
                    }
                };

                contents.childNodes.forEach(applyStyleRecursively);
                span.appendChild(contents);

                range.deleteContents();
                range.insertNode(span);

                // Move caret after inserted content (your logic)
                const newRange = document.createRange();
                if (focusNode.nodeType === Node.TEXT_NODE) {
                    newRange.setStart(focusNode, Math.min(focusOffset, focusNode.length));
                } else {
                    newRange.setStartAfter(span);
                }
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
            }

            // Save to undo stack and update state
            if (selectedElement) {
                saveStateToUndoStack(elements);
                const updatedElements = elements.map((el) =>
                    el.id === selectedElement
                        ? {
                            ...el,
                            content: elementRefs.current[el.id]?.innerHTML,
                        }
                        : el
                );
                setElements(updatedElements);
            }

        } catch (error) {
            console.error(`Error applying ${property} to selected text:`, error);
            showToast({ message: `Error applying ${property}. Ensure the selection is valid.` });
        }
    };


    const handleColorChange = (color) => {
        console.log("Selected:", selectedElement);
        settextColor(color.hex)
        if (!selectedElement) return;

        const element = elements.find(el => el.id === selectedElement);
        if (!element) return;

        saveStateToUndoStack(elements);

        // Update shape type
        if (element.type === 'shape') {
            let updatedContent = element.content;

            // Replace background-color if present
            updatedContent = updatedContent.replace(
                /background-color\s*:\s*[^;"]+/g,
                `background-color: ${color.hex}`
            );

            // Replace border color if present
            updatedContent = updatedContent.replace(
                /border\s*:\s*([\d\w\s]+?)\s+(solid|dashed|dotted|double|groove|ridge|inset|outset)\s*[^;"]+/gi,
                (match, width, style) => `border: ${width} ${style} ${color.hex}`
            );

            // Replace text color if present
            updatedContent = updatedContent.replace(
                /color\s*:\s*[^;"]+/g,
                `color: ${color.hex}`
            );

            const updatedElement = {
                ...element,
                content: updatedContent,
                shapeColor: color.hex,
            };

            setElements(prevElements =>
                prevElements.map(el => el.id === selectedElement ? updatedElement : el)
            );
        }

        // Update non-shape type (e.g., text)
        else {
            const updatedElements = elements.map(el =>
                el.id === selectedElement ? { ...el, textColor: color.hex } : el
            );
            setElements(updatedElements);
            handleStyleChange("color", color.hex);
        }
    };

    //Applying the List functionality 

    const toggleList = () => {
        setShowLetterSpacingDropdown(false)
        setShowLineSpacingDropdown(false)
        setColorPickerVisible(false);
        setIsAlignMentOpen(false);
        setListTypeOpen(!isListTypeOpen);
    };

    const selectedListIconComponent =
        listOptions.find(option => option.value === listType)?.icon || MdFormatListBulleted;


    const handleListSelect = (alignment) => {

        handleListTypeChange(alignment);
        setListTypeOpen(false);
    };

    const handleListTypeChange = (listType) => {

        const selection = window.getSelection();
        const range = selection?.rangeCount > 0 ? selection.getRangeAt(0) : null;
        if (!range || range.collapsed) {
            showToast({ message: "No text selected to apply the color." });
            return;
        }

        try {
            const listElement = document.createElement(listType === 'ordered' ? 'ol' : 'ul');
            const contents = range.extractContents();
            // Function to recursively wrap child nodes in the list
            const wrapInList = (node) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const listItem = document.createElement('li');
                    listItem.textContent = node.textContent; // Wrap text nodes in <li>
                    listElement.appendChild(listItem);
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    const listItem = document.createElement('li');
                    listItem.appendChild(node.cloneNode(true)); // Wrap element nodes in <li>
                    listElement.appendChild(listItem);
                }
            };

            contents.childNodes.forEach(wrapInList);
            range.insertNode(listElement);
            removeEmptyListItems(listElement);
            selection.removeAllRanges();
            selection.addRange(range);

            if (selectedElement) {
                saveStateToUndoStack(elements);
                const updatedElements = elements.map((el) =>
                    el.id === selectedElement
                        ? {
                            ...el,
                            content: elementRefs.current[el.id]?.innerHTML,
                        }
                        : el
                );
                setElements(updatedElements);
            }

        } catch (error) {
            showToast({ message: "Error applying list type. Ensure the selection is valid." });
        }
    };

    // Applying the Alignment to the selected range functionality

    const toggleAlignMent = () => {
        setShowLetterSpacingDropdown(false)
        setShowLineSpacingDropdown(false)
        setColorPickerVisible(false);
        setIsAlignMentOpen(!isAlignMentOpen);
        setListTypeOpen(false);
    };

    const selectedIcon =
        alignmentOptions.find(option => option.value === textAlignment)?.icon ||
        <AiOutlineAlignLeft />;

    const handleAlignSelect = (alignment) => {
        handleAlignmentChange(alignment);
        setIsAlignMentOpen(false);
    };

    const handleAlignmentChange = (alignment) => {
        const selection = window.getSelection();
        const range = selection?.rangeCount > 0 ? selection.getRangeAt(0) : null;

        if (!range || range.collapsed) {
            showToast({ message: "No text selected to apply the alignment." });
            return;
        }

        try {
            const parentNode = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
                ? range.commonAncestorContainer.parentNode
                : range.commonAncestorContainer;

            // Check if selection is inside a <ul> or <ol>
            const listContainer = parentNode.closest('ul, ol');
            if (listContainer) {
                listContainer.style.textAlign = alignment;
            } else {
                // Otherwise, wrap selection in a <div> with text-align
                const contents = range.extractContents();
                const wrapper = document.createElement("div");
                wrapper.style.textAlign = alignment;

                // Optional: clean up existing alignment inside children
                const updateAlignmentRecursively = (node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.style) node.style.textAlign = alignment;
                        node.childNodes.forEach(updateAlignmentRecursively);
                    }
                };
                contents.childNodes.forEach(updateAlignmentRecursively);

                wrapper.appendChild(contents);
                range.deleteContents();
                range.insertNode(wrapper);

                // Update selection to the newly inserted wrapper
                selection.removeAllRanges();
                const newRange = document.createRange();
                newRange.selectNodeContents(wrapper);
                selection.addRange(newRange);
            }

            // Save undo state
            if (selectedElement) {
                saveStateToUndoStack(elements);
                const updatedElements = elements.map((el) =>
                    el.id === selectedElement
                        ? {
                            ...el,
                            content: elementRefs.current[el.id]?.innerHTML,
                        }
                        : el
                );
                setElements(updatedElements);
            }
        } catch (error) {
            console.error("Error applying alignment to selected text:", error);
            showToast({ message: "Error applying alignment. Ensure the selection is valid." });
        }
    };


    // Line and Letter Spacing Dropdown fucntionality

    const [showLineSpacingDropdown, setShowLineSpacingDropdown] = useState(false);
    const [showLetterSpacingDropdown, setShowLetterSpacingDropdown] = useState(false);
    const [lineSpacing, setLineSpacing] = useState(1);
    const [letterSpacing, setLetterSpacing] = useState(0);

    const handleLineSpacingIconClick = () => {
        setShowLineSpacingDropdown(prev => !prev);
        setShowLetterSpacingDropdown(false); // Always close the other
        setColorPickerVisible(false)
        setIsAlignMentOpen(false);
        setListTypeOpen(false);
    };

    const handleLetterSpacingIconClick = () => {
        setColorPickerVisible(false)
        setShowLineSpacingDropdown(false)
        setShowLetterSpacingDropdown(!showLetterSpacingDropdown); // Toggle dropdown visibility
        setIsAlignMentOpen(false);
        setListTypeOpen(false);
    };


    // Applying the LineSpacing(Line-Height) to the selected range functionality
    const handleLineSpacingChange = (value) => {

        setShowLineSpacingDropdown(false);

        if (selectedElement) {
            saveStateToUndoStack(elements);
            const numericValue = typeof value === 'string' && !isNaN(value) ? parseFloat(value) : value;
            saveSelection();
            // Convert the value to a number if it's a numeric string
            const updatedElements = elements.map(el =>
                el.id === selectedElement ? { ...el, LineSpacing: numericValue } : el
            );
            setElements(updatedElements);

            setLineSpacing(numericValue);
            handleLineSpacing(numericValue);

        }
    };
    const handleLineSpacing = (value) => {
        const selection = window.getSelection();
        const range = selection?.rangeCount > 0 ? selection.getRangeAt(0) : null;

        if (!range || selection.collapsed) {
            showToast({ message: "No text selected to apply the line spacing." });
            return;
        }

        try {
            const parentNode = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
                ? range.commonAncestorContainer.parentNode
                : range.commonAncestorContainer;

            const selectedText = range.toString().trim();

            // Check if selection is inside a <ul> or <ol>
            const listContainer = parentNode.closest('ul, ol');
            if (listContainer) {
                listContainer.style.lineHeight = `${value}`;
            } else {
                // Otherwise, wrap selection in a <div> with line-height
                const contents = range.extractContents();
                const wrapper = document.createElement("div");
                wrapper.style.lineHeight = `${value}`;
                wrapper.appendChild(contents);
                range.deleteContents();
                range.insertNode(wrapper);
                selection.removeAllRanges();
                selection.selectAllChildren(wrapper);
            }

            // Save undo state if selection is valid
            if (selectedElement) {
                saveStateToUndoStack(elements);
                const updatedElements = elements.map((el) =>
                    el.id === selectedElement
                        ? {
                            ...el,
                            content: elementRefs.current[el.id]?.innerHTML,
                        }
                        : el
                );
                setElements(updatedElements);
            }
        } catch (error) {
            console.error("Error applying line height to selected text:", error);
            showToast({ message: "Error applying the line height. Ensure the selection is valid." });
        }
    };
    // Applying the LetterSpacing to the selected range functionality

    const handleLetterSpacingChange = (value) => {
        setShowLetterSpacingDropdown(false);

        if (selectedElement) {
            saveStateToUndoStack(elements);
            const updatedElements = elements.map(el =>
                el.id === selectedElement ? { ...el, letterSpacing: value } : el
            );
            setElements(updatedElements);
            setLetterSpacing(value);
            handleLetterSpacing(value);
        }
    };


    const handleLetterSpacing = (value) => {
        const selection = window.getSelection();
        const range = selection?.rangeCount > 0 ? selection.getRangeAt(0) : null;
        if (!range || range.collapsed) {
            showToast({ message: "No text selected to apply the letterspacing." });
            return;
        }
        try {
            const focusNode = selection.focusNode;
            const focusOffset = selection.focusOffset;
            const span = document.createElement("span");
            span.style.letterSpacing = `${value}px`;

            const contents = range.extractContents();
            span.appendChild(contents);
            range.insertNode(span);

            // Restore Cursor Position
            const newRange = document.createRange();
            newRange.setStart(focusNode, Math.min(focusOffset, focusNode.length));
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);

            // Update state
            if (selectedElement) {
                saveStateToUndoStack(elements);
                const updatedElements = elements.map((el) =>
                    el.id === selectedElement
                        ? {
                            ...el,
                            content: elementRefs.current[el.id]?.innerHTML,
                        }
                        : el
                );
                setElements(updatedElements);
            }
        } catch (error) {
            console.error("Error applying letter spacing:", error);
            showToast({ message: "Error applying letter spacing. Ensure the selection is valid." });
        }
    };

    //Undo and Redo functionality of elements in the editor.

    const handleUndo = () => {
        if (undoStack.length > 0) {
            const previousState = undoStack.pop();
            setRedoStack([...redoStack, elements]);
            setUndoStack([...undoStack]);
            setElements(previousState);

        }
    };

    const handleRedo = () => {
        if (redoStack.length > 0) {
            const nextState = redoStack.pop();
            setUndoStack([...undoStack, elements]);
            setRedoStack([...redoStack]);
            setElements(nextState);
        }
    };

    const saveStateToUndoStack = (newElements) => {
        setUndoStack([...undoStack, elements]);
        setRedoStack([]); // Clear redo stack on a new change
        setElements(newElements);

    };

    //Element Dragging functionality

    const handleDragStop = (id, newX, newY) => {
        setElements((prevElements) => {
            const updatedElements = prevElements.map((el) =>
                el.id === id ? { ...el, x: newX, y: newY } : el
            );
            saveStateToUndoStack(updatedElements);
            return updatedElements;
        });
    };

    // Element Resizing functionality

    const handleResizeStop = (id, newWidth, newHeight, newX = null, newY = null) => {
        const updatedElements = elements.map((el) => {
            if (el.id === id) {
                return {
                    ...el,
                    width: newWidth,
                    height: newHeight,
                    x: newX !== null ? newX : el.x,
                    y: newY !== null ? newY : el.y,
                };
            }
            return el;
        });

        setElements(updatedElements);
        saveStateToUndoStack(updatedElements);
    };

    //converting the Inches to pixels

    const inchesToPixels = (inches) => {
        return inches * 96;  // 96 pixels per inch
    };

    //converting the Pixels to inches

    const PixelsToInches = (pixels) => {
        return pixels / 96;
    }
    const EnvelopeCustomAdd = async (elements, shouldCloseEditor = true) => {
        const customSectionId = localStorage.getItem('email');
        const requestData = {
            envelopeId,
            customSectionUpdatedTimeStamp: new Date().toISOString(),
            customSectionAddedBy: customSectionId,
            customElements: elements,
            pdfCustomElements: '',
        };

        try {
            const envelopeGroupDS = new EnvelopeGroupListDS(
                (response) => handleSuccess(response, shouldCloseEditor),
                handleFailure
            );
            envelopeGroupDS.envelopeElementsADD(requestData);
        } catch (error) {
            console.error("Failed to add custom envelope elements:", error);
        }
    };


    const handleSuccess = (response, shouldCloseEditor) => {
        stopHudRotation();
        setLoading(false);
        if (isFullscreen) toggleFullscreen();
        if (shouldCloseEditor) onClose();
        setEnvelopeData(response);
    };

    const handleFailure = (error) => {
        stopHudRotation();
        setLoading(false);
        showAlert(error, [{ label: 'Ok', color: "#09c", onClick: () => { } }]);
    };


    const captureEnvelope = async (pageNumber) => {

        setIsCapturing(true);

        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                const envelopeElement = document.querySelector('.envelope');

                if (!envelopeElement) {
                    console.error('Envelope element not found');
                    setIsCapturing(false);
                    reject('Envelope element not found');
                    return;
                }

                const clonedEnvelope = envelopeElement.cloneNode(true);
                clonedEnvelope.querySelectorAll('[data-ignore="true"]').forEach(el => el.remove());

                let envelopeContent;

                if (page === 3) {
                    const draggableElements = new Set();

                    clonedEnvelope.querySelectorAll('.envelope-1, .envelope-2').forEach(wrapper => {
                        const draggables = wrapper.querySelectorAll('.react-draggable, .react-draggable.react-draggable-dragged');

                        draggables.forEach(draggable => {
                            const containsStrong = draggable.querySelector('strong') !== null;
                            if (containsStrong) {
                                draggable.remove(); // Optional: also remove it from the DOM
                                return;
                            }

                            // Append z-index: 999 to existing inline style
                            const currentStyle = draggable.getAttribute('style') || '';
                            const updatedStyle = currentStyle.includes('z-index')
                                ? currentStyle.replace(/z-index\s*:\s*\d+;?/i, 'z-index: 999;')
                                : currentStyle.trim().endsWith(';') || currentStyle === ''
                                    ? currentStyle + ' z-index: 999;'
                                    : currentStyle + '; z-index: 999;';

                            draggable.setAttribute('style', updatedStyle);

                            // Now get updated HTML
                            draggableElements.add(draggable.outerHTML);
                        });

                        wrapper.remove();
                    });

                    // Now create final HTML string from unique elements
                    envelopeContent = Array.from(draggableElements).join('\n');
                }
                else {
                    // Reset styles for non-page-3 logic
                    clonedEnvelope.querySelectorAll('.envelope-1').forEach(el => {
                        const { width, height, position } = el.style;
                        el.removeAttribute('style');
                        Object.assign(el.style, { width, height, position });
                    });

                    clonedEnvelope.querySelectorAll('.envelope-2').forEach(el => {
                        const { width, height, top, left, background, position } = el.style;
                        el.removeAttribute('style');
                        Object.assign(el.style, { width, height, top, left, position, background });
                    });

                    envelopeContent = clonedEnvelope.innerHTML;
                }

                // Wrap with full HTML only if NOT page 3
                const textFileContent =
                    page === 3
                        ? envelopeContent
                        : `
    <!DOCTYPE html>
    <html >
    <head>
    <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&family=Lato:wght@400;700&family=Montserrat:wght@400;700&family=Poppins:wght@400;700&family=Raleway:wght@400;700&family=Nunito:wght@400;700&family=Quicksand:wght@400;700&family=Source+Sans+Pro:wght@400;700&family=Ubuntu:wght@400;700&family=Garamond:wght@400;700&family=Noto+Sans+KR:wght@400;700&display=swap" rel="stylesheet">
    </head>
    <body>
      ${envelopeContent}
    </body>
    </html>`;

                const blob = new Blob([textFileContent], { type: 'text/plain' });
                const arrayBuffer = await blobToArrayBuffer(blob);

                const s3Key = `Clients/${ClientId}/Content/${title}_Page${pageNumber}.txt`;

                const params = {
                    Bucket: process.env.REACT_APP_S3_BUCKET_NAME,
                    Key: s3Key,
                    Body: arrayBuffer,
                    ContentType: 'text/plain',
                };

                console.log("Textfile:", textFileContent);
                console.log("s3key:", s3Key);

                try {
                    await s3.putObject(params).promise();
                    setS3keypath(s3Key);
                    resolve(s3Key);
                } catch (error) {
                    console.error('Error uploading file to S3', error);
                    reject(error);
                }

                setIsCapturing(false);
            }, 0);
        });
    };


    // Assuming currentPageIndex is a React state variable with its setter setCurrentPageIndex
    const navigateToPage = (pageIndex) => {
        // Update the current page index to navigate to the specified page
        setCurrentPageIndex(pageIndex);
        stopHudRotation();
    };

    // const saveEnvelope = async () => {
    //     const pageIndex = currentPageIndex;
    //     const currentPage = pageDataArray[pageIndex];

    //     const shouldReset = !pageDataArray.length || !currentPage;
    //     const pageNumber = shouldReset ? 1 : currentPage.pageNumber;
    //     console.log("page:", pageNumber);

    //     const newPageData = await saveImagesInS3(pageNumber);

    //     if (!newPageData) {
    //         console.error('Failed to save the page data.');
    //         return;
    //     }

    //     let updatedArray;

    //     if (shouldReset) {
    //         updatedArray = [
    //             {
    //                 pageNumber,
    //                 [`customelements${pageNumber}`]: newPageData[`customelements${pageNumber}`],
    //                 s3keyinfo: newPageData.s3keyinfo,
    //             },
    //         ];
    //     } else {
    //         const existingElements = currentPage[`customelements${pageNumber}`]?.elements || [];
    //         const newElements = newPageData[`customelements${pageNumber}`]?.elements || [];

    //         updatedArray = [...pageDataArray];
    //         updatedArray[pageIndex] = {
    //             ...currentPage,
    //             [`customelements${pageNumber}`]: {
    //                 elements: [
    //                     ...existingElements.filter(
    //                         (e) => !newElements.some((n) => n.id === e.id)
    //                     ),
    //                     ...newElements,
    //                 ],
    //             },
    //             s3keyinfo: newPageData.s3keyinfo,
    //         };
    //     }

    //     // Log the updated page number, elements, and S3 key info
    //     const updatedPage = updatedArray[pageIndex];
    //     console.log("Updated Page Number:", updatedPage.pageNumber);
    //     console.log("Updated Elements:", updatedPage[`customelements${pageNumber}`]?.elements);
    //     console.log("Updated S3 Key Info:", updatedPage.s3keyinfo);

    //     setPageDataArray(updatedArray);
    //     EnvelopeCustomAdd(convertPageDataArrayToInches(updatedArray));
    // };

    const saveEnvelope = async () => {
        setSelectedElement(null);
        const pageIndex = currentPageIndex;
        const currentPage = pageDataArray[pageIndex];
        console.log("MasterElements:", elements);
        const shouldReset = !pageDataArray.length || !currentPage;
        const pageNumber = shouldReset ? 1 : currentPage.pageNumber;
        console.log("page:", pageNumber);

        if (page === 3) {
            removeMasterElementsFromPageDataForPage(elements, pageIndex);
        }

        const newPageData = await saveImagesInS3(pageNumber, elements);


        if (!newPageData) {
            console.error('Failed to save the page data.');
            return;
        }

        let updatedArray;

        if (shouldReset) {
            updatedArray = [
                {
                    pageNumber,
                    [`customelements${pageNumber}`]: newPageData[`customelements${pageNumber}`],
                    s3keyinfo: newPageData.s3keyinfo,
                },
            ];
        } else {
            const existingElements = currentPage[`customelements${pageNumber}`]?.elements || [];
            const newElements = newPageData[`customelements${pageNumber}`]?.elements || [];

            updatedArray = [...pageDataArray];
            updatedArray[pageIndex] = {
                ...currentPage,
                [`customelements${pageNumber}`]: {
                    elements: [
                        ...existingElements.filter(
                            (e) => !newElements.some((n) => n.id === e.id)
                        ),
                        ...newElements,
                    ],
                },
                s3keyinfo: newPageData.s3keyinfo,
            };
        }

        // Log the updated page number, elements, and S3 key info
        const updatedPage = updatedArray[pageIndex];
        console.log("Updated Page Number:", updatedPage.pageNumber);
        console.log("Updated Elements:", updatedPage[`customelements${pageNumber}`]?.elements);
        console.log("Updated S3 Key Info:", updatedPage.s3keyinfo);

        setPageDataArray(updatedArray);

        // Check the next page index
        const nextPageIndex = pageIndex + 1;
        if (nextPageIndex < pageDataArray.length) {
            const nextPage = pageDataArray[nextPageIndex];
            if (!nextPage.s3filepath) {
                // Navigate to the next page
                navigateToPage(nextPageIndex); // Implement this function to handle navigation
            } else {
                // Directly call EnvelopeCustomAdd
                EnvelopeCustomAdd(convertPageDataArrayToInches(updatedArray));

            }
        } else {
            // If there is no next page, just call EnvelopeCustomAdd
            EnvelopeCustomAdd(convertPageDataArrayToInches(updatedArray));

        }
    };

    function removeMasterElementsFromPageDataForPage(elements, pageIndex) {
        const page = pageDataArray[pageIndex];
        const elementsKey = `customelements${page.pageNumber}`;

        const filteredElements = elements.filter(el => {
            return !MasterElements.some(masterEl => masterEl.id === el.id);
        });

        const updatedPage = {
            ...page,
            [elementsKey]: {
                ...page[elementsKey],
                elements: filteredElements,
            }
        };

        const updatedPageData = [...pageDataArray];
        updatedPageData[pageIndex] = updatedPage;

        console.log("Filtered (non-master) Elements:", filteredElements);

        setPageDataArray(updatedPageData);
    }



    function convertPageDataArrayToInches(pageDataArray) {
        return pageDataArray.map(page => {
            const pageNumber = page.pageNumber;

            // Find the dynamic key (e.g., "customelements1")
            const customKey = Object.keys(page).find(key => key.startsWith("customelements"));
            const elements = page[customKey]?.elements || [];

            const convertedElements = [];

            elements.forEach(el => {
                const isMasterElement = pageDataArray.some(page => {
                    const elementsKey = `customelements${page.pageNumber}`;
                    const elementsArray = page[elementsKey]?.elements || [];
                    return elementsArray.some(e =>
                        MasterElements.some(masterEl => masterEl.id === e.id && e.id === el.id)
                    );
                });
                if (isMasterElement) return;

                if (el.type === 'text' || el.type === 'shape') {
                    convertedElements.push({
                        id: el.id,
                        type: el.type,
                        content: el.content,
                        x: PixelsToInches(el.x).toString(),
                        y: PixelsToInches(el.y).toString(),
                        width: PixelsToInches(el.width).toString(),
                        height: PixelsToInches(el.height).toString(),
                    });
                } else if (el.type === 'image') {
                    const baseUrl = el.content.split('?')[0];
                    const urlParts = baseUrl.split('/');
                    const clientIDIndex = urlParts.indexOf('Clients') + 1;

                    if (clientIDIndex > 0 && clientIDIndex < urlParts.length - 1) {
                        const clientID = urlParts[clientIDIndex];
                        const imagePathIndex = urlParts.indexOf('photoLibrary');
                        const imagePath = imagePathIndex !== -1 ? urlParts.slice(imagePathIndex).join('/') : '';
                        const newContent = `Clients/${clientID}/${imagePath}`;

                        convertedElements.push({
                            id: el.id,
                            type: el.type,
                            content: newContent,
                            x: PixelsToInches(el.x).toString(),
                            y: PixelsToInches(el.y).toString(),
                            width: PixelsToInches(el.width).toString(),
                            height: PixelsToInches(el.height).toString(),
                        });
                    }
                }
            });

            return {
                pageNumber,
                [customKey]: {
                    elements: convertedElements
                },
                s3keyinfo: page.s3keyinfo || {}
            };
        });

    }



    async function saveImagesInS3(pageNumber) {

        hud('Please Wait...');
        const processedElements = [];

        for (let i = 0; i < elements.length; i++) {
            const el = elements[i];

            const isMasterElement = pageDataArray.some(page => {
                const elementsKey = `customelements${page.pageNumber}`;
                const elementsArray = page[elementsKey]?.elements || [];
                return elementsArray.some(e =>
                    MasterElements.some(masterEl => masterEl.id === e.id && e.id === el.id)
                );
            });

            if (isMasterElement) continue;

            if (el.type === 'text' || el.type === 'image' || el.type === 'shape') {
                processedElements.push({
                    id: el.id,
                    type: el.type,
                    content: el.content,
                    x: el.x,
                    y: el.y,
                    width: el.width,
                    height: el.height,
                });
            }
        }


        // ✅ Wait for DOM to update before capturing
        return new Promise((resolve) => {
            setTimeout(async () => {
                try {
                    const s3Key = await captureEnvelope(pageNumber);
                    if (!s3Key) {
                        console.error("S3 key path is not set. Upload may have failed.");
                        resolve(null);
                        return;
                    }

                    resolve({
                        pageNumber,
                        [`customelements${pageNumber}`]: { elements: processedElements },
                        s3keyinfo: { key: s3Key },
                    });
                } catch (error) {
                    console.error(error.message);
                    resolve(null);
                }
            }, 100); // Small delay lets DOM update
        });
    }


    const forwardPage = async () => {

        if (currentPageIndex < pageDataArray.length - 1) {
            await saveCurrentElements(); // Wait for saving before moving
            setCurrentPageIndex(prev => prev + 1);
        }
    };

    const backwardPage = async () => {
        if (currentPageIndex > 0) {
            await saveCurrentElements(); // Wait for saving before moving
            setCurrentPageIndex(prev => prev - 1);
        }
    };

    const saveCurrentElements = async () => {
        const currentIndex = currentPageIndex;
        const currentPageObj = pageDataArray[currentIndex];
        if (page === 3) {
            removeMasterElementsFromPageDataForPage(elements, currentIndex);
        }
        const pageNumber = currentPageObj?.pageNumber || currentIndex + 1;
        const key = `customelements${pageNumber}`;

        try {
            const newPageData = await saveImagesInS3(pageNumber);
            if (!newPageData) {
                console.error("❌ Failed to save the page data.");
                return;
            }

            const existingElements = currentPageObj[key]?.elements || [];
            const newElements = newPageData[key]?.elements || [];
            const mergedElements = [
                ...existingElements.filter(e => !newElements.find(n => n.id === e.id)),
                ...newElements,
            ];

            setPageDataArray(prevArray => {
                const updatedArray = [...prevArray];
                updatedArray[currentIndex] = {
                    ...currentPageObj,
                    [key]: {
                        elements: mergedElements,
                    },
                    s3keyinfo: newPageData.s3keyinfo,
                };
                return updatedArray;
            });

            stopHudRotation();
        } catch (error) {
            console.error("Error saving elements:", error);
        }
    };





    // Deleting the selected element in the editor.

    const DeleteElement = (id) => {
        const elementToDelete = elements.find(el => el.id === id);
        const envelopeString = JSON.stringify(elementToDelete);
        const sizeInBytes = new Blob([envelopeString]).size;
        const sizeInMB = sizeInBytes / (1024 * 1024);

        const updatedElements = elements.filter(el => el.id !== id);

        const confirmDeletion = () => {
            setElements(updatedElements);
            setelementsSize(updatedElements);
            setSelectedElement(null);

            // 🔁 Update pageDataArray with new elements
            setPageDataArray(prev => {
                const updatedArray = [...prev];
                const currentIndex = currentPageIndex;
                const pageNumber = updatedArray[currentIndex]?.pageNumber || currentIndex + 1;
                const key = `customelements${pageNumber}`;

                if (updatedArray[currentIndex]) {
                    updatedArray[currentIndex] = {
                        ...updatedArray[currentIndex],
                        [key]: {
                            elements: updatedElements,
                        },
                    };
                }
                return updatedArray;
            });
        };

        const cancelDeletion = () => {
            // You can also add any additional logic here if needed
        };

        if (page === 2) {
            showAlert(
                `Are you sure? Removing this element will affect all child pages linked to this master page.`,
                [
                    { label: 'Yes', color: '#09c', onClick: confirmDeletion },
                    { label: 'No', color: 'red', onClick: cancelDeletion },
                ]
            );
        } else {
            showAlert(
                `Are you sure you want to remove the element?`,
                [
                    { label: 'Yes', color: '#09c', onClick: confirmDeletion },
                    { label: 'No', color: 'red', onClick: cancelDeletion },
                ]
            );
        }
    };


    //Cloning the Element function
    //OnClick the icon clone ,CloneElement function is calling

    const CloneElement = (id) => {
        showAlert(`Are you sure you want to clone the element?`, [
            {
                label: 'Yes',
                color: "#09c",
                onClick: () => {
                    CreateClone(id);
                }
            },
            {
                label: 'No',
                color: 'red',
                onClick: () => {
                }
            }
        ]);
    }

    // Create Clone function
    //OnClick the yes create clone function is calling.

    const CreateClone = (id) => {
        const elementToClone = elements.find((element) => element.id === id);
        if (elementToClone) {
            const clonedElement = {
                ...elementToClone,
                id: Date.now(),
                x: elementToClone.x - 30,
                y: elementToClone.y + 20,
            };

            if (clonedElement.x < 0) {
                clonedElement.x = 50;
            }
            if (clonedElement.y < 0) {
                clonedElement.y = 50;
            }

            const updatedElements = [...elements, clonedElement];
            setElements(updatedElements);
        } else {
            showAlert(` Cloning the element Not Possible?`, [
                {
                    label: 'ok',
                    color: "#09c",
                },
            ]);
        }
    }

    //Editor closing function

    const closeEditor = () => {
        let pageDataChanged = false;
        if (!isPreview) {
            pageDataChanged = JSON.stringify(customElements.length) !== JSON.stringify(pageDataArray.length);
        }

        const elementsChanged = prevElements !== elements;

        const hasChanges = pageDataChanged || elementsChanged;

        if (!isPreview) {
            if (hasChanges) {
                showAlert('You have unsaved changes in your envelope or letter. Would you like to save them before closing?', [
                    {
                        label: 'Yes',
                        color: "#09c",
                        onClick: async () => {
                            if (isFullscreen) {
                                toggleFullscreen();
                            }

                            saveEnvelope();
                        }
                    },
                    {
                        label: 'No',
                        color: 'red',
                        onClick: () => {
                            if (isFullscreen) {
                                toggleFullscreen();
                            }
                            console.log("PageDataArray:", customElements)
                            EnvelopeCustomAdd(convertPageDataArrayToInches(customElements));

                            onClose(); // Close the editor without saving current elements
                        }
                    }
                ]);
            } else {
                if (isFullscreen) {
                    toggleFullscreen();
                }
                onClose(); // Close editor directly if no changes exist
            }
        } else {
            if (isFullscreen) {
                toggleFullscreen();
            }
            onClose(); // Close editor in preview mode directly
        }
    };

    const addPage = () => {
        showAlert('Do you want to save the current page before adding new?', [
            {
                label: 'Yes',
                color: "#09c",
                onClick: async () => {
                    setPageDataArray(prevArray => {
                        const updatedArray = [...prevArray];

                        const currentIndex = currentPageIndex;
                        const currentPage = updatedArray[currentIndex];
                        const currentPageNumber = currentPage.pageNumber;

                        const customelementsKey = Object.keys(currentPage).find(k => k.startsWith('customelements'));
                        if (customelementsKey) {
                            updatedArray[currentIndex][customelementsKey] = {
                                elements: [...elements]
                            };
                        }

                        return updatedArray;
                    });

                    // Save current page to S3
                    const savedResult = await saveImagesInS3(currentPageIndex + 1);

                    setPageDataArray(prevArray => {
                        const updatedArray = [...prevArray];

                        // Update S3 info for current page
                        updatedArray[currentPageIndex].s3keyinfo = savedResult.s3keyinfo;

                        // Clone matching elements for the new page
                        const masterElementsForNextPage = MasterElements.filter(masterEl =>
                            elements.some(el => el.id === masterEl.id)
                        );

                        const newPageNumber = prevArray.length + 1;
                        const newPage = {
                            pageNumber: newPageNumber,
                            [`customelements${newPageNumber}`]: {
                                elements: [...masterElementsForNextPage]
                            },
                            s3keyinfo: {}
                        };

                        updatedArray.push(newPage);
                        EnvelopeCustomAdd(convertPageDataArrayToInches(updatedArray), false);
                        reloadEnvelopeGroups();
                        setCurrentPageIndex(updatedArray.length - 1);

                        return updatedArray;
                    });
                }
            },
            {
                label: 'No',
                color: 'red',
                onClick: () => { }
            }
        ]);
    };


    const removeCurrentPage = () => {
        showAlert('Are you sure you want to delete this Page?', [
            {
                label: 'Yes',
                color: '#09c',
                onClick: () => {
                    if (((page === 1 && pageDataArray.length > 1) || (currentPageIndex > 0))) {
                        setPageDataArray(prevArray => {
                            const updatedArray = [...prevArray];
                            updatedArray.splice(currentPageIndex, 1);

                            const newArray = updatedArray.map((page, index) => {
                                // Find the old customelements key
                                const oldKey = Object.keys(page).find(k => k.startsWith('customelements'));

                                // Create the new key based on new index
                                const newKey = `customelements${index + 1}`;

                                // Build new page object with updated key and pageNumber
                                return {
                                    pageNumber: index + 1,
                                    s3keyinfo: page.s3keyinfo,
                                    [newKey]: {
                                        ...page[oldKey],
                                        elements: Array.isArray(page[oldKey]?.elements)
                                            ? [...page[oldKey].elements]
                                            : []
                                    }
                                };
                            });

                            return newArray;
                        });

                        setCurrentPageIndex(prev => Math.max(prev - 1, 0));
                    }
                }
            },
            {
                label: 'No',
                color: 'red',
                onClick: () => { }
            }
        ]);
    };


    const reloadEnvelopeGroups = async () => {
        setLoading(true);
        await getGroupSections();
        setLoading(false);
    };

    return (
        <div className={`modal-overlay ${isFullscreen ? 'fullscreen-overlay' : ''}`}>
            <div className={`modal-content-editor ${isFullscreen ? 'fullscreen-modal' : ''}`}>
                <div className="modal-header">
                    <h4>{title}</h4>
                    <div className="modal-header-controls">
                        {isFullscreen ? (
                            // <MdZoomInMap size={24} style={{ cursor: 'pointer' }} onClick={toggleFullscreen} />
                            <img
                                src="/expand.png"
                                alt="ExpandPage"
                                onClick={toggleFullscreen}
                                style={{ cursor: 'pointer', height: '20px' }}
                            />
                        ) : (
                            // <MdZoomOutMap size={24} style={{ cursor: 'pointer' }} onClick={toggleFullscreen} />
                            <img
                                src="/expand.png"
                                alt="CollapsePage"
                                onClick={toggleFullscreen}
                                style={{ cursor: 'pointer', height: '20px' }}
                            />
                        )}
                        <MdCancel size={24} style={{ cursor: 'pointer', marginRight: `${isFullscreen ? '20px' : "0px"}` }} onClick={closeEditor} />
                    </div>
                </div>

                <div className='editor-div'>
                    {!isPreview &&
                        (
                            <div className='Editor-main'>
                                <div className='Buttons-div'>
                                    {page !== 2 && (
                                        <img
                                            src="/addpageicon.webp"
                                            alt="Add Page"
                                            onClick={addPage}
                                            style={{ cursor: 'pointer', height: '30px' }}
                                        />
                                    )}
                                    {((page === 1 && pageDataArray.length > 1) || (currentPageIndex > 0)) && (
                                        <img
                                            src="/removepage.webp"
                                            alt="Remove Page"
                                            onClick={removeCurrentPage}
                                            style={{ cursor: 'pointer', height: '28px' }}
                                        />
                                    )}
                                    <PiTextTBold onClick={addText} size={20} />
                                    <FaRegFileImage size={20} onClick={triggerFileInput} />
                                </div>
                                <div className="editor-control-fields">
                                    {/* Bold, Italic, Underline, Text Color */}

                                    {/* Font Family */}
                                    <div className="form-group mb-1" style={{ marginLeft: '5px', minWidth: '30%' }}>
                                        <select
                                            className="form-control"
                                            value={textFont}
                                            onChange={(e) => {
                                                const selected = fontOptions.find(opt => opt.value === e.target.value);
                                                handleFontChange(selected);
                                            }}
                                            style={{
                                                fontFamily: textFont || 'inherit',
                                                borderColor: 'black',
                                                color: selectedElement && textFont ? 'blue' : 'black',
                                                minWidth: '200px',
                                                maxWidth: '250px',
                                                borderColor: 'black',
                                                borderRadius: '4px',

                                            }}
                                        >
                                            {fontOptions.map((option) => (
                                                <option key={option.value} value={option.value} style={{ fontFamily: option.value }}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>

                                    </div>

                                    {/* Font Size */}
                                    <div className="form-group">
                                        <select
                                            className="form-control"
                                            value={textSize}
                                            onChange={(e) => handleFontSizeChange(parseInt(e.target.value, 10))}
                                            style={{
                                                width: '100px',
                                                height: '35px',
                                                marginLeft: '5px',
                                                marginTop: '-3px',
                                                borderColor: 'black',
                                                borderRadius: '4px',
                                                color: selectedElement && textSize ? 'blue' : 'black'
                                            }}
                                        >
                                            {
                                                // If the current size is not in the list, show it temporarily
                                                !fontSizeOptions.includes(textSize) && (
                                                    <option value={textSize}>{textSize}px</option>
                                                )
                                            }

                                            {
                                                fontSizeOptions.map((size) => (
                                                    <option key={size} value={size}>
                                                        {size}px
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>

                                    <div className="form-group  d-flex align-items-center">
                                        <FaShapes
                                            size={20}
                                            onClick={() => setIsShapeModalOpen(true)}
                                            style={{ marginLeft: '5px', marginRight: '5px', cursor: 'pointer' }}
                                        />
                                        <TbBold
                                            style={{ marginLeft: '5px', marginRight: '5px', cursor: 'pointer', color: selectedElement && isBold ? 'blue' : 'black', fontWeight: selectedElement && isBold ? 'bold' : 'normal' }}
                                            onClick={() => applyStyleToSelection('bold')}
                                        />
                                        <TbItalic
                                            style={{ marginLeft: '5px', marginRight: '5px', cursor: 'pointer', color: selectedElement && isItalic ? 'blue' : 'black' }}
                                            onClick={() => applyStyleToSelection('italic')}
                                        />
                                        <TbUnderline
                                            size={18}
                                            style={{ marginLeft: '5px', cursor: 'pointer', color: selectedElement && isUnderline ? 'blue' : 'black' }}
                                            onClick={() => applyStyleToSelection('underline')}
                                        />
                                    </div>

                                    <div className="form-group d-flex">
                                        <IoMdUndo
                                            onClick={handleUndo}
                                            style={{ marginLeft: '5px', marginRight: '5px', cursor: 'pointer', opacity: undoStack.length > 0 ? 1 : 0.5 }}
                                            disabled={undoStack.length === 0}
                                        />
                                        <IoMdRedo
                                            onClick={handleRedo}
                                            style={{ marginLeft: '5px', marginRight: '5px', cursor: 'pointer', opacity: redoStack.length > 0 ? 1 : 0.5 }}
                                            disabled={redoStack.length === 0}
                                        />
                                    </div>

                                    <div style={{ position: 'relative', cursor: 'pointer' }}>
                                        <div onClick={toggleList} style={{ fontSize: '24px', marginTop: '-5px' }}>
                                            {React.createElement(selectedListIconComponent)}
                                        </div>


                                        {isListTypeOpen && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: 0,
                                                    background: '#fff',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '4px',
                                                    padding: '8px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    zIndex: 1000,
                                                }}
                                            >
                                                {listOptions.map(({ value, icon: Icon }, index) => (
                                                    <div
                                                        key={index}
                                                        onClick={() => handleListSelect(value)}
                                                        style={{
                                                            margin: '5px',
                                                            cursor: 'pointer',
                                                            color: selectedElement && listType === value ? 'blue' : 'black',
                                                            fontSize: '1.5em',
                                                        }}
                                                    >
                                                        <Icon />
                                                    </div>
                                                ))}

                                            </div>
                                        )}
                                    </div>

                                    <div className="dropdown-wrapper  d-flex" style={{ position: 'relative', marginTop: "-5px" }}>
                                        <div
                                            onClick={toggleAlignMent}
                                            style={{ cursor: 'pointer', color: (selectedElement && textAlignment) ? 'blue' : 'black', fontSize: '1.5em' }}
                                        >
                                            {selectedIcon}
                                        </div>

                                        {isAlignMentOpen && (
                                            <div
                                                className="dropdown-menu"
                                                style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    backgroundColor: 'white',
                                                    border: '1px solid #ccc',
                                                    zIndex: 1000,
                                                    display: 'flex',
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    height: "40px"
                                                }}
                                            >
                                                {alignmentOptions.map((option, index) => (
                                                    <div
                                                        key={index}
                                                        onClick={() => handleAlignSelect(option.value)}
                                                        style={{
                                                            margin: '5px',
                                                            cursor: 'pointer',
                                                            color: selectedElement && textAlignment === option.value ? 'blue' : 'black',
                                                            fontSize: '1.5em',
                                                        }}
                                                    >
                                                        {option.icon}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>



                                    <div className="color-picker-container" style={{ position: 'relative' }}>
                                        <AiOutlineFontColors
                                            size={20}
                                            onClick={toggleColorPicker}
                                            style={{
                                                cursor: 'pointer',
                                                color: (selectedElement && textColor) || 'black', // Display the color of the selected element or default to black
                                            }}
                                        />
                                        {colorPickerVisible && (
                                            <div
                                                style={{ position: 'absolute', zIndex: 2, marginTop: '10px' }}
                                                onMouseDown={e => e.stopPropagation()}
                                                onTouchStart={e => e.stopPropagation()}
                                            >
                                                <SketchPicker
                                                    color={selectedElement?.textColor || textColor} // Show color of the selected element or default textColor
                                                    onChange={handleColorChange}

                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className='Line-spacing d-flex'>
                                        <ImTextHeight
                                            size={18}
                                            onClick={handleLineSpacingIconClick}
                                            style={{ cursor: 'pointer', color: selectedElement && lineSpacing ? 'blue' : 'black' }}
                                        />

                                        {showLineSpacingDropdown && (
                                            <div className='dropdown' style={{ position: 'absolute', marginTop: '25px', zIndex: 2000 }}>

                                                {[1, 1.15, 1.5, 2, 2.5, 3, '80%', '100%', '200%'].map(spacing => (
                                                    <div
                                                        key={spacing}
                                                        className={spacing === lineSpacing ? 'active' : ''}
                                                        onClick={() => handleLineSpacingChange(spacing)}
                                                    >
                                                        {spacing}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className='Letter-spacing d-flex'>
                                        <ImTextWidth
                                            size={20}
                                            onClick={handleLetterSpacingIconClick}
                                            style={{ cursor: 'pointer', color: selectedElement && letterSpacing ? 'blue' : 'black' }}
                                        />
                                        {showLetterSpacingDropdown && (
                                            <div className='dropdown' style={{ position: 'absolute', marginTop: '25px', zIndex: 2000 }}>
                                                {[0, 1, 2, 3, 4].map(spacing => (
                                                    <div key={spacing} className={spacing === letterSpacing ? 'active' : ''} onClick={() => handleLetterSpacingChange(spacing)}>
                                                        {spacing}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>


                                </div>
                            </div>
                        )}

                    {isShapeModalOpen && (
                        <div className="shape-modal-overlay" onClick={() => setIsShapeModalOpen(false)}>
                            <div className="shape-modal-container" onClick={(e) => e.stopPropagation()}>
                                <div className="shape-modal-header">
                                    <span>Select a Shape</span>
                                    <MdCancel size={20} className="shape-modal-close" onClick={() => setIsShapeModalOpen(false)} />
                                </div>
                                <div className="shape-modal-content">
                                    {Object.entries(shapeConfigs).map(([key, shape]) => (
                                        <div key={key} className="shape-box" onClick={() => {
                                            addShape(key);
                                            setIsShapeModalOpen(false);
                                        }}>
                                            {shape.icon}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className='mt-2 parent'>
                        {!loading &&
                            (<div className='envelope'>
                                {page !== 2 && !isPreview && <div className="page-navigation" data-ignore="true">
                                    <IoCaretBackSharp
                                        onClick={backwardPage}
                                        style={{ cursor: currentPageIndex === 0 ? 'not-allowed' : 'pointer', opacity: currentPageIndex === 0 ? 0.5 : 1 }}
                                    />
                                    <span style={{ margin: '0 12px' }}>
                                        Page {pageDataArray[currentPageIndex]?.pageNumber || 1} / {pageDataArray.length === 0 ? 1 : pageDataArray.length}
                                    </span>
                                    <IoCaretForwardSharp
                                        onClick={forwardPage}
                                        style={{ cursor: currentPageIndex === pageDataArray.length - 1 ? 'not-allowed' : 'pointer', opacity: (currentPageIndex === pageDataArray.length - 1 || pageDataArray.length === 0) ? 0.5 : 1 }}
                                    />
                                </div>
                                }

                                <div
                                    className='envelope-1'
                                    style={{
                                        width: `calc(${inchesToPixels(envelopeData.envelopeWidth)}px)`,
                                        height: `calc(${inchesToPixels(envelopeData.envelopeHeight)}px)`,
                                        minWidth: `calc(${inchesToPixels(envelopeData.envelopeWidth)}px)`,
                                        minHeight: `calc(${inchesToPixels(envelopeData.envelopeHeight)}px)`,
                                        border: '1px solid #ccc',
                                        boxSizing: 'border-box',
                                        backgroundImage: `
                                    linear-gradient(-45deg, black 0%, transparent 0%, transparent 50%, black 20%, black 55%, transparent 50%),
                                    linear-gradient(45deg, black 0%, transparent 0%, transparent 50%, black 20%, black 25%, transparent 50%)
                                `,
                                        backgroundSize: '10px 10px',
                                        backgroundPosition: '0 0',
                                        backgroundRepeat: "repeat",
                                        position: 'relative',
                                    }}
                                >
                                    <div
                                        className='envelope-2'
                                        style={{
                                            position: 'absolute',
                                            top: `${inchesToPixels(envelopeData.printMarginTop || '0')}px`,
                                            left: `${inchesToPixels(envelopeData.printMarginLeft || '0')}px`,
                                            width: `calc(${inchesToPixels(envelopeData.envelopeWidth)}px - ${inchesToPixels(envelopeData.printMarginLeft || '0')}px - ${inchesToPixels(envelopeData.printMarginRight || '0')}px)`,
                                            height: `calc(${inchesToPixels(envelopeData.envelopeHeight)}px - ${inchesToPixels(envelopeData.printMarginTop || '0')}px - ${inchesToPixels(envelopeData.printMarginBottom || '0')}px)`,
                                            border: '1px solid black',
                                            boxSizing: 'border-box',
                                            background: `${envelopeData.envelopeColorText}`,
                                            // overflow: 'hidden'
                                        }}

                                    >
                                        {envelopeData.Sections && envelopeData.Sections.length > 0 && (
                                            envelopeData.Sections.map((section) => (
                                                <Rnd

                                                    key={section.sectionTitle}
                                                    default={{
                                                        x: inchesToPixels(section.sectionX) - inchesToPixels(envelopeData.printMarginLeft || '0'),
                                                        y: inchesToPixels(section.sectionY) - inchesToPixels(envelopeData.printMarginTop || '0'),
                                                        width: inchesToPixels(section.sectionWidth),
                                                        height: inchesToPixels(section.sectionHeight),
                                                    }}
                                                    style={{
                                                        backgroundColor: section.sectionColor,
                                                        opacity: section.sectionTransparency,
                                                        border: '1px solid black',
                                                        boxSizing: 'border-box',
                                                        borderRadius: section.sectionType === 'window' ? '10px' : '0px',
                                                    }}
                                                    disableDragging={true}
                                                    enableResizing={false}
                                                    bounds="parent"
                                                // data-ignore="true"
                                                >
                                                    <div style={{ padding: '5px', color: '#000' }}>
                                                        <strong>{section.sectionTitle}</strong>
                                                        <p>{section.sectionDetailText}</p>
                                                    </div>
                                                </Rnd>
                                            ))
                                        )}
                                        {/* {!currentPageIndex > 0 && <div
                                        data-ignore="true"
                                        style={{
                                            position: 'absolute',
                                            top: 20,
                                            right: 20,
                                            width: '100px',
                                            height: '100px',
                                            border: '1px solid black',
                                            backgroundColor: 'transparent',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            padding: '5px',
                                        }}
                                    >
                                        <span style={{ fontSize: '8pt', fontFamily: 'Times New Roman' }}>
                                            STAMP <br />OR <br /> INDICIA
                                        </span>
                                    </div>} */}


                                        <div
                                            ref={containerRef}
                                            style={{ width: '100%', height: '100%', overflow: "hidden" }}
                                            className='Parent_Child'
                                        >
                                            {elements.map((el) => {
                                                const isMasterElement = pageDataArray.some(page => {
                                                    const elementsKey = `customelements${page.pageNumber}`;
                                                    const elementsArray = page[elementsKey]?.elements || [];
                                                    return elementsArray.some(e =>
                                                        MasterElements.some(masterEl => masterEl.id === e.id && e.id === el.id)
                                                    );
                                                });
                                                const isElementInsideAnother = (draggedElement, targetElement) => {
                                                    const draggedRect = draggedElement.getBoundingClientRect();
                                                    const targetRect = targetElement.getBoundingClientRect();
                                                    return (
                                                        draggedRect.top >= targetRect.top &&
                                                        draggedRect.left >= targetRect.left &&
                                                        draggedRect.bottom <= targetRect.bottom &&
                                                        draggedRect.right <= targetRect.right
                                                    );
                                                };
                                                return (
                                                    <React.Fragment >
                                                        <Rnd
                                                            key={`${el.id}-${el.x}-${el.y}`}
                                                            position={{ x: el.x, y: el.y }}
                                                            size={{ width: el.width, height: el.height }}
                                                            style={{
                                                                border: !isCapturing && (el.id === selectedElement || (isAddedElements && el.id === newElementId))
                                                                    ? '2px dashed #ccc'
                                                                    : 'none',
                                                                borderRadius: '3px',
                                                                padding: '0px',
                                                                boxSizing: 'border-box',
                                                                cursor: isMasterElement ? 'not-allowed' : (dragEnabled ? 'move' : 'text')
                                                            }}
                                                            bounds="parent"
                                                            onClick={() => {
                                                                const isMasterElement = pageDataArray.some(page => {
                                                                    const elementsKey = `customelements${page.pageNumber}`;
                                                                    const elementsArray = page[elementsKey]?.elements || [];
                                                                    return elementsArray.some(e =>
                                                                        MasterElements.some(masterEl => masterEl.id === e.id && e.id === el.id)
                                                                    );
                                                                });

                                                                console.log("ele:", isMasterElement);

                                                                if (!isMasterElement) {
                                                                    setSelectedElement(el.id);
                                                                    handleSelectElement(el.id);
                                                                    setIsAddedElements(false);
                                                                } else {
                                                                    showToast({ message: "This is a master element, so you can't edit it.", position: 'center' });
                                                                }
                                                            }}


                                                            onDragStart={(e) => {
                                                                // Prevent dragging if the element is inside another element
                                                                const targetElement = document.elementFromPoint(e.clientX, e.clientY);
                                                                const draggedElement = e.target;

                                                                if (isElementInsideAnother(draggedElement, targetElement)) {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                            onDrag={(e, d) => {
                                                                setLiveDragPosition(prev => ({
                                                                    ...prev,
                                                                    [el.id]: { x: d.x, y: d.y }
                                                                }));
                                                            }}

                                                            onDragStop={(e, d) => {
                                                                handleDragStop(el.id, d.x, d.y);
                                                                setLiveDragPosition(prev => {
                                                                    const newState = { ...prev };
                                                                    delete newState[el.id];
                                                                    return newState;
                                                                });
                                                                e.preventDefault();
                                                            }}
                                                            onResizeStop={(e, direction, ref, delta, position) => {
                                                                const newWidth = ref.offsetWidth;
                                                                const newHeight = ref.offsetHeight;
                                                                const newX = position.x;
                                                                const newY = position.y;

                                                                if (el.id === selectedElement) {
                                                                    if (el.type === 'image') {
                                                                        const aspectRatio = el.width / el.height;
                                                                        let adjustedWidth = newWidth;
                                                                        let adjustedHeight = adjustedWidth / aspectRatio;

                                                                        handleResizeStop(el.id, adjustedWidth, adjustedHeight, newX, newY);

                                                                    } else {
                                                                        handleResizeStop(el.id, newWidth, newHeight, newX, newY);

                                                                    }
                                                                }
                                                            }}
                                                            enableResizing={el.id === selectedElement ? {
                                                                top: false,
                                                                right: false,
                                                                bottom: false,
                                                                left: false,
                                                                topRight: true,
                                                                bottomRight: true,
                                                                bottomLeft: true,
                                                                topLeft: true,
                                                            } : false}
                                                            disableDragging={el.id !== selectedElement || !(dragEnabled || el.type === 'image')}

                                                            lockAspectRatio={el.type === 'image'}
                                                        >
                                                            {!isPreview && el.id === selectedElement && (
                                                                <IoClose
                                                                    style={{
                                                                        position: 'absolute',
                                                                        top: '-1px',
                                                                        right: '-1px',
                                                                        border: 'none',
                                                                        borderRadius: '50%',
                                                                        fontSize: '20px',
                                                                        cursor: 'pointer',
                                                                        backgroundColor: 'transparent',
                                                                        transform: 'translate(50%, -50%)',
                                                                        color: 'Red',
                                                                        zIndex: 1,
                                                                    }}
                                                                    onClick={() => DeleteElement(el.id)}
                                                                    data-ignore="true"
                                                                />
                                                            )}
                                                            {!isPreview && el.id === selectedElement && (
                                                                <FcCopyright
                                                                    style={{
                                                                        position: 'absolute',
                                                                        top: '-1px',
                                                                        right: '50%',
                                                                        border: 'none',
                                                                        borderRadius: '50%',
                                                                        fontSize: '23px',
                                                                        cursor: 'pointer',
                                                                        backgroundColor: 'transparent',
                                                                        transform: 'translate(50%, -50%)',
                                                                        color: '#09c',
                                                                        zIndex: 1,
                                                                    }}
                                                                    onClick={() => CloneElement(el.id)}
                                                                    data-ignore="true"
                                                                />
                                                            )}
                                                            {el.type === 'image' ? (
                                                                <>
                                                                    {imageLoading && (
                                                                        <div
                                                                            style={{
                                                                                position: 'absolute',
                                                                                top: '50%',
                                                                                left: '50%',
                                                                                transform: 'translate(-50%, -50%)',
                                                                                zIndex: 2,
                                                                                background: 'white',
                                                                                padding: '10px',
                                                                                borderRadius: '50%',
                                                                            }}

                                                                        >
                                                                            <CiImageOn />
                                                                        </div>
                                                                    )}
                                                                    <img
                                                                        src={el.content}
                                                                        alt="Element"
                                                                        style={{
                                                                            width: '100%',
                                                                            height: '100%',
                                                                            objectFit: 'contain',
                                                                            cursor: isMasterElement ? 'not-allowed' : (dragEnabled ? "move" : "all-scroll"),
                                                                            display: imageLoading ? 'none' : 'block',
                                                                        }}
                                                                        onLoad={() => setImageLoading(false)}
                                                                        onError={() => setImageLoading(false)}
                                                                    />
                                                                </>
                                                            ) : (
                                                                <div
                                                                    ref={(ref) => (elementRefs.current[el.id] = ref)}
                                                                    contentEditable={!isMasterElement}
                                                                    suppressContentEditableWarning={true}
                                                                    className={el.className || ''}
                                                                    style={{
                                                                        width: "100%",
                                                                        height: "100%",
                                                                        padding: "5px",
                                                                        overflow: "hidden",
                                                                        textOverflow: "ellipsis",
                                                                        whiteSpace: "pre-wrap",
                                                                        outline: "none",
                                                                        lineHeight: '1.15',
                                                                        cursor: isMasterElement ? "not-allowed" : dragEnabled ? "move" : "text",
                                                                        textAlign: el.textAlign,
                                                                    }}
                                                                    onInput={(e) => {
                                                                        const isMasterElement = pageDataArray.some(page => {
                                                                            const elementsKey = `customelements${page.pageNumber}`;
                                                                            const elementsArray = page[elementsKey]?.elements || [];
                                                                            return elementsArray.some(e =>
                                                                                MasterElements.some(masterEl => masterEl.id === e.id && e.id === el.id)
                                                                            );
                                                                        });
                                                                        if (!isMasterElement) {
                                                                            onInput(e, el);
                                                                        }
                                                                    }}
                                                                    onPaste={onPaste}
                                                                    onMouseUp={onMouseUp}

                                                                    onKeyDown={(e) => onKeyDown(e, el)}
                                                                    onDrop={(e) => {
                                                                        const items = e.dataTransfer.items;
                                                                        for (const item of items) {
                                                                            if (item.kind === "file" && item.type.startsWith("image")) {
                                                                                e.preventDefault();
                                                                                alert("Dragging and dropping images is not allowed!");
                                                                                return;
                                                                            }
                                                                        }
                                                                    }}
                                                                    onDragOver={(e) => e.preventDefault()}
                                                                    dangerouslySetInnerHTML={{ __html: el.content || '' }} // Add ZWS if empty
                                                                />
                                                            )}
                                                            {selectedElement === el.id && el.type === "text" && (
                                                                <button
                                                                    data-ignore="true"
                                                                    style={{
                                                                        position: "absolute",
                                                                        top: "-30px",
                                                                        left: "0",
                                                                        cursor: "pointer",
                                                                        backgroundColor: `${dragEnabled ? '#09c' : 'red'}`,
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: '3px',
                                                                        fontSize: '14px',
                                                                        zIndex: 2
                                                                    }}
                                                                    onClick={toggleDrag} // Use the new function
                                                                >
                                                                    {dragEnabled ? "Can Move" : "Can't Move"}
                                                                </button>

                                                            )}
                                                            {selectedElement === el.id && dragEnabled && (() => {
                                                                const livePos = liveDragPosition[el.id];
                                                                const currentX = livePos?.x ?? el.x;
                                                                const currentY = livePos?.y ?? el.y;
                                                                const containerHeight = containerRef?.current?.offsetHeight || 0;
                                                                const containerWidth = containerRef?.current?.offsetWidth || 0;

                                                                const elementCenterX = currentX + el.width / 2;
                                                                const elementCenterY = currentY + el.height / 2;
                                                                const containerCenterX = containerWidth / 2;
                                                                const containerCenterY = containerHeight / 2;

                                                                const isHorizontallyCentered = Math.abs(elementCenterX - containerCenterX) < 5;
                                                                const isVerticallyCentered = Math.abs(elementCenterY - containerCenterY) < 5;

                                                                const redLine = 'rgba(0,0,0,0.3)';
                                                                const lineThickness = '1px';
                                                                const fixedLineLength = 80;

                                                                const topDistance = currentY;
                                                                const bottomDistance = containerHeight - (currentY + el.height);
                                                                const leftDistance = currentX;
                                                                const rightDistance = containerWidth - (currentX + el.width);

                                                                const topLineHeight = isHorizontallyCentered ? Math.min(topDistance, fixedLineLength) : 0;
                                                                const bottomLineHeight = isHorizontallyCentered ? Math.min(bottomDistance, fixedLineLength) : 0;
                                                                const leftLineWidth = isVerticallyCentered ? Math.min(leftDistance, fixedLineLength) : 0;
                                                                const rightLineWidth = isVerticallyCentered ? Math.min(rightDistance, fixedLineLength) : 0;
                                                                return (
                                                                    <>
                                                                        {/* Top Line (centered) */}
                                                                        {isHorizontallyCentered && topLineHeight > 0 && topDistance !== 0 && (
                                                                            <div
                                                                                data-ignore="true"
                                                                                style={{
                                                                                    position: 'absolute',
                                                                                    top: `-${topLineHeight}px`,
                                                                                    left: '50%',
                                                                                    width: lineThickness,
                                                                                    height: `${topLineHeight}px`,
                                                                                    backgroundColor: redLine,
                                                                                    zIndex: -1,
                                                                                    transform: 'translateX(-50%)',

                                                                                }} />
                                                                        )}

                                                                        {/* Bottom Line (centered) */}
                                                                        {isHorizontallyCentered && bottomLineHeight > 0 && bottomDistance !== 0 && (
                                                                            <div
                                                                                data-ignore="true"
                                                                                style={{
                                                                                    position: 'absolute',
                                                                                    top: `${el.height}px`,
                                                                                    left: '50%',
                                                                                    width: lineThickness,
                                                                                    height: `${bottomLineHeight}px`,
                                                                                    backgroundColor: redLine,
                                                                                    zIndex: 9999,
                                                                                    transform: 'translateX(-50%)',
                                                                                }} />
                                                                        )}

                                                                        {/* Left Line (centered) */}
                                                                        {isVerticallyCentered && leftLineWidth > 0 && leftDistance !== 0 && (
                                                                            <div
                                                                                data-ignore="true"
                                                                                style={{
                                                                                    position: 'absolute',
                                                                                    top: '50%',
                                                                                    left: `-${leftLineWidth}px`,
                                                                                    width: `${leftLineWidth}px`,
                                                                                    height: lineThickness,
                                                                                    backgroundColor: redLine,
                                                                                    zIndex: 9999,
                                                                                    transform: 'translateY(-50%)',
                                                                                }} />
                                                                        )}

                                                                        {/* Right Line (centered) */}
                                                                        {isVerticallyCentered && rightLineWidth > 0 && rightDistance !== 0 && (
                                                                            <div
                                                                                data-ignore="true"
                                                                                style={{
                                                                                    position: 'absolute',
                                                                                    top: '50%',
                                                                                    left: `${el.width}px`,
                                                                                    width: `${rightLineWidth}px`,
                                                                                    height: lineThickness,
                                                                                    backgroundColor: redLine,
                                                                                    zIndex: 9999,
                                                                                    transform: 'translateY(-50%)',
                                                                                }} />
                                                                        )}

                                                                        {/* Top fallback */}
                                                                        {bottomDistance === 0 && isHorizontallyCentered && (
                                                                            <div
                                                                                data-ignore="true"
                                                                                style={{
                                                                                    position: 'absolute',
                                                                                    top: `-${fixedLineLength}px`,
                                                                                    left: '50%',
                                                                                    width: lineThickness,
                                                                                    height: `${fixedLineLength}px`,
                                                                                    backgroundColor: redLine,
                                                                                    zIndex: -1,
                                                                                    transform: 'translateX(-50%)',
                                                                                }} />
                                                                        )}

                                                                        {/* Bottom fallback */}
                                                                        {topDistance === 0 && isHorizontallyCentered && (
                                                                            <div
                                                                                data-ignore="true"
                                                                                style={{
                                                                                    position: 'absolute',
                                                                                    top: `${el.height}px`,
                                                                                    left: '50%',
                                                                                    width: lineThickness,
                                                                                    height: `${fixedLineLength}px`,
                                                                                    backgroundColor: redLine,
                                                                                    zIndex: 9999,
                                                                                    transform: 'translateX(-50%)',
                                                                                }} />
                                                                        )}

                                                                        {/* Left fallback */}
                                                                        {rightDistance === 0 && isVerticallyCentered && (
                                                                            <div
                                                                                data-ignore="true"
                                                                                style={{
                                                                                    position: 'absolute',
                                                                                    top: '50%',
                                                                                    left: `-${fixedLineLength}px`,
                                                                                    width: `${fixedLineLength}px`,
                                                                                    height: lineThickness,
                                                                                    backgroundColor: redLine,
                                                                                    zIndex: 9999,
                                                                                    transform: 'translateY(-50%)',
                                                                                }} />
                                                                        )}

                                                                        {/* Right fallback */}
                                                                        {leftDistance === 0 && isVerticallyCentered && (
                                                                            <div
                                                                                data-ignore="true"
                                                                                style={{
                                                                                    position: 'absolute',
                                                                                    top: '50%',
                                                                                    left: `${el.width}px`,
                                                                                    width: `${fixedLineLength}px`,
                                                                                    height: lineThickness,
                                                                                    backgroundColor: redLine,
                                                                                    zIndex: 9999,
                                                                                    transform: 'translateY(-50%)',
                                                                                }} />
                                                                        )}
                                                                    </>
                                                                );
                                                            })()}
                                                        </Rnd>
                                                    </React.Fragment>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div data-ignore="true" style={{ marginTop: '-23px', textAlign: 'center' }}>
                                        {PrintableareaHide !== 0 && <span style={{ backgroundColor: 'white' }}>Unprintable Area</span>}
                                    </div>
                                </div>
                            </div>
                            )
                        }
                    </div>
                </div>
                {!isPreview && (<div className="modal-bottom">
                    <button className='edit-save' style={{ marginRight: `${isFullscreen ? '20px' : "0px"}` }} onClick={saveEnvelope} >
                        Save
                    </button>
                </div>)}
            </div>
            {OpenImagesModal && <AddPhotolibrary clientId={ClientId} onClose={handleCloselibraryModal} isEditorOpen={true} S3Elements={setImageElements} />}

        </div>
    );
}

export default EnvelopeEditor;
