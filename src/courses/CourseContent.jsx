import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import Spinner from "../Spinner";
import Styles from "./_course.module.css";
import { CourseContext } from "../state-mgmt/CourseContext";
import { errMsg, toEmbedUrl } from "../utils";

const Video = ({ url, title }) => {
  const embed = toEmbedUrl(url);

  // YouTube / Vimeo links cannot be played in a <video> tag
  if (embed) {
    return (
      <iframe
        className={Styles.videoFrame}
        src={embed}
        title={title}
        allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return <video controls width="100%" src={url} />;
};

const CourseContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { courseContent, loading, getCourseContent } =
    useContext(CourseContext);

  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    setAccessDenied(false);

    getCourseContent(id).catch((error) => {
      const status = error.response?.status;

      // API answers 404 "You are not enrolled in this course" (403 kept for safety)
      if (status === 404 || status === 403) {
        setAccessDenied(true);
        return;
      }

      toast.error(errMsg(error, "Failed to load course content"));
    });
  }, [id]);

  if (loading) return <Spinner />;

  if (accessDenied) {
    return (
      <section className={Styles.accessDenied}>
        <h1>Course Access Restricted</h1>
        <p>You are not enrolled in this course.</p>
        <p>Please purchase the course before accessing the lessons.</p>
        <button onClick={() => navigate(`/courses/${id}`)}>
          Back to Course
        </button>
      </section>
    );
  }

  return (
    <section className={Styles.courseContent}>
      <h1>Course Content</h1>

      {courseContent.length === 0 ? (
        <p>No course content available.</p>
      ) : (
        courseContent.map((content, index) => (
          <article className={Styles.contentCard} key={content._id || index}>
            <h2>{content.title || `Lesson ${index + 1}`}</h2>

            {content.description && <p>{content.description}</p>}

            {content.videoUrl && (
              <Video url={content.videoUrl} title={content.title} />
            )}

            {content.videoLength > 0 && (
              <p>Duration: {content.videoLength} minutes</p>
            )}

            {content.questions?.map((question) => (
              <div className={Styles.question} key={question._id}>
                <strong>Question</strong>
                <p>{question.question}</p>

                {question.answers?.map((answer) => (
                  <div className={Styles.answer} key={answer._id}>
                    <strong>Answer</strong>
                    <p>{answer.answer}</p>
                  </div>
                ))}
              </div>
            ))}
          </article>
        ))
      )}
    </section>
  );
};

export default CourseContent;
