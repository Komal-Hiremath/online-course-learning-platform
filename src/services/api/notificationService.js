import api from "./axios";

// Get all notifications (Admin only)
export const GetNotificationsApi = async () => {
  const { data } = await api.get("/notifications/get-all-notification");
  return data;
};

// Mark a notification as read (Admin only)
export const UpdateNotificationStatusApi = async (id) => {
  const { data } = await api.put(`/notifications/update-notification-status/${id}`);
  return data;
};
