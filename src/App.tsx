import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAnalytics } from "@/hooks/useAnalytics";
import Index from "./pages/Index";
import Templates from "./pages/Templates";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

const AppContent = () => {
  useAnalytics(); // Track page views and sessions

  return (
    <Routes>
      <Route path="/" element={<Templates />} />
      <Route path="/about" element={<Index />} />
      <Route path="/analytics" element={<Analytics />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
