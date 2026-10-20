import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import S from "./lms.module.css";
import { useAuth } from "../hooks/fetchUser";
import { errMsg, thumbnailUrl } from "../utils";
import {
  AddLmsReviewApi,
  GetCurriculumApi,
  GetLmsCourseApi,
  GetLmsReviewsApi,
  GetMyLearningApi,
  courseIdOf,
  flattenLearning,
  toList,
} from "./lmsApi";
import { Async, Empty, ErrorBox, Field, Loading, useAsync, useForm, useWishlist } from "./LmsShared";

// Phase 1's Stripe checkout is reused as-is (read-only import, nothing in Phase 1 is changed)
import CheckoutModal from "../courses/CheckoutModal";

const LmsCourseDetail = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { ids: wishIds, toggle } = useWishlist();

  const detail = useAsync(() => GetLmsCourseApi(courseId), [courseId]);
  const curriculum = useAsync(() => GetCurriculumApi(courseId), [courseId]);
  const reviews = useAsync(() => GetLmsReviewsApi(courseId), [courseId]);
  const learning = useAsync(
    () => (user ? GetMyLearningApi().catch(() => null) : Promise.resolve(null)),
    [courseId, user?._id],
  );

  const [checkout, setCheckout] = useState(false);
  const review = useForm({ rating: "5", comment: "" });
  const [posting, setPosting] = useState(false);

  if (detail.loading) return <Loading />;
  if (detail.error) return <ErrorBox message={detail.error} />;

  const course = detail.data?.course ?? detail.data ?? {};
  const lectures = toList(curriculum.data, "curriculum", "lectures", "content");

  const enrolledIds = new Set(flattenLearning(learning.data).map(courseIdOf));
  const enrolled =
    enrolledIds.has(courseId) || lectures.some((l) => l.locked === false && !l.isPreview);

  // group lectures by section title
  const groups = lectures.reduce((acc, l) => {
    const key = l.videoSection || "Lectures";
    (acc[key] = acc[key] || []).push(l);
    return acc;
  }, {});

  const openLecture = (l) => {
    if (l.locked) return toast("Enroll in this course to unlock this lecture");
    navigate(`/lms/course/${courseId}/lecture/${l._id}`);
  };

  const buy = () => {
    if (!user) {
      toast.error("Please log in to buy this course");
      return navigate("/auth/login");
    }
    setCheckout(true);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!review.values.comment.trim()) return toast.error("Write a comment");

    try {
      setPosting(true);
      await AddLmsReviewApi(courseId, {
        rating: Number(review.values.rating),
        comment: review.values.comment.trim(),
      });
      toast.success("Review added");
      review.reset();
      reviews.reload();
    } catch (err) {
      toast.error(errMsg(err, "Could not add review"));
    } finally {
      setPosting(false);
    }
  };

  return (
    <>
      <div className={S.detail}>
        <img src={thumbnailUrl(course.thumbnail)} alt={course.name} />

        <div>
          {course.level && <span className={S.badge}>{course.level}</span>}
          <h1>{course.name}</h1>
          <p>{course.description}</p>
          <p>
            ⭐ {course.rating || 0} · {course.purchased || 0} students
          </p>
          <p className={S.price} style={{ fontSize: 24 }}>
            ₹{course.price ?? 0}
            {course.estimatedPrice > 0 && <del>₹{course.estimatedPrice}</del>}
          </p>

          <div className={S.actions}>
            {enrolled ? (
              <button className={S.btn} onClick={() => navigate("/lms/learning")}>
                Go to My Learning
              </button>
            ) : (
              <button className={S.btn} onClick={buy}>
                Buy course
              </button>
            )}
            <button className={`${S.btn} ${S.btnGhost}`} onClick={() => toggle(courseId)}>
              {wishIds.has(courseId) ? "❤️ In wishlist" : "🤍 Add to wishlist"}
            </button>
            {course.demoUrl && (
              <a className={`${S.btn} ${S.btnGhost}`} href={course.demoUrl} target="_blank" rel="noreferrer">
                Watch demo
              </a>
            )}
          </div>

          {course.benefits?.length > 0 && (
            <>
              <h3 style={{ margin: "16px 0 6px" }}>What you will learn</h3>
              <ul>
                {course.benefits.map((b, i) => (
                  <li key={b._id || i}>✓ {b.title}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <section className={S.section}>
        <h2>Curriculum</h2>
        <Async state={curriculum}>
          {() =>
            lectures.length ? (
              Object.entries(groups).map(([section, list]) => (
                <div className={S.lectureGroup} key={section}>
                  <h3>{section}</h3>
                  {list.map((l, i) => (
                    <div
                      key={l._id || i}
                      className={`${S.lectureRow} ${l.locked ? S.lectureLocked : ""}`}
                      onClick={() => openLecture(l)}
                    >
                      <span>
                        {l.locked ? "🔒" : "▶️"} {l.title}
                        {l.isPreview && <span className={`${S.badge} ${S.badgeOk}`} style={{ marginLeft: 8 }}>Preview</span>}
                      </span>
                      {l.videoLength > 0 && <span className={S.muted}>{l.videoLength} min</span>}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <Empty>No lectures yet.</Empty>
            )
          }
        </Async>
      </section>

      <section className={S.section}>
        <h2>Reviews</h2>
        <Async state={reviews}>
          {(res) => {
            const list = toList(res, "reviews");
            return list.length ? (
              list.map((r, i) => (
                <div className={S.reviewCard} key={r._id || i}>
                  <strong>{r.user?.name || r.userName || "Student"}</strong>{" "}
                  {"⭐".repeat(Math.round(Number(r.rating || 0)))}
                  <p>{r.comment || r.review}</p>
                </div>
              ))
            ) : (
              <Empty>No reviews yet.</Empty>
            );
          }}
        </Async>

        {enrolled && (
          <form className={`${S.panel} ${S.form}`} onSubmit={submitReview} style={{ marginTop: 16 }}>
            <h3>Add your review</h3>
            <Field label="Rating">
              <select {...review.bind("rating")}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{n} star{n > 1 && "s"}</option>
                ))}
              </select>
            </Field>
            <Field label="Comment">
              <textarea {...review.bind("comment")} placeholder="What did you think?" />
            </Field>
            <button className={S.btn} disabled={posting}>
              {posting ? "Posting..." : "Submit review"}
            </button>
          </form>
        )}
      </section>

      {checkout && (
        <CheckoutModal
          course={{ ...course, _id: course._id || courseId }}
          onClose={() => setCheckout(false)}
          onPaid={() => {
            setCheckout(false);
            toast.success("Course purchased successfully");
            navigate("/lms/learning");
          }}
        />
      )}
    </>
  );
};

export default LmsCourseDetail;
