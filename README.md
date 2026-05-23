# 🛠️ E-Commerce Admin Dashboard

A modern, fully-featured admin dashboard for managing an e-commerce platform, built with **React.js**, **Tailwind CSS**, and **Redux Toolkit**.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React.js |
| Styling | Tailwind CSS |
| State Management | Redux Toolkit |
| Routing | React Router v6 |
| HTTP Client | Fetch API / Axios |
| Build Tool | Vite |

---

## ✨ Features

- 📊 **Analytics Dashboard** — Overview of key metrics: total sales, orders, users, and revenue charts
- 📦 **Product Management** — Create, edit, delete products with image uploads, variants (color, size, stock), and discount controls
- 🛍️ **Order Management** — View and update order status, mark orders as paid or delivered
- 👥 **User Management** — View all registered users, manage admin roles
- 🗂️ **Category Management** — Create and manage product categories
- 🔐 **Protected Routes** — Admin-only access enforced on all dashboard pages

---

## 📁 Project Structure

```
├── public/
├── src/
│   ├── assets/           # Static assets (images, icons)
│   ├── components/       # Reusable UI components
│   │   ├── layout/       # Sidebar, Navbar, Layout wrapper
│   │   └── ui/           # Buttons, Modals, Tables, Badges
│   ├── pages/            # Page-level components
│   │   ├── Dashboard.jsx
│   │   ├── Products.jsx
│   │   ├── Orders.jsx
│   │   ├── Users.jsx
│   │   └── Categories.jsx
│   ├── store/            # Redux store and slices
│   │   ├── store.js
│   │   ├── slices/
│   │   │   ├── authSlice.js
│   │   │   ├── productSlice.js
│   │   │   ├── orderSlice.js
│   │   │   ├── userSlice.js
│   │   │   └── categorySlice.js
│   ├── services/         # API call functions
│   ├── utils/            # Helper functions
│   ├── App.jsx
│   └── main.jsx
├── .env
├── index.html
├── tailwind.config.js
└── vite.config.js
```

---

## 🔧 Getting Started

### Prerequisites

- Node.js v18+
- The [backend API](../backend) running on port `4001`

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/your-admin-repo.git
cd your-admin-repo

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://your-vps-ip:4001/api
```

### Run the App

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

---

## 📸 Pages Overview

### 📊 Dashboard
- Summary cards: total revenue, total orders, total users, total products
- Recent orders table
- Sales analytics charts

### 📦 Products
- Paginated product table with image, name, price, stock, and category
- Add new product with image upload and variant support (color, size, stock, price)
- Edit and delete existing products
- Apply or remove discounts

### 🛍️ Orders
- Full orders list with status badges (Paid / Unpaid, Delivered / Pending)
- Order detail view with customer info, items, and shipping address
- Mark orders as delivered

### 👥 Users
- List of all registered users
- View user details
- Toggle admin privileges
- Delete users

### 🗂️ Categories
- List of all product categories
- Add, edit, and delete categories

---

## 🗃️ State Management

Global state is managed with **Redux Toolkit**. Each resource has its own slice:

```
store/
├── store.js               # Configures the Redux store
└── slices/
    ├── authSlice.js        # Login state, JWT token, user info
    ├── productSlice.js     # Products list, single product, CRUD actions
    ├── orderSlice.js       # Orders list, order detail, status updates
    ├── userSlice.js        # Users list, user detail, role management
    └── categorySlice.js   # Categories CRUD
```

---

## 🔒 Authentication & Route Protection

Login is required to access the dashboard. The JWT token is stored in Redux state (and optionally in `localStorage`) and sent with every API request via the `Authorization` header.

Protected routes redirect unauthenticated users to the login page:

```jsx
// Example protected route
<Route
  path="/dashboard"
  element={<AdminRoute><Dashboard /></AdminRoute>}
/>
```

---

## 🎨 Styling

The UI is built entirely with **Tailwind CSS** utility classes. No external component library is used — all components (tables, modals, badges, buttons) are custom-built.

To customize the theme, edit `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: "#your-color",
    },
  },
},
```

---

## 🔗 Related

- [Backend API Repository](https://github.com/your-username/your-backend-repo) — Node.js + Express.js REST API

---

## 📄 License

This project is licensed under the MIT License.
