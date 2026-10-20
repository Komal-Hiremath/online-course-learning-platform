import { useState } from "react";
import toast from "react-hot-toast";

import Styles from "./_course.module.css";
import { errMsg, tagsToString } from "../utils";

const emptyLesson = () => ({
  title: "",
  description: "",
  videoUrl: "",
  videoSection: "",
  videoLength: "",
});

const isValidUrl = (value) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

// Build the initial form state from an existing course (edit) or blank (create)
const toFormState = (course) => ({
  name: course?.name || "",
  description: course?.description || "",
  price: course?.price ?? "",
  estimatedPrice: course?.estimatedPrice ?? "",
  thumbnail:
    (typeof course?.thumbnail === "string"
      ? course.thumbnail
      : course?.thumbnail?.url) || "",
  tags: tagsToString(course?.tags),
  level: course?.level || "",
  demoUrl: course?.demoUrl || "",
});

const toTitles = (list) =>
  list?.length
    ? list.map((item) => ({ _id: item._id, title: item.title || "" }))
    : [{ title: "" }];

const toLessons = (list) =>
  list?.length
    ? list.map((item) => ({
        _id: item._id,
        title: item.title || "",
        description: item.description || "",
        videoUrl: item.videoUrl || "",
        videoSection: item.videoSection || "",
        videoLength: item.videoLength ?? "",
      }))
    : [emptyLesson()];

/**
 * Shared form for Create + Edit.
 *  - course:  existing course (edit) or undefined (create)
 *  - onSubmit(payload) -> Promise<boolean>  (true = success)
 */
