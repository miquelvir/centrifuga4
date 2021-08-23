import React from "react";

const userContext = React.createContext({
  user: null, 
  setUser: () => {}, 
  needs: [], 
  setNeeds: () => {},
  teacher: [],
  setTeacher: () => {}
}); // Create a context object

export {
  userContext // Export it so it can be used by other Components
};