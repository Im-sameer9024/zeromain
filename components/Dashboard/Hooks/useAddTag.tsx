/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { TagForm } from "@/types/other"

import axios, { AxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { useState, Dispatch, SetStateAction } from "react";

interface TagResponse {
  data?: any;
}

const useAddTag = () => {
  const { cookieData, setOpenAddModal, openAddModal } = useAppContext();
  const queryClient = useQueryClient();
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>("#E89623");

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

  const addTag = async (data: TagForm): Promise<any> => {
    const response = await axios.post<TagResponse>(
      "https://task-management-backend-kohl-omega.vercel.app/api/tags/create-tag",
      {
        name: data.name,
        color: data.color,
        createdBy: cookieData?.id,
      },
    );
    console.log("response of addTag", response);
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
    onError: (error: AxiosError<any>) => {
      toast.error(error.response?.data?.message || "Failed to create tag");
    },
  });

  const handleColorSelect = (color: string): void => {
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
    setSelectedColor: setSelectedColor as Dispatch<SetStateAction<string>>,
    handleColorSelect,
    showPicker,
    setShowPicker: setShowPicker as Dispatch<SetStateAction<boolean>>,
    setValue,
    setOpenAddModal,
    openAddModal
  };
};

export default useAddTag;