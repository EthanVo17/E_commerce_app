import { Outlet } from "react-router-dom";

import Header from "@/components/common/header/Header";
import Container from "@/components/common/container/Container";
import Footer from "@/components/common/footer/Footer";

export const MainLayout = () => {
  return (
    <div className="">
      <div>
        <Header />
      </div>
      <div>
        <main>
          <Container />
        </main>
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
};
