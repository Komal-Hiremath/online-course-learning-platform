import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { CourseContext } from "../state-mgmt/CourseContext";
import { useEnrollment } from "../state-mgmt/EnrollmentContext";
import { useAuth } from "../hooks/fetchUser";
import Spinner from "../Spinner";
import CheckoutModal from "./CheckoutModal";
import Styles from "./_course.module.css";
import { errMsg, idOf, thumbnailUrl } from "../utils";

/* ============================================================
   One lesson with its own Q&A state (the old code shared a single
   `question` string across every lesson).
   ============================================================ */
const LessonQA = ({
  content,
  index,
  courseId,
  canAsk,
  canAnswer,
  addQuestion,
  addAnswer,
  refresh,
}) => {
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState({});
  const [busy, setBusy] = useState(false);

  const ask = async () => {
    if (!question.trim()) return toast.error("Please enter a question");

    try {
      setBusy(true);
      await addQuestion({
        question: question.trim(),
        courseId,
        contentId: content._id,
      });
      toast.success("Question submitted");
      setQuestion("");
      await refresh();
    } catch (error) {
      toast.error(errMsg(error, "Failed to submit question"));
    } finally {
      setBusy(false);
    }
  };

  const answer = async (questionId) => {
    const text = (answers[questionId] || "").trim();
    if (!text) return toast.error("Please enter an answer");

    try {
      setBusy(true);
      await addAnswer({
        answer: text,
        courseId,
        contentId: content._id,
        questionId,
      });
      toast.success("Answer submitted");
      setAnswers((prev) => ({ ...prev, [questionId]: "" }));
      await refresh();
    } catch (error) {
      toast.error(errMsg(error, "Failed to submit answer"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className={Styles.contentCard}>
      <h3>
        {index + 1}. {content.title}
      </h3>

      {content.videoSection && (
        <p>
          <strong>Section:</strong> {content.videoSection}
        </p>
      )}

      {content.description && <p>{content.description}</p>}

      {content.videoLength > 0 && (
        <p>
          <strong>Duration:</strong> {content.videoLength} minutes
        </p>
      )}

      {content.isPreview && <span>Preview Available</span>}

      <div className={Styles.questionsSection}>
        <h4>Questions</h4>

        {content.questions?.length ? (
          content.questions.map((item) => (
            <div className={Styles.question} key={item._id}>
              <strong>{item.user?.name || "Student"}</strong>
              <p>{item.question}</p>

              {item.answers?.length ? (
                <div className={Styles.answers}>
                  {item.answers.map((a) => (
                    <div className={Styles.answer} key={a._id}>
                      <strong>{a.user?.name || "User"}</strong>
                      <p>{a.answer}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No answers yet.</p>
              )}

              {canAnswer && (
                <div>
                  <textarea
                    value={answers[item._id] || ""}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        [item._id]: e.target.value,
                      }))
                    }
                    placeholder="Write your answer..."
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => answer(item._id)}
                  >
                    Answer
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No questions yet.</p>
        )}
      </div>

      {canAsk && (
        <div className={Styles.askQuestion}>
          <h4>Ask a Question</h4>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask something about this lesson..."
          />
          <button type="button" disabled={busy} onClick={ask}>
            Ask Question
          </button>
        </div>
      )}
    </article>
  );
};

/* ============================================================
   One review, with its own admin-reply box
   ============================================================ */
const ReviewItem = ({ item, courseId, isAdmin, addReply, refresh }) => {
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!reply.trim()) return toast.error("Please enter a reply");

    try {
      setBusy(true);
      await addReply({
        comment: reply.trim(),
        courseId,
        reviewId: item._id,
      });
      toast.success("Reply added");
      setReply("");
      await refresh();
    } catch (error) {
      toast.error(errMsg(error, "Failed to add reply"));
    } finally {
      setBusy(false);
    }
  };

  // the API may return commentReplies (array) or reply (object / string)
  const replies = item.commentReplies?.length
    ? item.commentReplies
    : item.reply
      ? [item.reply]
      : [];

  return (
    <article className={Styles.reviewCard}>
      <h3>{item.user?.name || "Student"}</h3>
      <p>{"⭐".repeat(Math.round(Number(item.rating || 0)))}</p>
      <p>{item.comment || item.review}</p>

      {replies.map((r, i) => (
        <div className={Styles.adminReply} key={r._id || i}>
          <strong>Admin Reply</strong>
          <p>{r.comment || r}</p>
        </div>
      ))}

      {isAdmin && (
        <div>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Write admin reply..."
          />
          <button type="button" disabled={busy} onClick={submit}>
            Reply
          </button>
        </div>
      )}
    </article>
  );
};

/* ============================================================
   Page
   ============================================================ */
const CourseDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { getMyLearning, myLearning } = useEnrollment();

  const { course, loading, getCourseById, addReview, addQuestion, addAnswer, addReply } =
    useContext(CourseContext);

  const [review, setReview] = useState("");
  const [rating, setRating] = useState(5);
  const [busy, setBusy] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const isAdminPage = location.pathname.startsWith(
    "/admin/admin-dashboard/course/",
  );

  useEffect(() => {
    getCourseById(id).catch((error) =>
      toast.error(errMsg(error, "Failed to load course")),
    );
  }, [id]);

  // only students that are logged in have a "my learning" list
  useEffect(() => {
    if (user && !isAdminPage) {
      getMyLearning().catch(() => {});
    }
  }, [id, user?._id, isAdminPage]);

  const isPurchased = Boolean(
    user &&
      myLearning?.some((item) => {
        const found =
          idOf(item.courseId) || idOf(item.course) || idOf(item._id);
        return found === id;
      }),
  );

  // refresh the course without showing the full-page spinner
  const refresh = () => getCourseById(id, { silent: true });

  const handleReview = async () => {
    if (!review.trim()) return toast.error("Please enter a review");

    try {
      setBusy(true);
      await addReview(id, { review: review.trim(), rating: Number(rating) });
      toast.success("Review submitted");
      setReview("");
      setRating(5);
      await refresh();
    } catch (error) {
      toast.error(errMsg(error, "Failed to submit review"));
    } finally {
      setBusy(false);
    }
  };

  // Buy -> open the Stripe checkout modal (coupon + card)
  const handleBuyCourse = () => {
    if (!user) {
      toast.error("Please log in to buy this course");
      navigate("/auth/login");
      return;
    }
    setCheckoutOpen(true);
  };

  // called by the modal after Stripe charged the card AND /payments/verify created the enrollment
  const handlePaid = async () => {
    setCheckoutOpen(false);
    toast.success("Course purchased successfully");
    await getMyLearning().catch(() => {});
    navigate(`/user/profile/course/${id}`);
  };

  // `course._id !== id` also covers "previous course still in state"
  if (loading || !course || course._id !== id) {
    return <Spinner />;
  }

  return (
    <section className={Styles.courseDetails}>
      <div className={Styles.courseHero}>
        <div>
          <img src={thumbnailUrl(course.thumbnail)} alt={course.name} />
        </div>

        <div>
          <span>{course.level}</span>
          <h1>{course.name}</h1>
          <p>{course.description}</p>

          <div>
            <strong>₹{course.price}</strong>{" "}
            {course.estimatedPrice > 0 && <del>₹{course.estimatedPrice}</del>}
          </div>

          <p>⭐ {course.rating || 0}</p>
          <p>{course.purchased || 0} students</p>

          {course.demoUrl && (
            <a href={course.demoUrl} target="_blank" rel="noreferrer">
              Watch Demo
            </a>
          )}

          {!isAdminPage &&
            (isPurchased ? (
              <button
                type="button"
                onClick={() => navigate(`/user/profile/course/${course._id}`)}
              >
                Go to Course
              </button>
            ) : (
              <button type="button" onClick={handleBuyCourse}>
                Buy Course
              </button>
            ))}
        </div>
      </div>

      <div className={Styles.detailSection}>
        <h2>What You Will Learn</h2>
        {course.benefits?.length ? (
          <ul>
            {course.benefits.map((b, i) => (
              <li key={b._id || i}>✓ {b.title}</li>
            ))}
          </ul>
        ) : (
          <p>No benefits added.</p>
        )}
      </div>

      <div className={Styles.detailSection}>
        <h2>Prerequisites</h2>
        {course.prerequisites?.length ? (
          <ul>
            {course.prerequisites.map((p, i) => (
              <li key={p._id || i}>✓ {p.title}</li>
            ))}
          </ul>
        ) : (
          <p>No prerequisites added.</p>
        )}
      </div>

      <div className={Styles.detailSection}>
        <h2>Course Content</h2>
        {course.courseData?.length ? (
          course.courseData.map((content, index) => (
            <LessonQA
              key={content._id || index}
              content={content}
              index={index}
              courseId={id}
              canAsk={!isAdminPage && isPurchased}
              canAnswer={isAdminPage || isPurchased}
              addQuestion={addQuestion}
              addAnswer={addAnswer}
              refresh={refresh}
            />
          ))
        ) : (
          <p>No course content available.</p>
        )}
      </div>

      <div className={Styles.detailSection}>
        <h2>Reviews</h2>
        {course.reviews?.length ? (
          course.reviews.map((item, i) => (
            <ReviewItem
              key={item._id || i}
              item={item}
              courseId={id}
              isAdmin={isAdminPage}
              addReply={addReply}
              refresh={refresh}
            />
          ))
        ) : (
          <p>No reviews yet.</p>
        )}
      </div>

      {!isAdminPage && isPurchased && (
        <div className={Styles.detailSection}>
          <h2>Add Review</h2>

          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Write your review..."
          />

          <button type="button" disabled={busy} onClick={handleReview}>
            Submit Review
          </button>
        </div>
      )}

      {checkoutOpen && (
        <CheckoutModal
          course={course}
          onClose={() => setCheckoutOpen(false)}
          onPaid={handlePaid}
        />
      )}
    </section>
  );
};

export default CourseDetails;
