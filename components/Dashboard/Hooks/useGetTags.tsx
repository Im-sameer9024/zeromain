"use client";
//@ts-ignore
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import { useEffect } from "react";

const useGetTags = () => {
  const { cookieData } = useAppContext();
  const queryClient = useQueryClient();

  const fetchTags = async () => {
    if (!cookieData?.id) return []; // Return empty array if no cookieData.id

    const response = await axios.get(
      `https://task-management-backend-kohl-omega.vercel.app/api/tags/get-tags/${cookieData.id}`
    );
    return response.data?.data || [];
  };

  const {
    data: allTags = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["tags", cookieData?.id],
    queryFn: fetchTags,
    enabled: !!cookieData?.id, // Only enable when cookieData.id exists
  });

  // Function to invalidate and refetch tags
  const invalidateTags = () => {
    queryClient.invalidateQueries({
      queryKey: ["tags", cookieData?.id],
    });
  };

  return {
    allTags,
    isLoading,
    isError,
    error,
    refetchTags: refetch,
    invalidateTags,
  };
};

export default useGetTags;