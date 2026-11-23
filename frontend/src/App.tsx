import { useEffect } from "react";
import "./App.css";

import AppRoutes from "./routes/routes";
import ToastContainer from "@/components/ui/toast/ToastContainer";
import { useAuthStore } from "@/stores/authStore";

function App() {
  const initializeAuth = useAuthStore((s) => s.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <>
      <ToastContainer />
      <AppRoutes />
    </>
  );
}

export default App;
