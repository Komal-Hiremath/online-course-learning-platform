import { useContext, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import Styles from "./_course.module.css";
import { CourseContext } from "../state-mgmt/CourseContext";
import Spinner from "../Spinner";
import { errMsg, thumbnailUrl } from "../utils";

const GetCourses = () => {
  const navigate = useNavigate();

  const { adminCourses, loading, getCourses, deleteCourse } =
    useContext(CourseContext);

  useEffect(() => {
    getCourses().catch((error) => {
      toast.error(errMsg(error, "Failed to load courses"));
    });
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this course?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await deleteCourse(id);

      if (response?.success) {
        toast.success("Course deleted successfully");
      }
    } catch (error) {
      toast.error(errMsg(error, "Failed to delete course"));
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <section className={Styles.coursesPage}>
      {adminCourses.length === 0 ? (
        <div className={Styles.emptyState}>
          <h2>No courses found</h2>

          <button
            onClick={() => navigate("/admin/admin-dashboard/create-course")}
          >
            Create Your First Course
          </button>
        </div>
      ) : (
        <>
          <header className={Styles.coursesHeader}>
            <h1>All Courses</h1>
            <span className={Styles.courseCount}>
              {adminCourses.length}{" "}
              {adminCourses.length === 1 ? "course" : "courses"}
            </span>
          </header>

          <div className={Styles.courseGrid}>
            {adminCourses.map((course) => (
              <article className={Styles.courseCard} key={course._id}>
                <img src={thumbnailUrl(course.thumbnail)} alt={course.name} />

                <div className={Styles.courseCardBody}>
                  <span>{course.level}</span>

                  <h2>{course.name}</h2>

                  <p>{course.description}</p>

                  <strong>₹{course.price}</strong>

                  <div className={Styles.adminActions}>
                    <button
                      onClick={() =>
                        navigate(`/admin/admin-dashboard/course/${course._id}`)
                      }
                    >
                      View
                    </button>

                    <button
                      onClick={() =>
                        navigate(
                          `/admin/admin-dashboard/edit-course/${course._id}`,
                        )
                      }
                    >
                      Edit
                    </button>

                    <button onClick={() => handleDelete(course._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default GetCourses;
