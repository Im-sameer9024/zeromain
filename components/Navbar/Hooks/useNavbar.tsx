"use client";

import { useAppContext } from "@/context/AppContext";
import { NotificationProps, PaginationProps } from "@/types/Navbar.types";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface WorkSession {
  id: string;
  userId: string;
  clockInTime: string;
  clockOutTime?: string;
  TotalTime: number;
  Date: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface ClockInOutState {
  isClocked: boolean;
  currentSession: WorkSession | null;
  clockLoading: boolean;
}

const useNavbar = () => {
  // Notification states
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState<PaginationProps>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Clock states
  const [clockState, setClockState] = useState<ClockInOutState>({
    isClocked: false,
    currentSession: null,
    clockLoading: false,
  });

  const modalRef = useRef<HTMLDivElement>(null);
  const { cookieData } = useAppContext();

  const notificationBaseURL =
    "https://task-management-backend-kohl-omega.vercel.app/api/notifications";
  const clockBaseURL =
    "https://task-management-backend-kohl-omega.vercel.app/api/worksession";

  // Modal click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  // Notification functions
  const fetchNotifications = useCallback(
    async (page = 1, limit = 10, unreadOnly = false, append = false) => {
      if (!cookieData?.id || !cookieData?.role) {
        return;
      }

      try {
        setLoading(true);
        const roleParam = cookieData.role === "Admin" ? "adminId" : "userId";
        const response = await axios.get(
          `${notificationBaseURL}?${roleParam}=${cookieData.id}&page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`
        );

        const data = response.data.data || [];
        const paginationData = response.data.pagination || {};

        if (append) {
          setNotifications((prev) => [...prev, ...data]);
        } else {
          setNotifications(data);
        }
        setPagination(paginationData);
        setError(null);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to fetch notifications");
      } finally {
        setLoading(false);
      }
    },
    [cookieData]
  );

  const fetchUnreadCount = useCallback(async () => {
    if (!cookieData?.id || !cookieData?.role) {
      return;
    }

    try {
      const roleParam = cookieData.role === "Admin" ? "adminId" : "userId";
      const response = await axios.get(
        `${notificationBaseURL}/unread-count?${roleParam}=${cookieData.id}`
      );

      setUnreadCount(response.data.count || 0);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  }, [cookieData]);

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await axios.patch(
        `${notificationBaseURL}/${notificationId}/read`
      );

      if (response.status === 200) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        );

        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setError("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    if (!cookieData?.id || !cookieData?.role) {
      return;
    }

    try {
      const roleParam = cookieData.role === "Admin" ? "adminId" : "userId";
      const response = await axios.patch(
        `${notificationBaseURL}/read-all?${roleParam}=${cookieData.id}`
      );

      if (response.status === 200) {
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      setError("Failed to mark all notifications as read");
    }
  };

  const loadMore = () => {
    if (pagination.page < pagination.totalPages && !loading) {
      fetchNotifications(pagination.page + 1, pagination.limit, false, true);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInMinutes < 1) {
      return "just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hr${diffInHours > 1 ? "s" : ""} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    } else if (diffInWeeks < 4) {
      return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`;
    } else if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
    } else {
      return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
    }
  };

  // Clock functions
  const checkActiveSession = useCallback(async () => {
    if (!cookieData?.id || cookieData?.role !== "User") {
      return;
    }

    try {
      setClockState((prev) => ({ ...prev, clockLoading: true }));

      const response = await axios.get(
        `${clockBaseURL}/active/${cookieData.id}`
      );

      if (response.data.data) {
        setClockState((prev) => ({
          ...prev,
          isClocked: true,
          currentSession: response.data.data,
          clockLoading: false,
        }));
      } else {
        setClockState((prev) => ({
          ...prev,
          isClocked: false,
          currentSession: null,
          clockLoading: false,
        }));
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setClockState((prev) => ({
          ...prev,
          isClocked: false,
          currentSession: null,
          clockLoading: false,
        }));
      } else {
        console.error("Error checking active session:", error);
        setClockState((prev) => ({ ...prev, clockLoading: false }));
      }
    }
  }, [cookieData]);

  const clockIn = async () => {
    if (!cookieData?.id || cookieData?.role !== "User") {
      toast.error("Only users can clock in/out");
      return;
    }

    const toastId = toast.loading("Clocking in...");

    try {
      setClockState((prev) => ({ ...prev, clockLoading: true }));

      const response = await axios.post(`${clockBaseURL}/clock-in`, {
        userId: cookieData.id,
      });

      const newSession = response.data.data;

      setClockState((prev) => ({
        ...prev,
        isClocked: true,
        currentSession: newSession,
        clockLoading: false,
      }));

      toast.success("Clocked in successfully!", { id: toastId });
    } catch (error: any) {
      console.error("Error clocking in:", error);
      let errorMessage = "Failed to clock in";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(errorMessage, { id: toastId });
      setClockState((prev) => ({ ...prev, clockLoading: false }));
    }
  };

  const clockOut = async () => {
    if (
      !cookieData?.id ||
      cookieData?.role !== "User" ||
      !clockState.currentSession
    ) {
      toast.error("No active session to clock out");
      return;
    }

    const toastId = toast.loading("Clocking out...");

    try {
      setClockState((prev) => ({ ...prev, clockLoading: true }));

      const response = await axios.put(
        `${clockBaseURL}/clock-out/${clockState.currentSession.id}`,
        {
          userId: cookieData.id,
        }
      );

      setClockState((prev) => ({
        ...prev,
        isClocked: false,
        currentSession: null,
        clockLoading: false,
      }));

      const totalTimeFormatted = response.data.data.totalTimeFormatted;
      toast.success(
        `Clocked out successfully! Total time: ${totalTimeFormatted}`,
        {
          id: toastId,
          duration: 5000,
        }
      );
    } catch (error: any) {
      console.error("Error clocking out:", error);
      let errorMessage = "Failed to clock out";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(errorMessage, { id: toastId });
      setClockState((prev) => ({ ...prev, clockLoading: false }));
    }
  };

  const toggleClock = () => {
    if (clockState.isClocked) {
      clockOut();
    } else {
      clockIn();
    }
  };

  const getCurrentSessionTime = useCallback(() => {
    if (!clockState.currentSession?.clockInTime) return "00:00:00";

    const clockIn = new Date(clockState.currentSession.clockInTime);
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - clockIn.getTime()) / 1000
    );

    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    const seconds = diffInSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, [clockState.currentSession]);

  // Auto-refresh current time every second
  useEffect(() => {
    if (!clockState.isClocked) return;

    const interval = setInterval(() => {
      setClockState((prev) => ({ ...prev }));
    }, 1000);

    return () => clearInterval(interval);
  }, [clockState.isClocked]);

  // Initialize data on mount
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    checkActiveSession();
  }, [fetchNotifications, fetchUnreadCount, checkActiveSession]);

  const handleBellClick = () => {
    setIsModalOpen(true);
    if (notifications.length === 0) {
      fetchNotifications();
    }
  };

  const handleNotificationClick = (notification: NotificationProps) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  return {
    // Notification states and functions
    notifications,
    setNotifications,
    handleBellClick,
    handleNotificationClick,
    unreadCount,
    isModalOpen,
    setIsModalOpen,
    markAllAsRead,
    loadMore,
    formatDate,
    error,
    markAsRead,
    loading,
    setLoading,
    modalRef,
    pagination,

    // Clock states and functions
    isClocked: clockState.isClocked,
    currentSession: clockState.currentSession,
    clockLoading: clockState.clockLoading,
    toggleClock,
    clockIn,
    clockOut,
    getCurrentSessionTime,
    canUseClock: cookieData?.role === "User",
  };
};

export default useNavbar;
