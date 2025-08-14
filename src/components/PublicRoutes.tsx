import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PublicRoute({ element }: { element: React.ReactElement }) {
  const { user } = useSelector((state: any) => state.auth);

  // If logged in → redirect to /admin
  if (user) {
    return <Navigate to="/admin" replace />;
  }

  // If not logged in → render the provided element
  return element;
}
