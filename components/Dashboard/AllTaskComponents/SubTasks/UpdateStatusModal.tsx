"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface SubTask {
  id: string;
  taskId: string;
  title: string;
  userId: string;
  adminId: string | null;
  expectedTime: number;
  requiresFeedback: boolean;
  completedAt: string | null;
  status: string;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
  assignedToUser: {
    id: string;
    name: string;
    email: string;
  } | null;
  assignedToAdmin: null;
}

interface UpdateStatusPayload {
  taskId: string;
  status: string;
  feedback: string;
}

interface UpdateStatusModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  subTask: SubTask;
  onStatusUpdated?: () => void;
}

const updateSubTaskStatus = async (
  subtaskId: string,
  payload: UpdateStatusPayload
) => {
  const response = await fetch(
    `https://task-management-server-rouge-tau.vercel.app/api/subtasks/update-subtask/${subtaskId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update subtask status");
  }

  return response.json();
};

const UpdateStatusModal = ({
  isOpen,
  onOpenChange,
  subTask,
  onStatusUpdated,
}: UpdateStatusModalProps) => {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState(subTask.status);
  const [feedback, setFeedback] = useState(subTask.feedback || "");

  const statusOptions = ["PENDING", "IN_PROGRESS", "COMPLETED"];

  useEffect(() => {
    setSelectedStatus(subTask.status);
    setFeedback(subTask.feedback || "");
  }, [subTask]);

  const updateStatusMutation = useMutation({
    mutationFn: (payload: UpdateStatusPayload) =>
      updateSubTaskStatus(subTask.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subtasks", subTask.taskId],
      });
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
      if (onStatusUpdated) {
        onStatusUpdated();
      }
      toast.success("Subtask updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating subtask:", error);
      toast.error("Failed to update subtask");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedFeedback = feedback.trim();
    if (!trimmedFeedback) {
      toast.error("Please provide feedback");
      return;
    }

    const payload: UpdateStatusPayload = {
      taskId: subTask.taskId,
      status: selectedStatus,
      feedback: trimmedFeedback,
    };

    updateStatusMutation.mutate(payload);
  };

  const handleCancel = () => {
    setSelectedStatus(subTask.status);
    setFeedback(subTask.feedback || "");
    onOpenChange(false);
  };

  const hasChanges =
    selectedStatus !== subTask.status || feedback !== (subTask.feedback || "");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Subtask</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Subtask Title
            </label>
            <Input value={subTask.title} readOnly className="bg-gray-50" />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-2">
              Status *
            </label>
            <select
              id="status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border rounded-md p-2 bg-white"
              required
              disabled={updateStatusMutation.isPending}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="feedback"
              className="block text-sm font-medium mb-2"
            >
              Feedback *
            </label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter feedback..."
              className="w-full border rounded-md p-2 bg-white h-20 resize-none"
              required
              disabled={updateStatusMutation.isPending}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={updateStatusMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateStatusMutation.isPending || !hasChanges}
            >
              {updateStatusMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateStatusModal;
