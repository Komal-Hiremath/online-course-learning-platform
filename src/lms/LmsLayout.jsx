import { Link, NavLink, Outlet } from "react-router-dom";
import S from "./lms.module.css";
import { useAuth } from "../hooks/fetchUser";

const LmsLayout = () => {
  const { user } = useAuth();
  const role = user?.role;
  const cls = ({ isActive }) => (isActive ? `${S.navLink} ${S.navActive}` : S.navLink);

  return (
    <div className={S.page}>
      <header className={S.header}>
        <h1>LMS Marketplace</h1>

        <nav className={S.nav}>
          <NavLink to="/lms" end className={cls}>Marketplace</NavLink>
          {user && <NavLink to="/lms/learning" className={cls}>My Learning</NavLink>}
          {(role === "instructor" || role === "admin") && (
            <NavLink to="/lms/instructor" className={cls}>Instructor</NavLink>
          )}
          {role === "admin" && <NavLink to="/lms/admin" className={cls}>LMS Admin</NavLink>}
          <Link to="/" className={S.navLink}>← Site home</Link>
        </nav>
      </header>

      <Outlet />
    </div>
  );
};

export default LmsLayout;
