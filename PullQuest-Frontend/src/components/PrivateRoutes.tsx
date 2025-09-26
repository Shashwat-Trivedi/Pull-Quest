import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  role: string;
  exp?: number;
}

interface PrivateRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

const PrivateRoute = ({ allowedRoles, children }: PrivateRouteProps) => {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/" />;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (allowedRoles.includes(decoded.role)) {
      return <>{children}</>;
    } else {
      return <Navigate to="/" />;
    }
  } catch {
    return <Navigate to="/" />;
  }
};

export default PrivateRoute;
