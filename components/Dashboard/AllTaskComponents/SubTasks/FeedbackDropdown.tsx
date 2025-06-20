import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAppContext } from "@/context/AppContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageSquare, Loader2 } from "lucide-react";

interface FeedbackDropdownProps {
  subtaskId: string;
  taskId: string;
  currentFeedback: string | null;
  onFeedbackUpdated: () => void;
  assignedToUser: { id: string; name: string; email: string } | null; // Add assignedToUser prop
}

interface UpdateFeedbackPayload {
  taskId: string;
  feedback: string;
  userId?: string;
  adminId?: string;
}

const updateSubTaskFeedback = async (
  subtaskId: string,
  payload: UpdateFeedbackPayload
) => {
  const response = await fetch(
    `https://task-management-backend-seven-tan.vercel.app/api/subtasks/update-subtask/${subtaskId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update subtask feedback");
  }

  return response.json();
};

const FeedbackDropdown: React.FC<FeedbackDropdownProps> = ({
  subtaskId,
  taskId,
  currentFeedback,
  onFeedbackUpdated,
  assignedToUser, // Destructure the new prop
}) => {
  const queryClient = useQueryClient();
  const { cookieData } = useAppContext();
  const feedbackOptions = ["GOOD", "AVERAGE", "BAD"];

  // Check if the current user is allowed to give feedback
  const canGiveFeedback =
    cookieData?.id !== assignedToUser?.id || cookieData?.role === "Admin";

  // Feedback color mapping
  const getFeedbackColors = (feedback: string | null) => {
    switch (feedback) {
      case "GOOD":
        return {
          bg: "bg-green-100 hover:bg-green-200",
          text: "text-green-800",
          border: "border-green-300",
          icon: "text-green-600",
        };
      case "AVERAGE":
        return {
          bg: "bg-yellow-100 hover:bg-yellow-200",
          text: "text-yellow-800",
          border: "border-yellow-300",
          icon: "text-yellow-600",
        };
      case "BAD":
        return {
          bg: "bg-red-100 hover:bg-red-200",
          text: "text-red-800",
          border: "border-red-300",
          icon: "text-red-600",
        };
      default:
        return {
          bg: "bg-gray-100 hover:bg-gray-200",
          text: "text-gray-700",
          border: "border-gray-300",
          icon: "text-gray-500",
        };
    }
  };

  const feedbackMutation = useMutation({
    mutationFn: (payload: UpdateFeedbackPayload) =>
      updateSubTaskFeedback(subtaskId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subtasks", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      onFeedbackUpdated();
      toast.success("Feedback updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating feedback:", error);
      toast.error("Failed to update feedback");
    },
  });

  const handleFeedbackSelect = (feedback: string) => {
    if (!canGiveFeedback) {
      toast.error("You cannot provide feedback for your own subtask.");
      return;
    }

    const payload: UpdateFeedbackPayload = {
      taskId,
      feedback,
    };

    if (cookieData?.role === "Admin") {
      payload.adminId = cookieData.id;
    } else {
      payload.userId = cookieData?.id;
    }

    feedbackMutation.mutate(payload);
  };

  const currentFeedbackColors = getFeedbackColors(currentFeedback);

  // If the user is the assigned user and not an admin, show a disabled button or feedback text
  if (!canGiveFeedback) {
    return (
      <span
        className={`flex items-center gap-2 ${currentFeedbackColors.bg} ${currentFeedbackColors.text} ${currentFeedbackColors.border} text-xs px-2 rounded-xs py-0.5 border opacity-50 cursor-not-allowed`}
        title="You cannot provide feedback for your own subtask"
      >
        {currentFeedback || (
          <MessageSquare className={`w-4 h-4 ${currentFeedbackColors.icon}`} />
        )}
      </span>
    );
  }

  return (
    <DropdownMenu>
      {currentFeedback && (
        <DropdownMenuTrigger asChild>
          <button
            className={`flex items-center gap-2 ${currentFeedbackColors.bg} ${currentFeedbackColors.text} ${currentFeedbackColors.border} text-xs px-2 rounded-xs py-0.5 border`}
            disabled={feedbackMutation.isPending} // Disable button during loading
          >
            {feedbackMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" /> // Show spinner
            ) : (
              <>
                {/* <MessageSquare className={`w-4 h-4 ${currentFeedbackColors.icon}`} /> */}
                {currentFeedback}
              </>
            )}
          </button>
        </DropdownMenuTrigger>
      )}
      {!currentFeedback && (
        <DropdownMenuTrigger asChild>
          <button
            className={`flex items-center gap-2 ${currentFeedbackColors.bg} ${currentFeedbackColors.text} ${currentFeedbackColors.border} text-xs px-2 rounded-xs py-0.5 bg-white`}
            disabled={feedbackMutation.isPending} // Disable button during loading
          >
            {feedbackMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" /> // Show spinner
            ) : (
              <MessageSquare
                className={`w-4 h-4 ${currentFeedbackColors.icon}`}
              />
            )}
          </button>
        </DropdownMenuTrigger>
      )}
      <DropdownMenuContent className="w-32">
        {feedbackOptions.map((option) => {
          return (
            <DropdownMenuItem
              key={option}
              onClick={() => handleFeedbackSelect(option)}
              disabled={
                feedbackMutation.isPending || currentFeedback === option
              }
              className={currentFeedback === option ? "bg-gray-200" : ""}
            >
              {option}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FeedbackDropdown;
