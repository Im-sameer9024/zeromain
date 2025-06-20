/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { userTableData, userTableDataProps } from "@/assets/assets";
import TableComponent from "@/components/TableComponent";
import { TableCell, TableRow } from "@/components/ui/table";
import { Check } from "lucide-react";
import React, { useEffect, useState, useTransition } from "react";
import { CiEdit } from "react-icons/ci";
import useGetUsers from "../Dashboard/Hooks/useGetUsers";
import useDeleteUser from "./Hooks/useDeleteUser";
import { useAppContext } from "@/context/AppContext";
import Popup from "../Modal/Popup";
import UpdateUserForm from "./UpdateUserForm";

interface columnsProps {
  header: string;
  accessor: string;
  classes?: string;
}

const columns: columnsProps[] = [
  {
    header: "",
    accessor: "edit",
    classes: "hidden md:table-cell",
  },

  {
    header: "Name",
    accessor: "name",
    classes: "font-bold text-md text-text  ",
  },
  {
    header: "Email",
    accessor: "email",
    classes: "hidden md:table-cell font-bold text-md text-text  ",
  },
  {
    header: "Priority",
    accessor: "priority",
    classes: "hidden lg:table-cell font-bold text-md text-text text-center ",
  },
  {
    header: "SubTasks Assigned",
    accessor: "teamMembers",
    classes: "hidden lg:table-cell font-bold text-md text-text text-center ",
  },
  {
    header: "Actions",
    accessor: "dueDate",
    classes: "font-bold text-md text-text text-center ",
  },
];

const UsersTable = () => {
  const [isPending, startTransition] = useTransition();

  const { companyUsers, isLoading, isError, error, refetchCompanyUsers } =
    useGetUsers();

  const { setOpen ,open, setUserId,searchQuery  } = useAppContext();
  const { mutate: deleteUser } = useDeleteUser();

  const filteredUsers = companyUsers?.filter((user: any) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditUser = (userId: string) => {
    setUserId(userId);
    setOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUser(userId);
    }
  };

  useEffect(() => {
    startTransition(() => {
      refetchCompanyUsers();
    });
  }, [refetchCompanyUsers]);

  const renderRow = (item: any) => (
    <TableRow
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <TableCell className="hidden md:table-cell  ">
        <Check />
      </TableCell>

      <TableCell className=" gap-4 ">
        <div>
          <h3 className="font-semibold">{item?.name}</h3>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell  ">{item.email}</TableCell>
      <TableCell className="hidden md:table-cell text-center  ">
        {item?.priority}
      </TableCell>
      <TableCell className="hidden md:table-cell text-center ">
        {item.stats?.subtasksAssigned}
      </TableCell>

      <TableCell className=" text-center">
        <div>
          <div className=" flex gap-4 items-center justify-center">
            <button onClick={() => handleDeleteUser(item.id)} className=" bg-transparent border border-[#513600FF] hover:bg-red-500 hover:text-white hover:cursor-pointer font-medium  text-[#513600FF] text-xs rounded p-1">
              Delete
            </button>
            <button  onClick={() => handleEditUser(item.id)} className=" text-text text-2xl hover:font-bold hover:cursor-pointer">
              <CiEdit />
            </button>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );

  if(isPending){
     <div className="bg-[#fafafbe9] p-1 rounded-md mt-10 h-64 flex items-center justify-center">
        <div className="text-center text-gray-500">Loading User...</div>
      </div>
  }


  if (isLoading) {
    return (
      <div className="bg-[#fafafbe9] p-1 rounded-md mt-10 h-64 flex items-center justify-center">
        <div className="text-center text-gray-500">Loading Users...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-[#fafafbe9] p-1 rounded-md mt-10 h-64 flex items-center justify-center">
        <div className="text-center text-red-500">{error instanceof Error ? error.message : String(error)}</div>
      </div>
    );
  }

  return (
    <div className="bg-[#fafafbe9] p-1 rounded-md mt-10">
      {userTableData.length <= 0 ? (
        <div className="text-center text-gray-500 h-64">No Users Found</div>
      ) : (
       <div>
         <TableComponent
          columns={columns}
          data={filteredUsers || []}
          renderRow={renderRow}
        />
        <Popup openModal={open} content={<UpdateUserForm/>}  />
       </div>
      )}
    </div>
  );
};

export default UsersTable;
