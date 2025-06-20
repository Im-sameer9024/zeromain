/* eslint-disable react-hooks/exhaustive-deps */
import { useAppContext } from "@/context/AppContext";
import axios, { CancelTokenSource } from "axios";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

interface TaskFetchOptions {
  adminId?: string;
  userId?: string;
}

const useGetTasks = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { cookieData, isCookieLoading, allTasks, setAllTasks } =
    useAppContext();

  const fetchTasks = useCallback(
    async (cancelToken: CancelTokenSource) => {
      if (!cookieData) {
        setLoading(false);
        return;
      }

      const loadingId = toast.loading("Fetching tasks...");

      try {
        setLoading(true);
        setError(null);

        const params: TaskFetchOptions = {};
        if (cookieData.role === "Admin") {
          params.adminId = cookieData.id;
        } else {
          params.userId = cookieData.id;
        }

        const response = await axios.get(
          "https://task-management-backend-seven-tan.vercel.app/api/tasks/get-all-tasks",
          {
            params,
            cancelToken: cancelToken.token,
            timeout: 10000,
          }
        );

        if (!response.data?.data || !Array.isArray(response.data.data)) {
          throw new Error("Invalid tasks data structure");
        }

        setAllTasks(response.data.data);
        toast.success("Tasks loaded successfully", {
          id: loadingId,
          duration: 2000,
        });
      } catch (err) {
        if (!axios.isCancel(err)) {
          const errorMessage = axios.isAxiosError(err)
            ? err.response?.data?.message || err.message
            : "Failed to fetch tasks";
          setError(errorMessage);
          toast.error(`Error: ${errorMessage}`, { id: loadingId });
        }
      } finally {
        setLoading(false);
        toast.dismiss(loadingId);
      }
    },
    [isCookieLoading, cookieData]
  );

  useEffect(() => {
    if (isCookieLoading) return;

    const cancelTokenSource = axios.CancelToken.source();
    fetchTasks(cancelTokenSource);

    return () => {
      cancelTokenSource.cancel("Component unmounted");
    };
  }, [fetchTasks, isCookieLoading]);

  return {
    allTasks,
    loading: loading || isCookieLoading,
    error,
    refreshTasks: () => {
      const cancelTokenSource = axios.CancelToken.source();
      fetchTasks(cancelTokenSource);
    },
  };
};

export default useGetTasks;
