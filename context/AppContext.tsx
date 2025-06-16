/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import Cookies from "js-cookie";

export const AppContext = createContext<{
  cookieData: any;
  setCookieData: React.Dispatch<React.SetStateAction<any>>;
}>({
  cookieData: null,
  setCookieData: () => {},
});

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [cookieData, setCookieData] = useState();

  useEffect(() => {
    const loadCookieData = () => {
      const adminCookie = Cookies.get("cookieData");
      if (adminCookie) {
        try {
          const parsedData = JSON.parse(adminCookie);
          setCookieData(parsedData);
        } catch (error) {
          console.error("Error parsing admin data", error);
        }
      }
    };
    loadCookieData();
  }, []);

  console.log("cookie data in context api ",cookieData)

  return (
    <AppContext.Provider value={{ cookieData, setCookieData }}>
      {children}
    </AppContext.Provider>
  );
};

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within a AppContextProvider");
  }
  return context;
}
