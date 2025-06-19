"use client";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useSettings } from "@/hooks/useSettings";

import React, { useState } from "react";
import {
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Heart,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Monitor,
  Save,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  const {
    profile,
    notifications,
    medicalSettings,
    loading,
    error,
    updateProfile,
    updateNotifications,
    updateMedicalSettings,
  } = useSettings();

  // Local state for form data
  const [localProfile, setLocalProfile] = useState(profile);
  const [localNotifications, setLocalNotifications] = useState(notifications);
  const [localMedicalSettings, setLocalMedicalSettings] =
    useState(medicalSettings);

  // Update local state when data is loaded
  React.useEffect(() => {
    setLocalProfile(profile);
  }, [profile]);

  React.useEffect(() => {
    setLocalNotifications(notifications);
  }, [notifications]);

  React.useEffect(() => {
    setLocalMedicalSettings(medicalSettings);
  }, [medicalSettings]);

  const settingsTabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    /*{ id: "appearance", label: "Appearance", icon: Palette },*/
    /*{ id: "data", label: "Data & Privacy", icon: Database },*/
    /*{ id: "medical", label: "Medical Settings", icon: Heart },*/
  ];

  const handleNotificationChange = (key: string) => {
    setLocalNotifications((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  const handleProfileChange = (field: string, value: string) => {
    setLocalProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus("idle");

    try {
      let success = true;

      if (activeTab === "profile") {
        success = await updateProfile(localProfile);
      } else if (activeTab === "notifications") {
        success = await updateNotifications(localNotifications);
      } else if (activeTab === "medical") {
        success = await updateMedicalSettings(localMedicalSettings);
      }

      setSaveStatus(success ? "success" : "error");

      if (success) {
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Save error:", error);
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading settings...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-6 w-6" />
            <span>Error loading settings: {error}</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={localProfile.firstName}
                    onChange={(e) =>
                      handleProfileChange("firstName", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={localProfile.lastName}
                    onChange={(e) =>
                      handleProfileChange("lastName", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Specialty
                  </label>
                  <select
                    value={localProfile.specialty}
                    onChange={(e) =>
                      handleProfileChange("specialty", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                  >
                    <option value="">Select specialty</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="General Practice">General Practice</option>
                    <option value="Surgeon">Surgeon</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Psychiatrist">Psychiatrist</option>
                    <option value="Orthopedic">Orthopedic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    License Number
                  </label>
                  <input
                    type="text"
                    value={localProfile.licenseNumber}
                    onChange={(e) =>
                      handleProfileChange("licenseNumber", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    <Mail className="inline w-4 h-4 mr-1" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={localProfile.email}
                    onChange={(e) =>
                      handleProfileChange("email", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    <Phone className="inline w-4 h-4 mr-1" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={localProfile.phone}
                    onChange={(e) =>
                      handleProfileChange("phone", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    <MapPin className="inline w-4 h-4 mr-1" />
                    Address
                  </label>
                  <textarea
                    value={localProfile.address}
                    onChange={(e) =>
                      handleProfileChange("address", e.target.value)
                    }
                    rows={3}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Notification Preferences
              </h3>
              <div className="space-y-4">
                {Object.entries({
                  appointments: "Appointment Reminders",
                  criticalAlerts: "Critical Patient Alerts",
                  patientUpdates: "Patient Status Updates",
                  systemUpdates: "System Updates",
                  emailNotifications: "Email Notifications",
                  smsNotifications: "SMS Notifications",
                }).map(([key, label]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between py-3 border-b border-border"
                  >
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        {label}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {key === "appointments" &&
                          "Get notified about upcoming appointments"}
                        {key === "criticalAlerts" &&
                          "Receive immediate alerts for critical patients"}
                        {key === "patientUpdates" &&
                          "Updates on patient condition changes"}
                        {key === "systemUpdates" &&
                          "System maintenance and feature updates"}
                        {key === "emailNotifications" &&
                          "Receive notifications via email"}
                        {key === "smsNotifications" &&
                          "Receive notifications via SMS"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleNotificationChange(key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localNotifications[
                          key as keyof typeof localNotifications
                        ]
                          ? "bg-primary"
                          : "bg-muted"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications[key as keyof typeof notifications]
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Password & Security
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground pr-10"
                      placeholder="Enter current password"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Two-Factor Authentication
              </h3>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Enable 2FA</p>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    Enable
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Theme Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: "light", label: "Light", icon: Sun },
                  { id: "dark", label: "Dark", icon: Moon },
                  { id: "system", label: "System", icon: Monitor },
                ].map((theme) => (
                  <button
                    key={theme.id}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      theme.id === "light"
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <theme.icon className="w-6 h-6 mx-auto mb-2 text-foreground" />
                    <p className="text-sm font-medium text-foreground">
                      {theme.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Display Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Compact Mode
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Reduce spacing and padding for more content
                    </p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      High Contrast
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Increase contrast for better visibility
                    </p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "data":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Data Management
              </h3>
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-2">
                    Export Patient Data
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Download a copy of all patient records and data
                  </p>
                  <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
                    Export Data
                  </button>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-2">
                    Data Retention
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Configure how long patient data is stored
                  </p>
                  <select className="px-3 py-2 bg-input border border-border rounded-lg text-foreground">
                    <option>7 years (Recommended)</option>
                    <option>10 years</option>
                    <option>15 years</option>
                    <option>Indefinite</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Privacy Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Analytics Tracking
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Help improve the platform with usage analytics
                    </p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Data Sharing
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Share anonymized data for research purposes
                    </p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "medical":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Prescription Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Default Prescription Template
                  </label>
                  <select
                    value={localMedicalSettings.defaultPrescriptionTemplate}
                    onChange={(e) =>
                      setLocalMedicalSettings((prev) => ({
                        ...prev,
                        defaultPrescriptionTemplate: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                  >
                    <option value="standard">Standard Template</option>
                    <option value="cardiology">Cardiology Template</option>
                    <option value="pediatric">Pediatric Template</option>
                    <option value="custom">Custom Template</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    AI Prescription Assistance
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() =>
                        setLocalMedicalSettings((prev) => ({
                          ...prev,
                          enableAIPrescriptions: !prev.enableAIPrescriptions,
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localMedicalSettings.enableAIPrescriptions
                          ? "bg-primary"
                          : "bg-muted"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localMedicalSettings.enableAIPrescriptions
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span className="text-sm text-foreground">
                      Enable AI-powered prescription suggestions
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Clinical Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Appointment Duration
                  </label>
                  <select
                    value={localMedicalSettings.appointmentDuration}
                    onChange={(e) =>
                      setLocalMedicalSettings((prev) => ({
                        ...prev,
                        appointmentDuration: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Working Hours
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="time"
                      value={localMedicalSettings.workingHours.start}
                      onChange={(e) =>
                        setLocalMedicalSettings((prev) => ({
                          ...prev,
                          workingHours: {
                            ...prev.workingHours,
                            start: e.target.value,
                          },
                        }))
                      }
                      className="px-3 py-2 bg-input border border-border rounded-lg text-foreground"
                    />
                    <input
                      type="time"
                      value={localMedicalSettings.workingHours.end}
                      onChange={(e) =>
                        setLocalMedicalSettings((prev) => ({
                          ...prev,
                          workingHours: {
                            ...prev.workingHours,
                            end: e.target.value,
                          },
                        }))
                      }
                      className="px-3 py-2 bg-input border border-border rounded-lg text-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Emergency Contact
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() =>
                        setLocalMedicalSettings((prev) => ({
                          ...prev,
                          emergencyContactEnabled:
                            !prev.emergencyContactEnabled,
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localMedicalSettings.emergencyContactEnabled
                          ? "bg-primary"
                          : "bg-muted"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localMedicalSettings.emergencyContactEnabled
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span className="text-sm text-foreground">
                      Enable emergency contact notifications
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <DashboardLayout>
        <div className="min-h-screen bg-background">
          {/* Header */}
          <div className="border-b border-border bg-card">
            <div className="px-6 py-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                    <SettingsIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      Settings
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Manage your account and application preferences
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex">
            {/* Sidebar */}
            <div className="w-64 bg-card border-r border-border min-h-screen">
              <div className="p-4">
                <nav className="space-y-2">
                  {settingsTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
              <div className="max-w-4xl">
                {renderTabContent()}

                {/* Save Button */}
                <div className="mt-8 pt-6 border-t border-border">
                  <div className="flex justify-between items-center">
                    {saveStatus === "success" && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <span className="text-sm">
                          Settings saved successfully!
                        </span>
                      </div>
                    )}
                    {saveStatus === "error" && (
                      <div className="flex items-center text-red-600">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <span className="text-sm">
                          Error saving settings. Please try again.
                        </span>
                      </div>
                    )}
                    {saveStatus === "idle" && <div></div>}

                    <div className="flex space-x-3">
                      <button className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors">
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2 disabled:opacity-50"
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>{saving ? "Saving..." : "Save Changes"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
