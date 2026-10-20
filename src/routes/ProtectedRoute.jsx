import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/fetchUser";
import Spinner from "../Spinner";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/auth/login" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
