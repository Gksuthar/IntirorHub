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

const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
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
          <Route path="invite" element={<Invite />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
