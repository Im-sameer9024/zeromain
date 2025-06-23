"use client";
/* eslint-disable */

import { useAppContext } from "@/context/AppContext";

import axios from "axios";
import React, { useRef } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import useGetTasks from "./useGetTasks";
import { TaskDataProps } from "@/types/Task.types";

const useAddTask = () => {
  const { cookieData, open, setOpen, setAllTasks } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = React.useState(false);

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
    console.log("Form data:", data);
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
        attachments: data.attachments,
      };

      debugger;
      // Submit to API
      const response = await axios.post<{ data: TaskDataProps }>(
        "https://task-management-backend-seven-tan.vercel.app/api/tasks/create-task",
        formData
      );

      if (response?.data?.data) {
        setAllTasks((prevTasks: TaskDataProps[]) => {
          const newTasks: TaskDataProps[] = prevTasks;
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      const formData = new FormData();
      for (const file of newFiles) {
        formData.append("attachments", file);
      }

      try {
        const toastId = toast.loading("Uploading files..."); // save the toast ID

        const res = await fetch(
          "https://task-management-backend-seven-tan.vercel.app/api/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const result = await res.json();
        console.log("Instant upload result:", result);

        setValue("attachments", [
          ...watch("attachments"),
          ...result.files, // ✅ Use the uploaded file metadata from response
        ]);

        toast.success("Files uploaded successfully!");
        toast.dismiss(toastId); // ✅ dismiss the loading toast
      } catch (error) {
        toast.error("Failed to upload files. Please try again.");
        console.error("Instant upload failed:", error);
      } finally {
        setLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Clear the input field
        }
      }
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
