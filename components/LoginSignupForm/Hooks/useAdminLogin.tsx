/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
// import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { useState } from "react";

interface AdminFormProps {
  email: string;
  password: string;
}

const useAdminLogin = () => {
//   const router = useRouter();

const[showPassword,setShowPassword]=useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminFormProps>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: AdminFormProps) => {
    const toastId = toast.loading("Logging in...");
    try {
      const response = await axios.post(
        "https://task-management-backend-kohl-omega.vercel.app/api/auth/login-company-admin",
        data
      );

      const responseData = response.data?.data;

      console.log("login data is here", responseData);

      const cookieData = {
        id: responseData.id,
        name: responseData.name,
        email: responseData.email,
        token: responseData.token,
        role: responseData.role,
      };

      Cookies.set("cookieData", JSON.stringify(cookieData), { expires: 7 });
      Cookies.set("token", cookieData.token, { expires: 7 });
    //   router.push("/admin/dashboard");
      toast.success("Admin Login successful!", { id: toastId });
    } catch (error: any) {
      let errorMessage = "Login failed";
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      toast.error(errorMessage, { id: toastId });
    } finally {
      toast.dismiss(toastId);
    }
  };

  return {
    adminInfo: {
      register,
      handleSubmit,
      errors,
      isSubmitting,
      onSubmit,showPassword,setShowPassword
    },
  };
};

export default useAdminLogin;
