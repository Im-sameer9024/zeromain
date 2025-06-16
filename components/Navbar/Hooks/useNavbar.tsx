"use client"

import { useAppContext } from "@/context/AppContext";
import { NotificationProps, PaginationProps } from "@/types/Navbar.types";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

const useNavbar = () => {
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

  const modalRef = useRef<HTMLDivElement>(null);
  const { cookieData } = useAppContext();

  const baseURL =
    "https://task-management-backend-kohl-omega.vercel.app/api/notifications";

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

  const fetchNotifications = useCallback(
    async (page = 1, limit = 10, unreadOnly = false, append = false) => {
      if (!cookieData?.id || !cookieData?.role) {
        return;
      }

      try {
        setLoading(true);
        const roleParam = cookieData.role === "Admin" ? "adminId" : "userId";
        const response = await axios.get(
          `${baseURL}?${roleParam}=${cookieData.id}&page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`
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
        `${baseURL}/unread-count?${roleParam}=${cookieData.id}`
      );

      setUnreadCount(response.data.count || 0);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  }, [cookieData]);

  const markAsRead = async (notificationId: string) => {
    try {
      console.log("MARK AS READ");
      const response = await axios.patch(`${baseURL}/${notificationId}/read`);

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
        `${baseURL}/read-all?${roleParam}=${cookieData.id}`
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

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

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
    pagination

  };
};

export default useNavbar;
