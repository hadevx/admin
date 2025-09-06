import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Order from "./pages/orders/Order";
import UsersList from "./pages/users/UsersList";
import OrderDetails from "./pages/orders/OrderDetails";
import UserDetails from "./pages/users/UserDetails";
import Login from "./pages/auth/Login";
import PrivateRoute from "./components/PrivateRoute";
import Delivery from "./pages/delivery/Delivery";
import ProductList from "./pages/products/ProductList";
import Discounts from "./pages/discounts/Discounts";
import Categories from "./pages/categories/Categories";
import "react-toastify/dist/ReactToastify.css";
import Settings from "./pages/settings/Settings";
import ProductDetails from "./pages/products/ProductDetails";
import ForgotPassword from "./pages/auth/ForgetPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Summary from "./pages/summary/Summary";
import Unauthorized from "./components/Unauthorized";

function App() {
  const { adminUserInfo } = useSelector((state: any) => state.auth);

  return (
    <Routes>
      {/* Root route redirects based on login status */}
      <Route
        path="/"
        element={
          adminUserInfo ? (
            <Navigate to="/admin/summary" replace />
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />

      {/* Login page */}
      <Route
        path="/admin/login"
        element={adminUserInfo ? <Navigate to="/admin" replace /> : <Login />}
      />

      <Route path="/admin/unauthorized" element={<Unauthorized />} />
      <Route path="/admin/forget-password" element={<ForgotPassword />} />
      <Route path="/admin/reset-password/:token" element={<ResetPassword />} />

      {/* Admin routes */}
      <Route path="/admin/summary" element={<PrivateRoute element={<Summary />} />} />
      <Route path="/admin" element={<PrivateRoute element={<Order />} />} />
      <Route path="/admin/orders/:orderId" element={<PrivateRoute element={<OrderDetails />} />} />
      <Route path="/admin/userlist" element={<PrivateRoute element={<UsersList />} />} />
      <Route path="/admin/userlist/:userID" element={<PrivateRoute element={<UserDetails />} />} />
      <Route path="/admin/delivery" element={<PrivateRoute element={<Delivery />} />} />
      <Route path="/admin/productlist" element={<PrivateRoute element={<ProductList />} />} />
      <Route
        path="/admin/productlist/:id"
        element={<PrivateRoute element={<ProductDetails />} />}
      />
      <Route path="/admin/discounts" element={<PrivateRoute element={<Discounts />} />} />
      <Route path="/admin/settings" element={<PrivateRoute element={<Settings />} />} />
      <Route path="/admin/categories" element={<PrivateRoute element={<Categories />} />} />
    </Routes>
  );
}

export default App;
