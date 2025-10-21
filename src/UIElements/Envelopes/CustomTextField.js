import React from 'react';

const CustomTextField = ({
  id,
  content,
  onChange,
  fontFamily,
  fontSize,
  color,
  fontWeight,
  fontStyle,
  textDecoration,
  lineHeight,
  letterSpacing,
  textAlign,
  onFocus,
  onBlur,
  style,
  master
}) => {
  const handleFocus = () => {
    if (onFocus) onFocus(id);
  };

  const handleBlur = () => {
    if (onBlur) onBlur(id);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Prevent drag over behavior
  };

  const handleDrop = (e) => {
    e.preventDefault(); // Prevent dropping content
  };

  return master ? (
    <div
      id={id}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onDragOver={handleDragOver} // Prevent drag over
      onDrop={handleDrop} // Prevent drop
      style={{
        fontFamily,
        fontSize: `${fontSize}pt`,
        color,
        fontWeight,
        fontStyle,
        textDecoration,
        lineHeight,
        letterSpacing,
        textAlign,
        border: 'none',
        outline: 'none',
        padding: 0,
        margin: 0,
        boxShadow: 'none',
        background: 'transparent',
        width: '100%',
        height: 'auto',
        cursor: 'default', // Use default cursor for div
        ...style,
      }}
    >
      {content } {/* Display placeholder if content is empty */}
    </div>
  ) : (
    <textarea
      id={id}
      value={content}
      onChange={(e) => onChange(e.target.value)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onDragOver={handleDragOver} // Prevent drag over
      onDrop={handleDrop} // Prevent drop
      placeholder="Type here..."
      style={{
        fontFamily,
        fontSize: `${fontSize}pt`,
        color,
        fontWeight,
        fontStyle,
        textDecoration,
        lineHeight,
        letterSpacing,
        textAlign,
        border: 'none',
        outline: 'none',
        resize: 'none',
        padding: 0,
        margin: 0,
        boxShadow: 'none',
        background: 'transparent',
        width: '100%',
        height: 'auto',
        cursor: 'all-scroll',
        ...style,
      }}
    />
  );
};

export default CustomTextField;
