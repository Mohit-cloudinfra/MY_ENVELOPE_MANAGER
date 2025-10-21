import React, { useRef, useEffect } from 'react';

const CustomTextFieldforDownload = ({
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
  style
}) => {
  const textRef = useRef(null);

  const handleFocus = () => {
    if (onFocus) onFocus(id);
  };

  const handleBlur = () => {
    if (onBlur) onBlur(id);
  };

  const handleInput = () => {
    if (textRef.current) {
      const newValue = textRef.current.innerText;
      onChange(newValue);
    }
  };

  useEffect(() => {
    if (textRef.current) {
      textRef.current.innerText = content;
    }
  }, [content]);

  return (
    <div
      id={id}
      ref={textRef}
      contentEditable={false}
      suppressContentEditableWarning={true}
      onInput={handleInput}
      onFocus={handleFocus}
      onBlur={handleBlur}
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
        margin: 0,
        boxShadow: 'none',
        background: 'transparent',
        width: '100%',
        height: 'auto',
        cursor: 'text',
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        ...style,
      }}
    >
      {content}
    </div>
  );
};

export default CustomTextFieldforDownload;
