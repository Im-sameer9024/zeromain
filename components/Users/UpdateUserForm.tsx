/* eslint-disable @typescript-eslint/no-explicit-any */
// components/UpdateUserForm.tsx
"use client";

import { SubmitHandler } from "react-hook-form";

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
import { X, User, Crown, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import useGetUsers from "../Dashboard/Hooks/useGetUsers";
import useUpdateUser from "./Hooks/useUpdateUser";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ScrollArea } from "../ui/scroll-area";
import { motion } from "framer-motion";
import { CgClose } from "react-icons/cg";
import useGetAdmins from "./Hooks/useGetAdmin";

type FormValues = {
  name: string;
  email: string;
  priority: string;
  teamMemberIds: string[];
  adminTeamMemberIds: string[];
};

const popupVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

const UpdateUserForm = () => {
  const { setOpen, userId } = useAppContext();
  const { companyUsers } = useGetUsers();
  const { companyAdmins } = useGetAdmins();

  const userToEdit = companyUsers.find((user: any) => user.id === userId);
  const hasInitializedUserData = useRef(false);

  const {
    register,
    handleSubmit,
    onSubmit,
    setValue,
    errors,
    isSubmitting,
    isLoadingTeamMembers,
    reset,
    handleSelectTeamMembers,
    handleRemoveMember,
    handleSelectAdminMembers,
    handleRemoveAdmin,
    selectedTeamMembers,
    selectedAdminMembers,
    existingTeamMembers,
    existingAdminMembers,
  } = useUpdateUser();

  // Initialize form with user data - FIXED VERSION
  useEffect(() => {
    if (userToEdit && !hasInitializedUserData.current) {
      // Only set the basic user fields, don't reset team member arrays
      setValue("name", userToEdit.name);
      setValue("email", userToEdit.email);
      setValue("priority", userToEdit.priority.toString());
      hasInitializedUserData.current = true;
    }
  }, [userToEdit, setValue]);

  // Reset initialization flag when userId changes
  useEffect(() => {
    hasInitializedUserData.current = false;
  }, [userId]);

  const handleFormSubmit: SubmitHandler<FormValues> = (data) => {
    onSubmit(data);
  };

  // Show loading spinner while fetching team members data
  if (isLoadingTeamMembers) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading team members...</span>
        </div>
      </div>
    );
  }

  // Debug logs to help troubleshoot
  console.log("Existing team members:", existingTeamMembers);
  console.log("Selected team members:", selectedTeamMembers);
  console.log("Existing admin members:", existingAdminMembers);
  console.log("Selected admin members:", selectedAdminMembers);

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

      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="mt-3 text-[#494A4BFF] space-y-6"
      >
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
              errors?.name ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors?.name && (
            <span className="text-red-500 text-sm">
              {errors?.name?.message}
            </span>
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
              errors?.email ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors?.email && (
            <span className="text-red-500 text-sm">
              {errors?.email.message}
            </span>
          )}
        </div>

        {/* Team Members Management */}
        <div className="flex flex-col gap-2">
          <h2 className="font-Inter font-semibold">Team Members</h2>
          <div className="flex gap-2 items-center flex-wrap">
            {/* Display currently selected team members */}
            {selectedTeamMembers && selectedTeamMembers.length > 0 ? (
              selectedTeamMembers.map((userId: any) => {
                // First check if it's from existing team members (from API)
                let user = existingTeamMembers?.find(
                  (member: any) => member.id === userId
                );
                // If not found, check company users
                if (!user) {
                  user = companyUsers?.find((user: any) => user.id === userId);
                }

                return user ? (
                  <div
                    key={user.id}
                    className="relative inline-block m-1 group"
                  >
                    <span
                      className={`px-3 py-1 bg-gray-400 rounded-full text-white text-xs relative flex items-center gap-1`}
                    >
                      <User size={12} />
                      {user.name}
                      <CgClose
                        className="absolute -top-2 -right-2 text-lg text-black cursor-pointer 
                              opacity-0 group-hover:opacity-100 transition-opacity
                              bg-white rounded-full p-0.5 shadow-sm"
                        onClick={() => handleRemoveMember(user.id)}
                      />
                    </span>
                  </div>
                ) : null;
              })
            ) : (
              <span className="text-gray-500 text-sm italic">
                No team members selected
              </span>
            )}

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="text-text flex gap-2">
                  <User size={16} />
                  Add Users
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-2" align="start">
                <ScrollArea className="h-22 w-fit rounded-md border">
                  <motion.div
                    variants={popupVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-4 gap-2"
                  >
                    {companyUsers
                      ?.filter((user: any) => user.id !== userId) // Don't show the user being edited
                      .map((user: any) => (
                        <Button
                          key={user.id}
                          variant="outline"
                          className="hover:cursor-pointer bg-blue-200 disabled:cursor-not-allowed"
                          disabled={selectedTeamMembers?.includes(user.id)}
                          onClick={(e) => {
                            e.preventDefault();
                            handleSelectTeamMembers(user);
                          }}
                        >
                          {user.name}
                        </Button>
                      ))}
                  </motion.div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
          <p className="text-sm text-gray-600">
            Current team has {existingTeamMembers?.length || 0} member(s)
            {selectedTeamMembers?.length > 0 &&
              `, ${selectedTeamMembers.length} selected`}
          </p>
        </div>

        {/* Admin Team Members Management */}
        <div className="flex flex-col gap-2">
          <h2 className="font-Inter font-semibold">Admin Team Members</h2>
          <div className="flex gap-2 items-center flex-wrap">
            {/* Display currently selected admin members */}
            {selectedAdminMembers && selectedAdminMembers.length > 0 ? (
              selectedAdminMembers.map((adminId: any) => {
                // First check if it's from existing admin members (from API)
                let admin = existingAdminMembers?.find(
                  (member: any) => member.id === adminId
                );
                // If not found, check company admins
                if (!admin) {
                  admin = companyAdmins?.find(
                    (admin: any) => admin.id === adminId
                  );
                }

                return admin ? (
                  <div
                    key={admin.id}
                    className="relative inline-block m-1 group"
                  >
                    <span
                      className={`px-3 py-1 bg-orange-400 rounded-full text-white text-xs relative flex items-center gap-1`}
                    >
                      <Crown size={12} />
                      {admin.name}
                      <CgClose
                        className="absolute -top-2 -right-2 text-lg text-black cursor-pointer 
                              opacity-0 group-hover:opacity-100 transition-opacity
                              bg-white rounded-full p-0.5 shadow-sm"
                        onClick={() => handleRemoveAdmin(admin.id)}
                      />
                    </span>
                  </div>
                ) : null;
              })
            ) : (
              <span className="text-gray-500 text-sm italic">
                No admin members selected
              </span>
            )}

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="text-text flex gap-2">
                  <Crown size={16} />
                  Add Admin
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-2" align="start">
                <ScrollArea className="h-22 w-fit rounded-md border">
                  <motion.div
                    variants={popupVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-4 gap-2"
                  >
                    {companyAdmins?.map((admin: any) => (
                      <Button
                        key={admin.id}
                        variant="outline"
                        className="hover:cursor-pointer bg-orange-200 disabled:cursor-not-allowed"
                        disabled={selectedAdminMembers?.includes(admin.id)}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSelectAdminMembers(admin);
                        }}
                      >
                        {admin.name}
                      </Button>
                    ))}
                  </motion.div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
          <p className="text-sm text-gray-600">
            Current team has {existingAdminMembers?.length || 0} admin(s)
            {selectedAdminMembers?.length > 0 &&
              `, ${selectedAdminMembers.length} selected`}
          </p>
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
                errors?.priority ? "border-red-500" : "border-gray-300"
              }`}
            >
              <SelectValue placeholder="Select priority (1-20)" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {[
                  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
                  19, 20,
                ].map((num) => (
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
