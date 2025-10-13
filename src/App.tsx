// src/App.tsx (tu archivo actual)
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Catalog from "./pages/Catalog";
import DeckDetail from "./pages/DeckDetail.tsx";
import About from "./pages/About";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DeckManagement from "./pages/admin/DeckManagement";
import ClientManagement from "@/pages/admin/ClientsManagement.tsx";
import DeckForm from "./pages/admin/DeckForm";
import NotFound from "./pages/NotFound";
import ScrollToTop from "@/components/ScrollToTop.tsx";
import { AuthProvider } from "@/supabase/AuthProvider";
import ProtectedAdminRoute from "@/supabase/ProtectedAdminRoute.tsx"; // <-- IMPORTA

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                    <ScrollToTop behavior="auto" />
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Index />} />
                        <Route path="/catalog" element={<Catalog />} />
                        <Route path="/deck/:id" element={<DeckDetail />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        {/* Admin Routes */}
                        <Route path="/admin/decks" element={<ProtectedAdminRoute><DeckManagement /></ProtectedAdminRoute>}/>
                        <Route path="/admin/decks/create" element={<ProtectedAdminRoute><DeckForm /></ProtectedAdminRoute>}/>
                        <Route path="/admin/decks/edit/:id" element={<ProtectedAdminRoute><DeckForm /></ProtectedAdminRoute>}/>
                        <Route path="/admin/clients" element={<ProtectedAdminRoute><ClientManagement /></ProtectedAdminRoute>}/>
                        {/* Catch-all route */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
            </TooltipProvider>
        </AuthProvider>
    </QueryClientProvider>
);

export default App;