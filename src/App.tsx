
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Auth
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Layout
import Layout from './components/Layout/Layout';
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

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppConfigProvider>
            <UserProfileProvider>
              <CrmProvider>
                <div className="min-h-screen bg-gray-50">
                  <Routes>
                    <Route path="/" element={<Layout><Home /></Layout>} />
                    <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                    
                    {/* Customer routes */}
                    <Route path="/customers" element={<Layout><CustomerList /></Layout>} />
                    <Route path="/customers/new" element={<Layout><CustomerForm /></Layout>} />
                    <Route path="/customers/:id" element={<Layout><CustomerDetail /></Layout>} />
                    <Route path="/customers/:id/edit" element={<Layout><CustomerForm /></Layout>} />
                    
                    {/* Event routes */}
                    <Route path="/events" element={<Layout><EventList /></Layout>} />
                    <Route path="/events/new" element={<Layout><EventForm /></Layout>} />
                    <Route path="/events/:id" element={<Layout><EventDetail /></Layout>} />
                    <Route path="/events/:id/edit" element={<Layout><EventForm /></Layout>} />
                    
                    {/* Payment routes */}
                    <Route path="/payments" element={<Layout><PaymentPage /></Layout>} />
                    
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
                    
                    {/* Settings routes */}
                    <Route path="/settings" element={<Layout><AppSettings /></Layout>} />
                    
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
    </QueryClientProvider>
  );
}

export default App;
