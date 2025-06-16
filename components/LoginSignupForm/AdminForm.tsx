"use client"

import React from 'react'
import useAdminLogin from './Hooks/useAdminLogin';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Eye, EyeOff } from 'lucide-react';

const AdminForm = () => {

       const { adminInfo } = useAdminLogin();

  const handleSubmit = adminInfo?.handleSubmit;
  const register = adminInfo?.register;
  const errors = adminInfo?.errors;
  const onSubmit = adminInfo?.onSubmit;
  const isSubmitting = adminInfo?.isSubmitting;
  const showPassword = adminInfo?.showPassword;
  const setShowPassword = adminInfo?.setShowPassword;

  return (
     <div className="w-full flex justify-center items-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="  space-y-4 rounded-md my-5 w-full max-w-md"
      >
        
       <h2 className=' text-center font-bold text-xl'>
        Admin
       </h2>

        {/* Email Field */}
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="font-bold">
            Email
          </label>
          <Input
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            type="email"
            placeholder="Enter your email"
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <span className="text-red-500 text-sm">
              {errors.email?.message}
            </span>
          )}
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="font-bold">
            Password
          </label>
          <div className=' relative'>
            <Input
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className={errors.password ? "border-red-500" : ""}
          />
          <span onClick={() => setShowPassword(!showPassword)} className=' absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer'>
            {
                showPassword ? <EyeOff/> : <Eye/>
            }
          </span>
          </div>
          {errors.password && (
            <span className="text-red-500 text-sm">
              {errors.password?.message}
            </span>
          )}
        </div>

        <div className="flex justify-center items-center pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full hover:cursor-pointer bg-lightBtn hover:bg-darkBlueBtn  text-white"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default AdminForm
