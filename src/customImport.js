import React, { useRef, useState } from 'react';
import JSZip from 'jszip';
import { renderAsync } from 'docx-preview';

const DocxPreviewer = () => {
  const containerRef = useRef(null);
  const [pageCount, setPageCount] = useState(0);
  const [structuredData, setStructuredData] = useState([]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      alert('Please upload a valid .docx file');
      return;
    }

    containerRef.current.innerHTML = '';
    setPageCount(0);
    setStructuredData([]);

    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // 👉 Step 1: Extract embedded media files (word/media/*)
    const mediaFiles = Object.keys(zip.files).filter((name) => name.startsWith('word/media/'));
    const mediaBlobs = {};

    for (const fileName of mediaFiles) {
      const blob = await zip.files[fileName].async("blob");
      const url = URL.createObjectURL(blob);
      mediaBlobs[fileName.split('/').pop()] = url; // Only store filename (e.g., image1.png)
    }

    // 👉 Step 2: Parse XML for page size
    const documentXml = await zip.file("word/document.xml").async("text");
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(documentXml, "application/xml");


    const pgSz = xmlDoc.querySelector("w\\:pgSz, pgSz");
    const wHeight = pgSz?.getAttribute("w:h") || "15840"; // in twips
    const pageHeightInches = parseInt(wHeight, 10) / 1440;
    const logicalPageHeightPx = pageHeightInches * 96;

    const wWidth = pgSz?.getAttribute("w:w") || "12240";
    const pageWidthInches = parseInt(wWidth, 10) / 1440;
    const logicalPageWidthPx = pageWidthInches * 96;

    const paragraphs = xmlDoc.getElementsByTagName("w:p");
    const estimatedPageCount = Math.ceil(paragraphs.length / 30);
    setPageCount(estimatedPageCount);

    await renderAsync(arrayBuffer, containerRef.current);

    // 👉 Step 3: Patch missing images
    const fixBrokenImages = () => {
      const imgs = containerRef.current.querySelectorAll("img");
      imgs.forEach((img) => {
        const src = img.getAttribute("src") || "";
        const fileName = src.split("/").pop(); // image1.png

        // Replace broken or empty image srcs
        if (!img.src || img.src.startsWith("data:") || img.naturalWidth === 0) {
          if (mediaBlobs[fileName]) {
            img.src = mediaBlobs[fileName];
            console.log(`✅ Fixed image: ${fileName}`);
          } else {
            console.warn(`⚠️ Missing image file: ${fileName}`);
          }
        }
      });
    };

    // 👉 Step 4: Collect structured data after layout settles
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        fixBrokenImages(); // Fix images first

        const container = containerRef.current;
        console.log("data:",container)

        const containerRect = container.getBoundingClientRect();
        const sections = container.querySelectorAll('section.docx');


        if (sections.length === 0) {
          console.warn('No <section class="docx"> found.');
          return;
        }

        const finalPages = [];

        sections.forEach((section, sectionIndex) => {
          const sectionRect = section.getBoundingClientRect();
          const sectionX = sectionRect.left - containerRect.left;
          const sectionY = sectionRect.top - containerRect.top;
        
          const sectionXInch = (sectionX / 96).toFixed(2);
          const sectionYInch = (sectionY / 96).toFixed(2);
        
          const pageIndex = sectionIndex;
        
          // Initialize page if it doesn't exist
          if (!finalPages[pageIndex]) {
            finalPages[pageIndex] = {
              [`customelements${pageIndex + 1}`]: [],
              pageNumber: pageIndex + 1,
              minHeight: (logicalPageHeightPx / 96).toFixed(2),
              minWidth: (logicalPageWidthPx / 96).toFixed(2),
              s3keyinfo: { key: '' },
              sectionPosition: {
                x: sectionXInch,
                y: sectionYInch,
                width: (sectionRect.width / 96).toFixed(2),
                height: (sectionRect.height / 96).toFixed(2),
              },
            };
          }
        
          // Extract all <p> and <img> within the section
          const allElements = [
            ...Array.from(section.querySelectorAll('p')).map((p) => ({
              node: p,
              type: 'text',
            })),
            ...Array.from(section.querySelectorAll('img')).map((img) => ({
              node: img,
              type: 'image',
            })),
          ];
        
          allElements.forEach((el) => {
            const rect = el.node.getBoundingClientRect();
            const x = rect.left - containerRect.left;
            const y = rect.top - containerRect.top;
        
            const adjustedY = y - sectionRect.top + container.scrollTop; // relative to section
        
            const elementData = {
              id: Date.now() + Math.random(),
              type: el.type,
              content: el.type === 'text' ? el.node.innerHTML : el.node.outerHTML,
              x: (x / 96).toFixed(2),
              y: (adjustedY / 96).toFixed(2),
              width: (rect.width / 96).toFixed(2),
              height: (rect.height / 96).toFixed(2),
            };
        
            finalPages[pageIndex][`customelements${pageIndex + 1}`].push(elementData);
          });
        });
        

        setPageCount(finalPages.length);
        setStructuredData(finalPages);
        console.log('Structured Data (with images fixed):', finalPages);
      });
    });
  };

  return (
    <div>
      <input type="file" accept=".docx" onChange={handleFileChange} />
      <div>
        <strong>Estimated Page Count: {pageCount}</strong>
      </div>
      <div
        ref={containerRef}
        style={{ border: '1px solid #ccc', padding: '0px', marginTop: '10px', position: 'relative' }}
      ></div>
      <div>
        <h3>Structured Data Output:</h3>
        <pre>{JSON.stringify(structuredData, null, 2)}</pre>
      </div>
    </div>
  );
};

export default DocxPreviewer;
