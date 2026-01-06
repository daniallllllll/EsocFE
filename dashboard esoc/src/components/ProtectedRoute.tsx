import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const user = localStorage.getItem("auth_user");

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};
