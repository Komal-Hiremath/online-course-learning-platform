import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/fetchUser";
import toast from "react-hot-toast";

const AuthNav = () => {
  const { user, logout } = useAuth();

  const handleLogout = async (e) => {
    e.preventDefault();

    try {
      // call the API while the token is still stored, then clear it
      await logout();
    } catch {
      // even if the server call fails we still log the user out locally
    } finally {
      localStorage.removeItem("TOKEN");
      toast.success("successfully user has been loggedout");
      window.location.assign("/auth/login");
    }
  };

  return (
    <>
      <li>
        <Link to="/">Home</Link>
      </li>

      {user?.role !== "admin" && (
        <li>
          <Link to="/courses">Courses</Link>
        </li>
      )}

      <li>
        <Link to="/lms">LMS Marketplace</Link>
      </li>

      <li>
        {user?.role === "admin" ? (
          <Link to="/admin/admin-dashboard">Dashboard</Link>
        ) : (
          <Link to="/user/profile">Dashboard</Link>
        )}
      </li>

      <li>
        {user?.role === "admin" ? (
          <Link to="/admin/admin-dashboard">{user?.name}</Link>
        ) : (
          <Link to="/user/profile">{user?.name}</Link>
        )}
      </li>

      <li>
        <Link to="#" onClick={handleLogout}>
          Logout
        </Link>
      </li>
    </>
  );
};

export default AuthNav;
