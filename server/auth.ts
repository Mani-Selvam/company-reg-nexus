import { Router, type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { db } from "./db";
import { users, sessions, profiles, userRoles } from "@shared/schema";
import { eq, and, gt } from "drizzle-orm";
import { insertUserSchema } from "@shared/schema";

export const authRouter = Router();

const SESSION_EXPIRY_DAYS = 30;

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

function getSessionExpiryDate(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);
  return expiresAt;
}

authRouter.post("/api/auth/signup", async (req: Request, res: Response) => {
  try {
    const { email, password } = insertUserSchema.parse(req.body);
    
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await db.insert(users).values({
      email,
      password: hashedPassword,
    }).returning();

    await db.insert(profiles).values({
      userId: newUser[0].id,
      loginType: "manual",
    });

    await db.insert(userRoles).values({
      userId: newUser[0].id,
      role: "company_user",
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

authRouter.post("/api/auth/signin", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const userResult = await db.select().from(users).where(eq(users.email, email));
    if (userResult.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = userResult[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    await db.delete(sessions).where(eq(sessions.userId, user.id));

    const token = generateToken();
    const expiresAt = getSessionExpiryDate();

    await db.insert(sessions).values({
      userId: user.id,
      token,
      expiresAt,
    });

    res.cookie("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
    });

    res.json({ 
      user: { id: user.id, email: user.email },
      message: "Logged in successfully" 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

authRouter.post("/api/auth/signout", async (req: Request, res: Response) => {
  try {
    const token = req.cookies.session_token;
    if (token) {
      await db.delete(sessions).where(eq(sessions.token, token));
    }
    
    res.clearCookie("session_token");
    res.json({ message: "Logged out successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

authRouter.get("/api/auth/me", async (req: Request, res: Response) => {
  try {
    const token = req.cookies.session_token;
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const sessionResult = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.token, token),
          gt(sessions.expiresAt, new Date())
        )
      );

    if (sessionResult.length === 0) {
      res.clearCookie("session_token");
      return res.status(401).json({ error: "Session expired" });
    }

    const session = sessionResult[0];
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId));

    if (userResult.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    const user = userResult[0];
    const userRoleResult = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, user.id));

    const role = userRoleResult[0]?.role || "company_user";

    const profileResult = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id));

    res.json({ 
      user: { 
        id: user.id, 
        email: user.email,
        role,
        profile: profileResult[0] || null
      } 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.session_token;
  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const sessionResult = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.token, token),
        gt(sessions.expiresAt, new Date())
      )
    );

  if (sessionResult.length === 0) {
    res.clearCookie("session_token");
    return res.status(401).json({ error: "Session expired" });
  }

  const session = sessionResult[0];
  (req as any).userId = session.userId;
  next();
}
