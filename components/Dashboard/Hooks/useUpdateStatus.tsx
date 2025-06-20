//@ts-error-ignore
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";

const useUpdateStatus = () => {
  const { cookieData } = useAppContext();

  const updateStatus = async (
    e: React.MouseEvent<HTMLButtonElement>,
    taskId: string,
    status: string
  ) => {
    e.stopPropagation();

    // Check if we have the required data
    if (!cookieData?.id || !cookieData?.role) {
      toast.error("Authentication required");
      return;
    }

    const loadingId = toast.loading(
      status === "IN_PROGRESS"
        ? "Starting task..."
        : status === "PENDING"
        ? "Stopping task..."
        : status === "COMPLETED"
        ? "Completing task..."
        : "Updating task status..."
    );

    try {
      const response = await axios.put(
        `https://task-management-backend-seven-tan.vercel.app/api/tasks/update-task/${taskId}`,
        { status },
        {
          headers: {
            "Content-Type": "application/json",
            // Add authorization headers if needed
            // 'Authorization': `Bearer ${cookieData.token}`,
          },
        }
      );

      // Show success message based on status
      const successMessage =
        status === "IN_PROGRESS"
          ? "Task started successfully!"
          : status === "PENDING"
          ? "Task stopped successfully!"
          : status === "COMPLETED"
          ? "Task completed successfully!"
          : "Task updated successfully!";

      toast.success(successMessage, { id: loadingId });

      return response.data;
    } catch (error) {
      console.error("Error updating task status:", error);
      const err = error as unknown as {
        response?: { data?: { message?: string } };
        message?: string;
      };

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update task status";

      toast.error(errorMessage, { id: loadingId });
      throw err;
    } finally {
      toast.dismiss(loadingId);
    }
  };

  return {
    updateStatus,
  };
};

export default useUpdateStatus;
