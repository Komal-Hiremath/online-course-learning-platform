import api from "./axios";

// Create Course
export const CreateCourseApi = async (payload) => {
    const { data } = await api.post("/course/create-course",payload);
    return data;
};

// Get all public courses
export const GetCoursesApi = async () => {
    const { data } = await api.get("/course/get-courses");
    return data;
};

// Get all courses for Admin Dashboard
export const GetAdminCoursesApi = async () => {
    const { data } = await api.get("/course/get-all-course-dashboard");
    return data;
};

// Get single course
export const GetCourseByIdApi = async (id) => {
    const { data } = await api.get(`/course/get-course/${id}`);
    return data;
};

// Get enrolled course content
export const GetCourseContentApi = async (id) => {
    const { data } = await api.get(`/course/get-course-content/${id}`);
    return data;
};

// Edit course
export const EditCourseApi = async (id, payload) => {
    const { data } = await api.put(`/course/edit-course/${id}`, payload);
    return data;
};

// Delete course
export const DeleteCourseApi = async (id) => {
    const { data } = await api.delete(`/course/delete-course/${id}`);
    return data;
};

// Add question
export const AddQuestionApi = async (payload) => {
    const { data } = await api.put("/course/add-question",payload);
    return data;
};

// Add answer
export const AddAnswerApi = async (payload) => {
    const { data } = await api.put("/course/add-answer",payload);
    return data;
};

// Add review
export const AddReviewApi = async (id, payload) => {
    const { data } = await api.put(`/course/add-review/${id}`,payload);
    return data;
};

// Admin reply to review
export const AddReplyApi = async (payload) => {
    const { data } = await api.put("/course/add-replay",payload);
    return data;
};
