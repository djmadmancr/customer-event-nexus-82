
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CrmProvider } from "./contexts/CrmContext";
import { AppConfigProvider } from "./contexts/AppConfigContext";
import Layout from "./components/Layout/Layout";

// Pages
import Home from "./pages/Home";
import CustomerList from "./pages/Customers/CustomerList";
import CustomerForm from "./pages/Customers/CustomerForm";
import CustomerDetail from "./pages/Customers/CustomerDetail";
import EventList from "./pages/Events/EventList";
import EventForm from "./pages/Events/EventForm";
import EventDetail from "./pages/Events/EventDetail";
import PaymentPage from "./pages/Payments/PaymentPage";
import AppSettings from "./pages/Settings/AppSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppConfigProvider>
      <CrmProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Redirigir login a la página principal */}
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="/register" element={<Navigate to="/" replace />} />
              
              {/* Rutas principales - ya sin protección */}
              <Route path="/" element={
                <Layout>
                  <Home />
                </Layout>
              } />
              
              {/* Customer routes */}
              <Route path="/customers" element={
                <Layout>
                  <CustomerList />
                </Layout>
              } />
              <Route path="/customers/new" element={
                <Layout>
                  <CustomerForm />
                </Layout>
              } />
              <Route path="/customers/:id" element={
                <Layout>
                  <CustomerDetail />
                </Layout>
              } />
              <Route path="/customers/:id/edit" element={
                <Layout>
                  <CustomerForm />
                </Layout>
              } />
              
              {/* Event routes */}
              <Route path="/events" element={
                <Layout>
                  <EventList />
                </Layout>
              } />
              <Route path="/events/new" element={
                <Layout>
                  <EventForm />
                </Layout>
              } />
              <Route path="/events/:id" element={
                <Layout>
                  <EventDetail />
                </Layout>
              } />
              <Route path="/events/:id/edit" element={
                <Layout>
                  <EventForm />
                </Layout>
              } />
              
              {/* Payment routes */}
              <Route path="/payments" element={
                <Layout>
                  <PaymentPage />
                </Layout>
              } />
              
              {/* Settings route */}
              <Route path="/settings" element={
                <Layout>
                  <AppSettings />
                </Layout>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CrmProvider>
    </AppConfigProvider>
  </QueryClientProvider>
);

export default App;
