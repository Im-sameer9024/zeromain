// hooks/useDeleteUser.ts
"use client";

import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";

const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { cookieData } = useAppContext();

  const deleteUser = async (userId: string) => {
    const response = await axios.delete(
      `https://task-management-server-rouge-tau.vercel.app/api/auth/delete-user/${userId}`
    );
    return response.data;
  };

  const mutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      if (cookieData?.id) {
        queryClient.invalidateQueries({
          queryKey: ["companyUsers", cookieData.id],
        });
      }
      toast.success("User deleted successfully");
    },
    onError: (error) => {
      // If using AxiosError type, you can import and use it for better type safety:
      // import type { AxiosError } from "axios";
      // onError: (error: AxiosError) => { ... }
      const err = error as unknown as {
        response?: { data?: { message?: string } };
      };
      toast.error(err?.response?.data?.message || "Failed to delete user");
    },
  });

  return mutation;
};

export default useDeleteUser;
