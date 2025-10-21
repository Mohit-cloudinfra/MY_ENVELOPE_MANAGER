import React, { useRef, useState, useEffect } from 'react';
import JSZip from 'jszip';
import { renderAsync } from 'docx-preview';

const DocxPreviewer = ({ file, getElements, onClose }) => {
  const containerRef = useRef(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageHeight, setPageHeight] = useState(1056);

  const fontOptions = [
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: '"Comic Sans MS", cursive, sans-serif', label: 'Comic Sans MS' },
    { value: '"Courier New", Courier, monospace', label: 'Courier New' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: '"Gill Sans", sans-serif', label: 'Gill Sans' },
    { value: 'Lato, sans-serif', label: 'Lato' },
    { value: '"Lucida Sans", sans-serif', label: 'Lucida Sans' },
    { value: 'Montserrat, sans-serif', label: 'Montserrat' },
    { value: 'Nunito, sans-serif', label: 'Nunito' },
    { value: '"Open Sans", sans-serif', label: 'Open Sans' },
    { value: 'Poppins, sans-serif', label: 'Poppins' },
    { value: 'Quicksand, sans-serif', label: 'Quicksand' },
    { value: 'Raleway, sans-serif', label: 'Raleway' },
    { value: 'Roboto, sans-serif', label: 'Roboto' },
    { value: '"Source Sans Pro", sans-serif', label: 'Source Sans Pro' },
    { value: 'Tahoma, sans-serif', label: 'Tahoma' },
    { value: '"Times New Roman", Times, serif', label: 'Times New Roman' },
    { value: '"Trebuchet MS", sans-serif', label: 'Trebuchet MS' },
    { value: 'Ubuntu, sans-serif', label: 'Ubuntu' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
  ];

  useEffect(() => {
    if (file) {
      handleFileChange(file);
    }
  }, [file, pageHeight]);

  const ptToPx = (pt) => (parseFloat(pt) * 4) / 3;

  const injectGlobalStyles = () => {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      p {
        margin: 0 0 8px 0 !important;
        line-height: 1.5 !important;
        font-family: 'Times New Roman', serif !important;
        font-size: 14px !important;
      }
      li {
        margin-left: 20px !important;
      }
      ul, ol {
        padding-left: 20px !important;
      }
    `;
    containerRef.current.prepend(styleEl);
  };

  function mergeSmartTemplateSpans(root) {
    const isValidMergeSpan = (el) =>
      el.tagName === 'SPAN' &&
      el.className === 'imported-element' &&
      el.childNodes.length === 1 &&
      el.firstChild.nodeType === Node.TEXT_NODE;

    const getNextValidSpan = (node) => {
      let next = node.nextSibling;
      while (next && next.nodeType === Node.TEXT_NODE && !next.textContent.trim()) {
        next = next.nextSibling;
      }
      return next;
    };

    const spans = Array.from(root.querySelectorAll('span.imported-element'));

    for (let i = 0; i < spans.length; i++) {
      const current = spans[i];
      if (!isValidMergeSpan(current)) continue;


      let mergeContent = current.textContent;
      let mergeNodes = [current];
      let next = getNextValidSpan(current);

      while (next && isValidMergeSpan(next)) {
        mergeContent += next.textContent;
        mergeNodes.push(next);

        // Stop when we detect likely end of a token (e.g. ends with ])
        if (/\]\**$/.test(mergeContent.trim())) {
          break;
        }

        next = getNextValidSpan(next);
      }

      if (mergeNodes.length > 1) {
        const mergedSpan = current.cloneNode(false);
        mergedSpan.textContent = mergeContent;

        const parent = current.parentNode;
        parent.insertBefore(mergedSpan, current);
        mergeNodes.forEach((node) => parent.removeChild(node));
        spans[i] = mergedSpan; // Replace pointer so loop can continue
      }
    }
  }

  const postProcessContent = (element) => {
    mergeSmartTemplateSpans(element)
    if (
      (['SPAN', 'DIV', 'P'].includes(element.tagName)) &&
      (!element.textContent.trim() ||
        element.innerHTML.trim() === '&nbsp;' ||
        element.innerHTML.trim() === '<br>') &&
      element.children.length === 0
    ) {
      element.remove();
      return;
    }

    if (element.tagName === 'SPAN') {
      element.className = 'imported-element';
      // element.classList.add('imported-element');
      const fontFamily = element.style.fontFamily || '';
      const isFontInOptions = fontOptions.some((option) =>
        fontFamily.includes(option.value)
      );
      if (element.tagName === 'SPAN' || element.tagName === 'DIV') {
        // Apply text-transform manually
        const transform = element.style.textTransform?.toLowerCase();
        if (transform && element.childNodes.length === 1 && element.childNodes[0].nodeType === Node.TEXT_NODE) {
          switch (transform) {
            case 'uppercase':
              element.textContent = element.textContent.toUpperCase();
              break;
            case 'lowercase':
              element.textContent = element.textContent.toLowerCase();
              break;
            case 'capitalize':
              element.textContent = element.textContent.replace(/\b\w/g, c => c.toUpperCase());
              break;
          }
        }
      }
      if (!isFontInOptions) {
        element.style.fontFamily = '"Times New Roman", Times, serif';
      }

      if (element.style.fontWeight?.toLowerCase() === 'bold') {
        element.style.fontWeight = '';
        const bold = document.createElement('b');
        while (element.firstChild) {
          bold.appendChild(element.firstChild);
        }
        element.appendChild(bold);
      }
    }

    // Normalize spacing and font styles
    for (let i = 0; i < element.style.length; i++) {
      const prop = element.style[i];
      const val = element.style.getPropertyValue(prop);

      if (val && val.trim().endsWith('pt')) {
        const pxVal = ptToPx(val);

        if (prop === 'font-size') {
          const cappedPx = Math.min(pxVal, 50);
          element.style.setProperty(prop, `${cappedPx.toFixed(2)}px`);
        } else {
          element.style.setProperty(prop, `${pxVal.toFixed(2)}px`);
        }
      }

      if (prop === 'font-size' && val.trim().endsWith('px')) {
        const pxVal = parseFloat(val);
        if (pxVal > 50) {
          element.style.setProperty(prop, '30px');
        }
      }

      if (prop === 'line-height' && val.trim().endsWith('pt')) {
        const pxVal = ptToPx(val);
        element.style.setProperty('line-height', `${pxVal.toFixed(2)}px`);
      }
    }

    Array.from(element.children).forEach(postProcessContent);
  };

  const handleFileChange = async (file) => {
    if (
      !file ||
      file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      alert('Please upload a valid .docx file');
      return;
    }

    containerRef.current.innerHTML = '';
    setPageCount(0);

    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    try {
      const documentXml = await zip.file('word/document.xml').async('text');
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(documentXml, 'application/xml');
      const pgSz = xmlDoc.querySelector('w\\:pgSz, pgSz');
      const wHeight = pgSz?.getAttribute('w:h') || '15840';
      const wWidth = pgSz?.getAttribute('w:w') || '12240';
      const pageHeightPx = (parseInt(wHeight, 10) / 1440) * 96;
      setPageHeight(pageHeightPx);
    } catch (err) {
      console.warn('Failed to parse document.xml for page size:', err);
    }

    await renderAsync(arrayBuffer, containerRef.current, null, {
      breakPages: true,
      ignoreLastRenderedPageBreak: false,
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        injectGlobalStyles();

        const container = containerRef.current;
        Array.from(container.children).forEach(postProcessContent);
        // postProcessContent(container);

        const sections = container.querySelectorAll('section.docx');
        const finalPages = [];

        sections.forEach((section, sectionIndex) => {
          const sectionRect = section.getBoundingClientRect();
          const sectionHeightPx = sectionRect.height;

          const pageCountInSection = Math.floor(sectionHeightPx / pageHeight);

          const allElements = [
            ...Array.from(section.querySelectorAll('p')).map((p) => ({ node: p, type: 'text' })),
            ...Array.from(section.querySelectorAll('img')).map((img) => ({ node: img, type: 'image' })),
          ].filter((el) => {
            const content = el.node.innerHTML;
            if (content.includes('id="_GoBack"')) return false;
            if (
              el.node.tagName === 'SPAN' &&
              !el.node.textContent.trim() &&
              el.node.children.length === 0
            )
              return false;
            return true;
          });

          allElements.forEach((el) => {
            const rect = el.node.getBoundingClientRect();
            const xAbs = rect.left - sectionRect.left;
            const yAbs = rect.top - sectionRect.top;

            let pageIndex = Math.floor(yAbs / pageHeight);
            if (pageIndex >= pageCountInSection) {
              pageIndex = pageCountInSection - 1;
            }

            pageIndex = pageIndex + sectionIndex;
            pageIndex = Math.max(pageIndex, 0);

            const pageTopOffset = pageIndex * pageHeight;
            const x = xAbs;
            const y = yAbs - (pageTopOffset - sectionIndex * pageHeight);

            let content;

            if (el.type === 'text') {
              const computedStyle = window.getComputedStyle(el.node);
              const textAlign = computedStyle.textAlign;

              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = el.node.innerHTML;

              const span = tempDiv.querySelector('span') || tempDiv;

              if (textAlign && span) {
                span.style.textAlign = textAlign;
              }

              content = tempDiv.innerHTML;

              if (content.includes('<svg') || content.includes('<foreignObject')) {
                return;
              }
            } else {
              content = el.node.outerHTML;
            }

            const elementData = {
              id: Date.now() + Math.floor(Math.random() * 1000000),
              type: el.type,
              content,
              x: (x / 96).toFixed(2),
              y: (y / 96).toFixed(2),
              width: (rect.width / 96).toFixed(2),
              height: (
                el.type === 'image'
                  ? rect.height / 96
                  : (rect.height * 1.5) / 96
              ).toFixed(2),
              // className: 'imported-element',
            };

            if (!finalPages[pageIndex]) {
              finalPages[pageIndex] = {
                [`customelements${pageIndex + 1}`]: { elements: [] },
                pageNumber: pageIndex + 1,
                s3keyinfo: { key: '' },
              };
            }

            finalPages[pageIndex][`customelements${pageIndex + 1}`].elements.push(elementData);
          });
        });

        setPageCount(finalPages.length);
        getElements(finalPages);
        onClose();
        console.log('Structured Data:', finalPages);
      });
    });
  };

  return (
    <div style={{ opacity: 1, width: '100vw', position: 'absolute' }}>
      <div
        ref={containerRef}
        style={{
          border: '1px solid #ccc',
          padding: '10px',
          marginTop: '10px',
          position: 'relative',
          overflowY: 'auto',
          height: '80vh',
        }}
      ></div>
    </div>
  );
};

export default DocxPreviewer;