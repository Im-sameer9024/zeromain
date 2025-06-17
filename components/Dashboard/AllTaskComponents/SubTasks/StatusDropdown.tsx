import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAppContext } from "@/context/AppContext";
import Popup from "@/components/Modal/Popup";
import { Check, X } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface UpdateStatusPayload {
    taskId: string;
    status: string;
    userId?: string;
    adminId?: string;
}

interface StatusDropdownProps {
    subtaskId: string;
    taskId: string;
    currentStatus: string;
    onStatusUpdated: () => void;
}

const updateSubTaskStatus = async (subtaskId: string, payload: UpdateStatusPayload) => {
    const response = await fetch(
        `https://task-management-backend-kohl-omega.vercel.app/api/subtasks/update-subtask/${subtaskId}`,
        {
            method: "PUT",
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

const StatusDropdown: React.FC<StatusDropdownProps> = ({
    subtaskId,
    taskId,
    currentStatus,
    onStatusUpdated,
}) => {
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<string | null>(null);
    const queryClient = useQueryClient();
    const { cookieData } = useAppContext();

    const statusOptions = ["PENDING", "IN_PROGRESS", "COMPLETED"];

    // Status color mapping
    const getStatusColors = (status: string) => {
        switch (status) {
            case "PENDING":
                return {
                    bg: "bg-yellow-100 hover:bg-yellow-200",
                    text: "text-yellow-800",
                    border: "border-yellow-300",
                };
            case "IN_PROGRESS":
                return {
                    bg: "bg-blue-100 hover:bg-blue-200",
                    text: "text-blue-800",
                    border: "border-blue-300",
                };
            case "COMPLETED":
                return {
                    bg: "bg-green-100 hover:bg-green-200",
                    text: "text-green-800",
                    border: "border-green-300",
                };
            default:
                return {
                    bg: "bg-gray-100 hover:bg-gray-200",
                    text: "text-gray-800",
                    border: "border-gray-300",
                };
        }
    };

    const statusMutation = useMutation({
        mutationFn: (payload: UpdateStatusPayload) => updateSubTaskStatus(subtaskId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subtasks", taskId] });
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            onStatusUpdated();
            toast.success("Subtask status updated successfully!");
            setShowConfirmModal(false);
            setPendingStatus(null);
        },
        onError: (error) => {
            console.error("Error updating status:", error);
            toast.error("Failed to update subtask status");
            setShowConfirmModal(false);
            setPendingStatus(null);
        },
    });

    const handleStatusSelect = (status: string) => {
        if (status === "COMPLETED") {
            setPendingStatus(status);
            setShowConfirmModal(true);
            return;
        }
        updateStatus(status);
    };

    const updateStatus = (status: string) => {
        const payload: UpdateStatusPayload = {
            taskId,
            status,
        };

        if (cookieData?.role === "Admin") {
            payload.adminId = cookieData.id;
        } else {
            payload.userId = cookieData?.id;
        }

        statusMutation.mutate(payload);
    };

    const handleConfirmComplete = () => {
        if (pendingStatus) {
            updateStatus(pendingStatus);
        }
    };

    const handleCancelComplete = () => {
        setShowConfirmModal(false);
        setPendingStatus(null);
    };

    const formatStatus = (status: string) =>
        status
            .toLowerCase()
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());

    const currentStatusColors = getStatusColors(currentStatus);

    const confirmationContent = (
        <div className="text-center p-10 shadow-lg bg-[#FAFAFBFF]">
            <div className="p-5 bg-white shadow-sm font-Inter">
                <p className="text-black mb-6 font-bold text-xl">
                    Are you sure you want to mark this task as complete?
                    <br />
                    <span className="text-sm font-light text-black">
                        (Once completed, it can no longer be edited)
                    </span>
                </p>
                <div className="flex gap-4 justify-center">
                    <Button
                        onClick={handleCancelComplete}
                        variant="destructive"
                        disabled={statusMutation.isPending}
                        className="flex items-center gap-2"
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmComplete}
                        variant="default"
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                        disabled={statusMutation.isPending}
                    >
                        <Check className="w-4 h-4" />
                        {statusMutation.isPending ? "Completing..." : "Complete"}
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        className={`${currentStatusColors.bg} ${currentStatusColors.text} ${currentStatusColors.border} border text-xs px-2 rounded-xs py-0.5 ${statusMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {statusMutation.isPending ? "Updating..." : formatStatus(currentStatus)}
                    </button>
                </DropdownMenuTrigger>
                {currentStatus !== "COMPLETED" && (
                    <DropdownMenuContent className="w-32">
                        {statusOptions.map((option) => {
                            const optionColors = getStatusColors(option);
                            return (
                                <DropdownMenuItem
                                    key={option}
                                    onClick={() => handleStatusSelect(option)}
                                    disabled={statusMutation.isPending || currentStatus === option}
                                    className={currentStatus === option ? "bg-gray-200" : ""}
                                >
                                    {formatStatus(option)}
                                </DropdownMenuItem>
                            );
                        })}
                    </DropdownMenuContent>
                )}
            </DropdownMenu>

            <Popup openModal={showConfirmModal} content={confirmationContent} />
        </>
    );
};

export default StatusDropdown;