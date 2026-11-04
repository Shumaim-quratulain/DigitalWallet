import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <p>Loading...</p>;

  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;

  return <>{children}</>;
}
