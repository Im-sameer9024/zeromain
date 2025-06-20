"use client";
import React from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { CgAttachment } from "react-icons/cg";
import { format, parseISO } from "date-fns";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Subtask, TagDataProps, TaskDataProps } from "@/types/Task.types";
import { ScrollArea } from "../ui/scroll-area";

interface BoardViewProps {
  data: TaskDataProps[]; // Using any[] since we don't have the exact TaskDataProps
}

const BoardView = ({ data }: BoardViewProps) => {
  const formatDueDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM dd, yyyy");
    } catch {
      return "Invalid date";
    }
  };

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {data.map((task) => (
        <Dialog key={task.id}>
          <DialogTrigger asChild>
            <div className="flex flex-col gap-3 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white">
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
          </DialogTrigger>

          <DialogContent className="max-w-3xl">
            <div className="space-y-6">
              {/* Task Header */}
              <DialogTitle>
                <div>
                  <h2 className="text-2xl font-bold">{task.title}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status.replace("_", " ")}
                    </span>
                    <span className="text-sm text-gray-500">
                      Due: {formatDueDate(task.dueDate)}
                    </span>
                  </div>
                </div>
              </DialogTitle>

              {/* Priority, Owner, Assignee, Due Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Tags</h3>
                  <div className="flex gap-2 flex-wrap">
                    {task.tags?.map((tag: TagDataProps, i: number) => (
                      <span
                        key={tag?.id || i}
                        className="bg-gray-100 px-2 py-1 rounded text-xs"
                      >
                        {tag?.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Owner</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                      {(
                        task.createdByAdmin?.name ||
                        task.createdByUser?.name ||
                        ""
                      ).charAt(0)}
                    </div>
                    <span>
                      {task.createdByAdmin?.name ||
                        task.createdByUser?.name ||
                        "Unassigned"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Assignee</h3>
                  <div className="flex items-center gap-2">
                    {task.subtasks?.[0]?.assignedToAdmin ? (
                      <>
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                          {task.subtasks[0].assignedToAdmin.name.charAt(0)}
                        </div>
                        <span>{task.subtasks[0].assignedToAdmin.name}</span>
                      </>
                    ) : task.subtasks?.[0]?.assignedToUser ? (
                      <>
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                          {task.subtasks[0].assignedToUser.name.charAt(0)}
                        </div>
                        <span>{task.subtasks[0].assignedToUser.name}</span>
                      </>
                    ) : (
                      <span className="text-gray-500">Unassigned</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Due Date</h3>
                  <p>{formatDueDate(task.dueDate)}</p>
                </div>
              </div>

              {/* Attachments */}
              {task.attachments && task.attachments.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">Attachments</h3>
                  <div className="flex flex-wrap gap-2">
                    {task.attachments.map(
                      (attachment: { fileUrl: string }, i: number) => (
                        <a
                          key={i}
                          href={attachment.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline text-sm flex items-center gap-1"
                        >
                          <CgAttachment />
                          Document {i + 1}
                        </a>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* subtasks  */}
              <div>
                 <ScrollArea className="h-40 w-full p-2 rounded-md border">
                {task.subtasks && task.subtasks.length > 0 ? (
                  task.subtasks.map((subtask: Subtask) => (
                    <div key={subtask.id}>
                      <div>
                        <h3 className="font-bold text-lg">Subtasks Details</h3>
                      </div>
                      <div>
                        <h2 className="font-semibold text-md text-gray-700">
                          {subtask.title}
                        </h2>
                        <p className="text-sm text-gray-500">{subtask.id}</p>
                      </div>
                      <div className=" flex justify-between mt-2">
                        <div>
                          <p>Feedback</p>
                          <p
                            className={`px-2 py-1 text-xs rounded w-fit ${getStatusColor(
                              task.status
                            )}`}
                          >
                            {subtask.feedback}
                          </p>
                        </div>
                        <div>
                          <p>Status</p>
                          <p
                            className={`px-2 py-1 text-xs rounded w-fit ${getStatusColor(
                              task.status
                            )}`}
                          >
                            {subtask.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div>
                    <p className="text-center">No Subtasks</p>
                  </div>
                )}
                </ScrollArea>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="font-medium">Description</h3>
                <p className="text-gray-700">{task.description}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
};

export default BoardView;
