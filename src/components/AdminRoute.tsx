import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function PrivateRoute({ element }: { element: React.ReactElement }) {
  const { userInfo } = useSelector((state: any) => state.auth);

  return userInfo && userInfo.isAdmin ? element : <Navigate to="/admin/login" replace />;
}

export default PrivateRoute;
