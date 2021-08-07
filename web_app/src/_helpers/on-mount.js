import { useEffect } from "react";

export const useOnMount = handler => {
  return useEffect(() => {
    return handler();
  }, []);
};