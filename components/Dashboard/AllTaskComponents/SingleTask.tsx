"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarIcon, PaperclipIcon, FileIcon,  } from "lucide-react";
import SubTasks from "./SubTasks/SubTasks";
import CommentsWrapper from "@/components/Comments/CommentsWrapper";
import { Tooltip } from "@radix-ui/react-tooltip";
import { TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Attachment {
  id: string;
  fileUrl: string;
  uploadedAt: string;
}

interface Comment {
  id?: string;
  content?: string;
  author?: User;
  createdAt?: string;
}

interface Subtask {
  id?: string;
  title?: string;
  completed?: boolean;
}

interface Tag {
  id: string;
  name: string;
  color: string; // Hex color code
}

enum TaskStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO 8601 format
  status: TaskStatus;
  adminId: string | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  createdByAdmin: User | null;
  createdByUser: User | null;
  attachments: Attachment[];
  subtasks: Subtask[];
  comments: Comment[];
  tags: Tag[];
}

interface SingleTaskProps {
  taskId: string;
}

// API function to fetch task data
const fetchTask = async (taskId: string): Promise<Task> => {
  const response = await fetch(
    `https://task-management-backend-seven-tan.vercel.app/api/tasks/get-task/${taskId}`
  );

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
};

// Helper function to get file name from URL
const getFileName = (url: string): string => {
  try {
    const urlParts = url.split("/");
    const fileName = urlParts[urlParts.length - 1];
    // Decode URI component to handle encoded file names
    return decodeURIComponent(fileName) || "Unknown file";
  } catch {
    return "Unknown file";
  }
};

// Helper function to get file extension
const getFileExtension = (url: string): string => {
  try {
    const fileName = getFileName(url);
    const extension = fileName.split(".").pop()?.toLowerCase();
    return extension || "";
  } catch {
    return "";
  }
};

// Helper function to format file size (if available)
// const formatFileSize = (bytes: number): string => {
//   if (bytes === 0) return "0 Bytes";
//   const k = 1024;
//   const sizes = ["Bytes", "KB", "MB", "GB"];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
// };

