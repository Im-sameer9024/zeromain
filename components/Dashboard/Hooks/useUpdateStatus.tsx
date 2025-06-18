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
      return;
    }

    const loadingId = toast.loading("Update task Status...");

    try {
      const response = await axios.put(
        `https://task-management-backend-kohl-omega.vercel.app/api/tasks/update-task/${taskId}`,
        { status }
      );

      console.log("response is here", response);

      // Adjust based on your actual API response structure
      toast.success("Tasks Updated Successfully", { id: loadingId });
    } catch (err) {
      console.error("Error fetching tasks:", err);
      toast.error("Failed to fetch tasks", { id: loadingId });
    }finally{
      toast.dismiss(loadingId);
    }
  };

  return {
    updateStatus,
  };
};

export default useUpdateStatus;
