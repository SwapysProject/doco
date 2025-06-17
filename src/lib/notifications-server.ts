// This file is server-only and ensures MongoDB imports are not bundled for the client

export {
  createNotification,
  getNotificationCount,
  getNotificationIcon,
  getNotificationColor,
} from "./notifications";
