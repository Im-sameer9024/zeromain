"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";

const useGetAdmins = () => {
  const { cookieData } = useAppContext();
  const queryClient = useQueryClient();

  const fetchAdmins = async () => {
    if (!cookieData) {
      toast.error("Please login to view admins");
      return [];
    }

    try {
      const response = await axios.get(
        `https://task-management-server-rouge-tau.vercel.app/api/auth/company-users/${cookieData?.id}`
      );

      // Extract admin information from the company object
      const companyData = response.data?.data?.company;

      if (companyData && companyData.adminId) {
        // Format admin data to match the expected structure
        const adminData = {
          id: companyData.adminId,
          name: companyData.adminName,
          email: companyData.email,
          companyName: companyData.companyName,
          totalUsers: companyData.totalUsers,
          role: "admin", // Adding role for clarity
        };

        return [adminData]; // Return as array for consistency
      }

      return [];
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to fetch admin data");
      return [];
    }
  };

  const {
    data: companyAdmins = [],
    isLoading: isLoadingAdmins,
    isError: isErrorAdmins,
    error: adminError,
    refetch: refetchAdmins,
  } = useQuery({
    queryKey: ["companyAdmins", cookieData?.id],
    queryFn: fetchAdmins,
    enabled: !!cookieData?.id,
  });

  const invalidateAdmins = () => {
    queryClient.invalidateQueries({
      queryKey: ["companyAdmins", cookieData?.id],
    });
  };

  return {
    companyAdmins,
    invalidateAdmins,
    isLoadingAdmins,
    isErrorAdmins,
    adminError: adminError as Error,
    refetchAdmins,
  };
};

export default useGetAdmins;
