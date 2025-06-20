"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";

interface AdminFormProps {
  email: string;
  password: string;
}

const useAdminLogin = () => {
  const router = useRouter();
  const { setCookieData } = useAppContext();

  const [showPassword, setShowPassword] = useState(false);

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
        "https://task-management-backend-seven-tan.vercel.app/api/auth/login-company-admin",
        data
      );

      if (response.status === 200) {
        router.push("/admin/dashboard");
      }

      const responseData = structuredClone(response.data?.data);

      setCookieData(responseData);

      Cookies.set("cookieData", JSON.stringify(responseData), { expires: 7 });
      Cookies.set("token", responseData.token, { expires: 7 });
      router.push("/admin/dashboard");
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
      onSubmit,
      showPassword,
      setShowPassword,
    },
  };
};

export default useAdminLogin;
