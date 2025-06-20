"use client";
//@ts-error-ignore
import { useState, useEffect, useCallback, useRef } from "react";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";

interface TaskTimer {
  time: number;
  isRunning: boolean;
  status: string;
}

const useTaskTimer = (
  taskId: string,
  initialStatus: string,
  initialTime: number = 0
) => {
  const { cookieData } = useAppContext();
  const [timer, setTimer] = useState<TaskTimer>({
    time: initialTime,
    isRunning: initialStatus === "IN_PROGRESS",
    status: initialStatus,
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format time as HH:MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Update status and handle timer logic
  const updateStatus = useCallback(
    async (newStatus: string) => {
      try {
        // Stop the timer if it's running
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        // Update local state immediately for responsive UI
        setTimer((prev) => ({
          ...prev,
          isRunning: newStatus === "IN_PROGRESS",
          status: newStatus,
        }));

        // Make API call to update only the status
        const response = await axios.put(
          `https://task-management-backend-seven-tan.vercel.app/api/tasks/update-status/${taskId}`,
          {
            status: newStatus, // Only send status to API
          }
        );

        // If starting the timer, begin counting locally
        if (newStatus === "IN_PROGRESS") {
          intervalRef.current = setInterval(() => {
            setTimer((prev) => ({
              ...prev,
              time: prev.time + 1,
            }));
          }, 1000);
        }

        return response.data;
      } catch (error) {
        // @ts-error-ignore
        const err = error as unknown as {
          response?: { data?: { message?: string } };
        };
        toast.error(
          err?.response?.data?.message || "Failed to update task status"
        );
        throw error;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [taskId, cookieData]
  );

  // Initialize timer and clean up on unmount
  useEffect(() => {
    // Start timer if initial status is IN_PROGRESS
    if (initialStatus === "IN_PROGRESS" && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => ({
          ...prev,
          time: prev.time + 1,
        }));
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [initialStatus]);

  return {
    time: timer.time,
    formattedTime: formatTime(timer.time),
    status: timer.status,
    isRunning: timer.isRunning,
    updateStatus,
  };
};

export default useTaskTimer;
