import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AgentLayout from './layouts/AgentLayout';
import AdminLayout from './layouts/AdminLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import Shop from './pages/Shop';

import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminUsers from './pages/admin/Users';
import AdminBanners from './pages/admin/Banners';
import AdminPromotions from './pages/admin/Promotions';
import FinanceStats from './pages/admin/FinanceStats';
import AdminSuppliers from './pages/admin/Suppliers';
import AdminChat from './pages/admin/Chat';

import AgentHome from './pages/agent/Home';
import AgentProducts from './pages/agent/Products';
import AgentOrders from './pages/agent/Orders';
import AgentCustomers from './pages/agent/Customers';
import AgentCollaborators from './pages/agent/Collaborators';
import AgentAbout from './pages/agent/About';
import AgentSettings from './pages/agent/Settings';
import AgentPointHistory from './pages/agent/PointHistory';
import AgentGrowthFund from './pages/agent/GrowthFund';
import AgentProfile from './pages/agent/Profile';
import AgentChat from './pages/agent/Chat';
import AgentCreateOrder from './pages/agent/CreateOrder';
import AgentCart from './pages/agent/Cart';
import AgentSupplierStore from './pages/agent/SupplierStore';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/shop/:agentId" element={<Shop />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="promotions" element={<AdminPromotions />} />
          <Route path="finance" element={<FinanceStats />} />
          <Route path="suppliers" element={<AdminSuppliers />} />
          <Route path="chat" element={<AdminChat />} />
        </Route>

        {/* Agent Routes */}
        <Route path="/agent" element={<AgentLayout />}>
          <Route index element={<AgentHome />} />
          <Route path="products" element={<AgentProducts />} />
          <Route path="orders" element={<AgentOrders />} />
          <Route path="customers" element={<AgentCustomers />} />
          <Route path="collaborators" element={<AgentCollaborators />} />
          <Route path="about" element={<AgentAbout />} />
          <Route path="settings" element={<AgentSettings />} />
          <Route path="points" element={<AgentPointHistory />} />
          <Route path="growth-fund" element={<AgentGrowthFund />} />
          <Route path="chat" element={<AgentChat />} />
          <Route path="profile" element={<AgentProfile />} />
          <Route path="create-order" element={<AgentCreateOrder />} />
          <Route path="cart" element={<AgentCart />} />
          <Route path="supplier/:supplierId" element={<AgentSupplierStore />} />
        </Route>

        {/* Default route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
