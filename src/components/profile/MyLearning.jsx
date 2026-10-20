import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useEnrollment } from "../../state-mgmt/EnrollmentContext";
import Styles from "./_profile.module.css";
import { errMsg, idOf, thumbnailUrl } from "../../utils";
import Spinner from "../../Spinner";

const MyLearning = () => {
  const navigate = useNavigate();
  const { myLearning, getMyLearning, loading } = useEnrollment();

  useEffect(() => {
    getMyLearning().catch((error) =>
      toast.error(errMsg(error, "Failed to load your courses")),
    );
  }, []);

  if (loading) return <Spinner/>;

  const total = myLearning?.length || 0;

  return (
    <section>
      <header className={Styles.learningHeader}>
        <h2>My Learning</h2>
        <span className={Styles.countBadge}>
          {total} {total === 1 ? "course" : "courses"}
        </span>
      </header>

      {total === 0 ? (
        <p className={Styles.learningEmpty}>
          You have not purchased any courses yet.
        </p>
      ) : (
        <section className={Styles.learningList}>
          {myLearning.map((item, index) => {
            const course =
              item.course && typeof item.course === "object"
                ? item.course
                : item;
            const courseId = idOf(item.courseId) || idOf(course) || idOf(item);

            return (
              <article className={Styles.learningCard} key={courseId || index}>
                <img src={thumbnailUrl(course.thumbnail)} alt={course.name} />

                <h3>{course.name}</h3>
                <p>{course.description}</p>

                <button
                  onClick={() => navigate(`/user/profile/course/${courseId}`)}
                >
                  Go to Course
                </button>
              </article>
            );
          })}
        </section>
      )}
    </section>
  );
};

export default MyLearning;
