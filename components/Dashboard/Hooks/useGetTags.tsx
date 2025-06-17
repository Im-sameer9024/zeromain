"use client";

import { useEffect } from "react";
import axios from "axios";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";

const useGetTags = () => {
  const { cookieData, allTags, setAllTags } = useAppContext();

//   console.log("cookieData in allTAgs", cookieData)

  useEffect(() => {
    const fetchTags = async () => {


      if (!cookieData?.id) return; // Wait until we have cookieData.id

      try {
        const response = await axios.get(
          `https://task-management-backend-kohl-omega.vercel.app/api/tags/get-tags/${cookieData.id}`
        );

        if (response.status === 200) {
          setAllTags(response.data?.data || []);
        }
        toast.success("Tags loaded successfully", { duration: 2000 });
      } catch (error) {
        console.error("Error fetching tags:", error);
        setAllTags([]); // Reset on error
      }
    };

    fetchTags();
  }, [cookieData?.id, setAllTags]); // Proper dependencies

  return { allTags };
};

export default useGetTags;