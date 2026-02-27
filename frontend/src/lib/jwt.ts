import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  id?: string;
  userId: string;
  email: string;
  name: string;
  role: "ADMIN" | "SUBADMIN" | "USER";
  exp: number;
  type: string;
}

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch {
    return null;
  }
};