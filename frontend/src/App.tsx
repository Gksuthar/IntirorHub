import "./App.css";
import type { ReactElement } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./Layout/main";
import Home from "./pages/Home";
import Payments from "./pages/Payments";
import BOQ from "./pages/BOQ";
import Expenses from "./pages/Expenses";
import Feed from "./pages/Feed";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Invite from "./pages/Invite";
import ManageSites from "./pages/ManageSites";
import FeedDetail from "./pages/FeedDetail";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SiteProvider } from "./context/SiteContext";

const LoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center bg-white text-gray-500">
    <span className="text-xs uppercase tracking-[0.4em]">Loading</span>
  </div>
);

const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AdminRoute = ({ children }: { children: ReactElement }) => {
  const { token, loading, user } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <SiteProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Home />} />
              <Route path="payments" element={<Payments />} />
              <Route path="boq" element={<BOQ />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="feed" element={<Feed />} />
              <Route path="feed/:id" element={<FeedDetail />} />
              <Route path="manage-sites" element={<ManageSites />} />
              <Route
                path="invite"
                element={
                  <AdminRoute>
                    <Invite />
                  </AdminRoute>
                }
              />
            </Route>
          </Routes>
        </Router>
      </SiteProvider>
    </AuthProvider>
  );
}

export default App;
