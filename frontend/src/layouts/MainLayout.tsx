import { Outlet } from "react-router-dom";

import Header from "@/components/common/header/Header";
import Container from "@/components/common/container/Container";
import Footer from "@/components/common/footer/Footer";

export const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <div className="flex-1">
        <Container>
          <Outlet />
        </Container>
      </div>
      <Footer />
    </div>
  );
};
