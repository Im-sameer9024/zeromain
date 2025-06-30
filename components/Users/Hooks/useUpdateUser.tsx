/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useUpdateUser.ts
"use client";

import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { useEffect, useRef } from "react";
import useGetTeamMembers from "./useGetTeammembers";

interface FormValues {
  name: string;
  email: string;
  priority: string;
  teamMemberIds: string[];
  adminTeamMemberIds: string[];
}

const useUpdateUser = () => {
  const { cookieData, setOpen, userId } = useAppContext();
  const queryClient = useQueryClient();

  // Get existing team members for the user being edited
  const { existingTeamMembers, existingAdminMembers, isLoadingTeamMembers } =
    //@ts-expect-error
    useGetTeamMembers(userId);

  // Track if we've already initialized the form data
  const hasInitializedTeamMembers = useRef(false);
  const hasInitializedAdminMembers = useRef(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      email: "",
      priority: "",
      teamMemberIds: [],
      adminTeamMemberIds: [],
    },
  });

  // Initialize team members when data is loaded
  useEffect(() => {
    if (
      !isLoadingTeamMembers &&
      existingTeamMembers &&
      !hasInitializedTeamMembers.current
    ) {
      const teamMemberIds = Array.isArray(existingTeamMembers)
        ? existingTeamMembers.map((member: any) => member.id)
        : [];

      console.log("Setting team member IDs:", teamMemberIds); // Debug log
      setValue("teamMemberIds", teamMemberIds);
      hasInitializedTeamMembers.current = true;
    }
  }, [isLoadingTeamMembers, existingTeamMembers, setValue]);

  // Initialize admin members when data is loaded
  useEffect(() => {
    if (
      !isLoadingTeamMembers &&
      existingAdminMembers &&
      !hasInitializedAdminMembers.current
    ) {
      const adminMemberIds = Array.isArray(existingAdminMembers)
        ? existingAdminMembers.map((admin: any) => admin.id)
        : [];

      console.log("Setting admin member IDs:", adminMemberIds); // Debug log
      setValue("adminTeamMemberIds", adminMemberIds);
      hasInitializedAdminMembers.current = true;
    }
  }, [isLoadingTeamMembers, existingAdminMembers, setValue]);

  // Reset initialization flags when userId changes (if editing different user)
  useEffect(() => {
    hasInitializedTeamMembers.current = false;
    hasInitializedAdminMembers.current = false;
    reset({
      name: "",
      email: "",
      priority: "",
      teamMemberIds: [],
      adminTeamMemberIds: [],
    });
  }, [userId, reset]);

  const handleSelectTeamMembers = (user: any) => {
    const currentUsers = watch("teamMemberIds") || [];
    if (currentUsers.includes(user.id)) {
      setValue(
        "teamMemberIds",
        currentUsers.filter((id: string) => id !== user.id)
      );
    } else {
      setValue("teamMemberIds", [...currentUsers, user.id]);
    }
  };

  const handleRemoveMember = (userId: string) => {
    const currentUsers = watch("teamMemberIds") || [];
    setValue(
      "teamMemberIds",
      currentUsers.filter((id: string) => id !== userId)
    );
  };

  const handleSelectAdminMembers = (admin: any) => {
    const currentAdmins = watch("adminTeamMemberIds") || [];
    if (currentAdmins.includes(admin.id)) {
      setValue(
        "adminTeamMemberIds",
        currentAdmins.filter((id: string) => id !== admin.id)
      );
    } else {
      setValue("adminTeamMemberIds", [...currentAdmins, admin.id]);
    }
  };

  const handleRemoveAdmin = (adminId: string) => {
    const currentAdmins = watch("adminTeamMemberIds") || [];
    setValue(
      "adminTeamMemberIds",
      currentAdmins.filter((id: string) => id !== adminId)
    );
  };

  const selectedTeamMembers = watch("teamMemberIds") || [];
  const selectedAdminMembers = watch("adminTeamMemberIds") || [];

  const updateUser = async (data: FormValues) => {
    const response = await axios.put(
      `https://task-management-server-rouge-tau.vercel.app/api/auth/update-user/${userId}`,
      {
        name: data.name,
        email: data.email,
        priority: parseInt(data.priority),
        teamMemberIds: data.teamMemberIds,
        adminTeamMemberIds: data.adminTeamMemberIds,
      }
    );
    return response.data;
  };

  const mutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["companyUsers", cookieData?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["teamMembers", userId],
      });
      toast.success("User updated successfully");
      setOpen(false);
    },
    onError: (error) => {
      const err = error as unknown as {
        response?: { data?: { message?: string } };
      };
      toast.error(err?.response?.data?.message || "Failed to update user");
    },
  });

  return {
    register,
    handleSubmit,
    onSubmit: mutation.mutate,
    setValue,
    reset,
    watch,
    isSubmitting: isSubmitting || mutation.status === "pending",
    isLoadingTeamMembers,
    errors,
    handleSelectTeamMembers,
    handleRemoveMember,
    handleSelectAdminMembers,
    handleRemoveAdmin,
    selectedTeamMembers,
    selectedAdminMembers,
    existingTeamMembers,
    existingAdminMembers,
  };
};

export default useUpdateUser;
