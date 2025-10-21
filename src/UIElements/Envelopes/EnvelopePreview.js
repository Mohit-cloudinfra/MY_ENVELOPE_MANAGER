import React from 'react';
import { MdCancel } from 'react-icons/md';
import './preview.css';

const PdfPreviewModal = ({ pdfUrl, title, onClose }) => {
  const AWS = require('aws-sdk');
  const s3 = new AWS.S3({
    region: process.env.REACT_APP_AWS_REGION,
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  });

  const params = {
    Bucket: process.env.REACT_APP_S3_BUCKET_NAME,
    Key: pdfUrl,
    Expires: 60 * 60, // 1 hour
  };

  const signedUrl = s3.getSignedUrl('getObject', params);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-content-preview">
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">{title}</h2>
          <MdCancel className="close-modal" size={24} onClick={onClose} />
        </div>

        <div className="modal-body-preview">
          <iframe
            src={`${signedUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
            title="PDF Preview"
            className="iframe-preview"
          />

        </div>
      </div>
    </div>
  );
};

export default PdfPreviewModal;
