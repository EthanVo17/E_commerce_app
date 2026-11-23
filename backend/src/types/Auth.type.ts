import mongoose from "mongoose";

export interface Auth {
  _id: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  phoneNumber: string;
  password: string;
  isPhoneVerified: boolean;
  avatar?: string;
  addresses: {
    street: string;
    ward: string;
    district: string;
    city: string;
    isDefault: boolean;
  }[];

  role: "user" | "admin";
  cart: {
    product: mongoose.Types.ObjectId;
    quantity: number;
  }[];
  loginAttempts: number;

  locked?: Date;
  tokens?: { token: string }[];
}
