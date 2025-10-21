// src/useAlertProvider.js
import React from 'react';
import { CustomProvider } from './CustomComponents';

const UseCustomComponentProvider = (Component) => {
  return function WrappedComponent(props) {
    return (
      <CustomProvider>
        <Component {...props} />
      </CustomProvider>
    );
  };
};

export default UseCustomComponentProvider;
