import React from "react";
import { Route, Routes } from "react-router-dom";

import { MainLayout } from "@/layouts/MainLayout";
import HomePage from "@/pages/HomePage";
import SignInPage from "@/pages/SignInPage";
import SignUpPage from "@/pages/SignUpPage";
import NotFoundPage from "@/pages/NotFoundPage";
import ProductPage from "@/pages/ProductPage";
import SupportPage from "@/pages/SupportPage";

export default function AppRoutes() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-white" />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:productId" element={<ProductPage />} />
          <Route path="/support" element={<SupportPage />} />
        </Route>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/user/:slug" element={<div />} />
        <Route path="/404_not_found" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </React.Suspense>
  );
}
