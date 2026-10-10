import { Outlet } from "react-router-dom";

import Header from "@/components/common/header/Header";
import Container from "@/components/common/Container";
import Footer from "@/components/common/Footer";

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
