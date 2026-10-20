import { NavLink } from "react-router-dom";
import Styles from "./_admin.module.css";

const LINKS = [
  { to: "/admin/admin-dashboard", label: "All Users", end: true },
  { to: "/admin/admin-dashboard/create-course", label: "Create Course" },
  { to: "/admin/admin-dashboard/courses", label: "All Courses" },
  { to: "/admin/admin-dashboard/orders", label: "Orders" },
  { to: "/admin/admin-dashboard/notifications", label: "Notifications" },
  { to: "/admin/admin-dashboard/analytics", label: "Analytics" },
  { to: "/admin/admin-dashboard/layout", label: "Site Layout" },
  { to: "/lms", label: "LMS Marketplace", end: true },
  { to: "/lms/admin", label: "LMS Admin" },
];

const AdminSidebar = () => {
  return (
    <div className={Styles.sidebar}>
      <h2 className={Styles.title}>Admin Panel</h2>

      <nav className={Styles.nav}>
        {LINKS.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              isActive ? `${Styles.link} ${Styles.active}` : Styles.link
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;
