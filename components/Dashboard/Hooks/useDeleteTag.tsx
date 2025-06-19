"use client";
//@ts-error-ignore
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";

const useDeleteTag = () => {
  const queryClient = useQueryClient();
  const { cookieData } = useAppContext();

  const deleteTag = async (tagId: string) => {
    const response = await axios.delete(
      `https://task-management-backend-kohl-omega.vercel.app/api/tags/delete-tag/${tagId}`,
      );
    return response.data;
  };

  const mutation = useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags", cookieData?.id] });
      toast.success("Tag deleted successfully");
    },
    onError: (error) => {
      const err = error as unknown as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to delete tag");
    },
  });

  return mutation;
};

export default useDeleteTag;