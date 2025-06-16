"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import Cookies from "js-cookie";
import { TagDataProps, TaskProps } from "@/types/Task.types";

interface UserData {
  id: string;
  role: string;
  // Add other user properties as needed
}

interface AppContextType {
  cookieData: UserData | null;
  isCookieLoading: boolean;
  open: boolean;
  setOpen: (value: boolean) => void;
  setCookieData: (data: UserData | null) => void;
  allTags: TagDataProps[];
  setAllTags: (tags: TagDataProps[]) => void;
  allTasks: TaskProps[];
  setAllTasks: (tasks: TaskProps[]) => void;
}

export const AppContext = createContext<AppContextType>({
  cookieData: null,
  isCookieLoading: true,
  open: false,
  setOpen: () => {},
  setCookieData: () => {},
  allTags: [],
  setAllTags: () => {},
  allTasks: [],
  setAllTasks: () => {},
});

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [cookieData, setCookieData] = useState<UserData | null>(null);
  const [isCookieLoading, setIsCookieLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [allTags, setAllTags] = useState<TagDataProps[]>([]);
  const [allTasks, setAllTasks] = useState<TaskProps[]>([]);

  useEffect(() => {
    const loadCookieData = () => {
      setIsCookieLoading(true);
      const cookie = Cookies.get("cookieData");
      
      if (cookie) {
        try {
          const parsedData = JSON.parse(cookie) as UserData;
          if (parsedData.id && parsedData.role) {
            setCookieData(parsedData);
          } else {
            console.warn("Invalid cookie data structure");
            Cookies.remove("cookieData");
          }
        } catch (error) {
          console.error("Error parsing cookie data", error);
          Cookies.remove("cookieData");
        }
      }
      setIsCookieLoading(false);
    };

    loadCookieData();
  }, []);

  return (
    <AppContext.Provider
      value={{
        cookieData,
        isCookieLoading,
        open,
        setOpen,
        setCookieData,
        allTags,
        setAllTags,
        allTasks,
        setAllTasks,
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