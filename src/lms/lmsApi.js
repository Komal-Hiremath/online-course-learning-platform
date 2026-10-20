// Phase 2 – LMS Marketplace API layer (self-contained, does not touch Phase 1 services)
import api from "../services/api/axios";
import { idOf } from "../utils";

const get = async (url, config) => (await api.get(url, config)).data;
const post = async (url, body) => (await api.post(url, body)).data;
const put = async (url, body) => (await api.put(url, body)).data;
const del = async (url) => (await api.delete(url)).data;

/* ---------- marketplace (public) ---------- */
export const GetMarketHomeApi = () => get("/lms/home");
export const GetPublishedCoursesApi = () => get("/lms/courses");
export const SearchCoursesApi = (q) => get("/lms/search", { params: { q } });
export const GetCategoriesApi = () => get("/lms/categories");
export const GetLmsCourseApi = (courseId) => get(`/lms/courses/${courseId}`);
export const GetCurriculumApi = (courseId) => get(`/lms/courses/${courseId}/curriculum`);
export const GetLmsReviewsApi = (courseId) => get(`/lms/reviews/${courseId}`);
export const AddLmsReviewApi = (courseId, payload) => post(`/lms/reviews/${courseId}`, payload); // { rating, comment }

/* ---------- lectures ---------- */
export const GetLectureApi = (lectureId) => get(`/lms/lectures/${lectureId}`);
export const SaveProgressApi = (lectureId, watchedSeconds) =>
  post(`/lms/lectures/${lectureId}/progress`, { watchedSeconds });
export const CompleteLectureApi = (lectureId) => post(`/lms/lectures/${lectureId}/complete`);

/* ---------- my learning ---------- */
export const GetMyLearningApi = () => get("/lms/my-learning");
export const GetProgressAnalyticsApi = () => get("/lms/progress-analytics");
export const GetMyPurchasesApi = () => get("/lms/purchases");
export const GetWishlistApi = () => get("/lms/wishlist");
export const ToggleWishlistApi = (courseId) => post("/lms/wishlist/toggle", { courseId });
export const GetCertificatesApi = () => get("/lms/certificates");

// PDF needs the Bearer token -> fetch as blob and save
export const DownloadCertificateApi = async (id) => {
  const res = await api.get(`/lms/certificates/${id}/download`, { responseType: "blob" });
  saveBlob(res.data, `certificate-${id}.pdf`);
};

/* ---------- instructor ---------- */
export const GetInstructorCoursesApi = () => get("/lms/instructor/courses");
export const CreateInstructorCourseApi = (payload) => post("/lms/instructor/courses", payload);
export const UpdateInstructorCourseApi = (id, payload) => put(`/lms/instructor/courses/${id}`, payload);
export const AddInstructorLectureApi = (id, payload) => post(`/lms/instructor/courses/${id}/lectures`, payload);
export const SubmitCourseApi = (id) => post(`/lms/instructor/courses/${id}/submit`);
export const GetInstructorStudentsApi = () => get("/lms/instructor/students");
export const GetInstructorRevenueApi = () => get("/lms/instructor/revenue");
export const GetInstructorAnalyticsApi = () => get("/lms/instructor/analytics");

/* ---------- admin ---------- */
export const GetAdminAnalyticsApi = () => get("/lms/admin/analytics");
export const GetAdminCoursesApi = () => get("/lms/admin/courses");
export const SetCourseStatusApi = (id, status) => put(`/lms/admin/courses/${id}/status`, { status });
export const CloneCourseApi = (courseId) => post("/lms/courses/clone", { courseId });
export const GetAdminOrdersApi = () => get("/lms/admin/orders");
export const RefundOrderApi = (orderId) => post("/lms/payments/refund", { orderId });
export const GetAdminEnrollmentsApi = () => get("/lms/admin/enrollments");
export const GetInstructorsApi = () => get("/lms/admin/instructors");
export const GetAllCategoriesApi = () => get("/lms/categories/all");
export const CreateCategoryApi = (payload) => post("/lms/categories", payload);
export const UpdateCategoryApi = (id, payload) => put(`/lms/categories/${id}`, payload);
export const DeleteCategoryApi = (id) => del(`/lms/categories/${id}`);
export const GetCouponsApi = () => get("/lms/coupons");
export const CreateCouponApi = (payload) => post("/lms/coupons", payload);
export const ExportEnrollmentsApi = async () => {
  const res = await api.get("/lms/admin/enrollments/export", { responseType: "blob" });
  saveBlob(res.data, "enrollments.csv");
};

/* ---------- helpers (the docs don't spell out every response shape) ---------- */

// first array under one of `keys`, otherwise the first array property, otherwise []
export const toList = (res, ...keys) => {
  if (Array.isArray(res)) return res;
  if (!res || typeof res !== "object") return [];
  for (const k of keys) if (Array.isArray(res[k])) return res[k];
  return Object.values(res).find(Array.isArray) || [];
};

// an enrollment / wishlist row may wrap the course: { course: {...} }
export const courseOf = (item) =>
  (item?.course && typeof item.course === "object" ? item.course : item) || {};

export const courseIdOf = (item) => idOf(item?.courseId) || idOf(courseOf(item)) || idOf(item);

// my-learning is "grouped by progress": flatten every group into one de-duplicated list
export const flattenLearning = (res) => {
  const rows = Array.isArray(res)
    ? res
    : Object.values(res || {}).filter(Array.isArray).flat();
  const seen = new Set();
  return rows.filter((r) => {
    const id = courseIdOf(r);
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

export const humanize = (key) =>
  String(key).replace(/([A-Z])/g, " $1").replace(/[_-]/g, " ").replace(/^./, (c) => c.toUpperCase());

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
