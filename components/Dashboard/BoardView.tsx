"use client";
import React from "react";
// import { format, parseISO } from "date-fns";
import { TagDataProps, TaskDataProps } from "@/types/Task.types";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";

interface BoardViewProps {
  data: TaskDataProps[]; // Using any[] since we don't have the exact TaskDataProps
}

const BoardView = ({ data }: BoardViewProps) => {
  // const formatDueDate = (dateString: string) => {
  //   try {
  //     return format(parseISO(dateString), "MMM dd, yyyy");
  //   } catch {
  //     return "Invalid date";
  //   }
  // };

const{cookieData} = useAppContext()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  const router = useRouter()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {data.map((task) => (
        <div key={task.id} onClick={() =>router.push(`/${cookieData?.role.toLowerCase()}/tasks/${task.id}`) }  className="flex flex-col gap-3 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white">
          {/* Status Badge */}
          <span
            className={`px-2 py-1 text-xs rounded w-fit ${getStatusColor(
              task.status
            )}`}
          >
            {task.status.replace("_", " ")}
          </span>

          {/* Title */}
          <h2 className="font-medium text-gray-800">{task.title}</h2>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex gap-2 items-center flex-wrap">
              {task.tags.map((tag: TagDataProps, i: number) => (
                <span
                  key={tag?.id || i}
                  className="bg-gray-100 rounded-full px-2 py-1 text-xs text-gray-600"
                >
                  {tag?.name}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BoardView;
