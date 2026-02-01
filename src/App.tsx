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
          adminUserInfo ? <Navigate to="/summary" replace /> : <Navigate to="/login" replace />
        }
      />

      {/* Auth */}
      <Route path="/login" element={adminUserInfo ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/forget-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Protected routes */}
      <Route path="/summary" element={<PrivateRoute element={<Summary />} />} />
      <Route path="/orders" element={<PrivateRoute element={<Order />} />} />
      <Route path="/orders/:orderId" element={<PrivateRoute element={<OrderDetails />} />} />

      <Route path="/userlist" element={<PrivateRoute element={<UsersList />} />} />
      <Route path="/userlist/:userID" element={<PrivateRoute element={<UserDetails />} />} />

      <Route path="/delivery" element={<PrivateRoute element={<Delivery />} />} />

      <Route path="/productlist" element={<PrivateRoute element={<ProductList />} />} />
      <Route path="/productlist/:id" element={<PrivateRoute element={<ProductDetails />} />} />

      <Route path="/discounts" element={<PrivateRoute element={<Discounts />} />} />
      <Route path="/categories" element={<PrivateRoute element={<Categories />} />} />
      <Route path="/settings" element={<PrivateRoute element={<Settings />} />} />
    </Routes>
  );
}

export default App;
