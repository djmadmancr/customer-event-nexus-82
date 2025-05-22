
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CrmProvider } from "./contexts/CrmContext";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/Auth/ProtectedRoute";

// Pages
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Home from "./pages/Home";
import CustomerList from "./pages/Customers/CustomerList";
import CustomerForm from "./pages/Customers/CustomerForm";
import CustomerDetail from "./pages/Customers/CustomerDetail";
import EventList from "./pages/Events/EventList";
import EventForm from "./pages/Events/EventForm";
import EventDetail from "./pages/Events/EventDetail";
import PaymentPage from "./pages/Payments/PaymentPage";
import AdminDashboard from "./pages/Admin/Dashboard";
import UserManagement from "./pages/Admin/UserManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CrmProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Home />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Customer routes */}
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
              
              {/* Event routes */}
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
              
              {/* Payment routes */}
              <Route path="/payments" element={
                <ProtectedRoute>
                  <Layout>
                    <PaymentPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Admin routes */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <UserManagement />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CrmProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
