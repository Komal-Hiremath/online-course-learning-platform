import api from "./axios";

// Small helpers so every endpoint is a one-liner
const get = async (url, config) => (await api.get(url, config)).data;
const post = async (url, body) => (await api.post(url, body)).data;
const put = async (url, body) => (await api.put(url, body)).data;
const del = async (url) => (await api.delete(url)).data;

/* ============ PAYMENTS (Stripe) ============ */
export const CreatePaymentApi = (payload) => post("/lms/payments/create", payload); // { courseId, couponCode? }
export const VerifyPaymentApi = (payload) => post("/lms/payments/verify", payload); // { paymentIntentId, courseId, couponCode? }
export const RefundPaymentApi = (orderId) => post("/lms/payments/refund", { orderId });
// POST /lms/payments/webhook is called by Stripe -> backend only, never from the UI

/* ============ MARKETPLACE (public) ============ */
export const GetMarketplaceHomeApi = () => get("/lms/home");
export const GetPublishedCoursesApi = () => get("/lms/courses");
export const SearchCoursesApi = (q) => get("/lms/search", { params: { q } });
export const GetLmsCourseApi = (courseId) => get(`/lms/courses/${courseId}`);
export const GetCategoriesApi = () => get("/lms/categories");

/* ============ CURRICULUM / LECTURES ============ */
export const GetCurriculumApi = (courseId) => get(`/lms/courses/${courseId}/curriculum`);
export const GetSectionsApi = (courseId) => get(`/lms/courses/${courseId}/sections`);
export const GetSectionApi = (sectionId) => get(`/lms/sections/${sectionId}`);
export const GetSectionLecturesApi = (sectionId) => get(`/lms/sections/${sectionId}/lectures`);
export const GetLectureApi = (lectureId) => get(`/lms/lectures/${lectureId}`);
export const CheckLectureAccessApi = (lectureId) => get(`/lms/lectures/${lectureId}/access`);
export const SaveLectureProgressApi = (lectureId, watchedSeconds) =>
  post(`/lms/lectures/${lectureId}/progress`, { watchedSeconds });
export const CompleteLectureApi = (lectureId) => post(`/lms/lectures/${lectureId}/complete`);

/* ============ MY LEARNING ============ */
export const GetMyLearningApi = () => get("/lms/my-learning");
export const GetMyEnrollmentsApi = () => get("/lms/enrollments");
export const GetEnrollmentApi = (id) => get(`/lms/enrollments/${id}`);
export const GetProgressAnalyticsApi = () => get("/lms/progress-analytics");
export const GetMyPurchasesApi = () => get("/lms/purchases");
export const GetMyOrdersApi = () => get("/lms/orders");
export const GetOrderApi = (id) => get(`/lms/orders/${id}`);

/* ============ WISHLIST ============ */
export const GetWishlistApi = () => get("/lms/wishlist");
export const ToggleWishlistApi = (courseId) => post("/lms/wishlist/toggle", { courseId }); // -> { wishlisted }

/* ============ REVIEWS ============ */
export const GetLmsReviewsApi = (courseId) => get(`/lms/reviews/${courseId}`);
export const AddLmsReviewApi = (courseId, payload) => post(`/lms/reviews/${courseId}`, payload); // { rating, comment }

/* ============ COUPONS ============ */
export const ValidateCouponApi = (payload) => post("/lms/coupons/validate", payload); // { code, courseId } -> { discount, payable }
export const GetCouponsApi = () => get("/lms/coupons"); // admin
export const CreateCouponApi = (payload) => post("/lms/coupons", payload); // admin

/* ============ CERTIFICATES ============ */
export const GetCertificatesApi = () => get("/lms/certificates");
export const GetCertificateApi = (id) => get(`/lms/certificates/${id}`);

// The PDF endpoint needs the Bearer token, so a plain <a href> will not work:
// download it as a blob and save it.
export const DownloadCertificateApi = async (id, filename = "certificate.pdf") => {
  const res = await api.get(`/lms/certificates/${id}/download`, { responseType: "blob" });
  saveBlob(res.data, filename);
};

/* ============ INSTRUCTOR ============ */
export const GetInstructorCoursesApi = () => get("/lms/instructor/courses");
export const CreateInstructorCourseApi = (payload) => post("/lms/instructor/courses", payload); // creates DRAFT
export const UpdateInstructorCourseApi = (courseId, payload) => put(`/lms/instructor/courses/${courseId}`, payload);
export const AddInstructorLectureApi = (courseId, payload) => post(`/lms/instructor/courses/${courseId}/lectures`, payload);
export const SubmitCourseForReviewApi = (courseId) => post(`/lms/instructor/courses/${courseId}/submit`);
export const GetInstructorStudentsApi = () => get("/lms/instructor/students");
export const GetInstructorRevenueApi = () => get("/lms/instructor/revenue");
export const GetInstructorAnalyticsApi = () => get("/lms/instructor/analytics");

/* ============ ADMIN ============ */
export const GetAdminAllCoursesApi = () => get("/lms/admin/courses");
export const SetCourseStatusApi = (courseId, status) => put(`/lms/admin/courses/${courseId}/status`, { status });
export const GetInstructorsApi = () => get("/lms/admin/instructors");
export const GetAdminOrdersApi = () => get("/lms/admin/orders");
export const GetAdminEnrollmentsApi = () => get("/lms/admin/enrollments");
export const GetMarketplaceAnalyticsApi = () => get("/lms/admin/analytics");
export const CloneCourseApi = (courseId) => post("/lms/courses/clone", { courseId });

export const ExportEnrollmentsCsvApi = async () => {
  const res = await api.get("/lms/admin/enrollments/export", { responseType: "blob" });
  saveBlob(res.data, "enrollments.csv");
};

// categories (admin)
export const GetAllCategoriesApi = () => get("/lms/categories/all");
export const CreateCategoryApi = (payload) => post("/lms/categories", payload); // { name, description }
export const UpdateCategoryApi = (id, payload) => put(`/lms/categories/${id}`, payload); // { name, description, isActive }
export const DeleteCategoryApi = (id) => del(`/lms/categories/${id}`);

/* ============ util ============ */
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
