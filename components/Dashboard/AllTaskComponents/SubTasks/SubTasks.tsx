"use client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AddSubTaskModal from "./AddSubTaskModal";
import FeedbackDropdown from "./FeedbackDropdown";
import StatusDropdown from "./StatusDropdown";

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
  totalTimeInSeconds: number;
  assignedToUser: {
    id: string;
    name: string;
    email: string;
  } | null;
  assignedToAdmin: null;
}

interface SubTasksProps {
  taskId: string;
}

const fetchSubTasks = async (taskId: string): Promise<SubTask[]> => {
  const response = await fetch(
    `https://task-management-backend-kohl-omega.vercel.app/api/tasks/get-task/${taskId}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch subtasks");
  }
  const result = await response.json();
  return result.data.subtasks || [];
};

const SubTasks: React.FC<SubTasksProps> = ({ taskId }) => {
  const {
    data: subTasks,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["subtasks", taskId],
    queryFn: () => fetchSubTasks(taskId),
    enabled: !!taskId,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubTaskCreated = () => {
    refetch();
    setIsModalOpen(false);
  };

  const handleStatusUpdated = () => {
    refetch();
  };

  const handleFeedbackUpdated = () => {
    refetch();
  };

  if (isLoading) {
    return <div>Loading subtasks...</div>;
  }

  if (error) {
    return <div>Error loading subtasks: {error.message}</div>;
  }

  return (
    <div className="mt-6 py-1 relative">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-medium">Subtasks</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1"
        >
          <Plus size={16} />
          Add Subtask
        </Button>
      </div>

      {subTasks && subTasks.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            <Table className="relative">
              <TableHeader className="sticky top-0 bg-white z-10 border-b">
                <TableRow>
                  <TableCell className="text-text font-medium">Name</TableCell>
                  <TableCell className="text-text font-medium">Assigned To</TableCell>
                  <TableCell className="text-text font-medium">Expected Time</TableCell>
                  <TableCell className="text-text font-medium">Elapsed Time</TableCell>
                  <TableCell className="text-text font-medium">Feedback</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="flex-1">
                      <p>{task.title}</p>
                    </TableCell>
                    <TableCell className="flex-1">
                      <div className="flex items-center gap-2">
                        {task.assignedToUser ? (
                          <>
                            <span>{task.assignedToUser.name}</span>
                            <span className="text-sm text-gray-500">
                              ({task.assignedToUser.email})
                            </span>
                          </>
                        ) : (
                          <span>Unassigned</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="flex-1">
                      <div className="flex items-center gap-1 text-[#AB8572FF]">
                        <span>{task.expectedTime}</span>
                        <span className="text-sm ">hours</span>
                      </div>
                    </TableCell>
                    <TableCell className="flex-1">
                      <StatusDropdown
                        subtaskId={task.id}
                        taskId={task.taskId}
                        currentStatus={task.status}
                        totalTimeInSeconds={task.totalTimeInSeconds}
                        onStatusUpdated={handleStatusUpdated}
                        assignedToUser={task.assignedToUser}
                      />
                    </TableCell>
                    <TableCell className="flex-1">
                      {task.status === "COMPLETED" ? (
                        <FeedbackDropdown
                          subtaskId={task.id}
                          taskId={task.taskId}
                          currentFeedback={task.feedback}
                          onFeedbackUpdated={handleFeedbackUpdated}
                          assignedToUser={task.assignedToUser}
                        />
                      ) : (
                        <span className="text-xs text-gray-600">
                          {task.feedback || "No feedback"}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          No subtasks found. Add a subtask to get started.
        </div>
      )}

      <AddSubTaskModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubTaskCreated={handleSubTaskCreated}
        taskId={taskId}
      />
    </div>
  );
};

export default SubTasks;