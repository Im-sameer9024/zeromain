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
    header: "Team Members",
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
            <button className=" bg-green-500 text-white text-xs rounded p-1">
              {"btnState"}
            </button>
            <button className=" bg-transparent border border-[#513600FF] hover:bg-red-500 hover:text-white hover:cursor-pointer font-medium  text-[#513600FF] text-xs rounded p-1">
              Delete
            </button>
            <button className=" text-text text-2xl hover:font-bold hover:cursor-pointer">
              <CiEdit />
            </button>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );

  if(isPending){
     <div className="bg-[#fafafbe9] p-1 rounded-md mt-10 h-64 flex items-center justify-center">
        <div className="text-center text-gray-500">Loading Assigned tasks...</div>
      </div>
  }


  if (isLoading) {
    return (
      <div className="bg-[#fafafbe9] p-1 rounded-md mt-10 h-64 flex items-center justify-center">
        <div className="text-center text-gray-500">Loading tasks...</div>
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
        <TableComponent
          columns={columns}
          data={companyUsers}
          renderRow={renderRow}
        />
      )}
    </div>
  );
};

export default UsersTable;
