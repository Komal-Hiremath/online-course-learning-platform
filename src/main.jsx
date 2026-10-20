import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import toast, { Toaster } from "react-hot-toast";
import { AuthProvider } from "./state-mgmt/contextApi";
import CourseProvider from "./state-mgmt/CourseContext.jsx";
import { EnrollmentProvider } from "./state-mgmt/EnrollmentContext.jsx";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <CourseProvider>
      <EnrollmentProvider>
        <Toaster position="top-right" />
        <App />
      </EnrollmentProvider>
    </CourseProvider>
  </AuthProvider>,
);
