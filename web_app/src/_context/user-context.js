import React from "react";

const userContext = React.createContext({user: null, setUser: () => {}, needs: [], setNeeds: () => {}}); // Create a context object

export {
  userContext // Export it so it can be used by other Components
};