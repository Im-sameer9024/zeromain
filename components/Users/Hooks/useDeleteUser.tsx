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
      `https://task-management-backend-kohl-omega.vercel.app/api/auth/delete-user/${userId}`,
    );
    return response.data;
  };

  const mutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries(["companyUsers", cookieData?.id]);
      toast.success("User deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete user");
    },
  });

  return mutation;
};

export default useDeleteUser;