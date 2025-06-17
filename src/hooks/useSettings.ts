import { useState, useEffect } from "react";

interface ProfileData {
  firstName: string;
  lastName: string;
  specialty: string;
  email: string;
  phone: string;
  address: string;
  licenseNumber: string;
  experience: string;
}

interface NotificationSettings {
  appointments: boolean;
  criticalAlerts: boolean;
  patientUpdates: boolean;
  systemUpdates: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

interface MedicalSettings {
  appointmentDuration: number;
  workingHours: {
    start: string;
    end: string;
  };
  enableAIPrescriptions: boolean;
  defaultPrescriptionTemplate: string;
  emergencyContactEnabled: boolean;
}

interface UseSettingsReturn {
  profile: ProfileData;
  notifications: NotificationSettings;
  medicalSettings: MedicalSettings;
  loading: boolean;
  error: string | null;
  updateProfile: (data: Partial<ProfileData>) => Promise<boolean>;
  updateNotifications: (data: NotificationSettings) => Promise<boolean>;
  updateMedicalSettings: (data: MedicalSettings) => Promise<boolean>;
  refreshSettings: () => Promise<void>;
}

const defaultProfile: ProfileData = {
  firstName: "",
  lastName: "",
  specialty: "",
  email: "",
  phone: "",
  address: "",
  licenseNumber: "",
  experience: "",
};

const defaultNotifications: NotificationSettings = {
  appointments: true,
  criticalAlerts: true,
  patientUpdates: false,
  systemUpdates: true,
  emailNotifications: true,
  smsNotifications: false,
};

const defaultMedicalSettings: MedicalSettings = {
  appointmentDuration: 30,
  workingHours: {
    start: "09:00",
    end: "17:00",
  },
  enableAIPrescriptions: true,
  defaultPrescriptionTemplate: "standard",
  emergencyContactEnabled: true,
};

export function useSettings(): UseSettingsReturn {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [notifications, setNotifications] =
    useState<NotificationSettings>(defaultNotifications);
  const [medicalSettings, setMedicalSettings] = useState<MedicalSettings>(
    defaultMedicalSettings
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const handleApiCall = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // Use cookies for authentication
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "API request failed");
    }

    return response.json();
  };

  const fetchProfile = async () => {
    try {
      const data = await handleApiCall("/api/settings/profile");
      setProfile(data.profile);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await handleApiCall("/api/settings/notifications");
      setNotifications(data.notifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch notifications"
      );
    }
  };

  const fetchMedicalSettings = async () => {
    try {
      const data = await handleApiCall("/api/settings/medical");
      setMedicalSettings(data.medicalSettings);
    } catch (err) {
      console.error("Error fetching medical settings:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch medical settings"
      );
    }
  };

  const refreshSettings = async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchProfile(),
        fetchNotifications(),
        fetchMedicalSettings(),
      ]);
    } catch (err) {
      console.error("Error refreshing settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (
    data: Partial<ProfileData>
  ): Promise<boolean> => {
    try {
      await handleApiCall("/api/settings/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      });

      // Update local state
      setProfile((prev) => ({ ...prev, ...data }));
      return true;
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
      return false;
    }
  };

  const updateNotifications = async (
    data: NotificationSettings
  ): Promise<boolean> => {
    try {
      await handleApiCall("/api/settings/notifications", {
        method: "PUT",
        body: JSON.stringify({ notifications: data }),
      });

      // Update local state
      setNotifications(data);
      return true;
    } catch (err) {
      console.error("Error updating notifications:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update notifications"
      );
      return false;
    }
  };

  const updateMedicalSettings = async (
    data: MedicalSettings
  ): Promise<boolean> => {
    try {
      await handleApiCall("/api/settings/medical", {
        method: "PUT",
        body: JSON.stringify({ medicalSettings: data }),
      });

      // Update local state
      setMedicalSettings(data);
      return true;
    } catch (err) {
      console.error("Error updating medical settings:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update medical settings"
      );
      return false;
    }
  };
  useEffect(() => {
    refreshSettings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    profile,
    notifications,
    medicalSettings,
    loading,
    error,
    updateProfile,
    updateNotifications,
    updateMedicalSettings,
    refreshSettings,
  };
}
