import React, { useState } from "react";
import JSZip from "jszip";

const DocxPageInfoExtractor = () => {
  const [pages, setPages] = useState(null);
  const [error, setError] = useState(null);

  const parseDocx = async (file) => {
    try {
      setError(null);
      setPages(null);
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);

      // Read document.xml
      const documentFile = zip.file("word/document.xml");
      if (!documentFile) {
        setError("document.xml not found inside DOCX");
        return;
      }
      const xmlText = await documentFile.async("text");

      // Parse XML using DOMParser
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "application/xml");

      // Namespace resolver for XPath queries
      const nsResolver = (prefix) => {
        const ns = {
          w: "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
        };
        return ns[prefix] || null;
      };

      // Find all w:sectPr elements (sections - typically each can have page settings)
      const sectPrNodes = xmlDoc.evaluate(
        "//w:sectPr",
        xmlDoc,
        nsResolver,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
      );

      if (sectPrNodes.snapshotLength === 0) {
        setError("No section properties (w:sectPr) found.");
        return;
      }

      let pagesInfo = [];

      for (let i = 0; i < sectPrNodes.snapshotLength; i++) {
        const sectPr = sectPrNodes.snapshotItem(i);

        // Extract page size - w:pgSz
        const pgSz = sectPr.getElementsByTagNameNS(
          "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
          "pgSz"
        )[0];

        // Extract margins - w:pgMar
        const pgMar = sectPr.getElementsByTagNameNS(
          "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
          "pgMar"
        )[0];

        // Extract attributes or set default 0
        const widthTwips = pgSz?.getAttribute("w:w") || "0"; // width in twentieths of a point
        const heightTwips = pgSz?.getAttribute("w:h") || "0";

        // Margins in twentieths of a point
        const marginTopTwips = pgMar?.getAttribute("w:top") || "0";
        const marginBottomTwips = pgMar?.getAttribute("w:bottom") || "0";
        const marginLeftTwips = pgMar?.getAttribute("w:left") || "0";
        const marginRightTwips = pgMar?.getAttribute("w:right") || "0";

        // Convert twips to mm (1 twip = 1/1440 inch; 1 inch = 25.4 mm)
        const twipToMm = (twip) => (parseInt(twip) / 1440) * 25.4;

        pagesInfo.push({
          pageNumber: i + 1,
          widthTwips: parseInt(widthTwips),
          heightTwips: parseInt(heightTwips),
          widthMM: twipToMm(widthTwips).toFixed(2),
          heightMM: twipToMm(heightTwips).toFixed(2),
          marginsTwips: {
            top: parseInt(marginTopTwips),
            bottom: parseInt(marginBottomTwips),
            left: parseInt(marginLeftTwips),
            right: parseInt(marginRightTwips),
          },
          marginsMM: {
            top: twipToMm(marginTopTwips).toFixed(2),
            bottom: twipToMm(marginBottomTwips).toFixed(2),
            left: twipToMm(marginLeftTwips).toFixed(2),
            right: twipToMm(marginRightTwips).toFixed(2),
          },
        });
      }

      setPages(pagesInfo);
    } catch (err) {
      setError("Failed to parse DOCX file: " + err.message);
    }
  };

  const onFileChange = async (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      await parseDocx(file);
    }
  };

  return (
    <div style={{
      maxWidth: "700px",
      margin: "20px auto",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      padding: "20px",
      background: "#f9f9f9",
      borderRadius: "8px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{color: "#333"}}>DOCX Page Info Extractor (JSZip only)</h2>
      <input
        type="file"
        accept=".doc, .docx"
        onChange={onFileChange}
        style={{marginBottom: "20px", padding: "6px 10px"}}
      />
      {error && (
        <p style={{color: "red", fontWeight: "bold"}}>{error}</p>
      )}
      {pages && (
        <>
          <h3>Found {pages.length} sections/pages</h3>
          <table style={{width: "100%", borderCollapse: "collapse"}}>
            <thead>
              <tr style={{backgroundColor: "#007acc", color: "#fff"}}>
                <th style={{padding: "8px", border: "1px solid #ddd"}}>Page #</th>
                <th style={{padding: "8px", border: "1px solid #ddd"}}>Width (twips)</th>
                <th style={{padding: "8px", border: "1px solid #ddd"}}>Height (twips)</th>
                <th style={{padding: "8px", border: "1px solid #ddd"}}>Width (mm)</th>
                <th style={{padding: "8px", border: "1px solid #ddd"}}>Height (mm)</th>
                <th style={{padding: "8px", border: "1px solid #ddd"}}>Margins (mm)</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.pageNumber} style={{backgroundColor: page.pageNumber %2 === 0 ? "#f0f0f0" : "#fff"}}>
                  <td style={{padding: "8px", border: "1px solid #ddd", textAlign: "center"}}>{page.pageNumber}</td>
                  <td style={{padding: "8px", border: "1px solid #ddd", textAlign: "right"}}>{page.widthTwips/1440}</td>
                  <td style={{padding: "8px", border: "1px solid #ddd", textAlign: "right"}}>{page.heightTwips}</td>
                  <td style={{padding: "8px", border: "1px solid #ddd", textAlign: "right"}}>{page.widthMM}</td>
                  <td style={{padding: "8px", border: "1px solid #ddd", textAlign: "right"}}>{page.heightMM}</td>
                  <td style={{padding: "8px", border: "1px solid #ddd"}}>
                    T: {page.marginsMM.top} <br />
                    B: {page.marginsMM.bottom} <br />
                    L: {page.marginsMM.left} <br />
                    R: {page.marginsMM.right}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{marginTop: "1em", fontSize: "0.9em", color: "#555"}}>
            Note: DOCX files do not store explicit page count; sections may correspond to pages or document breaks.
          </p>
        </>
      )}
    </div>
  );
};

export default DocxPageInfoExtractor;

