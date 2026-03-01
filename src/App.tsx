import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import PortalLayout from "./components/PortalLayout";
import Dashboard from "./pages/Dashboard";
import Holdings from "./pages/Holdings";
import CompanyOverview from "./pages/CompanyOverview";
import AIAssistant from "./pages/AIAssistant";
import Portfolio from "./pages/Portfolio";
import BuyShares from "./pages/BuyShares";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPlaceholder from "./pages/AdminPlaceholder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<PortalLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/holdings" element={<Holdings />} />
            <Route path="/company" element={<CompanyOverview />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/buy-shares" element={<BuyShares />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/documents" element={<AdminPlaceholder />} />
            <Route path="/admin/shareholders" element={<AdminPlaceholder />} />
            <Route path="/admin/ownership" element={<AdminPlaceholder />} />
            <Route path="/admin/valuations" element={<AdminPlaceholder />} />
            <Route path="/admin/portfolio" element={<AdminPlaceholder />} />
            <Route path="/admin/ai" element={<AdminPlaceholder />} />
            <Route path="/admin/audit" element={<AdminPlaceholder />} />
            <Route path="/admin/settings" element={<AdminPlaceholder />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
