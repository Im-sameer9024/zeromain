"use client";
//@ts-ignore
import React, { useEffect, useTransition, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import assginBy from "../../public/images/assignlogo.png";
import { X, Check, Circle, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { TableCell, TableRow } from "../ui/table";
import TableComponent from "../TableComponent";
import { useAppContext } from "@/context/AppContext";
import useGetTasks from "./Hooks/useGetTasks";
import useRemoveTask from "./Hooks/useRemoveTask";
import useUpdateStatus from "./Hooks/useUpdateStatus";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import useAssignedTasks from "./Hooks/useAssignedTasks";
import useColumns from "./useColumns";
import { TaskDataProps } from "@/types/Task.types";

// Time tracking hook
const useTimeTracking = (
  taskId: string,
  status: string,
  totalTimeInSeconds: number = 0,
  updatedAt?: string // Add this parameter
) => {
  const [currentTime, setCurrentTime] = useState(totalTimeInSeconds);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  useEffect(() => {
    if (status === "IN_PROGRESS") {
      if (!sessionStartTime) {
        // Use updatedAt as the session start time if available
        const estimatedStartTime = updatedAt ? new Date(updatedAt) : new Date();
        setSessionStartTime(estimatedStartTime);

        // Calculate initial time including estimated session duration
        if (updatedAt) {
          const now = new Date();
          const estimatedSessionDuration = Math.floor(
            (now.getTime() - estimatedStartTime.getTime()) / 1000
          );
          setCurrentTime(totalTimeInSeconds + estimatedSessionDuration);
        }
      }

      const interval = setInterval(() => {
        if (sessionStartTime) {
          const now = new Date();
          const sessionDuration = Math.floor(
            (now.getTime() - sessionStartTime.getTime()) / 1000
          );
          setCurrentTime(totalTimeInSeconds + sessionDuration);
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setSessionStartTime(null);
      setCurrentTime(totalTimeInSeconds);
    }
  }, [status, sessionStartTime, totalTimeInSeconds, updatedAt]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return {
    currentTime,
    formattedTime: formatTime(currentTime),
    isRunning: status === "IN_PROGRESS",
  };
};

// Time display component
const TimeTracker = ({
  taskId,
  status,
  totalTimeInSeconds,
  updatedAt, // Add this prop
}: {
  taskId: string;
  status: string;
  totalTimeInSeconds?: number;
  updatedAt?: string; // Add this prop
}) => {
  const { currentTime, formattedTime, isRunning } = useTimeTracking(
    taskId,
    status,
    totalTimeInSeconds || 0,
    updatedAt
  );

  return (
    <div className="flex items-center justify-center gap-1">
      {isRunning && <Clock className="w-3 h-3 text-blue-500 animate-pulse" />}
      <span
        className={`text-xs font-mono px-2 py-1 rounded ${
          isRunning
            ? "bg-blue-100 text-blue-700 border border-blue-200"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        {formattedTime}
      </span>
    </div>
  );
};

const StatusIndicator = ({ status }: { status: string }) => {
  switch (status) {
    case "PENDING":
      return <div className="w-3 h-3 rounded-full bg-red-500" />;
    case "IN_PROGRESS":
      return (
        <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
      );
    case "COMPLETED":
      return <Check className="w-4 h-4 text-green-500" />;
    default:
      return <Circle className="w-3 h-3 text-gray-400" />;
  }
};

const DashboardUsers = () => {
  const { cookieData, selectedTasksType } = useAppContext();
  const { CreatedColumns, AssignedColumns } = useColumns();

  const {
    assignedTasks,
    refetchAssignedTasks,
  } = useAssignedTasks();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { allTasks, loading, error, refreshTasks } = useGetTasks();
  const role = cookieData?.role?.toLowerCase() || "";
  const { updateStatus } = useUpdateStatus();

  useEffect(() => {
    if (selectedTasksType === "Assigned") {
      startTransition(() => {
        refetchAssignedTasks();
      });
    }
  }, [selectedTasksType, refetchAssignedTasks]);

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
      refreshTasks();
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
      refreshTasks();
      if (selectedTasksType === "Assigned") {
        refetchAssignedTasks();
      }
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  // Enhanced action handler for start/stop functionality
  const handleStartStop = async (
    e: React.MouseEvent<HTMLButtonElement>,
    taskId: string,
    currentStatus: string
  ) => {
    e.stopPropagation();
    try {
      let newStatus = "";
      if (currentStatus === "PENDING") {
        newStatus = "IN_PROGRESS";
      } else if (currentStatus === "IN_PROGRESS") {
        newStatus = "PENDING"; // Stop the task
      }

      if (newStatus) {
        await updateStatus(e, taskId, newStatus);
        refreshTasks();
        if (selectedTasksType === "Assigned") {
          refetchAssignedTasks();
        }
      }
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  const CreateTaskRenderRow = (item: TaskDataProps) => {
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
          className="hover:underline"
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

        <TableCell className="hidden md:table-cell">
          <div className="flex gap-2 items-center justify-center">
            {item.status === "PENDING" && (
              <button
                onClick={(e) => handleStartStop(e, item.id, item.status)}
                className="border border-[#513600FF] hover:bg-green-500 hover:text-white hover:cursor-pointer font-medium text-[#513600FF] text-xs rounded p-1 px-2 transition-colors"
              >
                Start
              </button>
            )}
            {item.status === "IN_PROGRESS" && (
              <>
                <button
                  onClick={(e) => handleStartStop(e, item.id, item.status)}
                  className="border border-[#513600FF] hover:text-white text-white bg-red-600 hover:cursor-pointer font-medium text-xs rounded p-1 px-2 transition-colors"
                >
                  Stop
                </button>
                <button
                  onClick={(e) => handleTaskAction(e, item.id, item.status)}
                  className="bg-transparent border border-[#513600FF] hover:bg-green-500 hover:text-white hover:cursor-pointer font-medium text-[#513600FF] text-xs rounded p-1 px-2 transition-colors"
                >
                  Finish
                </button>
              </>
            )}
            {item.status === "COMPLETED" && (
              <button
                disabled={true}
                className="text-white border disabled:cursor-not-allowed border-[#513600FF] bg-green-500 font-medium text-xs rounded p-1 px-2 transition-colors"
              >
                Finished
              </button>
            )}
          </div>
        </TableCell>

        <TableCell className="text-center">
          <TimeTracker
            taskId={item.id}
            status={item.status}
            totalTimeInSeconds={item.totalTimeInSeconds}
            updatedAt={item.updatedAt} // Add this line
          />
        </TableCell>

        <TableCell>
          <p className="text-center text-lightRedText">
            {formatDueDate(item.dueDate)}
          </p>
        </TableCell>

        <TableCell>
          <div className="items-center justify-center flex-wrap flex gap-2">
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

  const AssignedTaskRow = (item: TaskDataProps) => {
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
          className="hover:underline"
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
                onClick={(e) => handleStartStop(e, item.id, item.status)}
                className="border border-[#513600FF] hover:bg-green-500 hover:text-white hover:cursor-pointer font-medium text-[#513600FF] text-xs rounded p-1 px-2 transition-colors"
              >
                Start
              </button>
            )}
            {item.status === "IN_PROGRESS" && (
              <>
                <button
                  onClick={(e) => handleStartStop(e, item.id, item.status)}
                  className="border border-[#513600FF] hover:text-white text-white bg-red-600 hover:cursor-pointer font-medium text-xs rounded p-1 px-2 transition-colors"
                >
                  Stop
                </button>
                <button
                  onClick={(e) => handleTaskAction(e, item.id, item.status)}
                  className="bg-transparent border border-[#513600FF] hover:bg-green-500 hover:text-white hover:cursor-pointer font-medium text-[#513600FF] text-xs rounded p-1 px-2 transition-colors"
                >
                  Finish
                </button>
              </>
            )}
            {item.status === "COMPLETED" && (
              <button
                disabled={true}
                className="text-white border disabled:cursor-not-allowed border-[#513600FF] bg-green-500 font-medium text-xs rounded p-1 px-2 transition-colors"
              >
                Finished
              </button>
            )}
          </div>
        </TableCell>

        <TableCell className="text-center">
          <TimeTracker
            taskId={item.id}
            status={item.status}
            totalTimeInSeconds={item.totalTimeInSeconds}
            updatedAt={item.updatedAt} // Add this line
          />
        </TableCell>

        <TableCell>
          <p className="text-center text-lightRedText">
            {formatDueDate(item.dueDate)}
          </p>
        </TableCell>

        <TableCell>
          <div className="items-center justify-center flex-wrap flex gap-2">
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
    return (
      <div className="bg-[#fafafbe9] p-1 rounded-md mt-10 h-64 flex items-center justify-center">
        <div className="text-center text-gray-500">
          Loading Assigned tasks...
        </div>
      </div>
    );
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
