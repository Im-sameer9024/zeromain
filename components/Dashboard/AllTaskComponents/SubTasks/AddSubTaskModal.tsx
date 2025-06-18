"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppContext } from "@/context/AppContext";
import { debounce } from "lodash";
import Popup from "@/components/Modal/Popup";

interface AddSubTaskModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubTaskCreated: () => void;
  taskId: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface CreateSubTaskPayload {
  taskId: string;
  title: string;
  userId: string;
  expectedTime: number;
  requiresFeedback: boolean;
}

const createSubTask = async (payload: CreateSubTaskPayload) => {
  const response = await fetch(
    "https://task-management-backend-kohl-omega.vercel.app/api/subtasks/create-subtask",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create subtask");
  }

  return response.json();
};

const AddSubTaskModal = ({
  isOpen,
  onOpenChange,
  onSubTaskCreated,
  taskId,
}: AddSubTaskModalProps) => {
  const { cookieData } = useAppContext();
  const queryClient = useQueryClient();

  const [taskData, setTaskData] = useState({
    title: "",
    expectedTime: 6,
    userId: "",
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const createSubTaskMutation = useMutation({
    mutationFn: createSubTask,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subtasks", taskId],
      });
      onSubTaskCreated();
      setTaskData({
        title: "",
        expectedTime: 6,
        userId: "",
      });
      toast.success("Subtask created successfully!");
      onOpenChange(false); // Close the modal on success
    },
    onError: (error) => {
      console.error("Error creating subtask:", error);
      toast.error("Failed to create subtask");
    },
  });

  const fetchUsers = useCallback(
    debounce(async (term: string) => {
      try {
        setLoadingUsers(true);
        const response = await fetch(
          `https://task-management-backend-kohl-omega.vercel.app/api/auth/company-users/${cookieData.companyAdminId}?search=${term}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data.data.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
      } finally {
        setLoadingUsers(false);
      }
    }, 300),
    [cookieData?.id]
  );

  useEffect(() => {
    if (isOpen && cookieData?.id) {
      fetchUsers("");
    }
  }, [isOpen, fetchUsers, cookieData?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleUserSelect = (userId: string) => {
    setTaskData((prev) => ({
      ...prev,
      userId,
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    fetchUsers(term);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTitle = taskData.title.trim();
    if (!trimmedTitle) {
      toast.error("Please provide a valid title");
      return;
    }

    if (!taskData.userId) {
      toast.error("Please select a user");
      return;
    }

    const payload: CreateSubTaskPayload = {
      taskId,
      title: trimmedTitle,
      userId: taskData.userId,
      expectedTime: taskData.expectedTime,
      requiresFeedback: true, // Hardcode to true since it's removed from the UI
    };

    createSubTaskMutation.mutate(payload);
  };

  // Content for the Popup
  const modalContent = (
    <div className="space-y-4 p-5 shadow-lg rounded-lg">
      <h2 className="text-lg font-medium">Add New Subtask</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title*
          </label>
          <Input
            id="title"
            name="title"
            value={taskData.title}
            onChange={handleInputChange}
            required
            placeholder="Enter subtask title"
            disabled={createSubTaskMutation.isPending}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="expectedTime" className="block text-sm font-medium mb-1">
            Expected Time (hours)*
          </label>
          <select
            id="expectedTime"
            name="expectedTime"
            value={taskData.expectedTime}
            onChange={handleSelectChange}
            className="border rounded-md p-2 w-full"
            required
            disabled={createSubTaskMutation.isPending}
          >
            {Array.from({ length: 24 }, (_, i) => i + 1).map((hour) => (
              <option key={hour} value={hour}>
                {hour} hour{hour !== 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium mb-1">Assign to User*</label>
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="flex-1"
            disabled={createSubTaskMutation.isPending}
          />
          <div className="border rounded-md h-60 overflow-y-auto">
            {loadingUsers ? (
              <div className="text-center py-4">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-4 text-sm text-gray-500">
                No users found
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => !createSubTaskMutation.isPending && handleUserSelect(user.id)}
                  className={`p-3 cursor-pointer hover:bg-gray-100 ${taskData.userId === user.id ? "bg-blue-50 border-l-2 border-blue-500" : ""
                    }`}
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createSubTaskMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createSubTaskMutation.isPending}>
            {createSubTaskMutation.isPending ? "Creating..." : "Create Subtask"}
          </Button>
        </div>
      </form>
    </div>
  );

  return <Popup openModal={isOpen} content={modalContent} />;
};

export default AddSubTaskModal;