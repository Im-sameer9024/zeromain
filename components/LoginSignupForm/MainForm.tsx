"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Shield } from "lucide-react";
import UserForm from "./UserForm";
import AdminForm from "./AdminForm";

const MainForm = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <div>
      {/* Toggle Buttons */}
      <div className="relative flex">
        <button
          onClick={() => setIsAdmin(false)}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-full transition-all duration-300 ${
            isAdmin
              ? "text-black bg-gray-200 font-semibold "
              : " text-white  bg-lightBtn hover:bg-darkBlueBtn"
          }`}
        >
          <motion.div
            animate={{
              scale: !isAdmin ? 1 : 0.8,
              opacity: !isAdmin ? 1 : 0.6,
              rotate: !isAdmin ? 360 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
          >
            <User size={20} />
          </motion.div>
          <span>Login by User</span>
        </button>

        <button
          onClick={() => setIsAdmin(true)}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-full transition-all duration-300 ${
            isAdmin
              ? "text-white font-semibold bg-lightBtn hover:bg-darkBlueBtn"
              : "text-black bg-gray-200 font-semibold "
          }`}
        >
          <motion.div
            animate={{
              scale: isAdmin ? 1 : 0.8,
              opacity: isAdmin ? 1 : 0.6,
              rotate: isAdmin ? 360 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
          >
            <Shield size={20} />
          </motion.div>
          <span>Login by Admin</span>
        </button>
      </div>

      {
        isAdmin ? <AdminForm /> : <UserForm />
      }
    </div>
  );
};

export default MainForm;
