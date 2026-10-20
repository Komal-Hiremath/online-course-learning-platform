import { useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import S from "./lms.module.css";
import { errMsg, toEmbedUrl } from "../utils";
import { CompleteLectureApi, GetCurriculumApi, GetLectureApi, SaveProgressApi, toList } from "./lmsApi";
import { ErrorBox, Loading, useAsync } from "./LmsShared";

// <video> player that saves progress (key it by lecture id so the refs reset)
const Player = ({ lecture, lectureId }) => {
  const lastSaved = useRef(0);
  const embed = toEmbedUrl(lecture.videoUrl);
  const resume = Number(lecture.watchedSeconds ?? lecture.progress?.watchedSeconds ?? 0);

  const save = (seconds) => SaveProgressApi(lectureId, seconds).catch(() => {});

  if (!lecture.videoUrl) return <ErrorBox message="This lecture has no video." />;

  // YouTube / Vimeo iframes cannot report the playback position
  if (embed) {
    return <iframe src={embed} title={lecture.title} allowFullScreen allow="autoplay; encrypted-media; picture-in-picture" />;
  }

  return (
    <video
      controls
      src={lecture.videoUrl}
      onLoadedMetadata={(e) => {
        if (resume > 0) e.currentTarget.currentTime = resume;
      }}
      onTimeUpdate={(e) => {
        const t = Math.floor(e.currentTarget.currentTime);
        if (t - lastSaved.current >= 15) {
          lastSaved.current = t;
          save(t);
        }
      }}
      onPause={(e) => save(Math.floor(e.currentTarget.currentTime))}
    />
  );
};

const LmsLecture = () => {
  const { courseId, lectureId } = useParams();
  const navigate = useNavigate();

  const lectureState = useAsync(() => GetLectureApi(lectureId), [lectureId]);
  const curriculum = useAsync(() => GetCurriculumApi(courseId), [courseId]);

  const [completing, setCompleting] = useState(false);
  const [progress, setProgress] = useState(null);

  const list = toList(curriculum.data, "curriculum", "lectures", "content");
  const index = list.findIndex((l) => l._id === lectureId);
  const next = list.slice(index + 1).find((l) => !l.locked);
  const prev = index > 0 ? [...list.slice(0, index)].reverse().find((l) => !l.locked) : null;

  const complete = async () => {
    try {
      setCompleting(true);
      const res = await CompleteLectureApi(lectureId);
      const p = res?.enrollment?.progress ?? res?.progress;
      setProgress(typeof p === "number" ? p : null);
      toast.success(res?.certificate ? "Course completed - certificate issued! 🎉" : "Lecture marked complete");
    } catch (e) {
      toast.error(errMsg(e, "Could not mark complete"));
    } finally {
      setCompleting(false);
    }
  };

  const body = () => {
    if (lectureState.loading) return <Loading />;

    if (lectureState.status === 403) {
      return (
        <div className={S.empty}>
          <h3>Enrollment required</h3>
          <p>Buy this course to watch this lecture.</p>
          <Link className={S.btn} to={`/lms/course/${courseId}`}>Go to course</Link>
        </div>
      );
    }
    if (lectureState.error) return <ErrorBox message={lectureState.error} />;

    const lec = lectureState.data?.lecture ?? lectureState.data?.content ?? lectureState.data ?? {};

    return (
      <>
        <div className={S.videoWrap}>
          <Player key={lectureId} lecture={lec} lectureId={lectureId} />
        </div>

        <h2 style={{ margin: "14px 0 6px", color: "#32136c" }}>{lec.title}</h2>
        <p className={S.muted}>{lec.description}</p>

        {progress !== null && (
          <div style={{ margin: "12px 0" }}>
            <span className={S.muted}>Course progress: {Math.round(progress)}%</span>
            <div className={S.progress}>
              <div className={S.progressBar} style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
          </div>
        )}

        <div className={S.actions} style={{ marginTop: 14 }}>
          <button
            className={`${S.btn} ${S.btnGhost}`}
            disabled={!prev}
            onClick={() => navigate(`/lms/course/${courseId}/lecture/${prev._id}`)}
          >
            ← Previous
          </button>
          <button className={S.btn} disabled={completing} onClick={complete}>
            {completing ? "Saving..." : "✓ Mark complete"}
          </button>
          <button
            className={`${S.btn} ${S.btnGhost}`}
            disabled={!next}
            onClick={() => navigate(`/lms/course/${courseId}/lecture/${next._id}`)}
          >
            Next →
          </button>
        </div>
      </>
    );
  };

  return (
    <div className={S.lectureLayout}>
      <div>{body()}</div>

      <aside className={S.side}>
        <h3>Course content</h3>
        {curriculum.loading && <Loading />}
        {list.map((l, i) =>
          l.locked ? (
            <div key={l._id || i} className={`${S.sideItem} ${S.sideLocked}`}>🔒 {l.title}</div>
          ) : (
            <Link
              key={l._id || i}
              to={`/lms/course/${courseId}/lecture/${l._id}`}
              className={`${S.sideItem} ${l._id === lectureId ? S.sideActive : ""}`}
            >
              ▶️ {l.title}
            </Link>
          ),
        )}
        <div style={{ padding: 12 }}>
          <Link to={`/lms/course/${courseId}`}>← Back to course</Link>
        </div>
      </aside>
    </div>
  );
};

export default LmsLecture;
