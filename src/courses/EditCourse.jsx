import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { CourseContext } from "../state-mgmt/CourseContext";
import Spinner from "../Spinner";
import CourseForm from "./CourseForm";
import { errMsg } from "../utils";

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { adminCourses, getCourses, editCourse } = useContext(CourseContext);

  const course = adminCourses.find((item) => item._id === id);

  // becomes true once the admin list request finished (success or failure)
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (course) return;

    getCourses()
      .catch((error) => toast.error(errMsg(error, "Failed to load course")))
      .finally(() => setFetched(true));
  }, [id]);

  const handleSubmit = async (payload) => {
    const response = await editCourse(id, payload);

    if (response?.success) {
      toast.success("Course updated successfully");
      navigate("/admin/admin-dashboard/courses");
    } else {
      toast.error(response?.message || "Course update failed");
    }
  };

  if (!course && !fetched) return <Spinner />;

  // list loaded but this id is not in it (wrong id, or it was deleted)
  if (!course) {
    return (
      <div>
        <h2>Course not found</h2>
        <button onClick={() => navigate("/admin/admin-dashboard/courses")}>
          Back to courses
        </button>
      </div>
    );
  }

  return (
    <CourseForm
      key={course._id}
      course={course}
      title="Edit Course"
      submitLabel="Update Course"
      onSubmit={handleSubmit}
    />
  );
};

export default EditCourse;
