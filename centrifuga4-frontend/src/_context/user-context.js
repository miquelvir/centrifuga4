import React from "react";

const userContext = React.createContext({logged: false}); // Create a context object

export {
  userContext // Export it so it can be used by other Components
};