import { createContext, useState } from "react";

import {
  CreateCourseApi,
  GetCoursesApi,
  GetAdminCoursesApi,
  GetCourseByIdApi,
  GetCourseContentApi,
  EditCourseApi,
  DeleteCourseApi,
  AddQuestionApi,
  AddAnswerApi,
  AddReviewApi,
  AddReplyApi,
} from "../services/api/courseService";

export const CourseContext = createContext();

/*
  NOTE: `loading` is ONLY used for fetching data (list / details / content).
  Mutations (create, edit, delete, Q&A, reviews) do NOT flip it, otherwise the
  whole page is replaced by a spinner and typed text / scroll position is lost.
  Pages track their own "submitting" state for buttons.
*/
const CourseProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [adminCourses, setAdminCourses] = useState([]);
  const [course, setCourse] = useState(null);
  const [courseContent, setCourseContent] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---------- fetching (uses loading) ----------

  const getPublicCourses = async () => {
    try {
      setLoading(true);
      const response = await GetCoursesApi();
      if (response?.success) setCourses(response.courses || []);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const getCourses = async () => {
    try {
      setLoading(true);
      const response = await GetAdminCoursesApi();
      if (response?.success) setAdminCourses(response.courses || []);
      return response;
    } finally {
      setLoading(false);
    }
  };

  // silent = refresh in the background (no spinner, keeps current course on screen)
  const getCourseById = async (id, { silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
        setCourse(null); // never show the previously opened course
      }
      const response = await GetCourseByIdApi(id);
      if (response?.success) setCourse(response.course);
      return response;
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const getCourseContent = async (id) => {
    try {
      setLoading(true);
      setCourseContent([]);
      const response = await GetCourseContentApi(id);
      if (response?.success) setCourseContent(response.content || []);
      return response;
    } finally {
      setLoading(false);
    }
  };

  // ---------- mutations (no global loading) ----------

  const createCourse = async (payload) => {
    const response = await CreateCourseApi(payload);
    if (response?.success && response?.course) {
      setAdminCourses((prev) => [...prev, response.course]);
    }
    return response;
  };

  const editCourse = async (id, payload) => {
    const response = await EditCourseApi(id, payload);
    if (response?.success && response?.course) {
      setCourse(response.course);
      setAdminCourses((prev) =>
        prev.map((item) => (item._id === id ? response.course : item)),
      );
      setCourses((prev) =>
        prev.map((item) => (item._id === id ? response.course : item)),
      );
    }
    return response;
  };

  const deleteCourse = async (id) => {
    const response = await DeleteCourseApi(id);
    if (response?.success) {
      setAdminCourses((prev) => prev.filter((item) => item._id !== id));
      setCourses((prev) => prev.filter((item) => item._id !== id));
    }
    return response;
  };

  const addQuestion = (payload) => AddQuestionApi(payload);
  const addAnswer = (payload) => AddAnswerApi(payload);
  const addReview = (id, payload) => AddReviewApi(id, payload);
  const addReply = (payload) => AddReplyApi(payload);

  return (
    <CourseContext.Provider
      value={{
        courses,
        adminCourses,
        course,
        courseContent,
        loading,

        createCourse,
        getPublicCourses,
        getCourses,
        getCourseById,
        getCourseContent,

        editCourse,
        deleteCourse,

        addQuestion,
        addAnswer,
        addReview,
        addReply,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export default CourseProvider;
