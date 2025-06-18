// hooks/useUpdateTag.ts
"use client";
//@ts-ignore
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { useState } from "react";

interface TagForm {
  name: string;
  color: string;
}

const useUpdateTag = () => {
  const { cookieData, setOpen, tagId } = useAppContext();
  const queryClient = useQueryClient();
  const [showPicker, setShowPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#E89623");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TagForm>();

  const updateTag = async (data: TagForm) => {
    const response = await axios.put(
      `https://task-management-backend-kohl-omega.vercel.app/api/tags/update-tag/${tagId}`,
      {
        name: data.name,
        color: data.color,
      },
    );
    return response.data;
  };

  const mutation = useMutation({
    mutationFn: updateTag,
    onSuccess: () => {
      
      queryClient.invalidateQueries(["tags", cookieData?.id]);
      toast.success("Tag updated successfully");
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update tag");
    },
  });

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setValue("color", color);
    setShowPicker(false);
  };

  return {
    register,
    handleSubmit,
    onSubmit: mutation.mutate,
    errors,
    isSubmitting: isSubmitting || mutation.isLoading,
    selectedColor,
    setSelectedColor,
    handleColorSelect,
    showPicker,
    setShowPicker,
    setValue,
    reset,
  };
};

export default useUpdateTag;