const SingleTask: React.FC<SingleTaskProps> = ({ taskId }) => {

  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);

  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => fetchTask(taskId),
    enabled: !!taskId, // Only run query if taskId exists
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    retry: 3, // Retry failed requests 3 times
  });



  console.log("data of single task",data)

   const handleAttachmentClick = (attachment: Attachment) => {
    setPreviewAttachment(attachment);
  };

  const handleClosePreview = () => {
    setPreviewAttachment(null);
  };

  const renderFilePreview = () => {
    if (!previewAttachment) return null;

    const fileExtension = getFileExtension(previewAttachment.fileUrl);
    const fileName = getFileName(previewAttachment.fileUrl);

    if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
      return (
        <div className="flex justify-center">
          <img
            src={previewAttachment.fileUrl}
            alt={fileName}
            className="max-w-full max-h-[70vh] object-contain"
          />
        </div>
      );
    }

    if (fileExtension === "pdf") {
      return (
        <iframe
          src={previewAttachment.fileUrl}
          className="w-full h-[70vh] border rounded"
          title={`PDF Preview - ${fileName}`}
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-64">
        <FileIcon size={48} className="text-gray-400 mb-4" />
        <p className="text-gray-600 mb-4">
          Preview not available for this file type
        </p>
        <a
          href={previewAttachment.fileUrl}
          download={fileName}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Download File
        </a>
      </div>
    );
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <div className="text-red-500">
          Error: {error instanceof Error ? error.message : "An error occurred"}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <div>No task data found</div>
      </div>
    );
  }

  return (
    <div className="flex p-4 w-full !h-[calc(100vh-80px)] overflow-y-scroll">
      {/* left side section */}
      <div className="w-2/3 pr-4">
        {/*------ image and title -------- */}
        <div className="flex gap-2 items-center mb-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex justify-center">
                <img
                  src={`https://api.dicebear.com/5.x/initials/svg?seed=${
                    data?.createdByAdmin?.name || data?.createdByUser?.name
                  }`}
                  alt="assignee"
                  loading="lazy"
                  className="size-10 rounded-full"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{data?.createdByAdmin?.name || data?.createdByUser?.name}</p>
            </TooltipContent>
          </Tooltip>
          <h2 className="text-xl font-semibold text-[#323336FF]">
            {data.title}
          </h2>
        </div>

        {/*------------- tags ----------- */}
        <div className="">
          {data.tags?.map((tag) => (
            <span
              key={tag.id}
              className="inline-block px-3 py-1 rounded-md text-white text-sm mr-2 mb-2"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
            </span>
          ))}
        </div>

        {/* date */}
        <div className="text-[#6F6F6FFF] flex items-center gap-2 mt-3">
          <CalendarIcon size={16} />
          {new Date(data.createdAt).toLocaleDateString()}
        </div>

        {/* sub task */}
        <SubTasks taskId={taskId} />

        {/*------------- description ----------- */}
        <div className="my-4">
          <h3 className="text-base font-medium mb-1 text-[#A2A19FFF]">
            Description
          </h3>
          <p className="text-[#9095A0FF] text-sm">{data.description}</p>
        </div>

        {/*------------- attachments ----------- */}
       {data.attachments && data.attachments.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <PaperclipIcon size={18} className="text-[#525456FF]" />
              <h3 className="text-base font-medium text-[#525456FF]">
                Attachments
              </h3>
              <span className="text-sm text-[#9095A0FF]">
                ({data.attachments.length})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.attachments.map((attachment) => {
                const fileName = getFileName(attachment.fileUrl);
                const fileExtension = getFileExtension(attachment.fileUrl);

                return (
                  <div
                    key={attachment.id}
                    className="group relative hover:bg-gray-50 rounded-lg p-3 transition-all duration-200 cursor-pointer"
                    onClick={() => handleAttachmentClick(attachment)}
                  >
                    {/* File Preview/Icon */}
                    <div className="flex flex-col items-center mb-3">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mb-2 group-hover:bg-gray-300 transition-colors">
                        {fileExtension === "pdf" ? (
                          <div className="text-red-500 font-bold text-xs">PDF</div>
                        ) : fileExtension === "jpg" ||
                          fileExtension === "jpeg" ||
                          fileExtension === "png" ||
                          fileExtension === "gif" ? (
                          <div className="text-blue-500 font-bold text-xs">IMG</div>
                        ) : fileExtension === "doc" ||
                          fileExtension === "docx" ? (
                          <div className="text-blue-600 font-bold text-xs">DOC</div>
                        ) : (
                          <FileIcon size={24} className="text-gray-500" />
                        )}
                      </div>
                    </div>

                    {/* File Info */}
                    <div className="text-center mb-3">
                      <p
                        className="text-sm font-medium text-gray-900 truncate px-1"
                        title={fileName}
                      >
                        {fileName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(attachment.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/*------------- subtasks ----------- */}
        {/* {data.subtasks && data.subtasks.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Subtasks</h3>
            <div className="space-y-2">
              {data.subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    readOnly
                    className="rounded"
                  />
                  <span className={subtask.completed ? 'line-through text-gray-500' : ''}>
                    {subtask.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )} */}
      </div>

      {/* right side section of Comments */}
      <div className="w-1/3 pl-4 border-l">
        <CommentsWrapper taskId={taskId} />
      </div>


      {/* file preview  */}
      <Dialog open={!!previewAttachment} onOpenChange={(open) => !open && handleClosePreview()}>
        <DialogContent className="max-w-[90vw] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span className="truncate max-w-[80%]">
                {previewAttachment?.fileUrl && getFileName(previewAttachment.fileUrl)}
              </span>
             
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {previewAttachment && renderFilePreview()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SingleTask;
