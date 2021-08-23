import React from "react";

const loadingContext = React.createContext({loading: false,
  startLoading: () => {},
  stopLoading: () => {},
}); // Create a context object

export {
  loadingContext // Export it so it can be used by other Components
};