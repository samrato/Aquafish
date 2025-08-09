import { useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";

export default function RequireAuth({ children, requiredRole = null }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  if (requiredRole && user.role !== requiredRole) return <Navigate to="/unauthorized" />;

  return children;
}
