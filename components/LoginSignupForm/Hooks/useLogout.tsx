import { useAppContext } from "@/context/AppContext";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import toast from "react-hot-toast";

const useLogout = () => {
  const { setCookieData } = useAppContext();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const LogOut = async () => {
    const toastId = toast.loading("Logging out...", {
      position: "top-center",
      duration: 2000,
    });

    startTransition(async () => {
      try {
        // Clear cookies
        Cookies.remove("token");
        Cookies.remove("cookieData");
        
        // Clear context state
        setCookieData(null);
        
        // Wait a moment for state to update before redirecting
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Redirect and show success
        router.push("/");
        toast.success("Logged out successfully!", { 
          id: toastId,
          position: "top-center",
        });
        
        // Force a refresh to ensure middleware runs
        setTimeout(() => router.refresh(), 100);
      } catch (error) {
        console.error("Logout error:", error);
        toast.error("Failed to log out. Please try again.", { 
          id: toastId,
          position: "top-center",
        });
      }
    });
  };

  return {
    LogOut,
    isPending,
  };
};

export default useLogout;