const CourseForm = ({ course, title, submitLabel, onSubmit }) => {
  const isEdit = Boolean(course);

  const [formData, setFormData] = useState(() => toFormState(course));
  const [benefits, setBenefits] = useState(() => toTitles(course?.benefits));
  const [prerequisites, setPrerequisites] = useState(() =>
    toTitles(course?.prerequisites),
  );
  const [lessons, setLessons] = useState(() => toLessons(course?.courseData));
  const [submitting, setSubmitting] = useState(false);

  const originalThumbnail = toFormState(course).thumbnail;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // generic helpers for the three dynamic lists
  const updateItem = (setter, index, patch) =>
    setter((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  const removeItem = (setter, index) =>
    setter((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return toast.error("Course name is required");
    if (!formData.description.trim())
      return toast.error("Description is required");

    const price = Number(formData.price);
    if (formData.price === "" || Number.isNaN(price) || price < 0)
      return toast.error("Enter a valid price");

    if (!formData.level) return toast.error("Select course level");

    const thumbnail = formData.thumbnail.trim();
    if (!isEdit && !thumbnail) return toast.error("Thumbnail URL is required");
    if (thumbnail && !isValidUrl(thumbnail))
      return toast.error("Thumbnail must be a valid URL");

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price,
      tags: formData.tags.trim(),
      level: formData.level,
      demoUrl: formData.demoUrl.trim(),

      benefits: benefits
        .filter((b) => b.title.trim())
        .map((b) => ({ ...(b._id && { _id: b._id }), title: b.title.trim() })),

      prerequisites: prerequisites
        .filter((p) => p.title.trim())
        .map((p) => ({ ...(p._id && { _id: p._id }), title: p.title.trim() })),

      courseData: lessons
        .filter((l) => l.title.trim())
        .map((l) => ({
          ...(l._id && { _id: l._id }),
          title: l.title.trim(),
          description: l.description,
          videoUrl: l.videoUrl.trim(),
          videoSection: l.videoSection,
          videoLength: Number(l.videoLength || 0),
        })),
    };

    if (formData.estimatedPrice !== "") {
      payload.estimatedPrice = Number(formData.estimatedPrice);
    }

    // The API takes the thumbnail as a URL string and stores { public_id, url }.
    // On edit only send it when the admin actually changed it, otherwise the
    // server would re-upload the same image.
    if (!isEdit || thumbnail !== originalThumbnail) {
      payload.thumbnail = thumbnail;
    }

    try {
      setSubmitting(true);
      await onSubmit(payload);
    } catch (error) {
      toast.error(errMsg(error, "Request failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const renderTitleList = (label, placeholder, list, setter, addLabel) => (
    <>
      <div className={Styles.sectionHeader}>
        <h2>{label}</h2>
        <button
          type="button"
          onClick={() => setter((prev) => [...prev, { title: "" }])}
        >
          {addLabel}
        </button>
      </div>

      {list.map((item, index) => (
        <div className={Styles.dynamicRow} key={item._id || index}>
          <input
            type="text"
            value={item.title}
            onChange={(e) => updateItem(setter, index, { title: e.target.value })}
            placeholder={placeholder}
          />
          {list.length > 1 && (
            <button type="button" onClick={() => removeItem(setter, index)}>
              Remove
            </button>
          )}
        </div>
      ))}
    </>
  );

  return (
    <section className={Styles.createCourse}>
      <h1>{title}</h1>

      <form onSubmit={handleSubmit}>
        <h2>Basic Information</h2>

        <div>
          <label>Course Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter course name"
          />
        </div>

        <div>
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter course description"
          />
        </div>

        <div className={Styles.row}>
          <div>
            <label>Price (₹)</label>
            <input
              type="number"
              min="0"
              step="any"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="499"
            />
          </div>

          <div>
            <label>Estimated Price (₹)</label>
            <input
              type="number"
              min="0"
              step="any"
              name="estimatedPrice"
              value={formData.estimatedPrice}
              onChange={handleChange}
              placeholder="999"
            />
          </div>
        </div>

        <div>
          <label>Thumbnail URL</label>
          <input
            type="text"
            name="thumbnail"
            value={formData.thumbnail}
            onChange={handleChange}
            placeholder="https://..."
          />
          {formData.thumbnail && isValidUrl(formData.thumbnail) && (
            <img
              className={Styles.thumbPreview}
              src={formData.thumbnail}
              alt="Thumbnail preview"
            />
          )}
        </div>

        <div>
          <label>Tags (comma separated)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="react, javascript, frontend"
          />
        </div>

        <div className={Styles.row}>
          <div>
            <label>Level</label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
            >
              <option value="">Select level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label>Demo URL</label>
            <input
              type="text"
              name="demoUrl"
              value={formData.demoUrl}
              onChange={handleChange}
              placeholder="https://youtube.com/..."
            />
          </div>
        </div>

        {renderTitleList(
          "Benefits",
          "Example: Certificate",
          benefits,
          setBenefits,
          "+ Add Benefit",
        )}

        {renderTitleList(
          "Prerequisites",
          "Example: Basic JavaScript",
          prerequisites,
          setPrerequisites,
          "+ Add Prerequisite",
        )}

        <div className={Styles.sectionHeader}>
          <h2>Course Content</h2>
          <button
            type="button"
            onClick={() => setLessons((prev) => [...prev, emptyLesson()])}
          >
            + Add Video
          </button>
        </div>

        {lessons.map((lesson, index) => (
          <div className={Styles.videoBox} key={lesson._id || index}>
            <h3>Video {index + 1}</h3>

            <label>Video Title</label>
            <input
              type="text"
              value={lesson.title}
              onChange={(e) =>
                updateItem(setLessons, index, { title: e.target.value })
              }
              placeholder="Introduction to React"
            />

            <label>Description</label>
            <textarea
              value={lesson.description}
              onChange={(e) =>
                updateItem(setLessons, index, { description: e.target.value })
              }
              placeholder="Video description"
            />

            <label>Video URL</label>
            <input
              type="text"
              value={lesson.videoUrl}
              onChange={(e) =>
                updateItem(setLessons, index, { videoUrl: e.target.value })
              }
              placeholder="https://..."
            />

            <label>Video Section</label>
            <input
              type="text"
              value={lesson.videoSection}
              onChange={(e) =>
                updateItem(setLessons, index, { videoSection: e.target.value })
              }
              placeholder="React Basics"
            />

            <label>Video Length (minutes)</label>
            <input
              type="number"
              min="0"
              value={lesson.videoLength}
              onChange={(e) =>
                updateItem(setLessons, index, { videoLength: e.target.value })
              }
              placeholder="20"
            />

            {lessons.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(setLessons, index)}
              >
                Remove Video
              </button>
            )}
          </div>
        ))}

        <button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : submitLabel}
        </button>
      </form>
    </section>
  );
};

export default CourseForm;
