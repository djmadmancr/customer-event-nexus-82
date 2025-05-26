import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient } from 'react-query';

// Auth
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Layout
import Layout from './components/Layout/Layout';
import Sidebar from './components/Layout/Sidebar';
import NotFound from './pages/NotFound';

// Pages
import Home from './pages/Home';
import CustomerList from './pages/Customers/CustomerList';
import CustomerForm from './pages/Customers/CustomerForm';
import CustomerDetail from './pages/Customers/CustomerDetail';
import EventList from './pages/Events/EventList';
import EventForm from './pages/Events/EventForm';
import EventDetail from './pages/Events/EventDetail';
import PaymentPage from './pages/Payments/PaymentPage';
import AdminDashboard from './pages/Admin/Dashboard';
import UserManagement from './pages/Admin/UserManagement';
import AppSettings from './pages/Settings/AppSettings';

// Contexts
import { CrmProvider } from './contexts/CrmContext';
import { AppConfigProvider } from './contexts/AppConfigContext';
import { UserProfileProvider } from './contexts/UserProfileContext';
import Dashboard from './pages/Dashboard/Dashboard';

function App() {
  return (
    <QueryClient>
      <BrowserRouter>
        <AuthProvider>
          <AppConfigProvider>
            <UserProfileProvider>
              <CrmProvider>
                <div className="min-h-screen bg-gray-50">
                  <Routes>
                    <Route path="/" element={<Layout />}>
                      <Route index element={<Home />} />
                      <Route path="dashboard" element={<Dashboard />} />
                      
                      {/* Customer routes */}
                      <Route path="customers" element={<CustomerList />} />
                      <Route path="customers/new" element={<CustomerForm />} />
                      <Route path="customers/:id" element={<CustomerDetail />} />
                      <Route path="customers/:id/edit" element={<CustomerForm />} />
                      
                      {/* Event routes */}
                      <Route path="events" element={<EventList />} />
                      <Route path="events/new" element={<EventForm />} />
                      <Route path="events/:id" element={<EventDetail />} />
                      <Route path="events/:id/edit" element={<EventForm />} />
                      
                      {/* Payment routes */}
                      <Route path="payments" element={<PaymentPage />} />
                      
                      {/* Admin routes */}
                      <Route 
                        path="admin/*" 
                        element={
                          <ProtectedRoute requiredRole="admin">
                            <Routes>
                              <Route path="dashboard" element={<AdminDashboard />} />
                              <Route path="users" element={<UserManagement />} />
                            </Routes>
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* Settings routes */}
                      <Route path="settings" element={<AppSettings />} />
                    </Route>
                    
                    {/* Auth routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* 404 route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Toaster />
                </div>
              </CrmProvider>
            </UserProfileProvider>
          </AppConfigProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClient>
  );
}

export default App;
