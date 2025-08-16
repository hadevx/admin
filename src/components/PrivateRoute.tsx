import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * PrivateRoute
 * ------------
 * A wrapper for protecting admin-only pages.
 * If the user is NOT logged in or NOT an admin,
 * they are redirected to the admin login page.
 *
 * Usage example:
 * <Route path="/admin/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
 */
function PrivateRoute({ element }: { element: React.ReactElement }) {
  // Get the authentication state from Redux
  const { adminUserInfo } = useSelector((state: any) => state.auth);

  /**
   * Check:
   * - userInfo exists (means user is logged in)
   * - userInfo.isAdmin is true (means user has admin privileges)
   *
   * If both pass → allow access to the page.
   * Else → redirect to the admin login page.
   */
  return adminUserInfo && adminUserInfo.isAdmin ? element : <Navigate to="/admin/login" replace />;
}

export default PrivateRoute;
