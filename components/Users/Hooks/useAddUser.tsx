/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAppContext } from "@/context/AppContext";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface FormValues {
  name: string;
  email: string;
  password: string;
  priority: string;
  companyAdminId?: string;
}

const useAddUser = () => {
  const { cookieData, openAddModal, setOpenAddModal } = useAppContext();

  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      priority: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    const actualData = {
      name: data?.name,
      email: data?.email,
      password: data?.password,
      priority: parseInt(data?.priority),
      companyAdminId: cookieData?.id,
    };

    const toastId = toast.loading("Creating user...");
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const response = await axios.post(
        "https://task-management-backend-seven-tan.vercel.app/api/auth/register-user",
        actualData
      );

      toast.success("User created successfully!", { id: toastId });
      setOpenAddModal(false);
      // Invalidate and refetch the users query
      await queryClient.invalidateQueries({
        queryKey: ["companyUsers", cookieData?.id],
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to create user";
      toast.error(errorMessage, { id: toastId });
    }
  };

  return {
    register,
    onSubmit,
    open,
    openAddModal,
    handleSubmit,
    setOpenAddModal,
    setValue,
    errors,
    isSubmitting,
  };
};

export default useAddUser;
