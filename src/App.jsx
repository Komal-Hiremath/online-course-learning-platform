import { Fragment } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";

import Navbar from "./components/layouts/Navbar";
import HomePage from "./pages/HomePage";

// Auth
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import ActivationCode from "./components/auth/ActivationCOde";

// Profile
import ProfileDashboard from "./components/profile/ProfileDashboard";
import ProfileContentIndex from "./components/profile/ProfileContentIndex";
import UpdateProfileInfo from "./components/profile/UpdateProfileInfo";
import UpdatedProfilePicture from "./components/profile/UpdatedProfilePicture";
import UpdateProfilePassword from "./components/profile/UpdateProfilePassword";
import ProfileSettings from "./components/profile/ProfileSettings";

// Routes
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

// Admin
import AdminDashboard from "./components/admin/AdminDashboard";
import GetAllUsers from "./components/admin/GetAllUsers";
import SingleUser from "./components/admin/SingleUser";

// Phase 2: LMS Marketplace (separate module, lives in src/lms)
import LmsLayout from "./lms/LmsLayout";
import LmsHome from "./lms/LmsHome";
import LmsCourseDetail from "./lms/LmsCourseDetail";
import LmsLecture from "./lms/LmsLecture";
import LmsLearning from "./lms/LmsLearning";
import LmsInstructor from "./lms/LmsInstructor";
import LmsAdmin from "./lms/LmsAdmin";

// Courses
import CreateCourse from "./courses/CreateCourse";
import GetCourses from "./courses/GetCourses";
import EditCourse from "./courses/EditCourse";
import CourseDetails from "./courses/CourseDetails";
import Courses from "./courses/Courses";
import CourseContent from "./courses/CourseContent";

// Admin: orders / notifications / analytics / layout
import OrdersDashboard from "./components/admin/OrdersDashboard";
import Notifications from "./components/admin/Notifications";
import Analytics from "./components/admin/Analytics";
import LayoutManager from "./components/admin/LayoutManager";

const App = () => {
  return (
    <Fragment>
      <Router>
        <section id="navbar">
          <article className="container">
            {/* Navbar */}
            <aside className="top_header">
              <Navbar />
            </aside>

            <main className="main">
              <Routes>
                {/* ================= HOME ================= */}

                <Route path="/" element={<HomePage />} />

                {/* ================= AUTH ================= */}

                <Route path="/auth/register" element={<Register />} />

                <Route path="/auth/activate" element={<ActivationCode />} />

                <Route path="/auth/login" element={<Login />} />

                {/* ================= PUBLIC COURSES ================= */}

                {/* All Courses */}
                <Route path="/courses" element={<Courses />} />

                {/* Single Course Details */}
                <Route path="/courses/:id" element={<CourseDetails />} />

                {/* ================= PHASE 2: LMS MARKETPLACE ================= */}
                <Route path="/lms" element={<LmsLayout />}>
                  <Route index element={<LmsHome />} />
                  <Route path="course/:courseId" element={<LmsCourseDetail />} />

                  <Route element={<ProtectedRoute />}>
                    <Route path="course/:courseId/lecture/:lectureId" element={<LmsLecture />} />
                    <Route path="learning" element={<LmsLearning />} />
                    <Route path="instructor" element={<LmsInstructor />} />
                  </Route>

                  <Route element={<AdminRoute />}>
                    <Route path="admin" element={<LmsAdmin />} />
                  </Route>
                </Route>

                {/* ================= PROTECTED USER ROUTES ================= */}

                <Route element={<ProtectedRoute />}>
                  {/* User Profile */}
                  <Route path="/user/profile" element={<ProfileDashboard />}>
                    {/* /user/profile */}
                    <Route index element={<ProfileContentIndex />} />

                    {/* /user/profile/settings  (Profile tab: info + picture + password) */}
                    <Route path="settings" element={<ProfileSettings />} />

                    {/* /user/profile/update-user-info */}
                    <Route
                      path="update-user-info"
                      element={<UpdateProfileInfo />}
                    />

                    {/* /user/profile/update-profile-picture */}
                    <Route
                      path="update-profile-picture"
                      element={<UpdatedProfilePicture />}
                    />

                    {/* /user/profile/update-user-password */}
                    <Route
                      path="update-user-password"
                      element={<UpdateProfilePassword />}
                    />

                    {/* /user/profile/course/:id */}
                    <Route path="course/:id" element={<CourseContent />} />
                  </Route>
                </Route>

                {/* ================= ADMIN ROUTES ================= */}

                <Route element={<AdminRoute />}>
                  {/* Admin Dashboard */}
                  <Route
                    path="/admin/admin-dashboard"
                    element={<AdminDashboard />}
                  >
                    {/* /admin/admin-dashboard */}
                    <Route index element={<GetAllUsers />} />

                    {/* ================= ADMIN USERS ================= */}

                    {/* /admin/admin-dashboard/user/:id */}
                    <Route path="user/:id" element={<SingleUser />} />

                    {/* ================= ADMIN COURSES ================= */}

                    {/* Create Course */}
                    {/* /admin/admin-dashboard/create-course */}
                    <Route path="create-course" element={<CreateCourse />} />

                    {/* All Courses */}
                    {/* /admin/admin-dashboard/courses */}
                    <Route path="courses" element={<GetCourses />} />

                    {/* Course Details */}
                    {/* /admin/admin-dashboard/course/:id */}
                    <Route path="course/:id" element={<CourseDetails />} />

                    {/* Edit Course */}
                    {/* /admin/admin-dashboard/edit-course/:id */}
                    <Route path="edit-course/:id" element={<EditCourse />} />

                    {/* ================= ADMIN ORDERS / NOTIFICATIONS / ANALYTICS / LAYOUT ================= */}
                    <Route path="orders" element={<OrdersDashboard />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="layout" element={<LayoutManager />} />
                  </Route>
                </Route>
              </Routes>
            </main>
          </article>
        </section>
      </Router>
    </Fragment>
  );
};

export default App;
