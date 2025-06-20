"use client";

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import Cookies from "js-cookie";
import { TagDataProps, TaskDataProps } from "@/types/Task.types";

export interface UserData {
  id: string;
  role: string;
  companyAdminId?: string;
  name: string;
  email: string;
  // Add other user properties as needed
}

interface AppContextType {
  cookieData: UserData | null;
  isCookieLoading: boolean;
  open: boolean;
  setOpen: (value: boolean) => void;
  setCookieData: (data: UserData | null) => void;
  allTags: TagDataProps[];
  setAllTags: React.Dispatch<React.SetStateAction<TagDataProps[]>>;
  allTasks: TaskDataProps[];
  setAllTasks: React.Dispatch<React.SetStateAction<TaskDataProps[]>>;
  selectedTasksType: string;
  setSelectedTasksType: (value: string) => void;
  tagId: string | null;
  setTagId: (value: string | null) => void;
  userId: string | null;
  setUserId: (value: string | null) => void;
  openAddModal: boolean;
  setOpenAddModal: (value: boolean) => void;
  viewOfData: string;
  setViewOfData: (value: string) => void;
  filterPriority: string;
  setFilterPriority: (value: string) => void;
  searchQuery:string,
   setSearchQuery:(value:string) => void,
   tagSearchQuery:string,
    setTagSearchQuery:(value:string) => void,
    taskSearchQuery:string,
     setTaskSearchQuery:(value:string) => void,
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
  selectedTasksType: "",
  setSelectedTasksType: () => {},
  tagId: null,
  setTagId: () => {},
  userId: null,
  setUserId: () => {},
  openAddModal: false,
  setOpenAddModal: () => {},
  viewOfData: "",
  setViewOfData: () => {},
  filterPriority: "",
  setFilterPriority: () => {},
  searchQuery: "",
  setSearchQuery: () => {},
  tagSearchQuery:"",
   setTagSearchQuery:() =>{},
   taskSearchQuery:"",
    setTaskSearchQuery:() =>{}
});

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [cookieData, setCookieData] = useState<UserData | null>(null);
  const [isCookieLoading, setIsCookieLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [allTags, setAllTags] = useState<TagDataProps[]>([]);
  const [allTasks, setAllTasks] = useState<TaskDataProps[]>([]);
  const [selectedTasksType, setSelectedTasksType] = useState("Created");
  const [tagId, setTagId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [viewOfData, setViewOfData] = useState("Table");
  const [filterPriority, setFilterPriority] = useState("Low-High");
  const [searchQuery, setSearchQuery] = useState("");
   const [tagSearchQuery, setTagSearchQuery] = useState("");
const [taskSearchQuery, setTaskSearchQuery] = useState("");


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

  useEffect(() => {
    if (cookieData) {
      setIsCookieLoading(false);
    }
  }, [cookieData]);

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
        selectedTasksType,
        setSelectedTasksType,
        tagId,
        setTagId,
        userId,
        setUserId,
        openAddModal,
        setOpenAddModal,
        viewOfData,
        setViewOfData,
        filterPriority,
        setFilterPriority,
        searchQuery,
        setSearchQuery,
        tagSearchQuery, 
        setTagSearchQuery,
        taskSearchQuery, setTaskSearchQuery
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
