/* eslint-disable @typescript-eslint/no-explicit-any */
// components/UpdateUserForm.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppContext } from "@/context/AppContext";
import { X } from "lucide-react";
import { useEffect } from "react";
import useGetUsers from "../Dashboard/Hooks/useGetUsers";
import useUpdateUser from "./Hooks/useUpdateUser";

const UpdateUserForm = () => {
  const { setOpen, userId } = useAppContext();
  const { companyUsers } = useGetUsers();

  const userToEdit = companyUsers.find((user:any) => user.id === userId);

  const {
    register,
    handleSubmit,
    onSubmit,
    setValue,
    errors,
    isSubmitting,
    reset,
  } = useUpdateUser();

  // Initialize form with user data
  useEffect(() => {
    if (userToEdit) {
      reset({
        name: userToEdit.name,
        email: userToEdit.email,
        priority: userToEdit.priority.toString(),
      });
    }
  }, [userToEdit, reset]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-Inter font-bold text-xl">Update User</h2>
        <Button
          onClick={() => setOpen(false)}
          variant="ghost"
          className="text-text hover:cursor-pointer hover:bg-transparent"
        >
          <X />
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-3 text-[#494A4BFF] space-y-6">
        {/* Form fields same as AddUserForm */}
        {/* Name Field */}
        <div className="flex flex-col gap-2">
          <label className="font-Inter font-semibold" htmlFor="name">
            Name
          </label>
          <Input
            type="text"
            {...register("name", {
              required: "Name is required",
              minLength: {
                value: 2,
                message: "Name must be at least 2 characters",
              },
            })}
            placeholder="Full Name"
            className={`border-2 rounded ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.name && (
            <span className="text-red-500 text-sm">{errors.name.message}</span>
          )}
        </div>

        {/* Email Field */}
        <div className="flex flex-col gap-2">
          <label className="font-Inter font-semibold" htmlFor="email">
            Email
          </label>
          <Input
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            placeholder="Email address"
            className={`border-2 rounded ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.email && (
            <span className="text-red-500 text-sm">{errors.email.message}</span>
          )}
        </div>

        {/* Priority Field */}
        <div className="flex flex-col gap-2">
          <label className="font-Inter font-semibold" htmlFor="priority">
            Priority
          </label>
          <Select
            onValueChange={(value) => setValue("priority", value)}
            defaultValue={userToEdit?.priority.toString()}
          >
            <SelectTrigger
              className={`w-full rounded border-2 ${
                errors.priority ? "border-red-500" : "border-gray-300"
              }`}
            >
              <SelectValue placeholder="Select priority (1-5)" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {[1, 2, 3, 4, 5].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors.priority && (
            <span className="text-red-500 text-sm">Priority is required</span>
          )}
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <Button
            type="button"
            onClick={() => setOpen(false)}
            className="hover:cursor-pointer bg-[#F8F9FAFF] text-text hover:bg-[#dfecfa]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="hover:cursor-pointer bg-lightBtn hover:bg-darkBlueBtn"
          >
            {isSubmitting ? "Updating..." : "Update User"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UpdateUserForm;