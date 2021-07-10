import React from "react";

const themeContext = React.createContext({theme: null, switchTheme: () => {}, label: null}); // Create a context object

export {
  themeContext // Export it so it can be used by other Components
};