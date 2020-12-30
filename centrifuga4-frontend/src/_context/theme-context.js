import React from "react";

const themeContext = React.createContext({dark: true}); // Create a context object

export {
  themeContext // Export it so it can be used by other Components
};