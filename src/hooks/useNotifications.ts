import { useState, useEffect } from "react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  patientId?: string;
  appointmentId?: string;
  prescriptionId?: string;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  notificationCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleApiCall = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "API request failed");
    }

    return response.json();
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await handleApiCall("/api/notifications");
      setNotifications(data.notifications);
      setNotificationCount(data.count);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch notifications"
      );
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await handleApiCall("/api/notifications", {
        method: "POST",
        body: JSON.stringify({ notificationId }),
      });

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      setNotificationCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark notification as read"
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await handleApiCall("/api/notifications", {
        method: "PUT",
      });

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );

      setNotificationCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark all notifications as read"
      );
    }
  };

  const refreshNotifications = async () => {
    await fetchNotifications();
  };
  useEffect(() => {
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    notifications,
    notificationCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  };
}
