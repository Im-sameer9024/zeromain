"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { MdOutlineDashboard } from "react-icons/md";
import { LuUserRound } from "react-icons/lu";
import { JSX } from "react";

import { MdOutlineBookmarks } from "react-icons/md";
import { MdOutlineInsertChart } from "react-icons/md";
import { useAppContext } from "@/context/AppContext";

interface MenuItem {
  icon: JSX.Element;
  label: string;
  path: string;
}

const SideBar = () => {
  const { cookieData } = useAppContext();

  const path = usePathname();

  const role = cookieData?.role.toLowerCase() as string;

//   console.log("role os is ", role);

  const menuItems: MenuItem[] = [
    {
      icon: <MdOutlineDashboard />,
      label: "Dashboard",
      path: `/${role}/dashboard`,
    },
    {
      icon: <MdOutlineInsertChart />,
      label: "Tasks",
      path: `/${role}/tasks`,
    },
    {
      icon: <LuUserRound />,
      label: "Users",
      path: `/${role}/users`,
    },
    {
      icon: <MdOutlineBookmarks />,
      label: "Tags",
      path: `/${role}/tags`,
    },
  ];

  return (
    <div className=" mt-20 space-y-2 ">
      {menuItems.map((item, index) => (
        <Link
          href={item.path}
          key={index}
          className={`flex items-center gap-2 px-4  ${
            path === item.path ? "text-[#4850E4FF]" : ""
          } `}
        >
          <span className=" text-2xl">{item.icon}</span>
          <span className=" text-[0.9rem] hidden lg:block">{item.label}</span>
        </Link>
      ))}
    </div>
  );
};

export default SideBar;
