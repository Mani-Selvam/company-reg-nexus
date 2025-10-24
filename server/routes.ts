import { Router, type Request, type Response } from "express";
import { storage } from "./storage";
import { insertCompanySchema, insertProfileSchema, insertUserRoleSchema } from "@shared/schema";
import bcrypt from "bcryptjs";

export const router = Router();

router.get("/api/countries", async (req: Request, res: Response) => {
  try {
    const countries = await storage.getCountries();
    res.json(countries);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/states/:countryId", async (req: Request, res: Response) => {
  try {
    const states = await storage.getStates(req.params.countryId);
    res.json(states);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/cities/:stateId", async (req: Request, res: Response) => {
  try {
    const cities = await storage.getCities(req.params.stateId);
    res.json(cities);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/companies", async (req: Request, res: Response) => {
  try {
    const companies = await storage.getAllCompanies();
    res.json(companies);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/companies/:id", async (req: Request, res: Response) => {
  try {
    const company = await storage.getCompanyById(req.params.id);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    res.json(company);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/companies", async (req: Request, res: Response) => {
  try {
    const validatedData = insertCompanySchema.parse(req.body);
    const company = await storage.createCompany(validatedData);
    res.status(201).json(company);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.patch("/api/companies/:id", async (req: Request, res: Response) => {
  try {
    const company = await storage.updateCompany(req.params.id, req.body);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    res.json(company);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/api/companies/:id", async (req: Request, res: Response) => {
  try {
    const success = await storage.deleteCompany(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Company not found" });
    }
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/profile/:userId", async (req: Request, res: Response) => {
  try {
    const profile = await storage.getProfileByUserId(req.params.userId);
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/profile", async (req: Request, res: Response) => {
  try {
    const validatedData = insertProfileSchema.parse(req.body);
    const profile = await storage.createProfile(validatedData);
    res.status(201).json(profile);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.patch("/api/profile/:userId", async (req: Request, res: Response) => {
  try {
    const profile = await storage.updateProfile(req.params.userId, req.body);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/user-role/:userId", async (req: Request, res: Response) => {
  try {
    const userRole = await storage.getUserRole(req.params.userId);
    res.json(userRole);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/user-role", async (req: Request, res: Response) => {
  try {
    const validatedData = insertUserRoleSchema.parse(req.body);
    const userRole = await storage.createUserRole(validatedData);
    res.status(201).json(userRole);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
