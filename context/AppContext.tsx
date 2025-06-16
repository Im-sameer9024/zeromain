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
import { TagDataProps } from "@/types/Task.types";

interface AppContextType {
  cookieData: any;
  open: boolean;
  setOpen: (value: boolean) => void;
  setCookieData: (data: any) => void;
  allTags: TagDataProps[];
  setAllTags: (tags: TagDataProps[]) => void;
}

export const AppContext = createContext<AppContextType>({
  cookieData: null,
  setCookieData: () => {},
  open: false,
  setOpen: () => {},
  allTags: [],
  setAllTags: () => {},
});

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [cookieData, setCookieData] = useState<any>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [allTags, setAllTags] = useState<TagDataProps[]>([]);

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

  return (
    <AppContext.Provider
      value={{
        allTags,
        setAllTags,
        open,
        setOpen,
        cookieData,
        setCookieData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }
  return context;
};