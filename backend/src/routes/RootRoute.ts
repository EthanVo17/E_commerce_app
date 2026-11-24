import express from "express";

import { router as AuthenticationRoute } from "./Auth.route.js";
import { router as ProductRoute } from "./Product.route.js";

function RootRoute(app: express.Application) {
  app.use("/api/auth", AuthenticationRoute);
  app.use("/api/products", ProductRoute);
}

export default RootRoute;
