import React from "react";

const confirmContext = React.createContext(
    {confirm: (title, subtitle, successCallable, cancelCallable=null) => {}}); // Create a context object

export {
  confirmContext // Export it so it can be used by other Components
};