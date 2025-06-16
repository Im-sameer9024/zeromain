import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import useAddUser from "./Hooks/useAddUser";


const AddUserForm = () => {
  const {
    register,
    onSubmit,
    setOpen,
    handleSubmit,
    setValue,
    errors,
    isSubmitting,
  } = useAddUser();

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-Inter font-bold text-xl">Add New User</h2>
        <Button
          onClick={() => setOpen(false)}
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
              <SelectValue placeholder="Select priority (0-5)" />
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
            {isSubmitting ? "Creating..." : "Create User"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddUserForm;
