import React, { useState } from 'react';
import DocViewer, { DocViewerRenderers } from 'react-doc-viewer';

const DocxPreviewer = () => {
  const [documents, setDocuments] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.name.endsWith('.docx')) {
      alert('Please upload a valid .docx file');
      return;
    }

    const url = URL.createObjectURL(file);

    setDocuments([
      {
        uri: url,
        fileType: "docx",
        fileName: file.name,
      },
    ]);
  };

  return (
    <div>
      <input type="file" accept=".docx" onChange={handleFileChange} />

      {documents.length > 0 && (
        <div style={{ height: '800px', marginTop: '20px' }}>
          <DocViewer
            documents={documents}
            pluginRenderers={DocViewerRenderers}
            style={{ height: '100%' }}
          />
        </div>
      )}
    </div>
  );
};

export default DocxPreviewer;
