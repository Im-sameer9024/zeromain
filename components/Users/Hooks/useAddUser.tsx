/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import { useRouter } from "next/navigation";
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

  const { cookieData,open,setOpen } = useAppContext();

  const router = useRouter();

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

    console.log("actualdaa ", actualData);

    const toastId = toast.loading("Creating user...");
    try {
      const response = await axios.post(
        "https://task-management-backend-kohl-omega.vercel.app/api/auth/register-user",
        actualData
      );

      console.log("response is here", response);

      toast.success("User created successfully!", { id: toastId });
      setOpen(false);
      // Optional: redirect or refresh data
      router.refresh();
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
    setOpen,
    handleSubmit,
    setValue,
    errors,
    isSubmitting,
  };
};

export default useAddUser;
