import axios from "axios";
import toast from "react-hot-toast";

const useRemoveTask = () => {
  const removeTask = async (id: string) => {
    const toastId = toast.loading("Removing Task...");

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const response = await axios.delete(
        `https://task-management-backend-seven-tan.vercel.app/api/tasks/delete-task/${id}`
      );

      toast.success("Task Removed Successfully", { id: toastId });
    } catch (error) {
      console.log("error occur in fetching tags", error);
    } finally {
      toast.dismiss(toastId);
    }
  };

  return {
    removeTask,
  };
};

export default useRemoveTask;
