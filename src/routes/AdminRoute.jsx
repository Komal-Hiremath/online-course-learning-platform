import { Navigate, Link, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/fetchUser";
import Spinner from "../Spinner";

const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;

  // not logged in -> login (the original code forgot to `return` this)
  if (!user) return <Navigate to="/auth/login" replace />;

  if (user.role?.toLowerCase() !== "admin") {
    return (
      <>
        <div>
          <h2>Access Restricted</h2>
          <p>
            {user.name}, your role is "{user.role}". You cannot access this
            page.
          </p>
        </div>
        <Link to="/user/profile">Return Home</Link>
      </>
    );
  }

  return <Outlet />;
};

export default AdminRoute;
