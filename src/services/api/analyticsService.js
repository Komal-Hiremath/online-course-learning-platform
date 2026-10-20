import api from "./axios";

// 12-month analytics (Admin only)
export const GetUsersAnalyticsApi = async () => {
  const { data } = await api.get("/analytics/get-users-analytics");
  return data;
};

export const GetCourseAnalyticsApi = async () => {
  const { data } = await api.get("/analytics/get-course-analytics");
  return data;
};

export const GetOrderAnalyticsApi = async () => {
  const { data } = await api.get("/analytics/get-order-analytics");
  return data;
};
