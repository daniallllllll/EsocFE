import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const isAuth = localStorage.getItem("auth_user");

  if (!isAuth) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
