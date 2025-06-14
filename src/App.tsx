
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { CrmProvider } from '@/contexts/CrmContext';
import { UserProfileProvider } from '@/contexts/UserProfileContext';
import { AppConfigProvider } from '@/contexts/AppConfigContext';
import { EmailConfigProvider } from '@/contexts/EmailConfigContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import Layout from '@/components/Layout/Layout';
import AuthPage from '@/pages/Auth/AuthPage';
import Home from '@/pages/Home';
import CustomerList from '@/pages/Customers/CustomerList';
import CustomerDetail from '@/pages/Customers/CustomerDetail';
import CustomerForm from '@/pages/Customers/CustomerForm';
import EventList from '@/pages/Events/EventList';
import EventDetail from '@/pages/Events/EventDetail';
import EventForm from '@/pages/Events/EventForm';
import PaymentPage from '@/pages/Payments/PaymentPage';
import PaymentForm from '@/pages/Payments/PaymentForm';
import AppSettings from '@/pages/Settings/AppSettings';
import Dashboard from '@/pages/Admin/Dashboard';
import UserManagement from '@/pages/Admin/UserManagement';
import AdminDashboard from '@/pages/Admin/AdminDashboard';
import BookingForm from '@/pages/Booking/BookingForm';
import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <UserProfileProvider>
            <AppConfigProvider>
              <EmailConfigProvider>
                <NotificationProvider>
                  <CrmProvider>
                    <Routes>
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/login" element={<Navigate to="/auth" replace />} />
                      <Route path="/admin-dashboard" element={<AdminDashboard />} />
                      <Route path="/booking/:userId" element={<BookingForm />} />
                      <Route path="/" element={
                        <ProtectedRoute>
                          <Layout>
                            <Home />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <Layout>
                            <Dashboard />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      <Route path="/customers" element={
                        <ProtectedRoute>
                          <Layout>
                            <CustomerList />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      <Route path="/customers/new" element={
                        <ProtectedRoute>
                          <Layout>
                            <CustomerForm />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      <Route path="/customers/:id" element={
                        <ProtectedRoute>
                          <Layout>
                            <CustomerDetail />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      <Route path="/customers/:id/edit" element={
                        <ProtectedRoute>
                          <Layout>
                            <CustomerForm />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      <Route path="/events" element={
                        <ProtectedRoute>
                          <Layout>
                            <EventList />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      <Route path="/events/new" element={
                        <ProtectedRoute>
                          <Layout>
                            <EventForm />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      <Route path="/events/:id" element={
                        <ProtectedRoute>
                          <Layout>
                            <EventDetail />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      <Route path="/events/:id/edit" element={
                        <ProtectedRoute>
                          <Layout>
                            <EventForm />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      <Route path="/payments" element={
                        <ProtectedRoute>
                          <Layout>
                            <PaymentPage />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      <Route path="/payments/new" element={
                        <ProtectedRoute>
                          <Layout>
                            <PaymentForm />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      <Route path="/payments/:eventId/new" element={
                        <ProtectedRoute>
                          <Layout>
                            <PaymentForm />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      <Route path="/settings" element={
                        <ProtectedRoute>
                          <Layout>
                            <AppSettings />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      <Route path="/admin/users" element={
                        <ProtectedRoute requireAdmin>
                          <Layout>
                            <UserManagement />
                          </Layout>
                        </ProtectedRoute>
                      } />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    <Toaster />
                    <Sonner />
                  </CrmProvider>
                </NotificationProvider>
              </EmailConfigProvider>
            </AppConfigProvider>
          </UserProfileProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
