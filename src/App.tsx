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
