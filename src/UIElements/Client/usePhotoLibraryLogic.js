// AddPhotoLibraryLogic.js
import { useState, useEffect } from 'react';
import AWS from 'aws-sdk';

const usePhotoLibraryLogic = (clientId, hud, stopHudRotation, clientName, showAlert) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [images, setImages] = useState([]);
    const [popupImage, setPopupImage] = useState(null);
    const [NewfileName, setNewFileName] = useState(null);
    const [FileUploaded, SetFileUploaded] = useState(false);

    // Initialize AWS S3
    const s3 = new AWS.S3({
        region: process.env.REACT_APP_AWS_REGION,
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    });

    // Function to convert base64 to ArrayBuffer
    const base64ToArrayBuffer = (base64) => {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    };

    // Function to upload image to S3
    const uploadToS3 = async (content, fileName) => {
        try {
            const matches = content.match(/^data:([^;]+);base64,/);
            if (!matches) {
                throw new Error('Invalid base64 string. Unable to extract content type.');
            }

            const contentType = matches[1];
            const base64Data = content.replace(/^data:[^;]+;base64,/, '');
            const arrayBuffer = base64ToArrayBuffer(base64Data);
            const blob = new Blob([arrayBuffer], { type: contentType });

            // Generate timestamp for filename
            const now = new Date();
            const timestamp = `${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getFullYear())}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}${String(now.getMilliseconds()).padStart(3, '0')}`;

            // Sanitize filename: replace spaces with underscores and remove special characters except underscores
            const sanitizedFileName = fileName
                .replace(/\s+/g, '-') // Replace spaces with Hypen
                .replace(/[^\w.-]/g, ''); // Remove all special characters except letters, numbers, underscores, dots, and dashes

            // Extract name and extension
            const nameWithoutExtension = sanitizedFileName.substring(0, sanitizedFileName.lastIndexOf('.')) || sanitizedFileName;
            const fileExtension = sanitizedFileName.substring(sanitizedFileName.lastIndexOf('.') + 1);

            // Create new filename
            const newFileName = `${nameWithoutExtension}_${timestamp}.${fileExtension}`;
            console.log("Newfile name:", newFileName)
            const params = {
                Bucket: process.env.REACT_APP_S3_BUCKET_NAME,
                Key: `Clients/${clientId}/photoLibrary/${newFileName}`,
                Body: blob,
                ContentType: contentType,
            };
            setNewFileName(newFileName);
            // console.log(params.Body)
            const { Location } = await s3.upload(params).promise();
            SetFileUploaded(true);
            fetchImageFromUploadedS3(params.Key);
            return Location;
        } catch (error) {
            console.error('Error uploading to S3:', error);
            throw new Error('Image upload failed.');
        }
    };



    const fetchImagesFromS3 = async () => {
        try {
            const params = {
                Bucket: process.env.REACT_APP_S3_BUCKET_NAME,
                Prefix: `Clients/${clientId}/photoLibrary/`,
            };
            hud("Please Wait...");
            const data = await s3.listObjectsV2(params).promise();
            console.log("data:",data)
            // Extract file names and timestamps
            const imageUrls = data.Contents.map((item) => {
                return {
                    url: s3.getSignedUrl("getObject", {
                        Bucket: params.Bucket,
                        Key: item.Key,
                    }),
                    key: item.Key,
                    timestamp : item.Key.match(/(\d{8}\d{6}\d{3})(?=[._])/g)?.[0], // Match the timestamp pattern
                };
            });

            // Sort images by timestamp in descending order (newest first)
            const sortedImageUrls = imageUrls
                .filter(item => item.timestamp) // Ensure timestamp exists
                .sort((a, b) => b.timestamp.localeCompare(a.timestamp)); // Compare timestamps

            // Set sorted image URLs
            const validImageUrls = sortedImageUrls.map(item => item.url);
            setImages(validImageUrls);
            stopHudRotation();
        } catch (error) {
            stopHudRotation();
            console.error("Error fetching images from S3:", error);
        }
    };

    const fetchImageFromUploadedS3 = async (key) => {
        try {
            const params = {
                Bucket: process.env.REACT_APP_S3_BUCKET_NAME,
                Key: key,
            };

            const singleImageUrl = s3.getSignedUrl("getObject", {
                Bucket: params.Bucket,
                Key: params.Key,
            });

            // Add the newly uploaded image URL to the list
            setImages((prevImages) => [singleImageUrl, ...prevImages]);
            stopHudRotation();
        } catch (error) {
            stopHudRotation();
            console.error("Error fetching single image from S3:", error);
        }
    };


    // Handle file selection
    const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

    // Handle upload button click
    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        const reader = new FileReader();
        hud('Please Wait')
        reader.onloadend = async () => {
            try {
                const content = reader.result;
                await uploadToS3(content, selectedFile.name);  // Upload the file

            } catch (error) {
                alert('Failed to upload the file. Please try again.');
            } finally {
                setIsUploading(false);
            }
        };

        reader.readAsDataURL(selectedFile); // Read file as base64 string
    };

    // Handle pop-up navigation
    const handlePreviousImage = () => {
        if (popupImage > 0) setPopupImage(popupImage - 1);
    };

    const handleNextImage = () => {
        if (popupImage < images.length - 1) setPopupImage(popupImage + 1);
    };

    // Fetch images on component mount
    useEffect(() => {
        if (FileUploaded && clientId) {
            fetchImageFromUploadedS3();
        } else {
            fetchImagesFromS3();
        }
    }, [clientId]);

    return {
        images,
        popupImage,
        handleFileChange,
        handleUpload,
        isUploading,
        clientName,
        handlePreviousImage,
        handleNextImage,
        setPopupImage,
    };
};

export default usePhotoLibraryLogic;
