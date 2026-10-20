import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import { CourseContext } from "../state-mgmt/CourseContext";
import Spinner from "../Spinner";
import Styles from "./_course.module.css";
import { errMsg, tagsToString, thumbnailUrl } from "../utils";

const Courses = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { courses, loading, getPublicCourses } = useContext(CourseContext);

  // ?search=react (used by the home page category links)
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [level, setLevel] = useState("All");

  useEffect(() => {
    getPublicCourses().catch((error) =>
      toast.error(errMsg(error, "Failed to load courses")),
    );
  }, []);

  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesSearch =
        !q ||
        course.name?.toLowerCase().includes(q) ||
        tagsToString(course.tags).toLowerCase().includes(q);

      const matchesLevel = level === "All" || course.level === level;

      return matchesSearch && matchesLevel;
    });
  }, [courses, search, level]);

  if (loading) return <Spinner />;

  return (
    <section className={Styles.coursesPage}>
      <div className={Styles.coursesHeader}>
        <h1>Courses</h1>
        <p>Learn from our collection of professional courses.</p>
      </div>

      <div className={Styles.filters}>
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="All">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      {filteredCourses.length === 0 ? (
        <div className={Styles.emptyState}>
          <h2>No courses found</h2>
          <p>Try another search or level.</p>
        </div>
      ) : (
        <div className={Styles.courseGrid}>
          {filteredCourses.map((course) => (
            <article className={Styles.courseCard} key={course._id}>
              <img src={thumbnailUrl(course.thumbnail)} alt={course.name} />

              <div className={Styles.courseCardBody}>
                <span>{course.level}</span>
                <h2>{course.name}</h2>
                <p>{course.description}</p>

                <div className={Styles.courseMeta}>
                  <strong>₹{course.price}</strong>
                  {course.estimatedPrice > 0 && (
                    <del>₹{course.estimatedPrice}</del>
                  )}
                  <span>⭐ {course.rating || 0}</span>
                </div>

                <p>{course.purchased || 0} students</p>

                <button onClick={() => navigate(`/courses/${course._id}`)}>
                  View Course
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default Courses;
