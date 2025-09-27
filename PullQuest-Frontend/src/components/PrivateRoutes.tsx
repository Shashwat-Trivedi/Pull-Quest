import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useUser } from "@/context/UserProvider";

interface JwtPayload {
  role: string;
  exp?: number;
}

interface PrivateRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

const PrivateRoute = ({ allowedRoles, children }: PrivateRouteProps) => {
  const { user, isLoading } = useUser();
  const token = localStorage.getItem("token");

  // Show loading while user context is being initialized
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check user context first
  if (user && allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  // Fallback to token check if user context is not available
  if (!token) return <Navigate to="/login" />;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (allowedRoles.includes(decoded.role)) {
      return <>{children}</>;
    } else {
      return <Navigate to="/login" />;
    }
  } catch {
    return <Navigate to="/login" />;
  }
};

export default PrivateRoute;
