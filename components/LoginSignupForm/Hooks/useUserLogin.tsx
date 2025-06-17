"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from "axios";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";

interface UserFormProps {
  email: string;
  password: string;
}

const useUserLogin = () => {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const { setCookieData } = useAppContext();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormProps>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: UserFormProps) => {
    const toastId = toast.loading("Logging in...");
    try {
      const response = await axios.post(
        "https://task-management-backend-kohl-omega.vercel.app/api/auth/login-user",
        data
      );

      if (response.status === 200) {
        router.push("/user/dashboard");
      }

      const responseData = structuredClone(response.data?.data);

      console.log("test-----------in user Login------------- >",responseData)

      setCookieData(responseData);

      Cookies.set("cookieData", JSON.stringify(responseData), { expires: 7 });
      Cookies.set("token", responseData.token, { expires: 7 });

      toast.success(" User Login successful!", { id: toastId });
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
    userInfo: {
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

export default useUserLogin;
