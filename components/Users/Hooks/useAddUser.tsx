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
  teamMemberIds:string[]
}

const useAddUser = () => {
  const { cookieData, openAddModal, setOpenAddModal } = useAppContext();

  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      priority: "",
      teamMemberIds:[]
    },
  });


  const handleSelectTeamMembers = (user: any) => {
    const currentUser = watch("teamMemberIds");
    if (currentUser.includes(user.id)) {
      setValue(
        "teamMemberIds",
        currentUser.filter((t: any) => t !== user.id)
      );
    } else  {
      setValue("teamMemberIds", [...currentUser, user.id]);
    }
  };

  const handleRemoveMember = (tagId: string) => {
    setValue(
      "teamMemberIds",
      watch("teamMemberIds").filter((t: any) => t !== tagId)
    );
  };


  const selectedTeamMembers = watch("teamMemberIds")

  const onSubmit = async (data: FormValues) => {
    const actualData = {
      name: data?.name,
      email: data?.email,
      password: data?.password,
      priority: parseInt(data?.priority),
      companyAdminId: cookieData?.id,
      teamMemberIds: selectedTeamMembers
      
    };

    console.log("actual Data of User create",actualData)
    debugger;

    const toastId = toast.loading("Creating user...");
    try {
      const response = await axios.post(
        "https://task-management-backend-kohl-omega.vercel.app/api/auth/register-user",
        actualData
      );


      console.log("response of user create",response)
      debugger;



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
    handleRemoveMember,
    handleSelectTeamMembers,
    selectedTeamMembers
  };
};

export default useAddUser;
