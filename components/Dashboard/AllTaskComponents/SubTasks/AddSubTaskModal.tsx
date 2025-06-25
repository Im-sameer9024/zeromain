"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppContext } from "@/context/AppContext";
import { debounce } from "lodash";
import Popup from "@/components/Modal/Popup";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

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

// interface TeamMember {
//   id: string;
//   name: string;
//   email: string;
// }

interface CreateSubTaskPayload {
  taskId: string;
  title: string;
  userId: string;
  expectedTime: number;
  requiresFeedback: boolean;
}

const createSubTask = async (payload: CreateSubTaskPayload) => {
  const response = await fetch(
    "https://task-management-backend-seven-tan.vercel.app/api/subtasks/create-subtask",
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
      setSearchTerm("");
      setIsDropdownOpen(false);
      toast.success("Subtask created successfully!");
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Error creating subtask:", error);
      toast.error("Failed to create subtask");
    },
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchUsers = useCallback(
    debounce(async (term: string) => {
      try {
        setLoadingUsers(true);

        console.log("cookieData?.role", cookieData);

        if (cookieData?.role === "Admin") {
          const response = await fetch(
            `https://task-management-backend-seven-tan.vercel.app/api/auth/company-users/${
              cookieData?.role === "Admin"
                ? cookieData?.id
                : cookieData?.companyAdminId
            }?search=${term}`
          );

          

          if (!response?.ok) {

            throw new Error("Failed to fetch users");

          }

          const data = await response?.json();

            console.log("respons when admin login",data)
            debugger;

          const admin = {
            id: data.data.company.adminId,
            name: `${data.data.company.adminName} (Admin)`,
            email: data.data.company.email || "No email provided",
          };

          const usersList = data.data.users || [];
          setUsers([admin, ...usersList]);
        } else if (cookieData?.role === "User") {


          const response = await fetch(
            `https://task-management-backend-kohl-omega.vercel.app/api/auth/getTeamMembers/${cookieData?.id}`
          );
          if (!response?.ok) {

            throw new Error("Failed to fetch users");
          }

          const data = await response.json();
            console.log("respons when user user user login",data)
            debugger;


          setUsers([...data.data?.teamMembers]);
        }
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
      setIsDropdownOpen(true); // Open dropdown initially
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
    setIsDropdownOpen(false); // Close dropdown after selection
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    fetchUsers(term);
    if (!isDropdownOpen) {
      setIsDropdownOpen(true);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
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
      requiresFeedback: true,
    };

    createSubTaskMutation.mutate(payload);
  };

  // Get selected user for display
  const selectedUser = users.find(user => user.id === taskData.userId);

  // Organize users to show selected user at top
  const organizedUsers = () => {
    if (!selectedUser) return users;

    const otherUsers = users.filter(user => user.id !== taskData.userId);
    return [selectedUser, ...otherUsers];
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
          <label
            htmlFor="expectedTime"
            className="block text-sm font-medium mb-1"
          >
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
          <label className="block text-sm font-medium mb-1">
            Assign to User*
          </label>

          {/* Search Input with Dropdown Toggle */}
          <div className="relative">
            <Input
              placeholder={selectedUser ? selectedUser.name : "Search users..."}
              value={searchTerm}
              onChange={handleSearchChange}
              className="pr-10"
              disabled={createSubTaskMutation.isPending}
              onFocus={() => setIsDropdownOpen(true)}
            />
            <button
              type="button"
              onClick={toggleDropdown}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
              disabled={createSubTaskMutation.isPending}
            >
              <motion.div
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
              </motion.div>
            </button>
          </div>

          {/* Selected User Display */}
          {selectedUser && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-2 bg-blue-50 border border-blue-200 rounded-md"
            >
              <div className="text-sm font-medium text-blue-900">
                Selected: {selectedUser.name}
              </div>
              <div className="text-xs text-blue-700">{selectedUser.email}</div>
            </motion.div>
          )}

          {/* Dropdown List - Fixed height container */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="border rounded-md bg-white shadow-lg max-h-48 overflow-y-auto">
                  {loadingUsers ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-4"
                    >
                      Loading users...
                    </motion.div>
                  ) : users.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-4 text-sm text-gray-500"
                    >
                      No users found
                    </motion.div>
                  ) : (
                    <div>
                      {organizedUsers().map((user, index) => (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() =>
                            !createSubTaskMutation.isPending &&
                            handleUserSelect(user.id)
                          }
                          className={`p-3 cursor-pointer transition-colors hover:bg-gray-100 ${taskData.userId === user.id
                            ? "bg-blue-50 border-l-4 border-blue-500"
                            : ""
                            }`}
                        >
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {user.name}
                              {taskData.userId === user.id && (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full"
                                >
                                  ✓
                                </motion.span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-end gap-2 mt-6">
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