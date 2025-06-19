"use client";
import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAppContext } from "@/context/AppContext";
import Popup from "@/components/Modal/Popup";
import { Check, X } from "lucide-react";
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
    totalTimeInSeconds: number;
    onStatusUpdated: () => void;
    assignedToUser: { id: string; name: string; email: string } | null; // Add assignedToUser prop
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

const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const StatusDropdown: React.FC<StatusDropdownProps> = ({
    subtaskId,
    taskId,
    currentStatus,
    totalTimeInSeconds,
    onStatusUpdated,
    assignedToUser, // Destructure the new prop
}) => {
    const [time, setTime] = useState(totalTimeInSeconds || 0);
    const [isRunning, setIsRunning] = useState(currentStatus === "IN_PROGRESS");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const queryClient = useQueryClient();
    const { cookieData } = useAppContext();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Check if the current user is the assigned user or an admin
    const isAssignedUser = cookieData?.id === assignedToUser?.id || cookieData?.role === "Admin";

    // Status color mapping for timer text (no bg or border)
    const getStatusColors = (status: string) => {
        switch (status) {
            case "PENDING":
                return "text-yellow-800";
            case "IN_PROGRESS":
                return "text-blue-800";
            case "COMPLETED":
                return "text-green-800";
            default:
                return "text-gray-800";
        }
    };

    const statusMutation = useMutation({
        mutationFn: (payload: UpdateStatusPayload) => updateSubTaskStatus(subtaskId, payload),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["subtasks", taskId] });
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            onStatusUpdated();
            toast.success("Subtask status updated successfully!");

            // Update timer state and time based on API response
            if (variables.status === "IN_PROGRESS") {
                setIsRunning(true);
            } else if (variables.status === "PENDING" || variables.status === "COMPLETED") {
                setIsRunning(false);
            }

            // Update time with the latest totalTimeInSeconds from API response
            if (data?.data?.totalTimeInSeconds !== undefined) {
                setTime(data.data.totalTimeInSeconds);
            }

            if (variables.status === "COMPLETED") {
                setShowConfirmModal(false);
            }
        },
        onError: (error) => {
            console.error("Error updating status:", error);
            toast.error("Failed to update subtask status");
            setShowConfirmModal(false);
        },
    });

    useEffect(() => {
        // Initialize time with totalTimeInSeconds from props
        setTime(totalTimeInSeconds || 0);
        setIsRunning(currentStatus === "IN_PROGRESS");
    }, [totalTimeInSeconds, currentStatus]);

    useEffect(() => {
        if (isRunning && isAssignedUser) { // Only run timer if user is assigned
            timerRef.current = setInterval(() => {
                setTime((prev) => prev + 1);
            }, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isRunning, isAssignedUser]);

    const updateStatus = (status: string) => {
        if (!isAssignedUser) {
            toast.error("Only the assigned user or an admin can update the status.");
            return;
        }

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

    const handleStart = () => {
        updateStatus("IN_PROGRESS");
    };

    const handleStop = () => {
        updateStatus("PENDING");
    };

    const handleFinish = () => {
        setShowConfirmModal(true);
    };

    const handleConfirmComplete = () => {
        updateStatus("COMPLETED");
    };

    const handleCancelComplete = () => {
        setShowConfirmModal(false);
    };

    const timerTextColor = getStatusColors(currentStatus);

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
                        disabled={statusMutation.isPending || !isAssignedUser}
                        className="flex items-center gap-2"
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmComplete}
                        variant="default"
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                        disabled={statusMutation.isPending || !isAssignedUser}
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
            <div className="flex items-center gap-2">
                {currentStatus !== "COMPLETED" ? (
                    <>
                        <div className="flex gap-1">
                            {!isRunning ? (
                                <button
                                    onClick={handleStart}
                                    disabled={statusMutation.isPending || !isAssignedUser}
                                    className={`border-red-500 text-red-500 border bg-transparent hover:bg-red-50 text-xs py-1 px-2 rounded-sm ${!isAssignedUser ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    Start
                                </button>
                            ) : (
                                <button
                                    onClick={handleStop}
                                    disabled={statusMutation.isPending || !isAssignedUser}
                                    className={`border-red-500 bg-red-500 text-white hover:bg-red-600 text-xs py-1 px-2 rounded-sm border ${!isAssignedUser ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    Stop
                                </button>
                            )}
                            <button
                                onClick={handleFinish}
                                disabled={statusMutation.isPending || !isAssignedUser}
                                className={`border-black text-black border bg-transparent hover:bg-gray-50 text-xs py-1 px-2 rounded-sm ${!isAssignedUser ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                Finish
                            </button>
                        </div>
                        <span className={`text-xs ${timerTextColor}`}>
                            {statusMutation.isPending ? "Updating..." : formatTime(time)}
                        </span>
                    </>
                ) : (
                    <>
                        <button
                            disabled
                            className="border-green-500 bg-green-500 text-white text-xs py-1 px-2 rounded-sm"
                        >
                            Finished
                        </button>
                        <span className={`text-xs ${timerTextColor}`}>
                            {formatTime(time)}
                        </span>
                    </>
                )}
            </div>

            <Popup openModal={showConfirmModal && isAssignedUser} content={confirmationContent} />
        </>
    );
};

export default StatusDropdown;