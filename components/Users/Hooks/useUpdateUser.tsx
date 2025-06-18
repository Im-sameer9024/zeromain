// hooks/useUpdateUser.ts
"use client";
//@ts-ignore
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";

interface FormValues {
  name: string;
  email: string;
  priority: string;
}

const useUpdateUser = () => {
  const { cookieData, setOpen, userId } = useAppContext();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  const updateUser = async (data: FormValues) => {
    const response = await axios.put(
      `https://task-management-backend-kohl-omega.vercel.app/api/auth/update-user/${userId}`,
      {
        name: data.name,
        email: data.email,
        priority: parseInt(data.priority),
      },
    );
    return response.data;
  };

  const mutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries(["companyUsers", cookieData?.id]);
      toast.success("User updated successfully");
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update user");
    },
  });

  return {
    register,
    handleSubmit,
    onSubmit: mutation.mutate,
    setValue,
    reset,
    errors,
    isSubmitting: isSubmitting || mutation.isLoading,
  };
};

export default useUpdateUser;