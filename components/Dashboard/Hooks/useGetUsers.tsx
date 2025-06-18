"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";


const useGetUsers = () => {
  const { cookieData } = useAppContext();
    const queryClient = useQueryClient();

  const fetchUsers = async () => {
    if (!cookieData) {
      toast.error("Please login to view tasks");
      return [];
    }


    const response = await axios.get(
      `https://task-management-backend-kohl-omega.vercel.app/api/auth/company-users/${cookieData?.id}`,
      
    );

    return response.data?.data?.users || [];
  };

  const {
    data: companyUsers = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["companyUsers", cookieData?.id],
    queryFn: fetchUsers,
    enabled: !!cookieData?.id, // We'll manually trigger this
  });

   const invalidateUsers = () => {
    queryClient.invalidateQueries({
      queryKey: ["companyUsers", cookieData?.id],
    });
  };

  return {
    companyUsers,
    invalidateUsers,
    isLoading,
    isError,
    error: error as Error,
    refetchCompanyUsers: refetch,
  };
};

export default useGetUsers;