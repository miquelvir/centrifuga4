import React from "react";

const tabContext = React.createContext(
    {currentTab: null, goTo: (res) => {}}); // Create a context object

export {
  tabContext // Export it so it can be used by other Components
};