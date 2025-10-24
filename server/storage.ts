import type {
  InsertCompany,
  InsertProfile,
  InsertUserRole,
  Company,
  Profile,
  UserRole,
  Country,
  State,
  City,
} from "@shared/schema";

export interface IStorage {
  getCountries(): Promise<Country[]>;
  getStates(countryId: string): Promise<State[]>;
  getCities(stateId: string): Promise<City[]>;
  
  getCompanyById(id: string): Promise<Company | null>;
  getAllCompanies(): Promise<Company[]>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company | null>;
  deleteCompany(id: string): Promise<boolean>;
  
  getProfileByUserId(userId: string): Promise<Profile | null>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, profile: Partial<InsertProfile>): Promise<Profile | null>;
  
  getUserRole(userId: string): Promise<UserRole | null>;
  createUserRole(userRole: InsertUserRole): Promise<UserRole>;
}

import { db } from "./db";
import { countries, states, cities, companies, profiles, userRoles } from "@shared/schema";
import { eq } from "drizzle-orm";

export class DbStorage implements IStorage {
  async getCountries(): Promise<Country[]> {
    return await db.select().from(countries);
  }

  async getStates(countryId: string): Promise<State[]> {
    return await db.select().from(states).where(eq(states.countryId, countryId));
  }

  async getCities(stateId: string): Promise<City[]> {
    return await db.select().from(cities).where(eq(cities.stateId, stateId));
  }

  async getCompanyById(id: string): Promise<Company | null> {
    const result = await db.select().from(companies).where(eq(companies.id, id));
    return result[0] || null;
  }

  async getAllCompanies(): Promise<Company[]> {
    return await db.select().from(companies);
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const result = await db.insert(companies).values(company).returning();
    return result[0];
  }

  async updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company | null> {
    const result = await db
      .update(companies)
      .set({ ...company, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteCompany(id: string): Promise<boolean> {
    const result = await db.delete(companies).where(eq(companies.id, id)).returning();
    return result.length > 0;
  }

  async getProfileByUserId(userId: string): Promise<Profile | null> {
    const result = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return result[0] || null;
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const result = await db.insert(profiles).values(profile).returning();
    return result[0];
  }

  async updateProfile(userId: string, profile: Partial<InsertProfile>): Promise<Profile | null> {
    const result = await db
      .update(profiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return result[0] || null;
  }

  async getUserRole(userId: string): Promise<UserRole | null> {
    const result = await db.select().from(userRoles).where(eq(userRoles.userId, userId));
    return result[0] || null;
  }

  async createUserRole(userRole: InsertUserRole): Promise<UserRole> {
    const result = await db.insert(userRoles).values(userRole).returning();
    return result[0];
  }
}

export const storage = new DbStorage();
