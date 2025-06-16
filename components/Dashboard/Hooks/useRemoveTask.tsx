import axios from "axios";

const useRemoveTask = () => {
  const removeTask = async (id: string) => {
    try {
      const response = await axios.delete(
        `https://task-management-backend-kohl-omega.vercel.app/api/tasks/delete-task/${id}`
      );

      console.log("response of remove task", response);
    } catch (error) {
      console.log("error occur in fetching tags", error);
    }
  };

  return {
    removeTask,
  };
};

export default useRemoveTask;
