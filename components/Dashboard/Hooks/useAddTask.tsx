"use client";
/* eslint-disable */

import { useAppContext } from "@/context/AppContext";
import { TaskProps } from "@/types/Task.types";

import axios from "axios";
import React, { useRef } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import useGetTasks from "./useGetTasks";


const useAddTask = () => {
  const { cookieData, open, setOpen, setAllTasks } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { refreshTasks } = useGetTasks();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    defaultValues: {
      title: "",
      description: "",
      tags: [],
      attachments: [],
    },
  });

  const onSubmit = async (data: any) => {
    const toastId = toast.loading("Creating task...");

    if (!cookieData) {
      toast.loading("Please login to create a task", {
        id: toastId,
        duration: 2000,
      });
      return;
    }

    let adId = null;
    let usId = null;

    if (cookieData.role === "Admin") {
      adId = cookieData.id;
    } else if (cookieData.role === "User") {
      usId = cookieData.id;
    }

    try {
      const formData = {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        adminId: adId,
        userId: usId,
        tagIds: data.tags,
        attachments: [
          "https://cdn.example.com/doc1.pdf",
          "https://cdn.example.com/image1.png",
        ],
      };

      debugger;
      // Submit to API
      const response = await axios.post<{data: TaskProps}>(
        "https://task-management-backend-kohl-omega.vercel.app/api/tasks/create-task",
        formData
      );

      if (response?.data?.data) {
        setAllTasks((prevTasks: TaskProps[]) => {
          const newTasks: TaskProps[] = prevTasks;
          newTasks.unshift(response.data.data as any);
          return newTasks;
        });
      }

      toast.success("Task created successfully!", { id: toastId });
      setOpen(false);

      refreshTasks();
    } catch (error: any) {
      console.error("Error creating task:", error);
      toast.error(error.response?.data?.message || "Failed to create task", {
        id: toastId,
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setValue("attachments", [...watch("attachments"), ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    const updatedAttachments = [...watch("attachments")];
    updatedAttachments.splice(index, 1);
    setValue("attachments", updatedAttachments);
  };

  const handleTagSelect = (tag: any) => {
    const currentTags = watch("tags");
    if (currentTags.includes(tag.id)) {
      setValue(
        "tags",
        currentTags.filter((t: any) => t !== tag.id)
      );
    } else if (currentTags.length < 3) {
      setValue("tags", [...currentTags, tag.id]);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    setValue(
      "tags",
      watch("tags").filter((t: any) => t !== tagId)
    );
  };

  const selectedTags = watch("tags");
  const attachments = watch("attachments");
  const dueDate = watch("dueDate");

  return {
    selectedTags,
    attachments,
    dueDate,
    handleRemoveTag,
    handleTagSelect,
    handleRemoveFile,
    handleFileChange,
    onSubmit,
    cookieData,
    fileInputRef,
    register,
    handleSubmit,
    errors,
    isSubmitting,
    setValue,
    open,
    setOpen,
  };
};

export default useAddTask;
