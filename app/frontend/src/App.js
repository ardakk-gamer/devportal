import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import Login from "@/pages/Login";
import Users from "@/pages/Users";
import Chat from "@/pages/Chat";
import Nova from "@/pages/Nova";
import Profile from "@/pages/Profile";
import { Toaster } from "@/components/ui/sonner";

function RootRedirect() {
  const { user } = useAuth();
  if (user === null) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "admin" ? "/users" : "/chat"} replace />;
}

export default function App() {
  return (
    <div className="App dark">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/nova"
              element={
                <ProtectedRoute>
                  <Nova />
                </ProtectedRoute>
              }
            />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/users" element={<ProtectedRoute adminOnly><Users /></ProtectedRoute>} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster theme="dark" position="bottom-right" toastOptions={{ style: { borderRadius: 0, fontFamily: "JetBrains Mono, monospace", fontSize: "12px" } }} />
      </AuthProvider>
    </div>
  );
}
