
"use client";

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

const useAddTag = () => {
  const { cookieData, setOpenAddModal,openAddModal } = useAppContext();
  const queryClient = useQueryClient();
  const [showPicker, setShowPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#E89623");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TagForm>({
    defaultValues: {
      name: "",
      color: "#E89623",
    },
  });

  const addTag = async (data: TagForm) => {
    const response = await axios.post(
      "https://task-management-backend-kohl-omega.vercel.app/api/tags/create-tag",
      {
        name: data.name,
        color: data.color,
        createdBy: cookieData?.id,
      },
    );
    console.log("response of addTAg",response)
    debugger;


    return response.data?.data;
  };

  const mutation = useMutation({
    mutationFn: addTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags", cookieData?.id] });
      toast.success("Tag created successfully");
      setOpenAddModal(false);
      reset();
    },
    onError: (error: import("axios").AxiosError) => {
      toast.error(
        (error.response?.data as { message?: string })?.message || "Failed to create tag"
      );
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
    isSubmitting: isSubmitting || mutation.status === "pending",
    selectedColor,
    setSelectedColor,
    handleColorSelect,
    showPicker,
    setShowPicker,
    setValue,
    setOpenAddModal,openAddModal
  };
};

export default useAddTag;