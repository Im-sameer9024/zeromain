/* eslint-disable @typescript-eslint/no-explicit-any */

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
import { User, X, Crown } from "lucide-react";
import useAddUser from "./Hooks/useAddUser";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ScrollArea } from "../ui/scroll-area";
import { motion } from "framer-motion";
import useGetUsers from "../Dashboard/Hooks/useGetUsers";

import { CgClose } from "react-icons/cg";
import useGetAdmins from "./Hooks/useGetAdmin";

const popupVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

const AddUserForm = () => {
  const { companyUsers } = useGetUsers();
  const { companyAdmins } = useGetAdmins();
  console.log("companyAdmins",companyAdmins)
  const {
    register,
    onSubmit,
    setOpenAddModal,
    handleSubmit,
    setValue,
    errors,
    isSubmitting,
    handleRemoveMember,
    handleSelectTeamMembers,
    selectedTeamMembers,
    handleRemoveAdmin,
    handleSelectAdminMembers,
    selectedAdminMembers,
  } = useAddUser();

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-Inter font-bold text-xl">Add New User</h2>
        <Button
          onClick={() => setOpenAddModal(false)}
          variant="ghost"
          className="text-text hover:cursor-pointer hover:bg-transparent"
        >
          <X />
        </Button>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-3 text-[#494A4BFF] space-y-6"
      >
        {/* Full Name */}
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

        {/* Email */}
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

        {/* Password */}
        <div className="flex flex-col gap-2">
          <label className="font-Inter font-semibold" htmlFor="password">
            Password
          </label>
          <Input
            type="password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            placeholder="Password"
            className={`border-2 rounded ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.password && (
            <span className="text-red-500 text-sm">
              {errors.password.message}
            </span>
          )}
        </div>

        {/* Add team members  */}
        <div className="flex flex-col gap-2">
          <h2 className="font-Inter font-semibold">Team Members</h2>
          <div className="flex gap-2 items-center flex-wrap">
            {selectedTeamMembers.map((userId: any) => {
              const user = companyUsers.find((user: any) => user.id === userId);
              return user ? (
                <div key={user.id} className="relative inline-block m-1 group ">
                  <span
                    className={`px-3 py-1 bg-gray-400 rounded-full text-white text-xs  relative`}
                  >
                    {user.name}
                    <CgClose
                      className="absolute -top-2 text-lg text-black cursor-pointer 
                            opacity-0 group-hover:opacity-100 transition-opacity
                            bg-white rounded-full p-0.5 shadow-sm"
                      onClick={() => handleRemoveMember(user.id)}
                    />
                  </span>
                </div>
              ) : null;
            })}

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  disabled={selectedTeamMembers.length >= 2}
                  variant="outline"
                  className=" text-text flex gap-2"
                >
                  <User size={16} />
                  Users
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-2" align="start">
                <ScrollArea className="h-22 w-fit  rounded-md border">
                  <motion.div
                    variants={popupVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-4 gap-2 "
                  >
                    {companyUsers.map((user: any) => (
                      <Button
                        key={user.id}
                        variant="outline"
                        className="hover:cursor-pointer bg-blue-200 disabled:cursor-not-allowed"
                        disabled={selectedTeamMembers.includes(user.id)}
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
        </div>

        {/* Add admin members  */}
        <div className="flex flex-col gap-2">
          <h2 className="font-Inter font-semibold">Admin Team Members</h2>
          <div className="flex gap-2 items-center flex-wrap">
            {selectedAdminMembers.map((userId: any) => {
              const admin = companyAdmins.find(
                (admin: any) => admin.id === userId
              );
              return admin ? (
                <div
                  key={admin.id}
                  className="relative inline-block m-1 group "
                >
                  <span
                    className={`px-3 py-1 bg-orange-400 rounded-full text-white text-xs  relative flex items-center gap-1`}
                  >
                    <Crown size={12} />
                    {admin.name}
                    <CgClose
                      className="absolute -top-2 text-lg text-black cursor-pointer 
                            opacity-0 group-hover:opacity-100 transition-opacity
                            bg-white rounded-full p-0.5 shadow-sm"
                      onClick={() => handleRemoveAdmin(admin.id)}
                    />
                  </span>
                </div>
              ) : null;
            })}

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  disabled={selectedAdminMembers.length >= 2}
                  variant="outline"
                  className=" text-text flex gap-2"
                >
                  <Crown size={16} />
                  Admin
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-2" align="start">
                <ScrollArea className="h-22 w-fit  rounded-md border">
                  <motion.div
                    variants={popupVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-4 gap-2 "
                  >
                    {companyAdmins.map((admin: any) => (
                      <Button
                        key={admin.id}
                        variant="outline"
                        className="hover:cursor-pointer bg-orange-200 disabled:cursor-not-allowed"
                        disabled={selectedAdminMembers.includes(admin.id)}
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
        </div>

        {/* Priority */}
        <div className="flex flex-col gap-2">
          <label className="font-Inter font-semibold" htmlFor="priority">
            Priority
          </label>
          <Select onValueChange={(value) => setValue("priority", value)}>
            <SelectTrigger
              className={`w-full rounded border-2 ${
                errors.priority ? "border-red-500" : "border-gray-300"
              }`}
            >
              <SelectValue placeholder="Select priority (1-20)" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {[1, 2, 3, 4, 5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map((num) => (
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
            onClick={() => setOpenAddModal(false)}
            className="hover:cursor-pointer bg-[#F8F9FAFF] text-text hover:bg-[#dfecfa]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="hover:cursor-pointer bg-lightBtn hover:bg-darkBlueBtn"
          >
            {isSubmitting ? "Creating..." : "Create User"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddUserForm;
