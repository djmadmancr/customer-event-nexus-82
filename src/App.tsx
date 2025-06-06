
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Auth
import { AuthProvider } from './contexts/AuthContext';
import AuthPage from './pages/Auth/AuthPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Layout
import Layout from './components/Layout/Layout';
import NotFound from './pages/NotFound';

// Pages
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
import BookingForm from './pages/Booking/BookingForm';

// Contexts
import { CrmProvider } from './contexts/CrmContext';
import { AppConfigProvider } from './contexts/AppConfigContext';
import { UserProfileProvider } from './contexts/UserProfileContext';
import { EmailConfigProvider } from './contexts/EmailConfigContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Dashboard from './pages/Dashboard/Dashboard';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppConfigProvider>
            <UserProfileProvider>
              <EmailConfigProvider>
                <NotificationProvider>
                  <CrmProvider>
                    <div className="min-h-screen bg-gray-50">
                      <Routes>
                        {/* Public booking form route */}
                        <Route path="/booking/:userId" element={<BookingForm />} />
                        
                        {/* Auth routes */}
                        <Route path="/login" element={<AuthPage />} />
                        
                        {/* Protected routes */}
                        <Route path="/" element={
                          <ProtectedRoute>
                            <Layout />
                          </ProtectedRoute>
                        }>
                          <Route index element={<Dashboard />} />
                          
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
                          
                          {/* Settings routes */}
                          <Route path="settings" element={<AppSettings />} />
                        </Route>
                        
                        {/* Admin routes */}
                        <Route 
                          path="/admin/*" 
                          element={
                            <ProtectedRoute requiredRole="admin">
                              <Layout>
                                <Routes>
                                  <Route path="dashboard" element={<AdminDashboard />} />
                                  <Route path="users" element={<UserManagement />} />
                                </Routes>
                              </Layout>
                            </ProtectedRoute>
                          } 
                        />
                        
                        {/* 404 route */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                      <Toaster />
                    </div>
                  </CrmProvider>
                </NotificationProvider>
              </EmailConfigProvider>
            </UserProfileProvider>
          </AppConfigProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
