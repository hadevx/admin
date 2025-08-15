import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Order from "./pages/orders/Order";
import UsersList from "./pages/users/UsersList";
import OrderDetails from "./pages/orders/OrderDetails";
import UserDetails from "./pages/users/UserDetails";
import Login from "./pages/auth/Login";
import AdminRoute from "./components/AdminRoute";
import Delivery from "./pages/delivery/Delivery";
import ProductList from "./pages/products/ProductList";
import Discounts from "./pages/discounts/Discounts";
import Categories from "./pages/categories/Categories";
import "react-toastify/dist/ReactToastify.css";
import Settings from "./pages/settings/Settings";
import ProductDetails from "./pages/products/ProductDetails";
import PublicRoute from "./components/PublicRoutes";

function App() {
  const { userInfo } = useSelector((state: any) => state.auth);

  return (
    <Routes>
      {/* Root route redirects based on login status */}
      <Route
        path="/"
        element={
          userInfo ? <Navigate to="/admin" replace /> : <Navigate to="/admin/login" replace />
        }
      />

      {/* Login page */}
      <Route
        path="/admin/login"
        element={userInfo ? <Navigate to="/admin" replace /> : <Login />}
      />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminRoute element={<Order />} />} />
      <Route path="/admin/orders/:orderId" element={<AdminRoute element={<OrderDetails />} />} />
      <Route path="/admin/userlist" element={<AdminRoute element={<UsersList />} />} />
      <Route path="/admin/userlist/:userID" element={<AdminRoute element={<UserDetails />} />} />
      <Route path="/admin/delivery" element={<AdminRoute element={<Delivery />} />} />
      <Route path="/admin/productlist" element={<AdminRoute element={<ProductList />} />} />
      <Route
        path="/admin/productlist/:id"
        element={<AdminRoute element={<PublicRoute element={<ProductDetails />} />} />}
      />
      <Route path="/admin/discounts" element={<AdminRoute element={<Discounts />} />} />
      <Route path="/admin/settings" element={<AdminRoute element={<Settings />} />} />
      <Route path="/admin/categories" element={<AdminRoute element={<Categories />} />} />
    </Routes>
  );
}

export default App;
