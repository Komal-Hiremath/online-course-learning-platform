import { useState } from "react";
import toast from "react-hot-toast";

import S from "./lms.module.css";
import { errMsg } from "../utils";
import {
  AddInstructorLectureApi,
  CreateInstructorCourseApi,
  GetInstructorAnalyticsApi,
  GetInstructorCoursesApi,
  GetInstructorRevenueApi,
  GetInstructorStudentsApi,
  SubmitCourseApi,
  UpdateInstructorCourseApi,
  toList,
} from "./lmsApi";
import { Async, AutoTable, AutoView, Field, Tabs, useAsync, useForm } from "./LmsShared";

const lines = (text) =>
  String(text || "")
    .split(/[\n,]/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((title) => ({ title }));

/* ---------- create / edit a course (created as DRAFT) ---------- */
const CourseForm = ({ course, onDone, onCancel }) => {
  const isEdit = Boolean(course);
  const f = useForm({
    name: course?.name || "",
    description: course?.description || "",
    price: course?.price ?? "",
    estimatedPrice: course?.estimatedPrice ?? "",
    thumbnail: course?.thumbnail?.url || "",
    tags: course?.tags || "",
    level: course?.level || "Beginner",
    demoUrl: course?.demoUrl || "",
    benefits: (course?.benefits || []).map((b) => b.title).join("\n"),
    prerequisites: (course?.prerequisites || []).map((b) => b.title).join("\n"),
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const v = f.values;
    if (!v.name.trim() || !v.description.trim()) return toast.error("Name and description are required");
    if (v.price === "" || Number(v.price) < 0) return toast.error("Enter a valid price");

    const payload = {
      name: v.name.trim(),
      description: v.description.trim(),
      price: Number(v.price),
      tags: v.tags,
      level: v.level,
      demoUrl: v.demoUrl.trim(),
      benefits: lines(v.benefits),
      prerequisites: lines(v.prerequisites),
    };
    if (v.estimatedPrice !== "") payload.estimatedPrice = Number(v.estimatedPrice);
    // docs show thumbnail as { public_id, url }; we only have a URL to give
    if (v.thumbnail.trim() && v.thumbnail.trim() !== course?.thumbnail?.url)
      payload.thumbnail = { url: v.thumbnail.trim() };

    try {
      setSaving(true);
      isEdit
        ? await UpdateInstructorCourseApi(course._id, payload)
        : await CreateInstructorCourseApi(payload);
      toast.success(isEdit ? "Course updated" : "Draft course created");
      onDone();
    } catch (err) {
      toast.error(errMsg(err, "Could not save course"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className={`${S.panel} ${S.form}`} onSubmit={submit}>
      <h3>{isEdit ? "Edit course" : "New course (saved as DRAFT)"}</h3>
      <Field label="Name"><input type="text" {...f.bind("name")} /></Field>
      <Field label="Description"><textarea {...f.bind("description")} /></Field>
      <div className={S.formRow}>
        <Field label="Price (₹)"><input type="number" min="0" step="any" {...f.bind("price")} /></Field>
        <Field label="Estimated price (₹)"><input type="number" min="0" step="any" {...f.bind("estimatedPrice")} /></Field>
        <Field label="Level">
          <select {...f.bind("level")}>
            <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
          </select>
        </Field>
      </div>
      <Field label="Thumbnail URL"><input type="text" {...f.bind("thumbnail")} placeholder="https://..." /></Field>
      <div className={S.formRow}>
        <Field label="Tags (comma separated)"><input type="text" {...f.bind("tags")} /></Field>
        <Field label="Demo URL"><input type="text" {...f.bind("demoUrl")} /></Field>
      </div>
      <Field label="Benefits (one per line)"><textarea {...f.bind("benefits")} /></Field>
      <Field label="Prerequisites (one per line)"><textarea {...f.bind("prerequisites")} /></Field>

      <div className={S.actions}>
        <button className={S.btn} disabled={saving}>{saving ? "Saving..." : isEdit ? "Update course" : "Create draft"}</button>
        <button type="button" className={`${S.btn} ${S.btnGhost}`} onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

/* ---------- add a lecture to a course ---------- */
const LectureForm = ({ course, onDone, onCancel }) => {
  const f = useForm({ title: "", description: "", videoUrl: "", videoSection: "", videoLength: "", isPreview: false });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const v = f.values;
    if (!v.title.trim() || !v.videoUrl.trim()) return toast.error("Title and video URL are required");

    try {
      setSaving(true);
      await AddInstructorLectureApi(course._id, {
        title: v.title.trim(),
        description: v.description,
        videoUrl: v.videoUrl.trim(),
        videoSection: v.videoSection.trim(),
        videoLength: Number(v.videoLength || 0),
        isPreview: Boolean(v.isPreview),
      });
      toast.success("Lecture added");
      f.reset();
      onDone();
    } catch (err) {
      toast.error(errMsg(err, "Could not add lecture"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className={`${S.panel} ${S.form}`} onSubmit={submit}>
      <h3>Add lecture to “{course.name}”</h3>
      <Field label="Title"><input type="text" {...f.bind("title")} /></Field>
      <Field label="Description"><textarea {...f.bind("description")} /></Field>
      <Field label="Video URL"><input type="text" {...f.bind("videoUrl")} placeholder="https://..." /></Field>
      <div className={S.formRow}>
        <Field label="Section"><input type="text" {...f.bind("videoSection")} /></Field>
        <Field label="Length (minutes)"><input type="number" min="0" {...f.bind("videoLength")} /></Field>
      </div>
      <label className={`${S.field} ${S.check}`}>
        <input
          type="checkbox"
          checked={Boolean(f.values.isPreview)}
          onChange={(e) => f.setValues((v) => ({ ...v, isPreview: e.target.checked }))}
        />
        Free preview lecture
      </label>
      <div className={S.actions}>
        <button className={S.btn} disabled={saving}>{saving ? "Saving..." : "Add lecture"}</button>
        <button type="button" className={`${S.btn} ${S.btnGhost}`} onClick={onCancel}>Close</button>
      </div>
    </form>
  );
};

/* ---------- my courses ---------- */
const MyCourses = () => {
  const state = useAsync(GetInstructorCoursesApi);
  const [panel, setPanel] = useState(null); // { type: "create" | "edit" | "lecture", course }

  const submitForReview = async (id) => {
    try {
      await SubmitCourseApi(id);
      toast.success("Submitted for review");
      state.reload();
    } catch (e) {
      toast.error(errMsg(e, "Could not submit course"));
    }
  };

  const done = () => {
    setPanel(null);
    state.reload();
  };

  return (
    <>
      <div className={S.actions} style={{ marginBottom: 16 }}>
        <button className={S.btn} onClick={() => setPanel({ type: "create" })}>+ New course</button>
      </div>

      {panel?.type === "create" && <CourseForm onDone={done} onCancel={() => setPanel(null)} />}
      {panel?.type === "edit" && <CourseForm course={panel.course} onDone={done} onCancel={() => setPanel(null)} />}
      {panel?.type === "lecture" && <LectureForm course={panel.course} onDone={state.reload} onCancel={() => setPanel(null)} />}

      <Async state={state}>
        {(res) => (
          <AutoTable
            title="My courses"
            rows={toList(res, "courses")}
            actions={(c) => (
              <div className={S.actions}>
                <button className={`${S.btn} ${S.btnSm} ${S.btnGhost}`} onClick={() => setPanel({ type: "edit", course: c })}>Edit</button>
                <button className={`${S.btn} ${S.btnSm} ${S.btnGhost}`} onClick={() => setPanel({ type: "lecture", course: c })}>+ Lecture</button>
                <button className={`${S.btn} ${S.btnSm}`} onClick={() => submitForReview(c._id)}>Submit</button>
              </div>
            )}
          />
        )}
      </Async>
    </>
  );
};

const TABS = [
  ["courses", "My Courses"],
  ["students", "Students"],
  ["revenue", "Revenue"],
  ["analytics", "Analytics"],
];

const LmsInstructor = () => {
  const [tab, setTab] = useState("courses");
  const students = useAsync(() => (tab === "students" ? GetInstructorStudentsApi() : null), [tab]);
  const revenue = useAsync(() => (tab === "revenue" ? GetInstructorRevenueApi() : null), [tab]);
  const analytics = useAsync(() => (tab === "analytics" ? GetInstructorAnalyticsApi() : null), [tab]);

  return (
    <>
      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === "courses" && <MyCourses />}
      {tab === "students" && (
        <Async state={students}>{(d) => <AutoTable title="Students" rows={toList(d, "students", "enrollments")} />}</Async>
      )}
      {tab === "revenue" && <Async state={revenue}>{(d) => <AutoView data={d} />}</Async>}
      {tab === "analytics" && <Async state={analytics}>{(d) => <AutoView data={d} />}</Async>}
    </>
  );
};

export default LmsInstructor;
