import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import VerifyOtpPage from "./pages/VerifyOtpPage.jsx";
import ChatDashboardPage from "./pages/ChatDashboardPage.jsx";

function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user?._id) return <Navigate to="/" replace />;
  return children;
}

function GuestOnly({ children }) {
  const { user } = useAuth();
  if (user?._id) return <Navigate to="/chat" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <GuestOnly>
            <LoginPage />
          </GuestOnly>
        }
      />
      <Route
        path="/verify"
        element={
          <GuestOnly>
            <VerifyOtpPage />
          </GuestOnly>
        }
      />
      <Route
        path="/chat"
        element={
          <RequireAuth>
            <ChatDashboardPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
