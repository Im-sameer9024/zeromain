/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

//@ts-ignore
import React, { useEffect, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import assginBy from "../../public/images/assignlogo.png";
import { X, Check, Circle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { TableCell, TableRow } from "../ui/table";
import { TaskProps } from "@/types/Task.types";
import TableComponent from "../TableComponent";
import { useAppContext } from "@/context/AppContext";
import useGetAllTasks from "./Hooks/useGetAllTasks";
import useRemoveTask from "./Hooks/useRemoveTask";
import useUpdateStatus from "./Hooks/useUpdateStatus";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import useAssignedTasks from "./Hooks/useAssignedTasks";

interface columnsProps {
  header: string;
  accessor: string;
  classes?: string;
}

const StatusIndicator = ({ status }: { status: string }) => {
  switch (status) {
    case "PENDING":
      return <div className="w-3 h-3 rounded-full bg-red-500" />;
    case "IN_PROGRESS":
      return <div className="w-3 h-3 rounded-full bg-yellow-500" />;
    case "COMPLETED":
      return <Check className="w-4 h-4 text-green-500" />;
    default:
      return <Circle className="w-3 h-3 text-gray-400" />;
  }
};

const DashboardUsers = () => {
  const { cookieData, selectedTasksType } = useAppContext();

  const CreatedColumns: columnsProps[] = [
    {
      header: "",
      accessor: "status",
      classes: "hidden md:table-cell text-center",
    },
    {
      header: "Name",
      accessor: "name",
      classes: "font-bold text-md text-text",
    },
    {
      header: "Assign by",
      accessor: "assignBy",
      classes: "hidden md:table-cell font-bold text-md text-text text-center",
    },
    // {
    //   header: "Action",
    //   accessor: "action",
    //   classes: "hidden lg:table-cell font-bold text-md text-text text-center",
    // },
    {
      header: "Due Date",
      accessor: "dueDate",
      classes: "font-bold text-md text-text text-center",
    },
    {
      header: "Tags",
      accessor: "tags",
      classes: "font-bold text-md text-text text-center",
    },
    ...(cookieData?.role === "Admin"
      ? [
          {
            header: "Actions",
            accessor: "actions",
            classes: "font-bold text-md text-text text-center",
          },
        ]
      : []),
  ];

  const AssignedColumns: columnsProps[] = [
    {
      header: "",
      accessor: "status",
      classes: "hidden md:table-cell text-center",
    },
    {
      header: "Name",
      accessor: "name",
      classes: "font-bold text-md text-text",
    },
    {
      header: "Assign To",
      accessor: "assignBy",
      classes: "hidden md:table-cell font-bold text-md text-text text-center",
    },
    // {
    //   header: "Action",
    //   accessor: "action",
    //   classes: "hidden lg:table-cell font-bold text-md text-text text-center",
    // },
    {
      header: "Due Date",
      accessor: "dueDate",
      classes: "font-bold text-md text-text text-center",
    },
    {
      header: "Tags",
      accessor: "tags",
      classes: "font-bold text-md text-text text-center",
    },
    ...(cookieData?.role === "Admin"
      ? [
          {
            header: "Actions",
            accessor: "actions",
            classes: "font-bold text-md text-text text-center",
          },
        ]
      : []),
  ];
  const { assignedTasks, refetchAssignedTasks } = useAssignedTasks();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { allTasks, loading, error, refreshTasks } = useGetAllTasks();
  const role = cookieData?.role?.toLowerCase() || "";
  const { updateStatus } = useUpdateStatus();

  useEffect(() => {
    if (selectedTasksType === "Assigned") {
      startTransition(() => {
        refetchAssignedTasks();
      });
    }
  }, [selectedTasksType, refetchAssignedTasks]);

  console.log("allTasks", allTasks);

  const { removeTask } = useRemoveTask();

  const formatDueDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM dd, yyyy h:mm a");
    } catch {
      return "Invalid date";
    }
  };

  const handleDeleteTask = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    try {
      await removeTask(taskId);
      refreshTasks(); // Refresh tasks after deletion
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const handleTaskAction = async (
    e: React.MouseEvent<HTMLButtonElement>,
    taskId: string,
    currentStatus: string
  ) => {
    e.stopPropagation();
    try {
      let newStatus = "";
      switch (currentStatus) {
        case "PENDING":
          newStatus = "IN_PROGRESS";
          break;
        case "IN_PROGRESS":
          newStatus = "COMPLETED";
          break;
        case "COMPLETED":
          newStatus = "PENDING";
          break;
        default:
          return;
      }

      await updateStatus(e, taskId, newStatus);
      refreshTasks(); // Refresh tasks after status update
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  const CreateTaskRenderRow = (item: TaskProps) => {
    if (!item) return null;

    return (
      <TableRow
        key={item.id}
        className="border-b hover:cursor-pointer hover:bg-gray-100 border-gray-200 even:bg-slate-50 text-sm font-Inter"
      >
        <TableCell className="text-center">
          <StatusIndicator status={item.status} />
        </TableCell>
        <TableCell
          onClick={() => router.push(`/${role}/tasks/${item.id}`)}
          className=" hover:underline"
        >
          <h3 className="font-semibold font-Inter">{item.title}</h3>
          <p className="text-xs text-gray-500 truncate max-w-[200px]">
            {item.description}
          </p>
        </TableCell>
        <TableCell className="hidden md:table-cell">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex justify-center">
                <Image
                  src={assginBy}
                  alt="assignee"
                  width={40}
                  height={40}
                  className="size-10 rounded-full"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{item.createdByAdmin?.name || item.createdByUser?.name}</p>
            </TooltipContent>
          </Tooltip>
        </TableCell>
        {/* <TableCell className="hidden md:table-cell">
          <div className="flex gap-2 items-center justify-center">
            {item.status === "PENDING" && (
              <button
                onClick={(e) => handleTaskAction(e, item.id, item.status)}
                className=" border border-[#513600FF] hover:bg-green-500  hover:text-white hover:cursor-pointer font-medium text-[#513600FF] text-xs rounded p-1 px-2 transition-colors"
              >
                Start
              </button>
            )}
            {item.status === "IN_PROGRESS" && (
              <button
                onClick={(e) => handleTaskAction(e, item.id, item.status)}
                className=" border border-[#513600FF]  hover:text-white text-white bg-red-600 hover:cursor-pointer font-medium  text-xs rounded p-1 px-2 transition-colors"
              >
                Stop
              </button>
            )}
            {item.status === "IN_PROGRESS" && (
              <button
                onClick={(e) => handleTaskAction(e, item.id, item.status)}
                className="bg-transparent border border-[#513600FF]  hover:text-white hover:cursor-pointer font-medium text-[#513600FF] text-xs rounded p-1 px-2 transition-colors"
              >
                Finish
              </button>
            )}
            {item.status === "COMPLETED" && (
              <button
                disabled={true}
                onClick={(e) => handleTaskAction(e, item.id, item.status)}
                className=" text-white border disabled:cursor-not-allowed border-[#513600FF] bg-green-500 hover:cursor-pointer font-medium  text-xs rounded p-1 px-2 transition-colors"
              >
                Finished
              </button>
            )}
          </div>
        </TableCell> */}
        <TableCell>
          <p className="text-center text-lightRedText">
            {formatDueDate(item.dueDate)}
          </p>
        </TableCell>
        <TableCell>
          <div className=" items-center justify-center  flex-wrap flex gap-2">
            {item.tags?.map((tag, i) => (
              <span
                className="odd:bg-[#f7e9ee] rounded odd:text-[#E8618CFF] p-1 w-fit px-2 even:text-[#636AE8FF] even:bg-[#F2F2FDFF] text-xs"
                key={tag?.id || i}
              >
                {tag?.name}
              </span>
            ))}
          </div>
        </TableCell>
        {cookieData?.role === "Admin" && (
          <TableCell className="text-center">
            <button
              onClick={(e) => handleDeleteTask(e, item.id)}
              className="hover:bg-gray-100 p-1 rounded-full hover:cursor-pointer"
              aria-label="Delete task"
            >
              <X size={16} />
            </button>
          </TableCell>
        )}
      </TableRow>
    );
  };

  const AssignedTaskRow = (item: any) => {
    if (!item) return null;

    return (
      <TableRow
        key={item.id}
        className="border-b hover:cursor-pointer hover:bg-gray-100 border-gray-200 even:bg-slate-50 text-sm font-Inter"
      >
        <TableCell className="text-center">
          <StatusIndicator status={item.status} />
        </TableCell>
        <TableCell
          onClick={() => router.push(`/${role}/tasks/${item.id}`)}
          className=" hover:underline"
        >
          <h3 className="font-semibold font-Inter">{item.title}</h3>
          <p className="text-xs text-gray-500 truncate max-w-[200px]">
            {item.description}
          </p>
        </TableCell>
        <TableCell className="hidden md:table-cell">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex justify-center">
                <Image
                  src={assginBy}
                  alt="assignee"
                  width={40}
                  height={40}
                  className="size-10 rounded-full"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {item.subtasks[0]?.assignedToUser?.name ||
                  item.subtasks[0]?.assignedToAdmin?.name}
              </p>
            </TooltipContent>
          </Tooltip>
        </TableCell>
        <TableCell className="hidden md:table-cell">
          <div className="flex gap-2 items-center justify-center">
            {item.status === "PENDING" && (
              <button
                onClick={(e) => handleTaskAction(e, item.id, item.status)}
                className=" border border-[#513600FF] hover:bg-green-500  hover:text-white hover:cursor-pointer font-medium text-[#513600FF] text-xs rounded p-1 px-2 transition-colors"
              >
                Start
              </button>
            )}
            {item.status === "IN_PROGRESS" && (
              <button
                onClick={(e) => handleTaskAction(e, item.id, item.status)}
                className=" border border-[#513600FF]  hover:text-white text-white bg-red-600 hover:cursor-pointer font-medium  text-xs rounded p-1 px-2 transition-colors"
              >
                Stop
              </button>
            )}
            {item.status === "IN_PROGRESS" && (
              <button
                onClick={(e) => handleTaskAction(e, item.id, item.status)}
                className="bg-transparent border border-[#513600FF]  hover:text-white hover:cursor-pointer font-medium text-[#513600FF] text-xs rounded p-1 px-2 transition-colors"
              >
                Finish
              </button>
            )}
            {item.status === "COMPLETED" && (
              <button
                disabled={true}
                onClick={(e) => handleTaskAction(e, item.id, item.status)}
                className=" text-white border disabled:cursor-not-allowed border-[#513600FF] bg-green-500 hover:cursor-pointer font-medium  text-xs rounded p-1 px-2 transition-colors"
              >
                Finished
              </button>
            )}
          </div>
        </TableCell>
        <TableCell>
          <p className="text-center text-lightRedText">
            {formatDueDate(item.dueDate)}
          </p>
        </TableCell>
        <TableCell>
          <div className=" items-center justify-center  flex-wrap flex gap-2">
            {item.tags?.map((tag, i) => (
              <span
                className="odd:bg-[#f7e9ee] rounded odd:text-[#E8618CFF] p-1 w-fit px-2 even:text-[#636AE8FF] even:bg-[#F2F2FDFF] text-xs"
                key={tag?.id || i}
              >
                {tag?.name}
              </span>
            ))}
          </div>
        </TableCell>
        {cookieData?.role === "Admin" && (
          <TableCell>
            <button
              onClick={(e) => handleDeleteTask(e, item.id)}
              className="hover:bg-gray-100 p-1 rounded-full hover:cursor-pointer"
              aria-label="Delete task"
            >
              <X size={16} />
            </button>
          </TableCell>
        )}
      </TableRow>
    );
  };

  if (isPending) {
    <div className="bg-[#fafafbe9] p-1 rounded-md mt-10 h-64 flex items-center justify-center">
      <div className="text-center text-gray-500">Loading Assigned tasks...</div>
    </div>;
  }

  if (loading) {
    return (
      <div className="bg-[#fafafbe9] p-1 rounded-md mt-10 h-64 flex items-center justify-center">
        <div className="text-center text-gray-500">Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#fafafbe9] p-1 rounded-md mt-10 h-64 flex items-center justify-center">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-[#fafafbe9] p-1 rounded-md mt-10">
      {selectedTasksType === "Created" && allTasks.length === 0 ? (
        <div className="text-center text-gray-500 h-64 flex items-center justify-center">
          No created tasks found.
        </div>
      ) : selectedTasksType === "Assigned" && assignedTasks.length === 0 ? (
        <div className="text-center text-gray-500 h-64 flex items-center justify-center">
          No assigned tasks found.
        </div>
      ) : selectedTasksType === "Created" ? (
        <TableComponent
          columns={CreatedColumns}
          data={allTasks}
          renderRow={CreateTaskRenderRow}
        />
      ) : (
        <TableComponent
          columns={AssignedColumns}
          data={assignedTasks}
          renderRow={AssignedTaskRow}
        />
      )}
    </div>
  );
};

export default DashboardUsers;
