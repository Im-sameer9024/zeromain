"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";

interface TaskFetchOptions {
  adminId?: string;
  userId?: string;
}

const useAssignedTasks = () => {
  const { cookieData } = useAppContext();

  const fetchAssignedTasks = async () => {
    if (!cookieData) {
      toast.error("Please login to view tasks");
      return [];
    }

    const params: TaskFetchOptions = {};
    if (cookieData.role === "Admin") {
      params.adminId = cookieData.id;
    } else {
      params.userId = cookieData.id;
    }

    const response = await axios.get(
      "https://task-management-server-rouge-tau.vercel.app/api/tasks/assigned-tasks",
      { params }
    );

    return response.data?.data || [];
  };

  const {
    data: assignedTasks = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["assignedTasks", cookieData?.id],
    queryFn: fetchAssignedTasks,
    enabled: false, // We'll manually trigger this
  });

  return {
    assignedTasks,
    isLoading,
    isError,
    error: error as Error,
    refetchAssignedTasks: refetch,
  };
};

export default useAssignedTasks;
