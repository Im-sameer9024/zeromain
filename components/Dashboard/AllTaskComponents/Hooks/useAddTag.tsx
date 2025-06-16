"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface TagForm{
  name: string;
  color: string;
}

const useAddTag = () => {
  const { cookieData, setOpen, allTags, setAllTags } = useAppContext();

  console.log("cookieData in Single", cookieData);

  const [showPicker, setShowPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#E89623");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TagForm>({
    defaultValues: {
      name: "",
      color: "#E89623",
    },
  });

  const onSubmit = async (data: TagForm) => {
    const toastId = toast.loading("Logging in...");

    try {
      const response = await axios.post(
        "https://task-management-backend-kohl-omega.vercel.app/api/tags/create-tag",
        {
          name: data.name,
          color: data.color,
          createdBy: cookieData?.id,
        }
      );

    setAllTags((prev:any[]) => [...prev, response.data.data]  );

      console.log("response of tag create", response);

      toast.success("Login successful!", { id: toastId });
      setOpen(false);
    } catch (error: any) {
      console.error("Error creating tag:", error);
      toast.error(error.response?.data?.message || "Failed to create tag");
    } finally {
      toast.dismiss(toastId);
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setValue("color", color);
    setShowPicker(false);
  };

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isSubmitting,
    selectedColor,
    setSelectedColor,
    handleColorSelect,
    showPicker,
    setShowPicker,
    allTags,
    setAllTags,
    setOpen,
  };
};

export default useAddTag;
