import React from "react";
import { Routes, Route } from "react-router-dom";

import HomePage from "@/pages/HomePage";
import SignInPage from "@/pages/SignInPage";
import SignUpPage from "@/pages/SignUpPage";
import NotFoundPage from "@/pages/NotFoundPage";

interface RouteProps {
  path: string;
  element: React.JSX.Element;
  layout: React.JSX.Element | null;
}
const publicRoutes: RouteProps[] = [
  { path: "/", element: <HomePage />, layout: null },
  { path: "/signin", element: <SignInPage />, layout: null },
  { path: "/signup", element: <SignUpPage />, layout: null },
  { path: "/user:slug", element: <></>, layout: null },
  { path: "/product/productid:slug", element: <></>, layout: null },
  { path: "/support", element: <></>, layout: null },
  { path: "/404_not_found", element: <NotFoundPage />, layout: null },
];

const FallBack = (): any => {
  <div className="flex justify-center items-center h-sreen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
  </div>;
};

export default function AppRoutes() {
  return (
    <React.Suspense fallback={<FallBack />}>
      <Routes>
        {publicRoutes.map((route: RouteProps, index) => {
          return (
            <Route key={index} path={route.path} element={route.element} />
          );
        })}
        <Route />
      </Routes>
    </React.Suspense>
  );
}
