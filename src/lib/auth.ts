//Verifica sesión

// src/lib/auth.ts
import jwt from "jsonwebtoken";

type User = {
  id: number;
  email: string;
};

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-abc123";

export function generateToken(user: Pick<User, "id" | "email">) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null; // 🔁 Esto evita que tire un error no controlado
  }
}
