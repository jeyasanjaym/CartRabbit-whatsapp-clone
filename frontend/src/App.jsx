import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Chat from "./pages/Chat.jsx";
import { getStoredUser } from "./lib/storage.js";

function RequireChat({ children }) {
  const u = getStoredUser();
  if (!u?._id) return <Navigate to="/" replace />;
  return children;
}

function GuestOnly({ children }) {
  const u = getStoredUser();
  if (u?._id) return <Navigate to="/chat" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <GuestOnly>
            <Login />
          </GuestOnly>
        }
      />
      <Route
        path="/chat"
        element={
          <RequireChat>
            <Chat />
          </RequireChat>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
