import express from "express";

import { verifyAccessToken } from "../jwt/jwt.js";

export const RequireAuth: express.RequestHandler = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Please sign in." });
    return;
  }

  const token = authorization.slice(7);

  try {
    res.locals.user = verifyAccessToken(token);
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }

  next();
};
