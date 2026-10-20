import { useContext, useState } from "react";
import toast from "react-hot-toast";

import { CourseContext } from "../state-mgmt/CourseContext";
import CourseForm from "./CourseForm";

const CreateCourse = () => {
  const { createCourse } = useContext(CourseContext);

  // bumping the key remounts the form, which clears it after a successful save
  const [formKey, setFormKey] = useState(0);

  const handleSubmit = async (payload) => {
    const response = await createCourse(payload);

    if (response?.success) {
      toast.success("Course created successfully");
      setFormKey((key) => key + 1);
    } else {
      toast.error(response?.message || "Failed to create course");
    }
  };

  return (
    <CourseForm
      key={formKey}
      title="Create Course"
      submitLabel="Create Course"
      onSubmit={handleSubmit}
    />
  );
};

export default CreateCourse;
