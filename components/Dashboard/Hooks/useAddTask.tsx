/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAppContext } from '@/context/AppContext';
import axios from 'axios';
import React, { useRef } from 'react'
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const useAddTask = () => {
  const { cookieData,open,setOpen,setAllTasks } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);



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

    try {
      const formData = {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        adminId: cookieData.role === "admin" ? null : cookieData.id,
        userId: cookieData.role === "admin" ? cookieData.id : null,
        tagIds: data.tags,
        attachments: [
          "https://cdn.example.com/doc1.pdf",
          "https://cdn.example.com/image1.png",
        ],
      };

      console.log("formDAta of task is ", formData);

      // Submit to API
      const response = await axios.post(
        "https://task-management-backend-kohl-omega.vercel.app/api/tasks/create-task",
        formData
      );

      setAllTasks((prevTasks:any[]) => [...prevTasks, response.data?.data]);

      console.log("task is created successfully ", response);

      toast.success("Task created successfully!", { id: toastId });
      setOpen(false);
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
        currentTags.filter((t:any) => t !== tag.id)
      );
    } else {
      setValue("tags", [...currentTags, tag.id]);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    setValue(
      "tags",
      watch("tags").filter((t:any) => t !== tagId)
    );
  };

  const selectedTags = watch("tags");
  const attachments = watch("attachments");
  const dueDate = watch("dueDate");

  return {
    selectedTags,attachments,dueDate,handleRemoveTag,handleTagSelect,handleRemoveFile,handleFileChange,onSubmit,cookieData,fileInputRef,register,
    handleSubmit,errors, isSubmitting ,setValue,open,setOpen
  }
}

export default useAddTask
